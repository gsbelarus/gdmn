import {Transaction as NativeTransaction} from "node-firebird-native-api";
import {ATransaction, ITransactionOptions} from "../ATransaction";
import {Connection} from "./Connection";
import {Statement} from "./Statement";
import {createTpb} from "./utils/fb-utils";

export class Transaction extends ATransaction {

    public statements = new Set<Statement>();
    public handler?: NativeTransaction;

    constructor(connection: Connection, options: ITransactionOptions, handler: NativeTransaction) {
        super(connection, options);
        this.handler = handler;
        this.connection.transactions.add(this);
    }

    get connection(): Connection {
        return super.connection as Connection;
    }

    get finished(): boolean {
        return !this.handler;
    }

    public static async create(
        connection: Connection,
        options: ITransactionOptions = ATransaction.DEFAULT_OPTIONS
    ): Promise<Transaction> {
        const handler = await connection.client.statusAction(async (status) => {
            const tpb = createTpb(options, connection.client.client!.util, status);
            try {
                return await connection.handler!.startTransactionAsync(
                    status, tpb.getBufferLengthSync(status), tpb.getBufferSync(status));
            } finally {
                await tpb.disposeAsync();
            }
        });

        return new Transaction(connection, options, handler!);
    }

    public async commit(): Promise<void> {
        if (!this.handler) {
            throw new Error("Need absolute open transaction");
        }

        if (this.statements.size) {
            throw new Error("Not all statements disposed");   // TODO
        }
        await this._closeChildren();

        await this.connection.client.statusAction((status) => this.handler!.commitAsync(status));
        this.handler = undefined;
        this.connection.transactions.delete(this);
    }

    public async rollback(): Promise<void> {
        if (!this.handler) {
            throw new Error("Need absolute open transaction");
        }

        if (this.statements.size) {
            throw new Error("Not all statements disposed");   // TODO
        }
        await this._closeChildren();

        await this.connection.client.statusAction((status) => this.handler!.rollbackAsync(status));
        this.handler = undefined;
        this.connection.transactions.delete(this);
    }

    private async _closeChildren(): Promise<void> {
        if (this.statements.size) {
            console.warn("Not all statements disposed, they will be disposed");
        }
        await Promise.all(Array.from(this.statements).reduceRight((promises, statement) => {
            promises.push(statement.dispose());
            return promises;
        }, [] as Array<Promise<void>>));
    }
}
