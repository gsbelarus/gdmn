import { AttributeTypes, IStringAttribute, IAttribute, IEnumAttribute, IEntity, INumberAttribute } from "gdmn-orm";

export const initAttr = (type: AttributeTypes, prevAttr?: IAttribute) => {
  const attr: Partial<IAttribute> = {
    name: prevAttr ? prevAttr.name : '',
    lName: prevAttr && prevAttr.lName ? prevAttr.lName : { ru: { name: 'Описание' }},
    required: prevAttr ? prevAttr.required : false,
    semCategories: prevAttr ? prevAttr.semCategories : '',
  };

  switch (type) {
    case 'String':
      return {
        ...attr,
        type: 'String',
        autoTrim: false
      } as IStringAttribute;

    case 'Enum':
      return {
        ...attr,
        type: 'Enum',
        values: [],
        defaultValue: undefined
      } as IEnumAttribute;

    case 'Integer':
      return {
        ...attr,
        type: 'Integer',
        defaultValue:undefined
      } as INumberAttribute<number>;
  }

  throw new Error(`Unsupported type ${type}`);
};

export interface IErrorLink {
  attrIdx?: number;
  field: string;
  message: string;
};

export type ErrorLinks = IErrorLink[];

export const validateAttributes = (entity: IEntity) => {
  const errorLinks = entity.attributes.reduce(
    (p, attr, attrIdx) => {
      if (!attr.name) {
        p.push({
          attrIdx,
          field: 'name',
          message: "Name can't be empty"
        });
      }

      switch (attr.type) {
        case 'String': {
          const s = attr as IStringAttribute;
          if (s.minLength !== undefined && s.minLength > 32000) {
            p.push({
              attrIdx,
              field: 'minLength',
              message: "Out of range (0..32000)"
            });
          }

          if (s.maxLength !== undefined && s.maxLength > 32000) {
            p.push({
              attrIdx,
              field: 'maxLength',
              message: "Out of range (0..32000)"
            });
          }

          if (s.minLength !== undefined && s.maxLength !== undefined && s.minLength > s.maxLength) {
            p.push({
              attrIdx,
              field: 'minLength',
              message: "Min length > max length"
            });
          }
          break;
        }

        case 'Integer': {
          const i = attr as INumberAttribute<number>;

          if (i.minValue !== undefined && i.maxValue !== undefined && i.minValue > i.maxValue) {
            p.push({
              attrIdx,
              field: 'minValue',
              message: "Min Value > Max Value"
            });
          }
          break;
        }
      }
      return p;
    }, [] as ErrorLinks
  );

  if (!entity.name) {
    errorLinks.push({
      field: 'entityName',
      message: "Name can't be empty"
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

/*
export const getErrorMessage = (field: string, errorLinks?: ErrorLinks) => {
  if (errorLinks) {
    const el = errorLinks.find( l => l.field === field );
    return el && el.message;
  }
  return undefined;
};
*/
