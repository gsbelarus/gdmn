import {AConnection, ADriver, IConnectionOptions} from "../../src";

export function connectionTest(driver: ADriver, dbOptions: IConnectionOptions): void {
    describe("AConnection", async () => {

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

        it("prepare", async () => {
            await AConnection.executeConnection({
                connection: driver.newConnection(),
                options: dbOptions,
                callback: (connection) => AConnection.executeTransaction({
                    connection,
                    callback: (transaction) => AConnection.executePrepareStatement({
                        connection, transaction,
                        sql: "SELECT FIRST 1 * FROM RDB$DATABASE",
                        callback: (statement) => expect(statement).toBeTruthy()
                    })
                })
            });
        });

        it("execute", async () => {
            await AConnection.executeConnection({
                connection: driver.newConnection(),
                options: dbOptions,
                callback: (connection) => AConnection.executeTransaction({
                    connection,
                    callback: async (transaction) => {
                        const result = await connection.execute(transaction, "SELECT FIRST 1 * FROM RDB$DATABASE");
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
                            "SELECT FIRST :count * FROM RDB$DATABASE", {count: 1});
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
                            "SELECT FIRST ? * FROM RDB$DATABASE", [1]);
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
                        sql: "SELECT FIRST 1 * FROM RDB$DATABASE",
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
                        sql: "SELECT FIRST :count * FROM RDB$DATABASE",
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
                        sql: "SELECT FIRST ? * FROM RDB$DATABASE",
                        params: [1],
                        callback: async (resultSet) => {
                            expect(resultSet).toBeTruthy();
                            await resultSet.next();
                        }
                    })
                })
            });
        });
    });
}
