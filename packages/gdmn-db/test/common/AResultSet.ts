import {ABlobLink, AConnection, ADriver, CursorType, IConnectionOptions} from "../../src";

export function resultSetTest(driver: ADriver, dbOptions: IConnectionOptions): void {
    describe("AResultSet", () => {

        let globalConnection: AConnection;

        beforeAll(async () => {
            globalConnection = driver.newConnection();
            await globalConnection.connect(dbOptions);

            await AConnection.executeTransaction({
                connection: globalConnection,
                callback: async (transaction) => {
                    await globalConnection.execute(transaction, `
                        CREATE TABLE RESULT_SET_TABLE (
                            id              INT NOT NULL PRIMARY KEY,
                            name            VARCHAR(20)  NOT NULL,
                            dateTime        TIMESTAMP NOT NULL,
                            onlyDate        DATE NOT NULL,
                            onlyTime        TIME NOT NULL,
                            nullValue       VARCHAR(20),
                            textBlob        BLOB SUB_TYPE TEXT NOT NULL,
                            binaryBlob      BLOB NOT NULL
                        )
                    `);

                    await transaction.commitRetaining();

                    await AConnection.executePrepareStatement({
                        connection: globalConnection,
                        transaction,
                        sql: `
                            INSERT INTO RESULT_SET_TABLE (id, name, dateTime, onlyDate, onlyTime, nullValue, textBlob,
                              binaryBlob)
                            VALUES(:id, :name, :dateTime, :onlyDate, :onlyTime, :nullValue, :textBlob, :binaryBlob)
                            RETURNING id, name, dateTime, onlyDate, onlyTime, nullValue, textBlob, binaryBlob
                        `, callback: async (statement) => {
                            for (const dataItem of arrayData) {
                                const result = await statement.executeReturning(dataItem);
                                expect(result.getAny("ID")).toBe(dataItem.id);
                                expect(result.getAny("NAME")).toBe(dataItem.name);
                                expect(result.getAny("DATETIME")).toEqual(dataItem.dateTime);
                                expect(result.getAny("ONLYDATE")).toEqual(dataItem.onlyDate);
                                expect(result.getAny("ONLYTIME")).toEqual(dataItem.onlyTime);
                                expect(result.getAny("NULLVALUE")).toBeNull();
                                expect(
                                    await globalConnection.openBlobAsString(globalConnection.readTransaction,
                                        result.getBlob("TEXTBLOB")!)
                                ).toBe(dataItem.textBlob);
                                expect(
                                    await globalConnection.openBlobAsBuffer(globalConnection.readTransaction,
                                        result.getBlob("BINARYBLOB")!)
                                ).toEqual(dataItem.binaryBlob);
                            }
                        }
                    });
                }
            });
        });

        afterAll(async () => {
            // read transaction (in connection) locks table dropping
            await globalConnection.disconnect();

            await globalConnection.connect(dbOptions);
            await AConnection.executeTransaction({
                connection: globalConnection,
                callback: (transaction) => globalConnection.execute(transaction, "DROP TABLE RESULT_SET_TABLE")
            });
            await globalConnection.disconnect();
        });

        it("lifecycle", async () => {
            const resultSet = await globalConnection
                .executeQuery(globalConnection.readTransaction, "SELECT FIRST 1 * FROM RESULT_SET_TABLE");

            expect(await resultSet.next()).toBeTruthy();
            expect(resultSet.closed).toBeFalsy();

            await resultSet.close();
            expect(resultSet.closed).toBeTruthy();
        });

        it("read data (isNull) with params", async () => {
            await AConnection.executeQueryResultSet({
                connection: globalConnection,
                transaction: globalConnection.readTransaction,
                sql: "SELECT FIRST :count * FROM RESULT_SET_TABLE",
                params: {count: 1000},
                type: CursorType.FORWARD_ONLY,
                callback: async (resultSet) => {
                    while (await resultSet.next()) {
                        expect(resultSet.isNull("ID")).toBe(false);
                        expect(resultSet.isNull("NAME")).toBe(false);
                        expect(resultSet.isNull("DATETIME")).toBe(false);
                        expect(resultSet.isNull("ONLYDATE")).toBe(false);
                        expect(resultSet.isNull("ONLYTIME")).toBe(false);
                        expect(resultSet.isNull("NULLVALUE")).toBe(true);
                        expect(resultSet.isNull("TEXTBLOB")).toBe(false);
                        expect(resultSet.isNull("BINARYBLOB")).toBe(false);
                    }
                }
            });
        });

        it("read data (isNull)", async () => {
            await AConnection.executeQueryResultSet({
                connection: globalConnection,
                transaction: globalConnection.readTransaction,
                sql: "SELECT * FROM RESULT_SET_TABLE",
                callback: async (resultSet) => {
                    while (await resultSet.next()) {
                        expect(resultSet.isNull("ID")).toBe(false);
                        expect(resultSet.isNull("NAME")).toBe(false);
                        expect(resultSet.isNull("DATETIME")).toBe(false);
                        expect(resultSet.isNull("ONLYDATE")).toBe(false);
                        expect(resultSet.isNull("ONLYTIME")).toBe(false);
                        expect(resultSet.isNull("NULLVALUE")).toBe(true);
                        expect(resultSet.isNull("TEXTBLOB")).toBe(false);
                        expect(resultSet.isNull("BINARYBLOB")).toBe(false);
                    }
                }
            });
        });

        it("read data (getAll)", async () => {
            await AConnection.executeQueryResultSet({
                connection: globalConnection,
                transaction: globalConnection.readTransaction,
                sql: "SELECT * FROM RESULT_SET_TABLE",
                callback: async (resultSet) => {
                    for (let i = 0; await resultSet.next(); i++) {
                        const dataItem = arrayData[i];
                        const result = resultSet.getAll();
                        expect(result[0]).toBe(dataItem.id);
                        expect(result[1]).toBe(dataItem.name);
                        expect(result[2]).toEqual(dataItem.dateTime);
                        expect(result[3]).toEqual(dataItem.onlyDate);
                        expect(result[4]).toEqual(dataItem.onlyTime);
                        expect(result[5]).toBeNull();
                        expect(result[6]).toBeInstanceOf(ABlobLink);
                        expect(result[7]).toBeInstanceOf(ABlobLink);
                    }
                }
            });
        });

        it("read data (getAny)", async () => {
            await AConnection.executeQueryResultSet({
                connection: globalConnection,
                transaction: globalConnection.readTransaction,
                sql: "SELECT * FROM RESULT_SET_TABLE",
                callback: async (resultSet) => {
                    for (let i = 0; await resultSet.next(); i++) {
                        const dataItem = arrayData[i];
                        expect(resultSet.getAny("ID")).toBe(dataItem.id);
                        expect(resultSet.getAny("NAME")).toBe(dataItem.name);
                        expect(resultSet.getAny("DATETIME")).toEqual(dataItem.dateTime);
                        expect(resultSet.getAny("ONLYDATE")).toEqual(dataItem.onlyDate);
                        expect(resultSet.getAny("ONLYTIME")).toEqual(dataItem.onlyTime);
                        expect(resultSet.getAny("NULLVALUE")).toBeNull();
                        expect(resultSet.getAny("TEXTBLOB")).toBeInstanceOf(ABlobLink);
                        expect(resultSet.getAny("BINARYBLOB")).toBeInstanceOf(ABlobLink);
                    }
                }
            });
        });

        it("read data (getBlob)", async () => {
            await AConnection.executeQueryResultSet({
                connection: globalConnection,
                transaction: globalConnection.readTransaction,
                sql: "SELECT * FROM RESULT_SET_TABLE",
                callback: async (resultSet) => {
                    for (let i = 0; await resultSet.next(); i++) {
                        const dataItem = arrayData[i];
                        expect(() => resultSet.getBlob("ID")).toThrow(new Error("Invalid typecasting"));
                        expect(() => resultSet.getBlob("NAME")).toThrow(new Error("Invalid typecasting"));
                        expect(() => resultSet.getBlob("DATETIME")).toThrow(new Error("Invalid typecasting"));
                        expect(() => resultSet.getBlob("ONLYDATE")).toThrow(new Error("Invalid typecasting"));
                        expect(() => resultSet.getBlob("ONLYTIME")).toThrow(new Error("Invalid typecasting"));
                        expect(resultSet.getBlob("NULLVALUE")).toBeNull();
                        expect(
                            await globalConnection
                                .openBlobAsString(globalConnection.readTransaction, resultSet.getBlob("TEXTBLOB")!)
                        ).toBe(dataItem.textBlob);
                        expect(
                            await globalConnection
                                .openBlobAsBuffer(globalConnection.readTransaction, resultSet.getBlob("BINARYBLOB")!)
                        ).toEqual(dataItem.binaryBlob);
                    }
                }
            });
        });

        it("read data (getString)", async () => {
            await AConnection.executeQueryResultSet({
                connection: globalConnection,
                transaction: globalConnection.readTransaction,
                sql: "SELECT * FROM RESULT_SET_TABLE",
                callback: async (resultSet) => {
                    for (let i = 0; await resultSet.next(); i++) {
                        const dataItem = arrayData[i];
                        expect(resultSet.getString("ID")).toBe(dataItem.id.toString());
                        expect(resultSet.getString("NAME")).toBe(dataItem.name);
                        expect(resultSet.getString("DATETIME")).toBe(dataItem.dateTime.toString());
                        expect(resultSet.getString("ONLYDATE")).toBe(dataItem.onlyDate.toString());
                        expect(resultSet.getString("ONLYTIME")).toBe(dataItem.onlyTime.toString());
                        expect(resultSet.getString("NULLVALUE")).toBe("");
                        expect(() => resultSet.getString("TEXTBLOB")).toThrow(new Error("Invalid typecasting"));
                        expect(() => resultSet.getString("BINARYBLOB")).toThrow(new Error("Invalid typecasting"));
                    }
                }
            });
        });

        it("read data (getNumber)", async () => {
            await AConnection.executeQueryResultSet({
                connection: globalConnection,
                transaction: globalConnection.readTransaction,
                sql: "SELECT * FROM RESULT_SET_TABLE",
                callback: async (resultSet) => {
                    for (let i = 0; await resultSet.next(); i++) {
                        const dataItem = arrayData[i];
                        expect(resultSet.getNumber("ID")).toBe(dataItem.id);
                        expect(isNaN(resultSet.getNumber("NAME"))).toBe(true);
                        expect(isNaN(resultSet.getNumber("DATETIME"))).toBe(true);
                        expect(isNaN(resultSet.getNumber("ONLYDATE"))).toBe(true);
                        expect(isNaN(resultSet.getNumber("ONLYTIME"))).toBe(true);
                        expect(resultSet.getNumber("NULLVALUE")).toBe(0);
                        expect(() => resultSet.getString("TEXTBLOB")).toThrow(new Error("Invalid typecasting"));
                        expect(() => resultSet.getString("BINARYBLOB")).toThrow(new Error("Invalid typecasting"));
                    }
                }
            });
        });

        it("read data (getBoolean)", async () => {
            await AConnection.executeQueryResultSet({
                connection: globalConnection,
                transaction: globalConnection.readTransaction,
                sql: "SELECT * FROM RESULT_SET_TABLE",
                callback: async (resultSet) => {
                    for (let i = 0; await resultSet.next(); i++) {
                        expect(resultSet.getBoolean("ID")).toBe(i !== 0);
                        expect(resultSet.getBoolean("NAME")).toBe(true);
                        expect(resultSet.getBoolean("DATETIME")).toBe(true);
                        expect(resultSet.getBoolean("ONLYDATE")).toBe(true);
                        expect(resultSet.getBoolean("ONLYTIME")).toBe(true);
                        expect(resultSet.getBoolean("NULLVALUE")).toBe(false);
                        expect(() => resultSet.getString("TEXTBLOB")).toThrow(new Error("Invalid typecasting"));
                        expect(() => resultSet.getString("BINARYBLOB")).toThrow(new Error("Invalid typecasting"));
                    }
                }
            });
        });

        it("read data (getDate)", async () => {
            await AConnection.executeQueryResultSet({
                connection: globalConnection,
                transaction: globalConnection.readTransaction,
                sql: "SELECT * FROM RESULT_SET_TABLE",
                callback: async (resultSet) => {
                    for (let i = 0; await resultSet.next(); i++) {
                        const dataItem = arrayData[i];
                        expect(resultSet.getDate("ID")).toBeTruthy();
                        expect(resultSet.getDate("NAME")).toBeNull();
                        expect(resultSet.getDate("DATETIME")).toEqual(dataItem.dateTime);
                        expect(resultSet.getDate("ONLYDATE")).toEqual(dataItem.onlyDate);
                        expect(resultSet.getDate("ONLYTIME")).toEqual(dataItem.onlyTime);
                        expect(resultSet.getDate("NULLVALUE")).toBeNull();
                        expect(() => resultSet.getString("TEXTBLOB")).toThrow(new Error("Invalid typecasting"));
                        expect(() => resultSet.getString("BINARYBLOB")).toThrow(new Error("Invalid typecasting"));
                    }
                }
            });
        });

        it("metadata", async () => {
            await AConnection.executeQueryResultSet({
                connection: globalConnection,
                transaction: globalConnection.readTransaction,
                sql: "SELECT * FROM RESULT_SET_TABLE",
                callback: async (resultSet) => {
                    for (let i = 0; await resultSet.next(); i++) {
                        const dataItem = arrayData[i];
                        const names = Object.keys(dataItem).map((name) => name.toUpperCase());
                        for (let j = 0; j < resultSet.metadata.columnCount; j++) {
                            expect(resultSet.metadata.getColumnLabel(j)).toEqual(names[j]);
                            expect(resultSet.metadata.getColumnName(j)).toEqual(names[j]);
                            expect(resultSet.metadata.getColumnRelation(j)).toEqual("RESULT_SET_TABLE");
                        }
                    }
                }
            });
        });
    });
}

interface IDataItem {
    id: number;
    name: string;
    dateTime: Date;
    onlyDate: Date;
    onlyTime: Date;
    nullValue: null;
    textBlob: string;
    binaryBlob: Buffer;
}

const arrayData = getData(10);

function getData(count: number): IDataItem[] {
    const dateTime = new Date();
    const onlyDate = new Date();
    onlyDate.setHours(0, 0, 0, 0);
    const onlyTime = new Date();

    const data: IDataItem[] = [];
    for (let i = 0; i < count; i++) {
        data.push({
            id: i,
            name: `Name №${i + 1}`,
            dateTime,
            onlyDate,
            onlyTime,
            nullValue: null,
            textBlob: "Test text blob field",
            binaryBlob: Buffer.from("#".repeat(7E4))
        });
    }
    return data;
}
