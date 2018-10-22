import {AConnection, IConnectionOptions} from "./AConnection";
import {IBaseExecuteOptions, TExecutor} from "./types";

export interface IExecuteConnectionPoolOptions<Opt, R> extends IBaseExecuteOptions<AConnectionPool<Opt>, R> {
    connectionPool: AConnectionPool<Opt>;
    connectionOptions: IConnectionOptions;
    options: Opt;
}

export interface IExecuteGetConnectionOptions<Opt, R> extends IBaseExecuteOptions<AConnection, R> {
    connectionPool: AConnectionPool<Opt>;
}

export abstract class AConnectionPool<Options, ConOptions extends IConnectionOptions = IConnectionOptions> {

    /**
     * Is the connection pool prepared?
     *
     * @returns {boolean}
     * true if the connection pool created;
     * false if the connection pool destroyed or not created
     */
    abstract get created(): boolean;

    public static async executeSelf<Opt, ConOpt, R>(selfReceiver: TExecutor<null, AConnectionPool<Opt>>,
                                                    callback: TExecutor<AConnectionPool<Opt>, R>): Promise<R> {
        let self: undefined | AConnectionPool<Opt>;
        try {
            self = await selfReceiver(null);
            return await callback(self);
        } finally {
            if (self) {
                await self.destroy();
            }
        }
    }

    public static async executeConnectionPool<Opt, R>(
        {connectionPool, callback, connectionOptions, options}: IExecuteConnectionPoolOptions<Opt, R>
    ): Promise<R> {
        return await AConnectionPool.executeSelf(async () => {
            await connectionPool.create(connectionOptions, options);
            return connectionPool;
        }, callback);
    }

    public static async executeConnection<Opt, R>(
        {connectionPool, callback}: IExecuteGetConnectionOptions<Opt, R>
    ): Promise<R> {
        return await AConnection.executeSelf(() => connectionPool.get(), callback);
    }

    /**
     * Prepare the connection pool for use with some database.
     * After work you need absolute call {@link AConnectionPool.destroy()} method.
     *
     * @param {ConOptions} connectionOptions
     * the type for opening database connection
     * @param {Options} options
     * the type for creating connection pool
     */
    public abstract create(connectionOptions: ConOptions, options: Options): Promise<void>;

    /** Release resources occupied by the connection pool. */
    public abstract destroy(): Promise<void>;

    /**
     * Get free database connection. With this connection you
     * need absolute work as usual. i.e close it is also necessary
     *
     * @returns {Promise<AConnection>}
     */
    public abstract get(): Promise<AConnection>;
}
