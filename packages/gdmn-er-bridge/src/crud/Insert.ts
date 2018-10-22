import { Entity } from "gdmn-orm";
import { groupAttrsValuesByType, makeDetailAttrsSteps, makeSetAttrsSteps } from "./common";
import { Step, IInsert, IScalarAttrValue, IEntityAttrValue } from "./Crud";

type SetsThunk = (crossPKOwn: number) => Step[];
type DetailsThunk = (masterKey: number) => Step[];

export function buildInsertSteps(input: IInsert): {
  returningStep: Step,
  setAttrsValuesThunk: SetsThunk,
  detailAttrsValuesThunk: DetailsThunk
} {

  const { entity, attrsValues } = input;

  const {
    scalarAttrsValues,
    entityAttrsValues,
    setAttrsValues,
    detailAttrsValues
  } = groupAttrsValuesByType(attrsValues);

  if (scalarAttrsValues.length === 0 && entityAttrsValues.length === 0) {
    throw new Error("Must be at least one scalar or entity attribute for INSERT operation");
  }

  const returningStep = makeReturningIDsStep(entity, scalarAttrsValues, entityAttrsValues);

  const setAttrsValuesThunk = (crossPKOwn: number) => {
    return makeSetAttrsSteps(makeInsertSQL, crossPKOwn, setAttrsValues);
  };

  const detailAttrsValuesThunk = (masterKey: number) => {
    return makeDetailAttrsSteps(masterKey, detailAttrsValues);
  };

  return {
    returningStep,
    setAttrsValuesThunk,
    detailAttrsValuesThunk
  };
}

function makeInsertSQL(
  tableName: string,
  attrsNames: string[],
  placeholders: string[]) {

  const attrsNamesString = attrsNames.join(", ");
  const placeholdersString = placeholders.join(", ");
  return `INSERT INTO ${tableName} (${attrsNamesString}) VALUES (${placeholdersString})`;
}

function makeReturningIDsStep(entity: Entity,
  scalarAttrsValues: IScalarAttrValue[],
  entityAttrsValues: IEntityAttrValue[]): Step {

  const scalarAttrsValuesParams = scalarAttrsValues.reduce((acc, curr) => {
    return { ...acc, [curr.attribute.name]: curr.value };
  }, {});


  const entityAttrsValuesParams = entityAttrsValues.reduce((acc, curr) => {
    return { ...acc, [curr.attribute.name]: curr.values[0] };
  }, {});

  const params = { ...scalarAttrsValuesParams, ...entityAttrsValuesParams };
  const attrsNames = Object.keys(params);
  const placeholders = attrsNames.map(name => `:${name}`);

  const attrsNamesString = attrsNames.join(", ");
  const placeholdersString = placeholders.join(", ");
  const sql = `INSERT INTO ${entity.name} (${attrsNamesString}) VALUES (${placeholdersString}) RETURNING ID`;

  const step = { sql, params };
  return step;
}
