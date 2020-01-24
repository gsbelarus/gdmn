import { AttributeTypes, IStringAttribute, IAttribute, IEnumAttribute, IEntity,
  INumberAttribute, IBooleanAttribute, INumericAttribute, isINumericAttribute,
  IDateAttribute, IEntityAttribute, isUserDefined, getGedeminEntityType, ISetAttribute, isEntityAttribute, isSetAttribute } from "gdmn-orm";
import equal from "fast-deep-equal";

export const isTempID = (id?: string) => id && id.substring(0, 5) === 'temp-';
export const getTempID = () => 'temp-' + Math.random().toString();

export const initAttr = (type: AttributeTypes, prevAttr?: IAttribute) => {
  const attr: Partial<IAttribute> = {
    type,
    name: prevAttr ? prevAttr.name : 'USR$',
    lName: prevAttr && prevAttr.lName ? prevAttr.lName : { ru: { name: 'Описание' }},
    required: prevAttr ? prevAttr.required : false,
    semCategories: prevAttr ? prevAttr.semCategories : '',
    id: prevAttr && prevAttr.id ? prevAttr.id : getTempID()
  };

  switch (type) {
    case 'Date':
    case 'Time':
    case 'TimeStamp':
      return {
        ...attr,
        minValue: undefined,
        maxValue: undefined,
        defaultValue: undefined
      } as IDateAttribute;

    case 'String':
      return {
        ...attr,
        autoTrim: false
      } as IStringAttribute;

    case 'Enum':
      return {
        ...attr,
        values: [],
        defaultValue: undefined
      } as IEnumAttribute;

    case 'Integer':
    case 'Float':
      return attr as INumberAttribute<number>;

    case 'Numeric':
      return {...attr, precision: 18, scale: 4} as INumericAttribute;

    case 'Boolean':
      return {
        ...attr,
        defaultValue: false
      } as IBooleanAttribute;

    case 'Entity':
      return {
        ...attr,
        references: []
      } as IEntityAttribute;
    case 'Blob' :
      return {
        ...attr
      } as IAttribute;
    case 'Set' :
      return {
        ...attr,
        references: [],
        attributes: [],
        presLen: 1,
        isChar: true
      } as ISetAttribute;
  }

  throw new Error(`Unsupported type ${type}`);
};

export interface IErrorLink {
  attrIdx?: number;
  field: string;
  message: string;
  internal: boolean;
};

export type ErrorLinks = IErrorLink[];

export const validateAttributes = (entity: IEntity, prevErrorLinks: ErrorLinks) => {
  const errorLinks = entity.attributes.reduce(
    (p, attr, attrIdx) => {
      if (!stripUserPrefix(attr.name)) {
        p.push({
          attrIdx,
          field: 'name',
          message: "Name can't be empty",
          internal: false
        });
      }

      switch (attr.type) {
        case 'Date':
        case 'Time':
        case 'TimeStamp': {
          const s = attr as IDateAttribute;
          if (s.minValue !== undefined && s.maxValue !== undefined && s.minValue > s.maxValue) {
            p.push({
              attrIdx,
              field: 'minValue',
              message: "Min value > max value",
              internal: false
            });
          } else if (s.minValue !== undefined && s.defaultValue !== undefined && s.defaultValue < s.minValue) {
            p.push({
              attrIdx,
              field: 'defaultValue',
              message: "Default value < min value",
              internal: false
            });
          } else if (s.maxValue && s.defaultValue !== undefined && s.defaultValue > s.maxValue) {
            p.push({
              attrIdx,
              field: 'defaultValue',
              message: "Default value > max value",
              internal: false
            });
          }
          break;
        }

        case 'String': {
          const s = attr as IStringAttribute;
          if (s.minLength !== undefined && s.minLength > 32000) {
            p.push({
              attrIdx,
              field: 'minLength',
              message: "Out of range (0..32000)",
              internal: false
            });
          }

          if (s.maxLength !== undefined && s.maxLength > 32000) {
            p.push({
              attrIdx,
              field: 'maxLength',
              message: "Out of range (0..32000)",
              internal: false
            });
          }

          if (s.minLength !== undefined && s.maxLength !== undefined && s.minLength > s.maxLength) {
            p.push({
              attrIdx,
              field: 'minLength',
              message: "Min length > max length",
              internal: false
            });
          }

          if (!s.maxLength) {
            p.push({
              attrIdx,
              field: 'maxLength',
              message: "max length can't be empty",
              internal: false
            });
          }
          break;
        }

        case 'Entity':
        case 'Set':
          if ((isEntityAttribute(attr) || isSetAttribute(attr)) && attr.references.length === 0) {
            p.push({
              attrIdx,
              field: 'references',
              message: "References can't be empty",
              internal: false
            });
          }

        case 'Integer':
        case 'Float':
        case 'Numeric': {
          const i = attr as INumberAttribute<number>;

          if (i.minValue !== undefined && i.maxValue !== undefined && i.minValue > i.maxValue) {
            p.push({
              attrIdx,
              field: 'minValue',
              message: "Min Value > Max Value",
              internal: false
            });
          }

          if (isINumericAttribute(attr)) {
            if (attr.scale >= attr.precision) {
              p.push({
                attrIdx,
                field: 'scale',
                message: "Scale must be less than precision",
                internal: false
              });
            }
          }

          break;
        }
      }
      return p;
    }, [...prevErrorLinks.filter( l => l.internal )]
  );

  if (!stripUserPrefix(entity.name)) {
    errorLinks.push({
      field: 'entityName',
      message: "Name can't be empty",
      internal: false
    });
  }

  if (!entity.parent && getGedeminEntityType(entity) === 'INHERITED') {
    errorLinks.push({
      field: 'entityParent',
      message: "Enter ancestor entity",
      internal: false
    });
  }

  // check for duplicate names
  entity.attributes.forEach(
    (attr1, idx1) => entity.attributes.forEach(
      (attr2, idx2) => {
        if (idx1 < idx2 && attr1.name === attr2.name && stripUserPrefix(attr1.name) && stripUserPrefix(attr2.name)) {
          errorLinks.push({
            attrIdx: idx1,
            field: 'name',
            message: 'Duplicate attribute name',
            internal: false
          });
        }
      }
    )
  );

  /*
  const entityName = erModel ? Object.keys(erModel.entities) : undefined;

  if(entityName) {
    if(entityName.find(item => item === entity.name)) {
      errorLinks.push({
        field: 'entityName',
        message: 'Duplicated entity name',
        internal: false
      });
    }
  }
  */

  return equal(errorLinks, prevErrorLinks) ? prevErrorLinks : errorLinks;
};

export const getErrorMessage = (attrIdx: number | undefined, field: string, errorLinks?: ErrorLinks) => {
  if (errorLinks) {
    const el = errorLinks.find( l => l.attrIdx === attrIdx && l.field === field );
    return el && el.message;
  }
  return undefined;
};

export const userPrefix = 'USR$';

/**
 * Функция возвращает имя без префикса.
 */
export function stripUserPrefix(name: string) {
  if (isUserDefined(name)) {
    return name.substring(userPrefix.length);
  } else {
    return name;
  }
};

/**
 * Функция добавляет префикс.
 */
export function addUserPrefix(name: string) {
  if (isUserDefined(name)) {
    return name;
  } else {
    return userPrefix.concat(name);
  }
};
