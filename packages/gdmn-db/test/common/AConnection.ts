import {AConnection, ADriver, IConnectionOptions} from "../../src";

export function connectionTest(driver: ADriver, dbOptions: IConnectionOptions): void {
    describe("AConnection", () => {

        beforeAll(async () => {
            await AConnection.executeConnection({
                connection: driver.newConnection(),
                options: dbOptions,
                callback: (connection) => AConnection.executeTransaction({
                    connection,
                    callback: (transaction) => (
                        connection.execute(transaction, "CREATE TABLE CONNECTION_TABLE (ID INTEGER)")
                    )
                })
            });
        });

        it("lifecycle", async () => {
            const connection = driver.newConnection();
            await connection.connect(dbOptions);
            expect(connection.connected).toBeTruthy();

            await connection.disconnect();
            expect(connection.connected).toBeFalsy();
        });

        it("create connection", async () => {
            await AConnection.executeConnection({
                connection: driver.newConnection(),
                options: dbOptions,
                callback: async (connection) => {
                    const transaction = await connection.startTransaction();
                    expect(transaction).toBeTruthy();
                    expect(transaction.finished).toBeFalsy();
                    await transaction.commit();
                }
            });
        });

        it("execute", async () => {
            await AConnection.executeConnection({
                connection: driver.newConnection(),
                options: dbOptions,
                callback: (connection) => AConnection.executeTransaction({
                    connection,
                    callback: async (transaction) => {
                        const result = await connection.execute(transaction,
                            "INSERT INTO CONNECTION_TABLE (ID) VALUES (1)");
                        expect(result).toBeFalsy();
                    }
                })
            });
        });

        it("execute with placeholder params", async () => {
            await AConnection.executeConnection({
                connection: driver.newConnection(),
                options: dbOptions,
                callback: (connection) => AConnection.executeTransaction({
                    connection,
                    callback: async (transaction) => {
                        const result = await connection.execute(transaction,
                            "INSERT INTO CONNECTION_TABLE (ID) VALUES (:id)", {id: 1});
                        expect(result).toBeFalsy();
                    }
                })
            });
        });

        it("execute with params", async () => {
            await AConnection.executeConnection({
                connection: driver.newConnection(),
                options: dbOptions,
                callback: (connection) => AConnection.executeTransaction({
                    connection,
                    callback: async (transaction) => {
                        const result = await connection.execute(transaction,
                            "INSERT INTO CONNECTION_TABLE (ID) VALUES (?)", [1]);
                        expect(result).toBeFalsy();
                    }
                })
            });
        });

        it("executeQuery", async () => {
            await AConnection.executeConnection({
                connection: driver.newConnection(),
                options: dbOptions,
                callback: (connection) => AConnection.executeTransaction({
                    connection,
                    callback: (transaction) => AConnection.executeQueryResultSet({
                        connection,
                        transaction,
                        sql: "SELECT FIRST 1 * FROM CONNECTION_TABLE",
                        callback: async (resultSet) => {
                            expect(resultSet).toBeTruthy();
                            await resultSet.next();
                        }
                    })
                })
            });
        });

        it("executeQuery with placeholder params", async () => {
            await AConnection.executeConnection({
                connection: driver.newConnection(),
                options: dbOptions,
                callback: (connection) => AConnection.executeTransaction({
                    connection,
                    callback: (transaction) => AConnection.executeQueryResultSet({
                        connection,
                        transaction,
                        sql: "SELECT FIRST :count * FROM CONNECTION_TABLE",
                        params: {count: 1},
                        callback: async (resultSet) => {
                            expect(resultSet).toBeTruthy();
                            await resultSet.next();
                        }
                    })
                })
            });
        });

        it("executeQuery with params", async () => {
            await AConnection.executeConnection({
                connection: driver.newConnection(),
                options: dbOptions,
                callback: (connection) => AConnection.executeTransaction({
                    connection,
                    callback: (transaction) => AConnection.executeQueryResultSet({
                        connection,
                        transaction,
                        sql: "SELECT FIRST ? * FROM CONNECTION_TABLE",
                        params: [1],
                        callback: async (resultSet) => {
                            expect(resultSet).toBeTruthy();
                            await resultSet.next();
                        }
                    })
                })
            });
        });

        it("prepare", async () => {
            await AConnection.executeConnection({
                connection: driver.newConnection(),
                options: dbOptions,
                callback: (connection) => AConnection.executeTransaction({
                    connection,
                    callback: (transaction) => AConnection.executePrepareStatement({
                        connection, transaction,
                        sql: "SELECT FIRST 1 * FROM CONNECTION_TABLE",
                        callback: (statement) => expect(statement).toBeTruthy()
                    })
                })
            });
        });
    });
}
