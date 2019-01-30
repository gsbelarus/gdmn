import {ADriver} from "./ADriver";
import {AResultSet, CursorType} from "./AResultSet";
import {AStatement, IParams} from "./AStatement";
import {ATransaction, ITransactionOptions} from "./ATransaction";
import {Result} from "./fb/Result";
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

    protected _readTransaction?: ATransaction;

    protected constructor(driver: ADriver) {
        this.driver = driver;
    }

    /**
     * Is the database connected.
     *
     * @returns {boolean}
     * true if the database connected;
     * false if the database was disconnected or not connected yet
     */
    abstract get connected(): boolean;

    get readTransaction(): ATransaction {
        if (!this._readTransaction) {
            throw new Error("Read Transaction is not found");
        }
        return this._readTransaction;
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
     * Create database and connect absolute them.
     *
     * @param {Options} options
     * the type for creating database and connection absolute them
     */
    public abstract async createDatabase(options: IConnectionOptions): Promise<void>;

    /** Drop database and disconnect from them. */
    public abstract async dropDatabase(): Promise<void>;

    /**
     * Connect absolute the database.
     *
     * @param {Options} options
     * the type for opening database connection
     */
    public abstract async connect(options: IConnectionOptions): Promise<void>;

    /** Disconnect from the database. */
    public abstract async disconnect(): Promise<void>;

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
    public abstract async startTransaction(options?: ITransactionOptions): Promise<ATransaction>;

    /**
     * Creates a Statement object for sending parameterized SQL statements
     * absolute the database.
     *
     * @param {ATransaction} transaction
     * @param {string} sql
     * an SQL statement that may contain one or more parameter placeholders
     * @returns {Promise<AStatement>}
     * a Statement object containing the pre-compiled SQL statement
     */
    public abstract async prepare(transaction: ATransaction, sql: string): Promise<AStatement>;

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
    public abstract async executeQuery(transaction: ATransaction,
                                       sql: string,
                                       params?: IParams,
                                       type?: CursorType): Promise<AResultSet>;

    /**
     * Executes the SQL query.
     *
     * @param {ATransaction} transaction
     * @param {string} sql
     * an SQL statement that may contain one or more parameter placeholders
     * @param {IParams} params
     * array of parameters or object containing placeholders as keys and parameters as values; optional
     */
    public abstract async execute(transaction: ATransaction, sql: string, params?: IParams): Promise<void>;

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
    public abstract async executeReturning(transaction: ATransaction, sql: string, params?: IParams): Promise<Result>;
}
