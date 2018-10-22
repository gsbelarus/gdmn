import fs from "fs";
import path from "path";
import {AConnection, ADriver, IConnectionOptions} from "../../src";
import {AService, IRestoreOptions, IServiceOptions} from "../../src/AService";
import { bkpFileExt, dbFileExt, fixturesPath } from "../fb.test";
import {getData, IDataItem} from "../fixtures/getData";

export function serviceTest( driver: ADriver, dbOptions: IConnectionOptions): void {

    describe("AService", async () => {
        const svcOptions: IServiceOptions = {
            username: "SYSDBA",
            password: "masterkey",
            host: "localhost",
            port: 3050
        };

        const restoredTestDbPath = path.format({
            dir: fixturesPath, name: "RESTORED_TEST_DB", ext: dbFileExt
        });

        const backupTestDbPath = path.format({
            dir: fixturesPath, name: "BACKUP_TEST", ext: bkpFileExt
        });

        const restoredDbOptions = {...dbOptions, path: restoredTestDbPath};

        const tableName = "TEST_BACKUP_TABLE";

        let fixtureArrayData: IDataItem[];

        beforeAll(async () => {
            fixtureArrayData = getData(1000);
            const connection = driver.newConnection();

            try {
                await connection.connect(dbOptions);

                expect(connection.connected).toBeTruthy();

                await AConnection.executeTransaction({
                    connection,
                    callback: async (transaction) => {
                        await connection.execute(transaction, `
                        CREATE TABLE ${tableName} (
                            id              INT NOT NULL PRIMARY KEY,
                            name            VARCHAR(20)  NOT NULL,
                            dateTime        TIMESTAMP NOT NULL,
                            onlyDate        DATE NOT NULL,
                            onlyTime        TIME NOT NULL,
                            nullValue       VARCHAR(20),
                            textBlob        BLOB SUB_TYPE TEXT NOT NULL
                        )
                    `);
                    }
                });

                await AConnection.executeTransaction({
                    connection,
                    callback: (transaction) => AConnection.executePrepareStatement({
                        connection,
                        transaction,
                        sql: `
                            INSERT INTO ${tableName} (id, name, dateTime, onlyDate, onlyTime, nullValue, textBlob)
                            VALUES(:id, :name, :dateTime, :onlyDate, :onlyTime, :nullValue, :textBlob)
                            RETURNING id, name, dateTime, onlyDate, onlyTime, nullValue, textBlob
                        `,
                        callback: async (statement) => {
                            for (const dataItem of fixtureArrayData) {
                                const result = await statement.executeReturning(dataItem);
                                expect(await result.getAny("ID")).toEqual(dataItem.id);
                                expect(await result.getAny("NAME")).toEqual(dataItem.name);
                                expect((await result.getAny("DATETIME"))!.getTime())
                                    .toEqual(dataItem.dateTime.getTime());
                                expect((await result.getAny("ONLYDATE"))!.getTime())
                                    .toEqual(dataItem.onlyDate.getTime());
                                expect((await result.getAny("ONLYTIME"))!.getTime())
                                    .toEqual(dataItem.onlyTime.getTime());
                                expect(await result.getAny("NULLVALUE")).toBeNull();
                                expect(await result.getAny("TEXTBLOB")).toEqual(dataItem.textBlob);
                            }
                        }
                    })
                });
            } catch (error) {
                console.error(error);
            }
            finally {
                await connection.disconnect();
            }

            if (fs.existsSync(backupTestDbPath)) {
                fs.unlinkSync(backupTestDbPath);
            }

            if (fs.existsSync(restoredTestDbPath)) {
                fs.unlinkSync(restoredTestDbPath);
            }
        });

        afterAll(async () => {
            if (fs.existsSync(backupTestDbPath)) {
                fs.unlinkSync(backupTestDbPath);
            }

            if (fs.existsSync(restoredTestDbPath)) {
                fs.unlinkSync(restoredTestDbPath);
            }
        });

        it("backup/restore", async () => {
            const svcManager: AService = driver.newService();

            await svcManager.attach(svcOptions);
            await svcManager.backupDatabase(dbOptions.path, backupTestDbPath);

            expect(fs.existsSync(backupTestDbPath)).toBeTruthy();

            try {
                await svcManager.restoreDatabase(restoredTestDbPath, backupTestDbPath);
            } catch (error) {
                console.error(error);
            } finally {
                await svcManager.detach();
            }

            expect(fs.existsSync(restoredTestDbPath)).toBeTruthy();

            const connection = driver.newConnection();

            await AConnection.executeConnection({
                connection,
                options: restoredDbOptions,
                callback: (_connection) => AConnection.executeTransaction({
                    connection: _connection,
                    callback: (transaction) => AConnection.executeQueryResultSet({
                        connection,
                        transaction,
                        sql: `SELECT * FROM ${tableName}`,
                        callback: async (resultSet) => {
                            for (let i = 0; await resultSet.next(); i++) {
                                const dataItem = fixtureArrayData[i];
                                const result = await resultSet.getAll();
                                expect(result[0]).toEqual(dataItem.id);
                                expect(result[1]).toEqual(dataItem.name);
                                expect(result[2].getTime()).toEqual(dataItem.dateTime.getTime());
                                expect(result[3].getTime()).toEqual(dataItem.onlyDate.getTime());
                                expect(result[4].getTime()).toEqual(dataItem.onlyTime.getTime());
                                expect(result[5]).toBeNull();
                                expect(result[6]).toEqual(dataItem.textBlob);
                            }
                        }
                    })
                })
            });
        });

        it("restore with 'replace'", async () => {
            const connection = driver.newConnection();

            const changedName = "SuperName";

            await AConnection.executeConnection({
                connection,
                options: restoredDbOptions,
                callback: (_connection) => AConnection.executeTransaction({
                    connection: _connection,
                    callback: async (transaction) => {
                        await _connection.execute(transaction, `
                        UPDATE ${tableName}
                            SET name = :name
                        WHERE id = :id
                        `, {
                        name: changedName,
                        id: 1,
                        });
                    }
                })
            });

            const svcManager: AService = driver.newService();

            await svcManager.attach(svcOptions);
            await svcManager.backupDatabase(restoredDbOptions.path, backupTestDbPath);

            try {
                const resOptions: IRestoreOptions = {
                    replace: true
                };
                await svcManager.restoreDatabase(restoredDbOptions.path, backupTestDbPath, resOptions);
            } finally {
                await svcManager.detach();
            }

            await AConnection.executeConnection({
                connection,
                options: restoredDbOptions,
                callback: (_connection) => AConnection.executeTransaction({
                    connection: _connection,
                    callback: (transaction) => AConnection.executeQueryResultSet({
                        connection,
                        transaction,
                        sql: `
                          SELECT
                            name
                          FROM ${tableName}
                          WHERE id = :id
                        `,
                        params: {id: 1},
                        callback: async (resultSet) => {
                          const result = [];
                          while (await resultSet.next()) {
                            result.push({
                              name: resultSet.getString("NAME")
                            });
                          }
                          const [ { name } ]: [{name: string}] = result as [{name: string}];
                          expect(name).toEqual(changedName);
                        }
                    })
                })
            });
        });
    });
}
