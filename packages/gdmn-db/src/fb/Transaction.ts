import {Transaction as NativeTransaction} from "node-firebird-native-api";
import {ATransaction, ITransactionOptions} from "../ATransaction";
import {Connection} from "./Connection";
import {createTpb} from "./utils/fb-utils";

export class Transaction extends ATransaction {

    public statementsCount = 0;
    public handler?: NativeTransaction;

    constructor(connection: Connection, options: ITransactionOptions, handler: NativeTransaction) {
        super(connection, options);
        this.handler = handler;
        this.connection.transactionsCount++;
    }

    get connection(): Connection {
        return super.connection as Connection;
    }

    public static async create(
        connection: Connection,
        options: ITransactionOptions = ATransaction.DEFAULT_OPTIONS
    ): Promise<Transaction> {
        const handler = await connection.client.statusAction((status) => (
            createTpb(options, connection.client.client!.util, status, (buffer, length) => (
                connection.handler!.startTransactionAsync(status, length, buffer)
            ))
        ));

        return new Transaction(connection, options, handler!);
    }

    protected async _commit(): Promise<void> {
        if (this.statementsCount > 0) {
            throw new Error("Not all statements disposed");
        }

        await this.connection.client.statusAction((status) => this.handler!.commitAsync(status));
        this.handler = undefined;
        this.connection.transactionsCount--;
    }

    protected async _commitRetaining(): Promise<void> {
        await this.connection.client.statusAction((status) => this.handler!.commitRetainingAsync(status));
    }

    protected async _rollback(): Promise<void> {
        if (this.statementsCount > 0) {
            throw new Error("Not all statements disposed");
        }

        await this.connection.client.statusAction((status) => this.handler!.rollbackAsync(status));
        this.handler = undefined;
        this.connection.transactionsCount--;
    }
}
