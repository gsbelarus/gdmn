import {AConnection, ADriver, ATransaction, IConnectionOptions} from "../../src";

export function statementTest(driver: ADriver, dbOptions: IConnectionOptions): void {
    describe("AStatement", () => {

        let globalConnection: AConnection;
        let globalTransaction: ATransaction;

        beforeAll(async () => {
            globalConnection = driver.newConnection();
            await globalConnection.connect(dbOptions);

            await AConnection.executeTransaction({
                connection: globalConnection,
                callback: (transaction) => (
                    globalConnection.execute(transaction, "CREATE TABLE STATEMENT_TABLE (ID INTEGER)")
                )
            });
            globalTransaction = await globalConnection.startTransaction();
        });

        afterAll(async () => {
            await globalTransaction.commit();
            await globalConnection.disconnect();
        });

        it("lifecycle", async () => {
            const statement = await globalConnection
                .prepare(globalTransaction, "SELECT FIRST 1 * FROM STATEMENT_TABLE");
            await statement.dispose();
        });

        it("execute", async () => {
            await AConnection.executePrepareStatement({
                connection: globalConnection,
                transaction: globalTransaction,
                sql: "INSERT INTO STATEMENT_TABLE (ID) VALUES (1)",
                callback: async (statement) => {
                    const result = await statement.execute();
                    expect(result).toBeFalsy();
                }
            });
        });

        it("execute with placeholder params", async () => {
            await AConnection.executePrepareStatement({
                connection: globalConnection,
                transaction: globalTransaction,
                sql: "INSERT INTO STATEMENT_TABLE (ID) VALUES (:id)",
                callback: async (statement) => {
                    const result = await statement.execute({id: 1});
                    expect(result).toBeFalsy();
                }
            });
        });

        it("execute with params", async () => {
            await AConnection.executePrepareStatement({
                connection: globalConnection,
                transaction: globalTransaction,
                sql: "INSERT INTO STATEMENT_TABLE (ID) VALUES (?)",
                callback: async (statement) => {
                    const result = await statement.execute([1]);
                    expect(result).toBeFalsy();
                }
            });
        });

        it("executeQuery", async () => {
            await AConnection.executePrepareStatement({
                connection: globalConnection,
                transaction: globalTransaction,
                sql: "SELECT FIRST 1 * FROM STATEMENT_TABLE",
                callback: async (statement) => {
                    const resultSet = await statement.executeQuery();
                    expect(resultSet).toBeTruthy();

                    await resultSet.close();
                }
            });
        });

        it("executeQuery with placeholder params", async () => {
            await AConnection.executePrepareStatement({
                connection: globalConnection,
                transaction: globalTransaction,
                sql: "SELECT FIRST :count * FROM STATEMENT_TABLE",
                callback: async (statement) => {
                    const resultSet = await statement.executeQuery({count: 1});
                    expect(resultSet).toBeTruthy();

                    await resultSet.close();
                }
            });
        });

        it("executeQuery with params", async () => {
            await AConnection.executePrepareStatement({
                connection: globalConnection,
                transaction: globalTransaction,
                sql: "SELECT FIRST ? * FROM STATEMENT_TABLE",
                callback: async (statement) => {
                    const resultSet = await statement.executeQuery([1]);
                    expect(resultSet).toBeTruthy();

                    await resultSet.close();
                }
            });
        });

        it("executeReturning", async () => {
            await AConnection.executePrepareStatement({
                connection: globalConnection,
                transaction: globalTransaction,
                sql: "SELECT FIRST 1 * FROM STATEMENT_TABLE",
                callback: async (statement) => {
                    const result = await statement.executeReturning();
                    expect(result).toBeTruthy();
                }
            });
        });

        it("executeReturning with placeholder params", async () => {
            await AConnection.executePrepareStatement({
                connection: globalConnection,
                transaction: globalTransaction,
                sql: "SELECT FIRST :count * FROM STATEMENT_TABLE",
                callback: async (statement) => {
                    const result = await statement.executeReturning({count: 1});
                    expect(result).toBeTruthy();
                }
            });
        });

        it("executeReturning with params", async () => {
            await AConnection.executePrepareStatement({
                connection: globalConnection,
                transaction: globalTransaction,
                sql: "SELECT FIRST ? * FROM STATEMENT_TABLE",
                callback: async (statement) => {
                    const result = await statement.executeReturning([1]);
                    expect(result).toBeTruthy();
                }
            });
        });

        it("preparation sql and returning plan (getPlan)", async () => {
            const statement = await globalConnection
                .prepare(globalTransaction, "SELECT * FROM STATEMENT_TABLE WHERE ID = ?");
            const result = await statement.getPlan();
            expect(result).not.toBeNull();
            await statement.dispose();
        });
    });
}
