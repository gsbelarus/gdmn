import {AConnectionPool, ADriver, IConnectionOptions} from "../../src";

export function connectionPoolTest(driver: ADriver, dbOptions: IConnectionOptions): void {
    describe("AConnectionPool", () => {

        it("lifecycle", async () => {
            const connectionPool = driver.newCommonConnectionPool();
            await connectionPool.create(dbOptions, {min: 1, max: 1});
            expect(connectionPool.created).toBeTruthy();

            await connectionPool.destroy();
            expect(connectionPool.created).toBeFalsy();
        });

        it("get connection", async () => {
            await AConnectionPool.executeConnectionPool({
                connectionPool: driver.newCommonConnectionPool(),
                connectionOptions: dbOptions,
                options: {min: 1, max: 1},
                callback: async (connectionPool) => {
                    const con1 = await connectionPool.get();
                    expect(con1.connected).toBeTruthy();

                    await con1.disconnect();
                    expect(con1.connected).toBeFalsy();

                    const con2 = await connectionPool.get();
                    expect(con2.connected).toBeTruthy();

                    await con2.disconnect();
                    expect(con2.connected).toBeFalsy();
                    expect(con1).toBe(con2);
                }
            });
        });
    });
}
