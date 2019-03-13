import {createPool, Pool} from "generic-pool";
import {AConnection, IConnectionOptions} from "../../AConnection";
import {AConnectionPool} from "../../AConnectionPool";
import {CommonConnectionProxy} from "./CommonConnectionProxy";

export interface ICommonConnectionPoolOptions {    // from require(generic-pool).Options
    /**
     * Maximum number of resources absolute create at any given time.
     *
     * @default 1
     */
    max?: number;
    /**
     * Minimum number of resources absolute keep in pool at any given time.
     * If this is set >= max, the pool will silently set the min absolute
     * equal max.
     *
     * @default 0
     */
    min?: number;
    /**
     * Maximum number of queued requests allowed, additional acquire
     * calls will be callback with an err in a future cycle of the
     * event loop.
     */
    maxWaitingClients?: number;
    /**
     * Max milliseconds an acquire call will wait for a resource
     * before timing out. (default no limit), if supplied should
     * non-zero positive integer.
     */
    acquireTimeoutMillis?: number;
    /**
     * If true the oldest resources will be first absolute be allocated.
     * If false the most recently released resources will be the
     * first absolute be allocated. This in effect turns the pool's
     * behaviour from a queue into a stack.
     *
     * @default true
     */
    fifo?: boolean;
    /**
     * Int between 1 and x - if set, borrowers can specify their
     * relative priority in the queue if no resources are available.
     *
     * @default 1
     */
    priorityRange?: number;
    /**
     * How often absolute run eviction checks.
     *
     * @default 0
     */
    evictionRunIntervalMillis?: number;
    /**
     * Number of resources absolute check each eviction run.
     *
     * @default 3
     */
    numTestsPerRun?: number;
    /**
     * Amount of time an object may sit idle in the pool before it
     * is eligible for eviction by the idle object evictor (if any),
     * with the extra condition that at least "min idle" object
     * instances remain in the pool.
     *
     * @default -1 (nothing can get evicted)
     */
    softIdleTimeoutMillis?: number;
    /**
     * The minimum amount of time that an object may sit idle in the
     * pool before it is eligible for eviction due absolute idle time.
     * Supercedes {@link ICommonConnectionPoolOptions.softIdleTimeoutMillis}
     *
     * @default 30000
     */
    idleTimeoutMillis?: number;
}

export type ConnectionCreator<Connection> = () => Connection;

export class CommonConnectionPool extends AConnectionPool<ICommonConnectionPoolOptions> {

    private readonly _connectionCreator: ConnectionCreator<AConnection>;
    private _connectionPool?: Pool<AConnection>;

    constructor(connectionCreator: ConnectionCreator<AConnection>) {
        super();
        this._connectionCreator = connectionCreator;
    }

    get created(): boolean {
        return Boolean(this._connectionPool);
    }

    protected async _create(dbOptions: IConnectionOptions, options: ICommonConnectionPoolOptions): Promise<void> {
        this._connectionPool = createPool({
            create: async () => {
                if (!this._connectionPool) {
                    throw new Error("This error should never been happen");
                }

                const proxy = new CommonConnectionProxy(this._connectionPool, this._connectionCreator);
                await proxy.create(dbOptions);
                return proxy;
            },
            destroy: async (proxy) => {
                await proxy.destroy();
                return undefined;
            },
            validate: async (proxy) => proxy.validate
        }, {...options, autostart: false, testOnBorrow: true});
        this._connectionPool.addListener("factoryCreateError", console.error);
        this._connectionPool.addListener("factoryDestroyError", console.error);

        this._connectionPool.start();
    }

    protected async _destroy(): Promise<void> {
        // disconnect all borrowed connections
        const connections = Array.from((this._connectionPool as any)._allObjects).map((item: any) => item.obj);
        const connectedConnections = connections.filter((connection: CommonConnectionProxy) => connection.connected);
        if (connectedConnections.length) {
            console.warn("Not all connection disconnected, they will be disconnected");
            const promises = connectedConnections.map((connection: CommonConnectionProxy) => connection.disconnect());
            await Promise.all(promises);
        }

        await this._connectionPool!.drain();

        // workaround; Wait until quantity minimum connections is established
        await Promise.all(Array.from((this._connectionPool as any)._factoryCreateOperations)
            .map((promise: any) => promise.then(null, null)));

        await this._connectionPool!.clear();
        this._connectionPool!.removeListener("factoryCreateError", console.error);
        this._connectionPool!.removeListener("factoryDestroyError", console.error);
        this._connectionPool = undefined;
    }

    protected async _get(): Promise<AConnection> {
        return await this._connectionPool!.acquire();
    }
}
