import { Step, IUpdate, IScalarAttrValue, IEntityAttrValue, ISetAttrValue } from "./Crud";
import { Entity } from "gdmn-orm";
import { Constants } from "../ddl/Constants";
import { groupAttrsValuesByType, makeDetailAttrsSteps, flatten, zip3 } from "./common";

export function buildUpdateSteps(input: IUpdate): Step[] {
  const { entity, attrsValues } = input;
  const pk = input.pk;

  const {
    scalarAttrsValues,
    entityAttrsValues,
    setAttrsValues,
    detailAttrsValues
  } = groupAttrsValuesByType(attrsValues);

  const scalarsAndEntitiesSteps = makeScalarsAndEntitiesSteps(
    entity, pk, scalarAttrsValues, entityAttrsValues);
  const setsSteps = makeSetAttrsSteps(pk[0], setAttrsValues);
  const detailsSteps = makeDetailAttrsSteps(pk[0], detailAttrsValues);
  const steps = [...scalarsAndEntitiesSteps, ...setsSteps, ...detailsSteps];

  return steps;
}

function makeUpdateSQL(
  tableName: string,
  attrsNamesSetPart: string[],
  attrsNamesWherePart: string[]) {

  const setPart = attrsNamesSetPart.map(name => `${name} = :${name}`).join(", ");
  const wherePart = attrsNamesWherePart.map(name => `${name} = :${name}`).join(" AND ");
  const sql = `UPDATE ${tableName} SET ${setPart} WHERE ${wherePart}`;

  return sql;
}


function makeScalarsAndEntitiesSteps(
  entity: Entity, pk: any[],
  scalarAttrsValues: IScalarAttrValue[],
  entityAttrsValues: IEntityAttrValue[]): Step[] {

  if (scalarAttrsValues.length === 0 && entityAttrsValues.length === 0) {
    return [];
  }

  // TODO:
  // with complex primary keys?
  const pkNames = entity.pk.map(key => key.adapter.field);
  const pkParams = pkNames.reduce((acc, curr, currIndex) => {
    return {
      ...acc,
      [curr]: pk[currIndex]
    };
  }, {});

  const scalarAttrsValuesParams = scalarAttrsValues.reduce((acc, curr) => {
    return { ...acc, [curr.attribute.name]: curr.value };
  }, {});
  const entityAttrsValuesParams = entityAttrsValues.reduce((acc, curr) => {
    return { ...acc, [curr.attribute.name]: curr.values[0] };
  }, {});

  const params = { ...pkParams, ...scalarAttrsValuesParams, ...entityAttrsValuesParams };

  const scalarAttrsNames = Object.keys(scalarAttrsValuesParams);
  const entityAttrsNames = Object.keys(entityAttrsValuesParams);
  const attrsNames = [
    ...scalarAttrsNames,
    ...entityAttrsNames
  ];
  const sql = makeUpdateSQL(entity.name, attrsNames, pkNames);
  // TODO: sql always the same, this is space for optimization.
  const steps = [{ sql, params }];

  return steps;
}

function makeSetAttrsSteps(crossPKOwn: number, setAttrsValues: ISetAttrValue[]): Step[] {

  const flat = flatten(setAttrsValues.map(currSetAttrValue => {

    const { crossValues, refIDs } = currSetAttrValue;

    const currRefIDs = currSetAttrValue.currRefIDs;

    if (currRefIDs === undefined) {
      throw new Error("ISetAttrValue must provide currRefIDs for Update operation");
    }

    const innerSteps = zip3(refIDs, currRefIDs, crossValues).map(([refID, currRefID, currValues]) => {

      const currCrossValues = currValues as IScalarAttrValue[] || [];

      const restCrossAttrsParams = currCrossValues.reduce((acc, curr: IScalarAttrValue) => {
        return { ...acc, [curr.attribute.name]: curr.value };
      }, {});

      const setPartParams = {
        [Constants.DEFAULT_CROSS_PK_REF_NAME]: refID,
        ...restCrossAttrsParams
      };

      const setPartNames = Object.keys(setPartParams);
      const setSQLPart = setPartNames.map(name => `${name} = :${name}`).join(", ");

      const wherePartParams = {
        [Constants.DEFAULT_CROSS_PK_OWN_NAME]: crossPKOwn,
        currRefID
      };
      const whereSQLPart = [`${Constants.DEFAULT_CROSS_PK_OWN_NAME} = :${Constants.DEFAULT_CROSS_PK_OWN_NAME}`, `${Constants.DEFAULT_CROSS_PK_REF_NAME} = :currRefID`].join(" AND ");

      let crossTableName;
      if (currSetAttrValue.attribute.adapter) {
        crossTableName = currSetAttrValue.attribute.adapter.crossRelation;
      } else {
        crossTableName = currSetAttrValue.attribute.name;
      }

      const sql = `UPDATE ${crossTableName} SET ${setSQLPart} WHERE ${whereSQLPart}`;

      const params = {
        ...setPartParams,
        ...wherePartParams,
        ...restCrossAttrsParams
      };

      const step = { sql, params };

      return step;

    });

    return innerSteps;

  }));

  return flat;
}
