import fs from "fs";
import {resolve} from "path";
import {AConnection, ADriver, IConnectionOptions} from "../../src";
import {AService, IRestoreOptions, IServiceOptions} from "../../src/AService";
import {getData} from "../fixtures/getData";

export function serviceTest(driver: ADriver, serviceOptions: IServiceOptions, dbOptions: IConnectionOptions): void {
    describe("AService", async () => {

        const backupTestDbPath = resolve("./GDMN_DB_BACKUP.BKP");

        const restoredDbOptions = {
            ...dbOptions,
            path: resolve("./GDMN_DB_RESTORED.DB")
        };

        const tableName = "BACKUP_TABLE";

        const fixtureArrayData = getData(1000);

        beforeAll(async () => {
            if (fs.existsSync(backupTestDbPath)) {
                fs.unlinkSync(backupTestDbPath);
            }

            if (fs.existsSync(restoredDbOptions.path)) {
                fs.unlinkSync(restoredDbOptions.path);
            }

            await AConnection.executeConnection({
                connection: driver.newConnection(),
                options: dbOptions,
                callback: async (connection) => {
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
                                    expect(await result.getAny("DATETIME")).toEqual(dataItem.dateTime);
                                    expect(await result.getAny("ONLYDATE")).toEqual(dataItem.onlyDate);
                                    expect(await result.getAny("ONLYTIME")).toEqual(dataItem.onlyTime);
                                    expect(await result.getAny("NULLVALUE")).toBeNull();
                                    expect(await result.getAny("TEXTBLOB")).toEqual(dataItem.textBlob);
                                }
                            }
                        })
                    });
                }
            });
        });

        afterAll(async () => {
            if (fs.existsSync(backupTestDbPath)) {
                fs.unlinkSync(backupTestDbPath);
            }

            if (fs.existsSync(restoredDbOptions.path)) {
                fs.unlinkSync(restoredDbOptions.path);
            }
        });

        it("backup/restore", async () => {
            const svcManager: AService = driver.newService();

            await svcManager.attach(serviceOptions);
            await svcManager.backupDatabase(dbOptions.path, backupTestDbPath);

            expect(fs.existsSync(backupTestDbPath)).toBeTruthy();

            try {
                await svcManager.restoreDatabase(restoredDbOptions.path, backupTestDbPath);
            } catch (error) {
                console.error(error);
            } finally {
                await svcManager.detach();
            }

            expect(fs.existsSync(restoredDbOptions.path)).toBeTruthy();

            await AConnection.executeConnection({
                connection: driver.newConnection(),
                options: restoredDbOptions,
                callback: (connection) => AConnection.executeTransaction({
                    connection,
                    callback: (transaction) => AConnection.executeQueryResultSet({
                        connection,
                        transaction,
                        sql: `SELECT *
                        FROM ${tableName}`,
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
            const changedName = "SuperName";

            await AConnection.executeConnection({
                connection: driver.newConnection(),
                options: restoredDbOptions,
                callback: (connection) => AConnection.executeTransaction({
                    connection,
                    callback: async (transaction) => {
                        await connection.execute(transaction, `
                        UPDATE ${tableName}
                            SET name = :name
                        WHERE id = :id
                        `, {
                            name: changedName,
                            id: 1
                        });
                    }
                })
            });

            const svcManager: AService = driver.newService();

            await svcManager.attach(serviceOptions);
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
                connection: driver.newConnection(),
                options: restoredDbOptions,
                callback: (connection) => AConnection.executeTransaction({
                    connection,
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
                            const [{name}]: [{ name: string }] = result as [{ name: string }];
                            expect(name).toEqual(changedName);
                        }
                    })
                })
            });
        });
    });
}
