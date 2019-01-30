import {existsSync, unlinkSync} from "fs";
import {resolve} from "path";
import {AConnection, CommonParamsAnalyzer, Factory, IConnectionOptions, IServiceOptions} from "../src";
import {Statement} from "../src/fb/Statement";
import {connectionTest} from "./common/AConnection";
import {connectionPoolTest} from "./common/AConnectionPool";
import {resultSetTest} from "./common/AResultSet";
import {statementTest} from "./common/AStatement";
import {transactionTest} from "./common/ATransaction";

const driver = Factory.getDriver("firebird");

export const dbOptions: IConnectionOptions = {
    username: "SYSDBA",
    password: "masterkey",
    path: resolve("./GDMN_DB_FB.FDB")
};

const serviceOptions: IServiceOptions = {
    host: "localhost",
    port: 3050,
    username: "SYSDBA",
    password: "masterkey"
};

jest.setTimeout(100 * 1000);

describe("Firebird driver tests", async () => {
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

        const TIMEOUT = 8.64E7;
        const count = 1E3;

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
                await new Promise((resolve, reject) => {
                    let rejects = 0;
                    for (let i = 0; i < count; i++) {
                        globalConnection.execute(transaction, "DROP TABLE TEST")
                            .then(reject)
                            .catch((error) => {
                                expect(error).toEqual(
                                    new Error("Error: unsuccessful metadata update\n" +
                                        "-DROP TABLE TEST failed\n" +
                                        "-SQL error code = -607\n" +
                                        "-Invalid command\n" +
                                        "-Table TEST does not exist"
                                    )
                                );

                                if (rejects === count - 1) {
                                    resolve();
                                }
                                rejects++;
                            });
                    }
                });
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
                    const id = 1;
                    await globalConnection.execute(transaction, `
                            INSERT INTO TEST2 (ID)
                            VALUES (:id)
                        `, {id});
                    await globalConnection.execute(transaction, `
                            INSERT INTO TEST1 (ID, REF)
                            VALUES (:id, :ref)
                        `, {
                        id,
                        ref: id
                    });
                    await new Promise((resolve, reject) => {
                        let rejects = 0;
                        for (let i = 0; i < count; i++) {
                            globalConnection.execute(transaction, `
                                DELETE
                                FROM TEST2
                                WHERE ID = :id
                            `, {id})
                                .then(reject)
                                .catch((error) => {
                                    expect(error).toEqual(
                                        new Error("Error: violation of FOREIGN KEY constraint \"INTEG_5\" on table" +
                                            " \"TEST1\"\n" +
                                            "-Foreign key references are present for the record\n" +
                                            "-Problematic key value is (\"ID\" = 1)"
                                        )
                                    );

                                    if (rejects === count - 1) {
                                        resolve();
                                    }
                                    rejects++;
                                });
                        }
                    });
                }
            });
        }, TIMEOUT);

        it("execution sql with insert/update/delete", async () => {
            await AConnection.executeTransaction({
                connection: globalConnection,
                callback: async (transaction) => {
                    await globalConnection.execute(transaction, `
                        CREATE TABLE TMP_TEST
                        (
                            ID          INTEGER PRIMARY KEY,
                            F_DECIMAL   DECIMAL(10, 4),
                            F_FLOAT     FLOAT            NOT NULL,
                            F_DOUBLE    DOUBLE PRECISION NOT NULL,
                            F_VARCHAR   VARCHAR(20)      NOT NULL,
                            F_TIMESTAMP TIMESTAMP        NOT NULL,
                            F_DATE      DATE             NOT NULL,
                            F_TIME      TIME             NOT NULL,
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
                            ID, F_DECIMAL, F_FLOAT, F_DOUBLE, F_VARCHAR, F_TIMESTAMP, F_DATE, F_TIME, F_BLOB_TEXT)
                        VALUES (
                            :id, :fDecimal, :fFloat, :fDouble, :fVarChar, :fTimestamp, :fDate, :fTime, :fBlobText)
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
                            for (let j = 0; j < 2; j++) {
                                const fDecimal = randomDecimal(10, 4);
                                const fFloat = randomDecimal(10, 4);
                                const fDouble = randomDecimal(10, 4);
                                const fVarChar = randomString(20);
                                const fTimestamp = randomDate(new Date(2000, 1, 1), new Date(2100, 1, 1));
                                const fDate = new Date(fTimestamp);
                                const fTime = new Date(fTimestamp);
                                const fBlobText = randomString(1E3);

                                await _updateOrInsert.execute({
                                    id,
                                    fDecimal,
                                    fFloat,
                                    fDouble,
                                    fVarChar,
                                    fTimestamp,
                                    fDate,
                                    fTime,
                                    fBlobText
                                });

                                const result = await _select.executeReturning({id});

                                expect(result.getNumber("ID")).toEqual(id);
                                expect(result.getNumber("F_DECIMAL")).toEqual(fDecimal);
                                // expect(result.getNumber("F_FLOAT")).toEqual(fFloat);
                                expect(result.getNumber("F_DOUBLE")).toEqual(fDouble);
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
                            }

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
        }, TIMEOUT);
    });
});

// TODO CI
// describe("Firebird service tests", async () => {
//     const connection = driver.newConnection();
//
//     beforeAll(async () => {
//         if (existsSync(dbOptions.path)) {
//             unlinkSync(dbOptions.path);
//         }
//         await connection.createDatabase(dbOptions);
//         expect(connection.connected).toBeTruthy();
//
//         await connection.disconnect();
//         expect(connection.connected).toBeFalsy();
//     });
//
//     afterAll(async () => {
//         await connection.connect(dbOptions);
//         expect(connection.connected).toBeTruthy();
//
//         await connection.dropDatabase();
//         expect(connection.connected).toBeFalsy();
//     });
//
//     serviceTest(driver, serviceOptions, dbOptions);
// });

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
