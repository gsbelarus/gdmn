import {Semaphore} from "gdmn-internals";
import {ABlobLink} from "./ABlobLink";
import {ABlobStream} from "./ABlobStream";
import {ADriver} from "./ADriver";
import {AResult} from "./AResult";
import {AResultSet, CursorType} from "./AResultSet";
import {AStatement, IParams} from "./AStatement";
import {AccessMode, ATransaction, ITransactionOptions} from "./ATransaction";
import {IBaseExecuteOptions, TExecutor} from "./types";

export interface IConnectionServer {
    host: string;
    port: number;
}

export interface IConnectionOptions {
    server?: IConnectionServer;
    username: string;
    password: string;
    path: string;
    readTransaction?: boolean;
}

export interface IExecuteConnectionOptions<R> extends IBaseExecuteOptions<AConnection, R> {
    connection: AConnection;
    options: IConnectionOptions;
}

export interface IExecuteTransactionOptions<R> extends IBaseExecuteOptions<ATransaction, R> {
    connection: AConnection;
    options?: ITransactionOptions;
}

export interface IExecutePrepareStatementOptions<R> extends IBaseExecuteOptions<AStatement, R> {
    connection: AConnection;
    transaction: ATransaction;
    sql: string;
}

export interface IExecuteQueryResultSetOptions<R> extends IBaseExecuteOptions<AResultSet, R> {
    connection: AConnection;
    transaction: ATransaction;
    sql: string;
    params?: IParams;
    type?: CursorType;
}

export abstract class AConnection {

    public readonly driver: ADriver;

    protected _connected = false;
    protected _readTransaction?: ATransaction;

    private readonly _lock = new Semaphore();

    protected constructor(driver: ADriver) {
        this.driver = driver;
    }

    get readTransaction(): ATransaction {
        if (!this._connected) {
            throw new Error("Need to database connection");
        }
        if (!this._readTransaction) {
            throw new Error("Read Transaction is not found");
        }
        return this._readTransaction;
    }

    get isLock(): boolean {
        return !!this._lock.permits;
    }

    /**
     * Is the database connected.
     *
     * @returns {boolean}
     * true if the database connected;
     * false if the database was disconnected or not connected yet
     */
    get connected(): boolean {
        return this._connected;
    }

    public static async executeSelf<Opt, R>(selfReceiver: TExecutor<null, AConnection>,
                                            callback: TExecutor<AConnection, R>): Promise<R> {
        let self: undefined | AConnection;
        try {
            self = await selfReceiver(null);
            return await callback(self);
        } finally {
            if (self) {
                await self.disconnect();
            }
        }
    }

    public static async executeConnection<R>(
        {connection, callback, options}: IExecuteConnectionOptions<R>
    ): Promise<R> {
        return await AConnection.executeSelf(async () => {
            await connection.connect(options);
            return connection;
        }, callback);
    }

    public static async executeTransaction<R>(
        {connection, callback, options}: IExecuteTransactionOptions<R>
    ): Promise<R> {
        return await ATransaction.executeSelf(() => connection.startTransaction(options), callback);
    }

    public static async executePrepareStatement<R>(
        {connection, transaction, callback, sql}: IExecutePrepareStatementOptions<R>
    ): Promise<R> {
        return await AStatement.executeSelf(() => connection.prepare(transaction, sql), callback);
    }

    public static async executeQueryResultSet<R>(
        {connection, transaction, callback, sql, params, type}: IExecuteQueryResultSetOptions<R>
    ): Promise<R> {
        return await AResultSet.executeSelf(() => connection.executeQuery(transaction, sql, params, type), callback);
    }

    /**
     * Create database and connect to it.
     *
     * @param {Options} options
     * the type for creating database and connection to it
     */
    public async createDatabase(options: IConnectionOptions): Promise<void> {
        await this._executeWithLock(async () => {
            if (this._connected) {
                throw new Error("Database already connected");
            }
            await this._createDatabase(options);
            await this._openReadTransaction();
            this._connected = true;
        });
    }

    /** Drop database and disconnect from it. */
    public async dropDatabase(): Promise<void> {
        await this._executeWithLock(async () => {
            if (!this._connected) {
                throw new Error("Need to database connection");
            }
            await this._closeReadTransaction();
            await this._dropDatabase();
            this._connected = false;
        });
    }

    /**
     * Connect to the database.
     *
     * @param {Options} options
     * the type for opening database connection
     */
    public async connect(options: IConnectionOptions): Promise<void> {
        await this._executeWithLock(async () => {
            if (this._connected) {
                throw new Error("Database already connected");
            }
            await this._connect(options);
            await this._openReadTransaction();
            this._connected = true;
        });
    }

    /** Disconnect from the database. */
    public async disconnect(): Promise<void> {
        await this._executeWithLock(async () => {
            if (!this._connected) {
                throw new Error("Need to database connection");
            }
            await this._closeReadTransaction();
            await this._disconnect();
            this._connected = false;
        });
    }

    /**
     * Start transaction.
     * @see {@link ATransaction.DEFAULT_OPTIONS}
     *
     * @param {ITransactionOptions} [options=DEFAULT_OPTIONS]
     * the type for transaction; optional
     * @returns {Promise<ATransaction>}
     * a Transaction object;
     * never null
     */
    public async startTransaction(options?: ITransactionOptions): Promise<ATransaction> {
        if (this.isLock) {
            await this.waitUnlock();
        }
        if (!this._connected) {
            throw new Error("Need to database connection");
        }
        return await this._startTransaction(options);
    }

    // TODO docs
    public async openBlobStream(transaction: ATransaction, blob: ABlobLink): Promise<ABlobStream> {
        if (this.isLock) {
            await this.waitUnlock();
        }
        if (!this._connected) {
            throw new Error("Need to database connection");
        }
        this._checkTransaction(transaction);
        return await this._openBlobStream(transaction, blob);
    }

    // TODO docs
    public async openBlobAsBuffer(transaction: ATransaction, blob: ABlobLink): Promise<Buffer> {
        const blobStream = await this.openBlobStream(transaction, blob);
        try {
            const length = await blobStream.getLength();
            const buffer = Buffer.alloc(length);
            await blobStream.read(buffer);

            return buffer;

        } catch (error) {
            if (!blobStream.finished) {
                await blobStream.cancel();
            }
            throw error;
        } finally {
            if (!blobStream.finished) {
                await blobStream.close();
            }
        }
    }

    // TODO docs
    public async openBlobAsString(transaction: ATransaction, blob: ABlobLink): Promise<string> {
        const buffer = await this.openBlobAsBuffer(transaction, blob);
        return buffer.toString();
    }

    // TODO docs
    public async createBlobStream(transaction: ATransaction): Promise<ABlobStream> {
        if (this.isLock) {
            await this.waitUnlock();
        }
        if (!this._connected) {
            throw new Error("Need to database connection");
        }
        this._checkTransaction(transaction);
        return await this._createBlobStream(transaction);
    }

    /**
     * Creates a Statement object for sending parameterized SQL statements
     * to the database.
     *
     * @param {ATransaction} transaction
     * @param {string} sql
     * an SQL statement that may contain one or more parameter placeholders
     * @returns {Promise<AStatement>}
     * a Statement object containing the pre-compiled SQL statement
     */
    public async prepare(transaction: ATransaction, sql: string): Promise<AStatement> {
        if (this.isLock) {
            await this.waitUnlock();
        }
        if (!this._connected) {
            throw new Error("Need to database connection");
        }
        this._checkTransaction(transaction);
        return await this._prepare(transaction, sql);
    }

    /**
     * Executes the SQL query and returns the ResultSet object generated by the query.
     *
     * @param {ATransaction} transaction
     * @param {string} sql
     * an SQL statement that may contain one or more parameter placeholders
     * @param {IParams} params
     * array of parameters or object containing placeholders as keys and parameters as values; optional
     * @param {CursorType} type
     * @returns {Promise<AResultSet>}
     * a ResultSet object that contains the data produced by the given query;
     * never null
     */
    public async executeQuery(transaction: ATransaction,
                              sql: string,
                              params?: IParams,
                              type?: CursorType): Promise<AResultSet> {
        if (this.isLock) {
            await this.waitUnlock();
        }
        if (!this._connected) {
            throw new Error("Need to database connection");
        }
        this._checkTransaction(transaction);
        return await this._executeQuery(transaction, sql, params, type);
    }

    /**
     * Executes the SQL query.
     *
     * @param {ATransaction} transaction
     * @param {string} sql
     * an SQL statement that may contain one or more parameter placeholders
     * @param {IParams} params
     * array of parameters or object containing placeholders as keys and parameters as values; optional
     */
    public async execute(transaction: ATransaction, sql: string, params?: IParams): Promise<void> {
        if (this.isLock) {
            await this.waitUnlock();
        }
        if (!this._connected) {
            throw new Error("Need to database connection");
        }
        this._checkTransaction(transaction);
        return await this._execute(transaction, sql, params);
    }

    /**
     * Executes the SQL query and returns the result array.
     *
     * @param {ATransaction} transaction
     * @param {string} sql
     * an SQL statement that may contain one or more parameter placeholders
     * @param {IParams} params
     * array of parameters or object containing placeholders as keys and parameters as values; optional
     * @returns {Promise<Result>}
     * a result array;
     * never null
     */
    public async executeReturning(transaction: ATransaction, sql: string, params?: IParams): Promise<AResult> {
        if (this.isLock) {
            await this.waitUnlock();
        }
        if (!this._connected) {
            throw new Error("Need to database connection");
        }
        this._checkTransaction(transaction);
        return await this._executeReturning(transaction, sql, params);
    }

    /**
     * Wait unlock connection. Lock occurs when creating, deleting, connecting and disconnecting
     */
    public async waitUnlock(): Promise<void> {
        if (!this.isLock) {
            await this._lock.acquire();
            this._lock.release();
        }
    }

    protected async _executeWithLock<R>(callback: TExecutor<void, R>): Promise<R> {
        await this._lock.acquire();
        try {
            return await callback();
        } finally {
            this._lock.release();
        }
    }

    protected async _openReadTransaction(): Promise<void> {
        if (this._readTransaction) {
            throw new Error("Read transaction already opened");
        }
        this._readTransaction = await this._startTransaction({accessMode: AccessMode.READ_ONLY});
    }

    protected async _closeReadTransaction(): Promise<void> {
        if (this._readTransaction) {
            await this._readTransaction.commit();
            this._readTransaction = undefined;
        }
    }

    protected abstract async _createDatabase(options: IConnectionOptions): Promise<void>;

    protected abstract async _dropDatabase(): Promise<void>;

    protected abstract async _connect(options: IConnectionOptions): Promise<void>;

    protected abstract async _disconnect(): Promise<void>;

    protected abstract async _startTransaction(options?: ITransactionOptions): Promise<ATransaction>;

    protected abstract async _openBlobStream(transaction: ATransaction, blob: ABlobLink): Promise<ABlobStream>;

    protected abstract async _createBlobStream(transaction: ATransaction): Promise<ABlobStream>;

    protected abstract async _prepare(transaction: ATransaction, sql: string): Promise<AStatement>;

    protected abstract async _executeQuery(transaction: ATransaction,
                                           sql: string,
                                           params?: IParams,
                                           type?: CursorType): Promise<AResultSet>;

    protected abstract async _execute(transaction: ATransaction, sql: string, params?: IParams): Promise<void>;

    protected abstract async _executeReturning(transaction: ATransaction,
                                               sql: string,
                                               params?: IParams): Promise<AResult>;

    private _checkTransaction(transaction: ATransaction): void {
        if (transaction.connection !== this) {
            throw new Error("Invalid transaction");
        }
        if (transaction.finished) {
            throw new Error("Need to open transaction");
        }
    }
}
