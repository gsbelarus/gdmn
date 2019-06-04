import {
  Entity,
  EntityAttribute,
  EntityLink,
  EntityLinkField,
  EntityQuery,
  EntityQueryOptions,
  IEntityQueryResponseFieldAlias,
  ParentAttribute,
  ScalarAttribute
} from "gdmn-orm";
import {IFieldDef, TFieldType} from "gdmn-recordset";

interface Idata2RS {
  [fieldName: string]: string | null;
};

export function prepareDefaultEntityQuery(entity: Entity, pkValues?: any[], alias: string = 'root'): EntityQuery {
  const scalarFields = Object.values(entity.attributes)
    .filter((attr) => attr instanceof ScalarAttribute && attr.type !== "Blob")
    .map((attr) => new EntityLinkField(attr));

  const linkFields = Object.values(entity.attributes)
    .filter((attr) => attr.type === "Entity")
    .map((attr) => {
      const linkAttr = attr as EntityAttribute;
      const scalarAttrs = Object.values(linkAttr.entities[0].attributes)
        .filter((attr) => attr instanceof ScalarAttribute && attr.type !== "Blob");

      const fields: EntityLinkField[] = linkAttr.entities[0].pk.map((attr) => new EntityLinkField(attr));

      const presentField = scalarAttrs.find((attr) => attr.name === "NAME")
        || scalarAttrs.find((attr) => attr.name === "USR$NAME")
        || scalarAttrs.find((attr) => attr.name === "ALIAS")
        || scalarAttrs.find((attr) => attr.type === "String");
      if (presentField) {
        fields.push(new EntityLinkField(presentField));
      }
      //if (!fields.length) {
      //  fields = fields.concat(linkAttr.entities[0].pk.map((attr) => new EntityLinkField(attr)));
      //}
      const link = new EntityLink(linkAttr.entities[0], attr.name, fields);
      return new EntityLinkField(attr, [link]);
    });

    const setLinkFields = Object.values(entity.attributes)
    .filter((attr) => attr.type === "Set")
    .map((attr) => {
      const linkAttr = attr as EntityAttribute;
      const scalarAttrs = Object.values(linkAttr.entities[0].attributes)
        .filter((attr) => attr instanceof ScalarAttribute && attr.type !== "Blob");

      const fields: EntityLinkField[] = linkAttr.entities[0].pk.map((attr) => new EntityLinkField(attr));

      const presentField = scalarAttrs.find((attr) => attr.name === "NAME")
        || scalarAttrs.find((attr) => attr.name === "USR$NAME")
        || scalarAttrs.find((attr) => attr.name === "ALIAS")
        || scalarAttrs.find((attr) => attr.type === "String");
      if (presentField) {
        fields.push(new EntityLinkField(presentField));
      }
      const link = new EntityLink(linkAttr.entities[0], attr.name, fields);
      return new EntityLinkField(attr, [link]);
    });

  const parentAttr = Object.values(entity.attributes).find( attr => attr instanceof ParentAttribute );

  if (parentAttr) {
    const scalarAttrs = Object.values((parentAttr as ParentAttribute).entities[0].attributes)
      .filter((attr) => attr instanceof ScalarAttribute && attr.type !== "Blob");
    const fields: EntityLinkField[] = (parentAttr as ParentAttribute).entities[0].pk.map((attr) => new EntityLinkField(attr));
    const presentField = scalarAttrs.find((attr) => attr.name === "NAME")
      || scalarAttrs.find((attr) => attr.name === "USR$NAME")
      || scalarAttrs.find((attr) => attr.name === "ALIAS")
      || scalarAttrs.find((attr) => attr.type === "String");
    if (presentField) {
      fields.push(new EntityLinkField(presentField));
    }
    const link = new EntityLink((parentAttr as ParentAttribute).entities[0], parentAttr.name, fields);
    linkFields.push(new EntityLinkField(parentAttr, [link]));
  }

  return new EntityQuery(
    new EntityLink(entity, alias, scalarFields.concat(linkFields).concat(setLinkFields)),
    pkValues && new EntityQueryOptions(
    undefined,
    undefined,
    [{
      equals: pkValues.map((value, index) => ({
        alias,
        attribute: entity.pk[index],
        value
      }))
    }])
  );
}

export function getData2RSData(fieldDefs: IFieldDef[], id: string): Idata2RS {
  let data2RS: Idata2RS = {};

  fieldDefs.forEach((f, i) => {
      data2RS[f.fieldName] = i == 0 ? id : null
  });
  return data2RS
}

export function getFieldsAlias(entity: Entity): IEntityQueryResponseFieldAlias {
  let i = 1;
  let fieldsAlias: any = {};

  Object.values(entity.attributes).forEach((attr)=> {
    let linkAlias = "root";
    let attrName =  attr.name;
    if (attr.type === 'Entity'|| attr.type === 'Set'){
      linkAlias = attr.name;
      attrName = entity.pk[0].name;
    }
    fieldsAlias['F$'+i] = {linkAlias, attribute: attrName};
    i++;
    if (attr.type === 'Entity'|| attr.type === 'Set'){
      fieldsAlias['F$'+i] = {linkAlias, attribute: "NAME"};
      i++;
    }
  });

  return (fieldsAlias) as IEntityQueryResponseFieldAlias
}


export function attr2fd(query: EntityQuery, fieldAlias: string, eqfa: IEntityQueryResponseFieldAlias): IFieldDef {
  const link = query.link.deepFindLink(eqfa.linkAlias)!;
  const findField = link.fields.find((field) => field.attribute.name === eqfa.attribute);

  if (!findField) {
    throw new Error("Invalid query data!");
  }

  const attr = findField.attribute;
  let dataType;
  let size: number | undefined = undefined;

  switch (attr.type) {
    case "Blob":
    case "Enum":
    case "String":
      dataType = TFieldType.String;
      break;
    case "Sequence":
    case "Integer":
      dataType = TFieldType.Integer;
      break;
    case "Float":
      dataType = TFieldType.Float;
      break;
    case "TimeStamp":
    case "Time":
    case "Date":
      dataType = TFieldType.Date;
      break;
    case "Boolean":
      dataType = TFieldType.Boolean;
      break;
    case "Numeric":
      dataType = TFieldType.Currency;
      break;
    default:
      throw new Error(`Unsupported attribute type ${attr.type} of ${attr.name}`);
  }

  const caption = query.link === link ? attr.name : `${link.alias}.${attr.name}`;
  return {
    fieldName: fieldAlias,
    dataType,
    size,
    caption,
    eqfa
  };
}
