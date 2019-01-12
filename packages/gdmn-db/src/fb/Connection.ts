import {Attachment as NativeConnection} from "node-firebird-native-api";
import {AConnection, IConnectionOptions} from "../AConnection";
import {CursorType} from "../AResultSet";
import {IParams} from "../AStatement";
import {ITransactionOptions} from "../ATransaction";
import {Client} from "./Client";
import {Result} from "./Result";
import {ResultSet} from "./ResultSet";
import {Statement} from "./Statement";
import {Transaction} from "./Transaction";
import {blobInfo} from "./utils/constants";
import {createDpb} from "./utils/fb-utils";

export class Connection extends AConnection {

    public client = new Client();
    public transactionsCount = 0;
    public handler?: NativeConnection;

    get connected(): boolean {
        if (this.handler) {
            // this.client.statusActionSync((status) => this.handler!.pingSync(status));
            try {
                this.client.statusActionSync((status) => {  // hack for checking the lost connections
                    const infoReq = new Uint8Array([blobInfo.totalLength]);
                    const infoRet = new Uint8Array(20);
                    this.handler!.getInfoSync(status, infoReq.byteLength, infoReq, infoRet.byteLength, infoRet);
                });
            } catch (error) {
                return false;
            }
            return true;
        }
        return false;
    }

    private static _optionsToUri(options: IConnectionOptions): string {
        let url = "";
        if (options.server) {
            url += options.server.host;
            url += `/${options.server.port}`;
        }
        if (url) {
            url += ":";
        }
        url += options.path;
        return url;
    }

    public async createDatabase(options: IConnectionOptions): Promise<void> {
        if (this.handler) {
            throw new Error("Database already connected");
        }

        await this.client.create();
        this.handler = await this.client.statusAction((status) => (
            createDpb(options, this.client.client!.util, status, async (buffer, length) => {
                const uri = Connection._optionsToUri(options);
                return await this.client!.client!.dispatcher!.createDatabaseAsync(status, uri, length, buffer);
            })
        ));
    }

    public async dropDatabase(): Promise<void> {
        if (!this.handler) {
            throw new Error("Need database connection");
        }

        if (this.transactionsCount > 0) {
            throw new Error("Not all transactions finished");
        }

        await this.client.statusAction((status) => this.handler!.dropDatabaseAsync(status));
        this.handler = undefined;
        await this.client.destroy();
    }

    public async connect(options: IConnectionOptions): Promise<void> {
        if (this.handler) {
            throw new Error("Database already connected");
        }

        await this.client.create();
        this.handler = await this.client.statusAction((status) => (
            createDpb(options, this.client.client!.util, status, async (buffer, length) => {
                const uri = Connection._optionsToUri(options);
                return await this.client!.client!.dispatcher!.attachDatabaseAsync(status, uri, length, buffer);
            })
        ));
    }

    public async startTransaction(options?: ITransactionOptions): Promise<Transaction> {
        if (!this.handler) {
            throw new Error("Need database connection");
        }

        return await Transaction.create(this, options);
    }

    public async disconnect(): Promise<void> {
        if (!this.handler) {
            throw new Error("Need database connection");
        }

        if (this.transactionsCount > 0) {
            throw new Error("Not all transactions finished");
        }

        await this.client.statusAction((status) => this.handler!.detachAsync(status));
        await this.client.destroy();
        this.handler = undefined;
    }

    public async execute(transaction: Transaction, sql: string, params?: IParams): Promise<void> {
        const statement = await Statement.prepare(transaction, sql);
        try {
            await statement.execute(params);
        } finally {
            await statement.dispose();
        }
    }

    public async executeReturning(transaction: Transaction, sql: string, params?: IParams): Promise<Result> {
        const statement = await Statement.prepare(transaction, sql);
        try {
            return await statement.executeReturning(params);
        } finally {
            await statement.dispose();
        }
    }

    public async executeQuery(transaction: Transaction,
                              sql: string,
                              params?: IParams,
                              type?: CursorType): Promise<ResultSet> {
        if (transaction.finished) {
            throw new Error("Need to open transaction");
        }

        const statement = await Statement.prepare(transaction, sql);
        const resultSet = await statement.executeQuery(params, type);
        resultSet.disposeStatementOnClose = true;
        return resultSet;
    }

    public async prepare(transaction: Transaction, sql: string): Promise<Statement> {
        if (transaction.finished) {
            throw new Error("Need to open transaction");
        }

        return await Statement.prepare(transaction, sql);
    }
}
