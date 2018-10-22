import { Entity, SetAttribute, DetailAttribute, ScalarAttribute, EntityAttribute, } from "gdmn-orm";
import { AConnection, ATransaction } from "gdmn-db";
import { buildUpdateOrInsertSteps } from "./UpdateOrInsert";
import { buildUpdateSteps } from "./Update";
import { buildInsertSteps } from "./Insert";
import { buildDeleteSteps } from "./Delete";
import { flatten } from "./common";

export type Scalar = string | boolean | number | Date | null;

export interface IScalarAttrValue {
  attribute: ScalarAttribute;
  value: Scalar;
}

export interface IEntityAttrValue {
  attribute: EntityAttribute;
  values: Scalar[];
}

// Set attribute (add applications to user).
// insert in cross table:
// (userId, appID, alias, another_column, ...)
// (1, 12, alias1, anothercrosscolumnvalue1, ...)
// (1, 23, alias2, anothercrosscolumnvalue2, ...)
// const setAttrValue = {
//   attribute,
//   crossValues: [["alias1", "anothercrosscolumnvalue1"], ["alias2", "anothercrosscolumnvalue2"], ...]
//   refIDs: [12, 13]
// };

export interface ISetAttrValue {
  attribute: SetAttribute;
  crossValues: IScalarAttrValue[][];
  currRefIDs?: number[]; // only for Update to define which exactly records should update
  refIDs: number[];
}

export interface IDetailAttrValue {
  attribute: DetailAttribute;
  pks: Scalar[][];
}

export interface IAttrsValuesByType {
  scalarAttrsValues: IScalarAttrValue[];
  entityAttrsValues: IEntityAttrValue[];
  detailAttrsValues: IDetailAttrValue[];
  setAttrsValues: ISetAttrValue[];
}

export type AttrsValues = Array<
  IScalarAttrValue | IEntityAttrValue | ISetAttrValue | IDetailAttrValue>;

export interface IInsert {
  entity: Entity;
  attrsValues: AttrsValues;
}

export interface IUpdate extends IInsert {
  pk: any[];
}

export interface IUpdateOrInsert extends IInsert {
  pk?: any[];
}

export interface IDelete {
  pk: any[];
  entity: Entity;
}

export type Step = { sql: string, params: {} };

async function runPrepNestedSteps(
  connection: AConnection,
  transaction: ATransaction,
  nestedSteps: Step[][]): Promise<void> {

  if (flatten(nestedSteps).length > 0) {
    for (const setSteps of nestedSteps) {
      const generalSQL = setSteps[0].sql;
      const statement = await connection.prepare(transaction, generalSQL);
      for (const { params } of setSteps) {
        await statement.execute(params);
      }
      await statement.dispose();
    }
  }
}

export abstract class Crud {

  public static async executeInsert(
    connection: AConnection,
    input: IInsert | Array<IInsert>
  ): Promise<number[]> {

    const datoms = Array.isArray(input) ? input : [input];

    const nestedSteps = datoms.map(d => buildInsertSteps(d));

    const returningSteps = nestedSteps.map(({ returningStep }) => returningStep);
    const returningSQL = returningSteps[0].sql;
    const returningNestedParams = returningSteps.map(({ params }) => params);

    const ids = await AConnection.executeTransaction({
      connection,
      callback: async (transaction) => {

        const returningStatement = await connection.prepare(transaction, returningSQL);

        let ids: number[] = [];
        for (const params of returningNestedParams) {
          const result = await returningStatement.executeReturning(params);
          const id = result.getNumber("ID");
          ids.push(id);
        }

        await returningStatement.dispose();

        const setsNestedSteps = nestedSteps.map(({ setAttrsValuesThunk }, currIndex) => setAttrsValuesThunk(ids[currIndex]));
        await runPrepNestedSteps(connection, transaction, setsNestedSteps);

        const detailsNestedSteps = nestedSteps.map(({ detailAttrsValuesThunk }, currIndex) => detailAttrsValuesThunk(ids[currIndex]));
        await runPrepNestedSteps(connection, transaction, detailsNestedSteps);

        return ids;
      }
    });

    return ids;
  }

  public static async executeUpdateOrInsert(
    connection: AConnection,
    input: IUpdateOrInsert | Array<IUpdateOrInsert>): Promise<Array<number>> {

    const datoms = Array.isArray(input) ? input : [input];

    const datomsWithPK = datoms.filter(d => d.pk);
    const nestedSteps = datomsWithPK.map(d => buildUpdateOrInsertSteps(d));
    const flattenSteps = flatten(nestedSteps);

    await AConnection.executeTransaction({
      connection,
      callback: async (transaction) => {
        for (const { sql, params } of flattenSteps) {
          await connection.executeReturning(
            transaction,
            sql,
            params
          );
        }
      },
    });

    const datomsWithoutPK = datoms.filter(d => !d.pk);
    if (datomsWithoutPK.length > 0) {
      const ids = await Crud.executeInsert(connection, datomsWithoutPK as IInsert[]);
      return ids;
    }

    return [];
  }

  public static async executeUpdate(
    connection: AConnection,
    input: IUpdate | IUpdate[]
  ): Promise<void> {

    const datoms = Array.isArray(input) ? input : [input];

    const nestedSteps = datoms.map(d => buildUpdateSteps(d));
    const flattenSteps = flatten(nestedSteps);

    await AConnection.executeTransaction({
      connection,
      callback: async (transaction) => {
        for (const { sql, params } of flattenSteps) {
          await connection.executeReturning(
            transaction,
            sql,
            params
          );
        }
      },
    });
  }

  public static async executeDelete(
    connection: AConnection,
    input: IDelete | IDelete[]
  ): Promise<void> {

    const datoms = Array.isArray(input) ? input : [input];

    const nestedSteps = datoms.map(d => buildDeleteSteps(d));
    const flattenSteps = flatten(nestedSteps);

    await AConnection.executeTransaction({
      connection,
      callback: async (transaction) => {
        for (const { sql, params } of flattenSteps) {
          await connection.execute(transaction, sql, params);
        }
      }
    });

  }
}
