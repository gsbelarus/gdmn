import {Pool} from "generic-pool";
import {AConnection, IConnectionOptions} from "../../AConnection";
import {ADriver} from "../../ADriver";
import {AResultSet} from "../../AResultSet";
import {AStatement, IParams} from "../../AStatement";
import {ATransaction, ITransactionOptions} from "../../ATransaction";
import {Result} from "../../fb/Result";

export class CommonConnectionProxy extends AConnection {

    private readonly _pool: Pool<AConnection>;
    private readonly _connectionCreator: () => AConnection;
    private _connection?: AConnection;

    constructor(pool: Pool<AConnection>, connectionCreator: () => AConnection) {
        super(null as any);
        this._pool = pool;
        this._connectionCreator = connectionCreator;
    }

    get driver(): ADriver {
        if (!this._connection) {
            throw new Error("Need database connection");
        }
        return this._connection.driver;
    }

    set driver(driver: ADriver) {
        // empty
    }

    get connected(): boolean {
        if (!this._connection || !this._pool.isBorrowedResource(this)) {
            return false;
        }
        return this._connection.connected;
    }

    get readTransaction(): ATransaction {
        if (!this._connection) {
            throw new Error("Need database connection");
        }
        return this._connection.readTransaction;
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
        this._connection = undefined;
    }

    protected async _createDatabase(options: IConnectionOptions): Promise<void> {
        throw new Error("Invalid operation for connection from the pool");
    }

    protected async _dropDatabase(): Promise<void> {
        throw new Error("Invalid operation for connection from the pool");
    }

    protected async _connect(options: IConnectionOptions): Promise<void> {
        throw new Error("Invalid operation for connection from the pool");
    }

    protected async _disconnect(): Promise<void> {
        if (!this._connection) {
            throw new Error("Need database connection");
        }

        if (this._pool.isBorrowedResource(this)) {
            await this._pool.release(this);
        }
    }

    protected async _startTransaction(options?: ITransactionOptions): Promise<ATransaction> {
        if (!this._connection || !this._pool.isBorrowedResource(this)) {
            throw new Error("Need database connection");
        }
        return await this._connection.startTransaction(options);
    }

    protected async _prepare(transaction: ATransaction, sql: string): Promise<AStatement> {
        if (!this._connection || !this._pool.isBorrowedResource(this)) {
            throw new Error("Need database connection");
        }
        return await this._connection.prepare(transaction, sql);
    }

    protected async _executeQuery(transaction: ATransaction,
                                  sql: string,
                                  params?: IParams): Promise<AResultSet> {
        if (!this._connection || !this._pool.isBorrowedResource(this)) {
            throw new Error("Need database connection");
        }
        return await this._connection.executeQuery(transaction, sql, params);
    }

    protected async _execute(transaction: ATransaction, sql: string, params?: IParams): Promise<void> {
        if (!this._connection || !this._pool.isBorrowedResource(this)) {
            throw new Error("Need database connection");
        }
        await this._connection.execute(transaction, sql, params);
    }

    protected async _executeReturning(transaction: ATransaction,
                                      sql: string,
                                      params?: IParams): Promise<Result> {
        if (!this._connection || !this._pool.isBorrowedResource(this)) {
            throw new Error("Need database connection");
        }
        return await this._connection.executeReturning(transaction, sql, params);
    }
}
