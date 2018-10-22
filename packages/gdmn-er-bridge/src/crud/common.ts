import { ScalarAttribute, SetAttribute, DetailAttribute, EntityAttribute } from "gdmn-orm";
import { IAttrsValuesByType, AttrsValues, IScalarAttrValue, ISetAttrValue, IDetailAttrValue, IEntityAttrValue, Step, Scalar } from "./Crud";
import { Constants } from "../ddl/Constants";

export function flatten(nestedList: any[][]): any[] {
  const flatList = nestedList.reduce((acc, curr) => {
    if (Array.isArray(curr)) {
      return [...acc, ...curr];
    }
    return [...acc, curr];
  }, []);
  return flatList;
}

export function zip3(xs: any[], ys: any[], zs: any[]): any[] {
  const zipped = xs.map((x, index) => {
    return [x, ys[index], zs[index]];
  });
  return zipped;
}

export function groupAttrsValuesByType(attrsValues: AttrsValues) {

  const byType: IAttrsValuesByType = {
    scalarAttrsValues: [],
    entityAttrsValues: [],
    detailAttrsValues: [],
    setAttrsValues: []
  };

  return attrsValues.reduce((acc: IAttrsValuesByType, curr) => {

    if (ScalarAttribute.isType(curr.attribute)) {
      const scalarAttrsValues = [...acc.scalarAttrsValues, curr as IScalarAttrValue];
      return {
        ...acc,
        scalarAttrsValues
      };
    }

    if (SetAttribute.isType(curr.attribute)) {
      const setAttrsValues = [...acc.setAttrsValues, curr as ISetAttrValue];
      return {
        ...acc,
        setAttrsValues
      };
    }

    if (DetailAttribute.isType(curr.attribute)) {
      const detailAttrsValues = [...acc.detailAttrsValues, curr as IDetailAttrValue];
      return {
        ...acc,
        detailAttrsValues
      };
    }

    if (EntityAttribute.isType(curr.attribute)) {
      const entityAttrsValues = [...acc.entityAttrsValues, curr as IEntityAttrValue];
      return {
        ...acc,
        entityAttrsValues
      };
    }

    throw new Error("Unknow attribute type");

  }, byType);
};


export function makeDetailAttrsSteps(masterKeyValue: number,
  detailAttrsValues: IDetailAttrValue[]): Step[] {

  const steps = detailAttrsValues.map(currDetailAttrValues => {
    const currDetailAttr = currDetailAttrValues.attribute;
    const [detailEntity] = currDetailAttr.entities;

    const detailRelation = currDetailAttr.adapter ?
      currDetailAttr.adapter.masterLinks[0].detailRelation :
      detailEntity.attribute.name;

    const link2masterField = currDetailAttr.adapter ?
      currDetailAttr.adapter.masterLinks[0].link2masterField :
      Constants.DEFAULT_MASTER_KEY_NAME;


    const parts = currDetailAttrValues.pks.map((pk: Scalar[], pkIndex) => {

      const pKeyNames = detailEntity.pk.map(k => k.name);
      const sqlPart = pKeyNames
        .map(name => `${name} = :${name}${pkIndex}`)
        .join(" AND ");

      const params = pKeyNames.reduce((acc, currName, currIndex) => {
        return { ...acc, [`${currName}${pkIndex}`]: pk[currIndex] };
      }, {});

      return { sqlPart, params };
    });

    const whereParams = parts.reduce((acc, part) => {
      return { ...acc, ...part.params };
    }, {});
    const whereSQL = parts.map(part => part.sqlPart).join(" OR ");

    const sql = `UPDATE ${detailRelation} SET ${link2masterField} = (${masterKeyValue}) WHERE ${whereSQL}`;
    const step = { sql, params: whereParams };
    return step;
  });

  return steps;
}


export function makeSetAttrsSteps(makeSQL: (tableName: string, attrsNames: string[], placeholders: string[]) => string, crossPKOwn: number, setAttrsValues: ISetAttrValue[]): Step[] {

  const steps = setAttrsValues.map(currSetAttrValue => {

    const { crossValues, refIDs } = currSetAttrValue;

    const innerSteps = refIDs.map((currRefID, index) => {

      const currValues = crossValues[index] || [];

      const restCrossAttrsParams = currValues.reduce((acc, curr: IScalarAttrValue) => {
        return { ...acc, [curr.attribute.name]: curr.value };
      }, {});

      const params = {
        [Constants.DEFAULT_CROSS_PK_OWN_NAME]: crossPKOwn,
        [Constants.DEFAULT_CROSS_PK_REF_NAME]: currRefID,
        ...restCrossAttrsParams
      };

      const attrsNames = Object.keys(params);
      const placeholders = attrsNames.map(name => `:${name}`);

      let crossTableName;
      if (currSetAttrValue.attribute.adapter) {
        crossTableName = currSetAttrValue.attribute.adapter.crossRelation;
      } else {
        crossTableName = currSetAttrValue.attribute.name;
      }

      const sql = makeSQL(crossTableName, attrsNames, placeholders);
      const step = { sql, params };
      return step;
    });

    return innerSteps;
  });

  const flat = flatten(steps);
  return flat;
}
