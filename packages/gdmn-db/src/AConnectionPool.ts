import {Semaphore} from "gdmn-internals";
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

    protected _created = false;

    private readonly _lock = new Semaphore();

    /**
     * Is the connection pool prepared?
     *
     * @returns {boolean}
     * true if the connection pool created;
     * false if the connection pool destroyed or not created
     */
    get created(): boolean {
        return this._created;
    }

    get isLock(): boolean {
        return !!this._lock.permits;
    }

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
     * After work you need to call {@link AConnectionPool.destroy()} method.
     *
     * @param {ConOptions} connectionOptions
     * the type for opening database connection
     * @param {Options} options
     * the type for creating connection pool
     */
    public async create(connectionOptions: ConOptions, options: Options): Promise<void> {
        await this._executeWithLock(async () => {
            if (this._created) {
                throw new Error("Connection pool already created");
            }
            await this._create(connectionOptions, options);
            this._created = true;
        });
    }

    /** Release resources occupied by the connection pool. */
    public async destroy(): Promise<void> {
        await this._executeWithLock(async () => {
            if (!this._created) {
                throw new Error("Need to create connection pool");
            }
            await this._destroy();
            this._created = false;
        });
    }

    /**
     * Get free database connection. With this connection you
     * need to work as usual. i.e close it is also necessary
     *
     * @returns {Promise<AConnection>}
     */
    public async get(): Promise<AConnection> {
        if (this.isLock) {
            await this.waitUnlock();
        }
        if (!this._created) {
            throw new Error("Need to create connection pool");
        }
        return await this._get();
    }

    /**
     * Wait unlock connection pool. Lock occurs when creating, destroying
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

    protected abstract async _create(connectionOptions: ConOptions, options: Options): Promise<void>;

    protected abstract async _destroy(): Promise<void>;

    protected abstract async _get(): Promise<AConnection>;
}
