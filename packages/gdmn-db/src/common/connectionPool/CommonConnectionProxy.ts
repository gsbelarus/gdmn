import {Pool} from "generic-pool";
import {AConnection, IConnectionOptions} from "../../AConnection";
import {AResultSet} from "../../AResultSet";
import {AStatement, IParams} from "../../AStatement";
import {ATransaction, ITransactionOptions} from "../../ATransaction";
import {Result} from "../../fb/Result";

export class CommonConnectionProxy extends AConnection {

    private readonly _pool: Pool<AConnection>;
    private readonly _connectionCreator: () => AConnection;
    private _connection: null | AConnection = null;

    constructor(pool: Pool<AConnection>, connectionCreator: () => AConnection) {
        super();
        this._pool = pool;
        this._connectionCreator = connectionCreator;
    }

    get connected(): boolean {
        if (!this._connection || !this.isBorrowed()) {
            return false;
        }
        return this._connection.connected;
    }

    get validate(): boolean {
        if (!this._connection) {
            return false;
        }
        return this._connection.connected;
    }

    public async create(options: IConnectionOptions): Promise<void> {
        if (this._connection) {
            throw new Error("Database already connected");
        }
        this._connection = this._connectionCreator();
        await this._connection.connect(options);
    }

    public async destroy(): Promise<void> {
        if (!this._connection) {
            throw new Error("Need database connection");
        }
        await this._connection.disconnect();
    }

    public async createDatabase(options: IConnectionOptions): Promise<void> {
        throw new Error("Invalid operation for connection from the pool");
    }

    public async dropDatabase(): Promise<void> {
        throw new Error("Invalid operation for connection from the pool");
    }

    public async connect(options: IConnectionOptions): Promise<void> {
        throw new Error("Invalid operation for connection from the pool");
    }

    public async disconnect(): Promise<void> {
        if (!this._connection) {
            throw new Error("Need database connection");
        }

        if (this.isBorrowed()) {
            await this._pool.release(this);
        }
    }

    public async startTransaction(options?: ITransactionOptions): Promise<ATransaction> {
        if (!this._connection || !this.isBorrowed()) {
            throw new Error("Need database connection");
        }
        return await this._connection.startTransaction(options);
    }

    public async prepare(transaction: ATransaction, sql: string): Promise<AStatement> {
        if (!this._connection || !this.isBorrowed()) {
            throw new Error("Need database connection");
        }
        return await this._connection.prepare(transaction, sql);
    }

    public async executeQuery(transaction: ATransaction,
                              sql: string,
                              params?: IParams): Promise<AResultSet> {
        if (!this._connection || !this.isBorrowed()) {
            throw new Error("Need database connection");
        }
        return await this._connection.executeQuery(transaction, sql, params);
    }

    public async execute(transaction: ATransaction, sql: string, params?: IParams): Promise<void> {
        if (!this._connection || !this.isBorrowed()) {
            throw new Error("Need database connection");
        }
        await this._connection.execute(transaction, sql, params);
    }

    public async executeReturning(transaction: ATransaction,
                                  sql: string,
                                  params?: IParams): Promise<Result> {
        if (!this._connection || !this.isBorrowed()) {
            throw new Error("Need database connection");
        }
        return await this._connection.executeReturning(transaction, sql, params);
    }

    private isBorrowed(): boolean {
        return this._pool.isBorrowedResource(this);
    }
}
