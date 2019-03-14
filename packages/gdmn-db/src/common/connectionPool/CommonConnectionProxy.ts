import {Pool} from "generic-pool";
import {ABlobLink} from "../../ABlobLink";
import {ABlobStream} from "../../ABlobStream";
import {AConnection, IConnectionOptions} from "../../AConnection";
import {ADriver} from "../../ADriver";
import {AResult} from "../../AResult";
import {AResultSet, CursorType} from "../../AResultSet";
import {AStatement, IParams} from "../../AStatement";
import {ATransaction, ITransactionOptions} from "../../ATransaction";

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

    public async createDatabase(options: IConnectionOptions): Promise<void> {
        await this._createDatabase(options);
    }

    public async dropDatabase(): Promise<void> {
        await this._dropDatabase();
    }

    public async connect(options: IConnectionOptions): Promise<void> {
        await this._connect(options);
    }

    public async disconnect(): Promise<void> {
        if (!this._connection) {
            throw new Error("Need database connection");
        }

        if (this._pool.isBorrowedResource(this)) {
            await this._pool.release(this);
        }
    }

    public async startTransaction(options?: ITransactionOptions): Promise<ATransaction> {
        return await this._startTransaction(options);
    }

    public async createBlobStream(transaction: ATransaction): Promise<ABlobStream> {
        return await this._createBlobStream(transaction);
    }

    public async openBlobStream(transaction: ATransaction, blob: ABlobLink): Promise<ABlobStream> {
        return await this._openBlobStream(transaction, blob);
    }

    public async prepare(transaction: ATransaction, sql: string): Promise<AStatement> {
        return await this._prepare(transaction, sql);
    }

    public async executeQuery(transaction: ATransaction,
                              sql: string,
                              params?: IParams,
                              type?: CursorType): Promise<AResultSet> {
        return await this._executeQuery(transaction, sql, params, type);
    }

    public async execute(transaction: ATransaction, sql: string, params?: IParams): Promise<void> {
        await this._execute(transaction, sql, params);
    }

    public async executeReturning(transaction: ATransaction, sql: string, params?: IParams): Promise<AResult> {
        return await this._executeReturning(transaction, sql, params);
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
        throw new Error("Invalid operation for connection from the pool");
    }

    protected async _startTransaction(options?: ITransactionOptions): Promise<ATransaction> {
        if (!this._connection || !this._pool.isBorrowedResource(this)) {
            throw new Error("Need database connection");
        }
        return await this._connection.startTransaction(options);
    }

    protected async _createBlobStream(transaction: ATransaction): Promise<ABlobStream> {
        if (!this._connection || !this._pool.isBorrowedResource(this)) {
            throw new Error("Need database connection");
        }
        return await this._connection.createBlobStream(transaction);
    }

    protected async _openBlobStream(transaction: ATransaction, blob: ABlobLink): Promise<ABlobStream> {
        if (!this._connection || !this._pool.isBorrowedResource(this)) {
            throw new Error("Need database connection");
        }
        return await this._connection.openBlobStream(transaction, blob);
    }

    protected async _prepare(transaction: ATransaction, sql: string): Promise<AStatement> {
        if (!this._connection || !this._pool.isBorrowedResource(this)) {
            throw new Error("Need database connection");
        }
        return await this._connection.prepare(transaction, sql);
    }

    protected async _executeQuery(transaction: ATransaction,
                                  sql: string,
                                  params?: IParams,
                                  type?: CursorType): Promise<AResultSet> {
        if (!this._connection || !this._pool.isBorrowedResource(this)) {
            throw new Error("Need database connection");
        }
        return await this._connection.executeQuery(transaction, sql, params, type);
    }

    protected async _execute(transaction: ATransaction, sql: string, params?: IParams): Promise<void> {
        if (!this._connection || !this._pool.isBorrowedResource(this)) {
            throw new Error("Need database connection");
        }
        await this._connection.execute(transaction, sql, params);
    }

    protected async _executeReturning(transaction: ATransaction,
                                      sql: string,
                                      params?: IParams): Promise<AResult> {
        if (!this._connection || !this._pool.isBorrowedResource(this)) {
            throw new Error("Need database connection");
        }
        return await this._connection.executeReturning(transaction, sql, params);
    }
}
