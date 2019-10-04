import { AttributeTypes, IStringAttribute, IAttribute, IEnumAttribute, IEntity, INumberAttribute,
  IBooleanAttribute, INumericAttribute, isINumericAttribute, IDateAttribute, IEntityAttribute, GedeminEntityType } from "gdmn-orm";

export const initAttr = (type: AttributeTypes, prevAttr?: IAttribute) => {
  const attr: Partial<IAttribute> = {
    type,
    name: prevAttr ? prevAttr.name : '',
    lName: prevAttr && prevAttr.lName ? prevAttr.lName : { ru: { name: 'Описание' }},
    required: prevAttr ? prevAttr.required : false,
    semCategories: prevAttr ? prevAttr.semCategories : '',
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
      return {...attr, scale: 18, precision: 4} as INumericAttribute;

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

export const validateAttributes = (entity: IEntity, requiredEntityType: GedeminEntityType, prevErrorLinks: ErrorLinks) => {
  const errorLinks = entity.attributes.reduce(
    (p, attr, attrIdx) => {
      if (!attr.name) {
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
          break;
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
            if (attr.precision >= attr.scale) {
              p.push({
                attrIdx,
                field: 'precision',
                message: "Precision must be less than scale",
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

  if (!entity.name) {
    errorLinks.push({
      field: 'entityName',
      message: "Name can't be empty",
      internal: false
    });
  }

  if (!entity.parent && requiredEntityType === 'INHERITED') {
    errorLinks.push({
      field: 'entityParent',
      message: "Enter ancestor entity",
      internal: false
    });
  }

  return errorLinks;
};

export const getErrorMessage = (field: string, errorLinks?: ErrorLinks) => {
  if (errorLinks) {
    const el = errorLinks.find( l => l.field === field );
    return el && el.message;
  }
  return undefined;
};
