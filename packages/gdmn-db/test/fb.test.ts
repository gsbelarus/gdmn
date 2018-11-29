import {existsSync, unlinkSync} from "fs";
import {resolve} from "path";
import {AConnection, CommonParamsAnalyzer, Factory, IConnectionOptions} from "../src";
import {Statement} from "../src/fb/Statement";
import {connectionTest} from "./common/AConnection";
import {connectionPoolTest} from "./common/AConnectionPool";
import {resultSetTest} from "./common/AResultSet";
import {serviceTest} from "./common/AService";
import {statementTest} from "./common/AStatement";
import {transactionTest} from "./common/ATransaction";

export const dbOptions: IConnectionOptions = {
    username: "SYSDBA",
    password: "masterkey",
    path: resolve("./GDMN_DB_FB.FDB")
};

jest.setTimeout(100 * 1000);

describe("Firebird driver tests", async () => {
    const driver = Factory.FBDriver;
    const globalConnectionPool = driver.newCommonConnectionPool();

    beforeAll(async () => {
        if (existsSync(dbOptions.path)) {
            unlinkSync(dbOptions.path);
        }
        const connection = driver.newConnection();

        await connection.createDatabase(dbOptions);
        expect(connection.connected).toBeTruthy();

        await connection.disconnect();
        expect(connection.connected).toBeFalsy();

        await globalConnectionPool.create(dbOptions, {min: 1, max: 1});
        expect(globalConnectionPool.created).toBeTruthy();
    });

    afterAll(async () => {
        await globalConnectionPool.destroy();
        expect(globalConnectionPool.created).toBeFalsy();

        const connection = driver.newConnection();

        await connection.connect(dbOptions);
        expect(connection.connected).toBeTruthy();

        await connection.dropDatabase();
        expect(connection.connected).toBeFalsy();
    });

    it(dbOptions.path + " exists", async () => {
        expect(existsSync(dbOptions.path)).toBeTruthy();
    });

    connectionTest(driver, dbOptions);

    connectionPoolTest(driver, dbOptions);

    transactionTest(globalConnectionPool);

    statementTest(globalConnectionPool);

    resultSetTest(globalConnectionPool);

    serviceTest(driver, dbOptions);

    describe("CommonParamsAnalyzer", () => {

        it("simple sql query", () => {
            const sql =
                "SELECT * FROM TABLE\n" +
                "WHERE FIELD = :field_1\n" +
                "   OR FIELD = :field$2\n" +
                "   OR KEY = :field_1\n";
            const values = {
                field_1: "field1",
                field$2: "field2"
            };

            const analyzer = new CommonParamsAnalyzer(sql, Statement.EXCLUDE_PATTERNS, Statement.PLACEHOLDER_PATTERN);
            expect(analyzer.sql).toEqual(
                "SELECT * FROM TABLE\n" +
                "WHERE FIELD = ?       \n" +
                "   OR FIELD = ?       \n" +
                "   OR KEY = ?       \n");
            expect(analyzer.prepareParams(values)).toEqual([values.field_1, values.field$2, values.field_1]);
        });

        it("sql query with comments", () => {
            const sql =
                "SELECT * FROM TABLE --comment with :field\n" +
                "WHERE FIELD = /* comment with :field */:field1\n" +
                "   OR FIELD = :field2\n";
            const values = {
                field1: "field1",
                field2: "field2"
            };

            const analyzer = new CommonParamsAnalyzer(sql, Statement.EXCLUDE_PATTERNS, Statement.PLACEHOLDER_PATTERN);
            expect(analyzer.sql).toEqual(
                "SELECT * FROM TABLE --comment with :field\n" +
                "WHERE FIELD = /* comment with :field */?      \n" +
                "   OR FIELD = ?      \n");
            expect(analyzer.prepareParams(values)).toEqual([values.field1, values.field2]);
        });

        it("sql query with value similar as named param", () => {
            const sql =
                "SELECT * FROM TABLE\n" +
                "WHERE FIELD = :field1\n" +
                "   OR FIELD = 'text :value text'\n";
            const values = {
                field1: "field1"
            };

            const analyzer = new CommonParamsAnalyzer(sql, Statement.EXCLUDE_PATTERNS, Statement.PLACEHOLDER_PATTERN);
            expect(analyzer.sql).toEqual(
                "SELECT * FROM TABLE\n" +
                "WHERE FIELD = ?      \n" +
                "   OR FIELD = 'text :value text'\n");
            expect(analyzer.prepareParams(values)).toEqual([values.field1]);
        });

        it("execute block", () => {
            const sql =
                "EXECUTE BLOCK (id int = :id)\n" +
                "AS /*comment :id :key*/\n" +
                "BEGIN\n" +
                "   --comment :key --:id comment\n" +
                "   FOR SELECT * FROM TABLE\n" +
                "       WHERE ID = :id\n" +
                "   BEGIN\n" +
                "       --comment :key --:id comment\n" +
                "   END\n" +
                "end\n";
            const values = {
                id: "id"
            };

            const analyzer = new CommonParamsAnalyzer(sql, Statement.EXCLUDE_PATTERNS, Statement.PLACEHOLDER_PATTERN);
            expect(analyzer.sql).toEqual(
                "EXECUTE BLOCK (id int = ?  )\n" +
                "AS /*comment :id :key*/\n" +
                "BEGIN\n" +
                "   --comment :key --:id comment\n" +
                "   FOR SELECT * FROM TABLE\n" +
                "       WHERE ID = :id\n" +
                "   BEGIN\n" +
                "       --comment :key --:id comment\n" +
                "   END\n" +
                "end\n");
            expect(analyzer.prepareParams(values)).toEqual([values.id]);
        });
    });

    describe.skip("stress", async () => {

        const TIMEOUT = 8.64e+7;
        const count = 1000;

        let globalConnection: AConnection;

        beforeAll(async () => {
            globalConnection = await globalConnectionPool.get();
        });

        afterAll(async () => {
            await globalConnection.disconnect();
        });

        it("preparation sql with an error", () => AConnection.executeTransaction({
            connection: globalConnection,
            callback: async (transaction) => {
                for (let i = 0; i < count; i++) {
                    await expect(globalConnection.execute(transaction, "DROP TABLE TEST"))
                        .rejects.toThrow(new Error("Error: unsuccessful metadata update\n" +
                            "-DROP TABLE TEST failed\n" +
                            "-SQL error code = -607\n" +
                            "-Invalid command\n" +
                            "-Table TEST does not exist"
                        ));
                }
            }
        }), TIMEOUT);

        it("execution sql with an error", async () => {
            await AConnection.executeTransaction({
                connection: globalConnection,
                callback: async (transaction) => {
                    await globalConnection.execute(transaction, `
                        CREATE TABLE TEST2
                        (
                            ID INTEGER PRIMARY KEY
                        )
                    `);
                    await globalConnection.execute(transaction, `
                        CREATE TABLE TEST1
                        (
                            ID  INTEGER PRIMARY KEY,
                            REF INTEGER REFERENCES TEST2 (ID)
                        )
                    `);
                }
            });
            await AConnection.executeTransaction({
                connection: globalConnection,
                callback: async (transaction) => {
                    for (let i = 0; i < count; i++) {
                        await globalConnection.execute(transaction, `
                            INSERT INTO TEST2 (ID)
                            VALUES (:id)
                        `, {id: i});
                        await globalConnection.execute(transaction, `
                            INSERT INTO TEST1 (ID, REF)
                            VALUES (:id, :ref)
                        `, {
                            id: i,
                            ref: i
                        });
                        await expect(globalConnection.execute(transaction, `
                            DELETE
                            FROM TEST2
                            WHERE ID = :id
                        `, {id: i}))
                            .rejects.toThrow(new Error(
                                "Error: violation of FOREIGN KEY constraint \"INTEG_5\" on table \"TEST1\"\n" +
                                "-Foreign key references are present for the record\n" +
                                "-Problematic key value is (\"ID\" = 1)"
                            ));
                    }
                }
            });
        }, TIMEOUT);

        it("execution sql with an error", async () => {
            await AConnection.executeTransaction({
                connection: globalConnection,
                callback: async (transaction) => {
                    await globalConnection.execute(transaction, `
                        CREATE TABLE TMP_TEST
                        (
                            ID          INTEGER PRIMARY KEY,
                            F_DECIMAL   DECIMAL(10, 4),
                            F_VARCHAR   VARCHAR(20) NOT NULL,
                            F_TIMESTAMP TIMESTAMP   NOT NULL,
                            F_DATE      DATE        NOT NULL,
                            F_TIME      TIME        NOT NULL,
                            F_BLOB_TEXT BLOB SUB_TYPE TEXT NOT NULL
                        )
                    `);
                }
            });
            await AConnection.executeTransaction({
                connection: globalConnection,
                callback: async (transaction) => {
                    const _updateOrInsert = await globalConnection.prepare(transaction, `
                        UPDATE OR INSERT INTO TMP_TEST (
                            ID, F_DECIMAL, F_VARCHAR, F_TIMESTAMP, F_DATE, F_TIME, F_BLOB_TEXT)
                        VALUES (
                            :id, :fDecimal, :fVarChar, :fTimestamp, :fDate, :fTime, :fBlobText)
                        MATCHING (ID)
                    `);
                    const _delete = await globalConnection.prepare(transaction, `
                        DELETE
                        FROM TMP_TEST
                        WHERE ID = :id
                    `);
                    const _select = await globalConnection.prepare(transaction, `
                        SELECT FIRST 1 *
                        FROM TMP_TEST
                        WHERE ID = :id
                    `);

                    try {
                        for (let i = 0; i < count; i++) {
                            const id = i;
                            const fDecimal = randomDecimal(10, 4);
                            const fVarChar = randomString(20);
                            const fTimestamp = randomDate(new Date(2000, 1, 1), new Date(2100, 1, 1));
                            const fDate = new Date(fTimestamp);
                            const fTime = new Date(fTimestamp);
                            const fBlobText = randomString(1E3);

                            await _updateOrInsert.execute({
                                id,
                                fDecimal,
                                fVarChar,
                                fTimestamp,
                                fDate,
                                fTime,
                                fBlobText
                            });

                            const result = await _select.executeReturning({id});

                            expect(result.getNumber("ID")).toEqual(id);
                            expect(result.getNumber("F_DECIMAL")).toEqual(fDecimal);
                            expect(result.getString("F_VARCHAR")).toEqual(fVarChar);
                            expect(result.getDate("F_TIMESTAMP")).toEqual(fTimestamp);
                            const date = result.getDate("F_DATE")!;
                            date.setHours(fDate.getHours(), fDate.getMinutes(), fDate.getSeconds(),
                                fDate.getMilliseconds());
                            const time = result.getDate("F_TIME")!;
                            time.setFullYear(fTime.getFullYear(), fTime.getMonth(), fTime.getDate());
                            expect(date).toEqual(fDate);
                            expect(time).toEqual(fTime);
                            expect(await result.getBlob("F_BLOB_TEXT").asString()).toEqual(fBlobText);

                            if (id % 2 === 0) {
                                await _delete.execute({id});
                            }
                        }
                    } finally {
                        await _updateOrInsert.dispose();
                        await _delete.dispose();
                        await _select.dispose();
                    }
                }
            });
        });
    });
});

function randomDecimal(precision: number, scale: number): number {
    return Number.parseFloat((Math.random() * Math.pow(10, precision - scale)).toFixed(scale));
}

function randomString(maxLength: number): string {
    let str = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    const length = Math.floor(Math.random() * maxLength);
    for (let i = 0; i < length; i++) {
        str += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return str;
}

function randomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
