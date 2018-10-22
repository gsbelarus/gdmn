import { Step, IDelete } from "./Crud";
import { SetAttribute, DetailAttribute } from "gdmn-orm"; import { Constants } from "../ddl/Constants";

export function buildDeleteSteps(input: IDelete): Step[] {
  const { pk, entity } = input;

  const pkNames = entity.pk.map(key => key.adapter.field);
  const pkValues = pk;
  const params = pkNames.reduce((acc, currName, currIndex) => {
    return {
      ...acc,
      [currName]: pkValues[currIndex]
    };
  }, {});

  const wherePart = pkNames.map(name => `${name} = :${name}`).join(" AND ");
  const sql = `DELETE FROM ${entity.name} WHERE ${wherePart}`;
  const mainStep = { sql, params };

  const attributesNames = Object.keys(entity.attributes);
  const attributes = attributesNames.map(name => entity.attribute(name));

  const setAttrs = attributes.filter(attr => SetAttribute.isType(attr));
  const cascadeSetSteps = setAttrs.map((currSetAttr) => {

    const crossTableName = currSetAttr.adapter ? currSetAttr.adapter!.crossRelation : currSetAttr.name;

    const wherePart = `${Constants.DEFAULT_CROSS_PK_OWN_NAME} = :${Constants.DEFAULT_CROSS_PK_OWN_NAME}`;
    const sql = `DELETE FROM ${crossTableName} WHERE ${wherePart}`;
    const [pkOwnValue] = pkValues;
    const params = {
      [Constants.DEFAULT_CROSS_PK_OWN_NAME]: pkOwnValue
    };
    return { sql, params };
  });

  const detailAttrs = attributes.filter(attr => DetailAttribute.isType(attr)) as DetailAttribute[];
  const cascadeDetailSteps = detailAttrs.map((currDetailAttr: DetailAttribute) => {

    const [detailEntity] = currDetailAttr.entities;
    const detailRelation = currDetailAttr.adapter ?
      currDetailAttr.adapter.masterLinks[0].detailRelation :
      detailEntity.name;

    const link2masterField = currDetailAttr.adapter ?
      currDetailAttr.adapter.masterLinks[0].link2masterField :
      Constants.DEFAULT_MASTER_KEY_NAME;

    const wherePart = `${link2masterField} = :${link2masterField}`;
    // const sql = `DELETE FROM ${detailRelation} WHERE ${wherePart}`;
    const setPart = `${link2masterField} = NULL`;
    const sql = `UPDATE ${detailRelation} SET ${setPart} WHERE ${wherePart}`;
    const [masterID] = pkValues;
    const params = {
      [link2masterField]: masterID
    };

    return { sql, params };
  });

  const steps = [...cascadeSetSteps, ...cascadeDetailSteps, mainStep];
  return steps;
}
