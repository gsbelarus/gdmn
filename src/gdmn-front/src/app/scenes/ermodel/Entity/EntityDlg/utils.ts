import { AttributeTypes, IStringAttribute, IAttribute, IEnumAttribute, IEntity, INumberAttribute, IBooleanAttribute, INumericAttribute } from "gdmn-orm";

export const initAttr = (type: AttributeTypes, prevAttr?: IAttribute) => {
  const attr: Partial<IAttribute> = {
    type,
    name: prevAttr ? prevAttr.name : '',
    lName: prevAttr && prevAttr.lName ? prevAttr.lName : { ru: { name: 'Описание' }},
    required: prevAttr ? prevAttr.required : false,
    semCategories: prevAttr ? prevAttr.semCategories : '',
  };

  switch (type) {
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
      if (!attr.name) {
        p.push({
          attrIdx,
          field: 'name',
          message: "Name can't be empty",
          internal: false
        });
      }

      switch (attr.type) {
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
        case 'Float': {
          const i = attr as INumberAttribute<number>;

          if (i.minValue !== undefined && i.maxValue !== undefined && i.minValue > i.maxValue) {
            p.push({
              attrIdx,
              field: 'minValue',
              message: "Min Value > Max Value",
              internal: false
            });
          }
          break;
        }

        case 'Numeric': {
          const i = attr as INumericAttribute;

          if (i.minValue !== undefined && i.maxValue !== undefined && i.minValue > i.maxValue) {
            p.push({
              attrIdx,
              field: 'minValue',
              message: "Min Value > Max Value",
              internal: false
            });
          }

          if (i.precision >= i.scale) {
            p.push({
              attrIdx,
              field: 'precision',
              message: "Precision must be less than scale",
              internal: false
            });
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
