import { Step, IUpdateOrInsert, IScalarAttrValue, IEntityAttrValue } from "./Crud";
import { Entity } from "gdmn-orm";
import { groupAttrsValuesByType, makeSetAttrsSteps, makeDetailAttrsSteps } from "./common";

export function buildUpdateOrInsertSteps(input: IUpdateOrInsert): Step[] {

  const { entity, attrsValues } = input;
  const pk = input.pk!;

  const {
    scalarAttrsValues,
    entityAttrsValues,
    setAttrsValues,
    detailAttrsValues
  } = groupAttrsValuesByType(attrsValues);

  const scalarsAndEntitiesSteps = makeScalarsAndEntitiesSteps(
    entity, pk, scalarAttrsValues, entityAttrsValues);
  const setsSteps = makeSetAttrsSteps(makeUpdateOrInsertSQL, pk[0], setAttrsValues);
  const detailsSteps = makeDetailAttrsSteps(pk[0], detailAttrsValues);
  const steps = [...scalarsAndEntitiesSteps, ...setsSteps, ...detailsSteps];

  return steps;
}

function makeUpdateOrInsertSQL(
  tableName: string,
  attrsNames: string[],
  placeholders: string[]) {

  const attrsNamesString = attrsNames.join(", ");
  const placeholdersString = placeholders.join(", ");
  return `UPDATE OR INSERT INTO ${tableName} (${attrsNamesString}) VALUES (${placeholdersString})`;
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

  const names = [
    ...pkNames,
    ...scalarAttrsNames,
    ...entityAttrsNames
  ];
  const placeholders = names.map(name => `:${name}`);
  const sql = makeUpdateOrInsertSQL(entity.name, names, placeholders);
  // TODO: sql always the same, this is space for optimization.
  const steps = [{ sql, params }];

  return steps;
}
