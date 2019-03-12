import {AConnection, ADriver, IConnectionOptions} from "../../src";

export function transactionTest(driver: ADriver, dbOptions: IConnectionOptions): void {
    describe("ATransaction", () => {

        let globalConnection: AConnection;

        beforeAll(async () => {
            globalConnection = driver.newConnection();
            await globalConnection.connect(dbOptions);
        });

        afterAll(async () => {
            await globalConnection.disconnect();
        });

        it("lifecycle", async () => {
            let transaction = await globalConnection.startTransaction();
            expect(transaction.finished).toBeFalsy();

            await transaction.commit();
            expect(transaction.finished).toBeTruthy();

            transaction = await globalConnection.startTransaction();
            expect(transaction.finished).toBeFalsy();

            await transaction.rollback();
            expect(transaction.finished).toBeTruthy();
        });
    });
}
