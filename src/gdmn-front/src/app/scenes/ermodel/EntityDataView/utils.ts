import {
  Entity,
  EntityAttribute,
  EntityLink,
  EntityLinkField,
  EntityQuery,
  EntityQueryOptions,
  ParentAttribute,
  ScalarAttribute,
  EntityQuerySet,
  EntityQuerySetOptions
} from "gdmn-orm";
import {IFieldDef, TFieldType} from "gdmn-recordset";

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
    new EntityLink(entity, alias, scalarFields.concat(linkFields)),
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

export function prepareDefaultEntityQuerySetAttr(entity: Entity, fieldname?: string, pkValues?: any[], alias: string = 'root'): EntityQuerySet {
  const setLinkFields = Object.values(entity.attributes)
  .filter((attr) => attr.type === "Set" && (fieldname? attr.name === fieldname : true))
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

  const where = fieldname && pkValues && [{
    equals: pkValues.map((value, index) => ({
      alias:fieldname,
      value
    }))
  }]

  return new EntityQuerySet(
    new EntityLink(entity, alias, setLinkFields),
    pkValues && new EntityQuerySetOptions(
    where ? where : undefined
    )
  );
}

export function attr2fd(query: EntityQuery, fieldAlias: string, linkAlias: string, attribute: string): IFieldDef {
  const link = query.link.deepFindLink(linkAlias)!;
  const findField = link.fields.find((field) => field.attribute.name === attribute);

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
    eqfa: { linkAlias, attribute }
  };
}
