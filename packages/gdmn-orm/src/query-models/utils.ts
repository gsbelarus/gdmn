import { Entity, EntityLinkField, ScalarAttribute, EntityAttribute, EntityLink, ParentAttribute, EntityQueryOrderType, EntityQuery, IEntityQueryOrder, EntityQueryOptions, EntityQuerySet, EntityQuerySetOptions } from "..";

export function prepareDefaultEntityLinkFields(entity: Entity): EntityLinkField[] {
  const scalarFields = Object.values(entity.attributes)
    .filter((attr) => attr instanceof ScalarAttribute && attr.type !== "Blob")
    .map((attr) => new EntityLinkField(attr));

  const linkFields = Object.values(entity.attributes)
    .filter((attr) => attr.type === "Entity")
    .map((attr) => {
      const linkAttr = attr as EntityAttribute;
      // const scalarAttrs = Object.values(linkAttr.entities[0].attributes)
      //   .filter((attr) => attr instanceof ScalarAttribute && attr.type !== "Blob");

      const fields: EntityLinkField[] = linkAttr.entities[0].pk.map((attr) => new EntityLinkField(attr));

      // const presentField = scalarAttrs.find((attr) => attr.name === "NAME")
      //   || scalarAttrs.find((attr) => attr.name === "USR$NAME")
      //   || scalarAttrs.find((attr) => attr.name === "ALIAS")
      //   || scalarAttrs.find((attr) => attr.type === "String");

      const presentField = linkAttr.entities[0].presentAttribute();

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

  return scalarFields.concat(linkFields);
}

export function prepareDefaultEntityQuery(entity: Entity, pkValues?: any[], alias: string = 'root', orderFields?: {name: string, order: EntityQueryOrderType}[]): EntityQuery {

  const orderObj: IEntityQueryOrder[] = [];
  orderFields && orderFields.forEach(fd => {
    const sortAttrs = Object.values(entity.attributes).find(attr => attr.name === fd.name);
    sortAttrs && orderObj.push({alias, type: fd.order, attribute: sortAttrs});
  });

  const whereObj = pkValues && [{
    equals: pkValues.map((value, index) => ({
      alias,
      attribute: entity.pk[index],
      value
    }))
  }];

  return new EntityQuery(
    new EntityLink(entity, alias, prepareDefaultEntityLinkFields(entity)),
    new EntityQueryOptions(
    undefined,
    undefined,
    whereObj,
    orderObj)
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
