import { AttributeTypes, IStringAttribute, IAttribute, IEnumAttribute } from "gdmn-orm";

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
  }

  throw new Error(`Unsupported type ${type}`);
};