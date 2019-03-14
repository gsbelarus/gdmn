import {AConnection} from "../../AConnection";
import {AConnectionPool} from "../../AConnectionPool";
import {ATransaction} from "../../ATransaction";
import {
    ConstraintType,
    DeleteRule,
    IRDB$FIELD,
    IRDB$RELATIONCONSTRAINT,
    IRDB$RELATIONFIELD,
    NullFlag,
    UpdateRule
} from "../../DBSchema";

export class RDBReader {

    public static async readFields(connection: AConnection, transaction: ATransaction): Promise<IRDB$FIELD[]> {
        return await AConnection.executeQueryResultSet({
            connection,
            transaction,
            sql: `
                SELECT
                    TRIM(f.RDB$FIELD_NAME)                            AS "fieldName",
                    f.RDB$FIELD_TYPE                                  AS "fieldType",
                    f.RDB$NULL_FLAG                                   AS "nullFlag",
                    f.RDB$DEFAULT_SOURCE                              AS "defaultSource",
                    f.RDB$FIELD_LENGTH                                AS "fieldLength",
                    f.RDB$FIELD_SCALE                                 AS "fieldScale",
                    f.RDB$VALIDATION_SOURCE                           AS "validationSource",
                    f.RDB$FIELD_SUB_TYPE                              AS "fieldSubType",
                    f.RDB$FIELD_PRECISION                             AS "fieldPrecision"
                FROM RDB$FIELDS f
            `,
            callback: async (resultSet) => {
                const array: IRDB$FIELD[] = [];
                while (await resultSet.next()) {
                    array.push({
                        RDB$FIELD_NAME: resultSet.getString("fieldName"),
                        RDB$FIELD_TYPE: resultSet.getNumber("fieldType"),
                        RDB$NULL_FLAG: resultSet.getNumber("nullFlag") as NullFlag,
                        RDB$DEFAULT_SOURCE: resultSet.isNull("defaultSource")
                            ? null
                            : await connection.openBlobAsString(transaction, resultSet.getBlob("defaultSource")!),
                        RDB$FIELD_LENGTH: resultSet.getNumber("fieldLength"),
                        RDB$FIELD_SCALE: resultSet.getNumber("fieldScale"),
                        RDB$VALIDATION_SOURCE: resultSet.isNull("validationSource")
                            ? null
                            : await connection.openBlobAsString(transaction, resultSet.getBlob("validationSource")!),
                        RDB$FIELD_SUB_TYPE: resultSet.isNull("fieldSubType") ? null
                            : resultSet.getNumber("fieldSubType"),
                        RDB$FIELD_PRECISION: resultSet.getNumber("fieldPrecision")
                    });
                }
                return array;
            }
        });
    }

    public static async readRelationFields(connection: AConnection,
                                           transaction: ATransaction): Promise<IRDB$RELATIONFIELD[]> {
        return await AConnection.executeQueryResultSet({
            connection,
            transaction,
            sql: `
                SELECT
                    TRIM(rf.RDB$RELATION_NAME)                        AS "relationName",
                    TRIM(rf.RDB$FIELD_NAME)                           AS "fieldName",
                    TRIM(rf.RDB$FIELD_SOURCE)                         AS "fieldSource",
                    rf.RDB$NULL_FLAG                                  AS "nullFlag",
                    rf.RDB$DEFAULT_SOURCE                             AS "defaultSource"
                FROM RDB$RELATION_FIELDS rf
                ORDER BY RDB$RELATION_NAME, RDB$FIELD_POSITION
            `,
            callback: async (resultSet) => {
                const array: IRDB$RELATIONFIELD[] = [];
                while (await resultSet.next()) {
                    array.push({
                        RDB$RELATION_NAME: resultSet.getString("relationName"),
                        RDB$FIELD_NAME: resultSet.getString("fieldName"),
                        RDB$FIELD_SOURCE: resultSet.getString("fieldSource"),
                        RDB$NULL_FLAG: resultSet.getNumber("nullFlag") as NullFlag,
                        RDB$DEFAULT_SOURCE: resultSet.isNull("defaultSource")
                            ? null
                            : await connection.openBlobAsString(transaction, resultSet.getBlob("defaultSource")!)
                    });
                }
                return array;
            }
        });
    }

    public static async readConstraints(connection: AConnection,
                                        transaction: ATransaction): Promise<IRDB$RELATIONCONSTRAINT[]> {
        return await AConnection.executeQueryResultSet({
            connection,
            transaction,
            sql: `
                SELECT
                    TRIM(rc.RDB$RELATION_NAME)      AS "relationName",
                    TRIM(rc.RDB$CONSTRAINT_NAME)    AS "constraintName",
                    TRIM(rc.RDB$CONSTRAINT_TYPE)    AS "constraintType",
                    TRIM(s.RDB$INDEX_NAME)          AS "indexName",
                    TRIM(s.RDB$FIELD_NAME)          AS "fieldName",
                    TRIM(rfc.RDB$CONST_NAME_UQ)     AS "constNameUq",
                    TRIM(rfc.RDB$UPDATE_RULE)       AS "updateRule",
                    TRIM(rfc.RDB$DELETE_RULE)       AS "deleteRule"
                FROM RDB$RELATION_CONSTRAINTS rc
                   JOIN RDB$INDEX_SEGMENTS s ON s.RDB$INDEX_NAME = rc.RDB$INDEX_NAME
                   LEFT JOIN RDB$REF_CONSTRAINTS rfc ON rfc.RDB$CONSTRAINT_NAME = rc.RDB$CONSTRAINT_NAME
                ORDER BY rc.RDB$RELATION_NAME, rc.RDB$CONSTRAINT_NAME, s.RDB$FIELD_POSITION
            `,
            callback: async (resultSet) => {
                const array: IRDB$RELATIONCONSTRAINT[] = [];
                while (await resultSet.next()) {
                    array.push({
                        RDB$RELATION_NAME: resultSet.getString("relationName"),
                        RDB$CONSTRAINT_NAME: resultSet.getString("constraintName"),
                        RDB$CONSTRAINT_TYPE: resultSet.getString("constraintType") as ConstraintType,
                        RDB$INDEX_NAME: resultSet.getString("indexName"),
                        RDB$FIELD_NAME: resultSet.getString("fieldName"),
                        RDB$CONST_NAME_UQ: resultSet.getString("constNameUq"),
                        RDB$UPDATE_RULE: resultSet.getString("updateRule") as UpdateRule,
                        RDB$DELETE_RULE: resultSet.getString("deleteRule") as DeleteRule
                    });
                }
                return array;
            }
        });
    }

    public static async readByConnection(
        connection: AConnection,
        transaction: ATransaction
    ): Promise<[IRDB$FIELD[], IRDB$RELATIONFIELD[], IRDB$RELATIONCONSTRAINT[]]> {
        const promises: [Promise<IRDB$FIELD[]>, Promise<IRDB$RELATIONFIELD[]>, Promise<IRDB$RELATIONCONSTRAINT[]>] = [
            RDBReader.readFields(connection, transaction),
            RDBReader.readRelationFields(connection, transaction),
            RDBReader.readConstraints(connection, transaction)
        ];

        return await Promise.all(promises);
    }

    public static async readConnectionPool(
        connectionPool: AConnectionPool<any>
    ): Promise<[IRDB$FIELD[], IRDB$RELATIONFIELD[], IRDB$RELATIONCONSTRAINT[]]> {
        const promises: [
            Promise<IRDB$FIELD[]>,
            Promise<IRDB$RELATIONFIELD[]>,
            Promise<IRDB$RELATIONCONSTRAINT[]>
            ] = [
            (async () => await AConnectionPool.executeConnection({
                connectionPool,
                callback: (connection) => RDBReader.readFields(connection, connection.readTransaction)
            }))(),
            (async () => AConnectionPool.executeConnection({
                connectionPool,
                callback: (connection) => RDBReader.readRelationFields(connection, connection.readTransaction)
            }))(),
            (async () => AConnectionPool.executeConnection({
                connectionPool,
                callback: (connection) => RDBReader.readConstraints(connection, connection.readTransaction)
            }))()
        ];

        return await Promise.all(promises);
    }
}
