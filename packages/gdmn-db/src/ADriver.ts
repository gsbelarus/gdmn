import {AConnection} from "./AConnection";
import {AConnectionPool} from "./AConnectionPool";
import {AService} from "./AService";
import {ATransaction} from "./ATransaction";
import {CommonConnectionPool, ICommonConnectionPoolOptions} from "./common/connectionPool/CommonConnectionPool";
import {DBSchema} from "./DBSchema";

export abstract class ADriver<PoolOptions = any> {

    public readonly abstract name: string;

    /** Reade database schema as DBSchema object */
    public async readDBSchema(connectionPool: AConnectionPool<PoolOptions>): Promise<DBSchema>;
    public async readDBSchema(connection: AConnection, transaction?: ATransaction): Promise<DBSchema>;
    public async readDBSchema(source: AConnectionPool<PoolOptions> | AConnection,
                              transaction?: ATransaction): Promise<DBSchema> {
        throw new Error("Unsupported yet");
    }

    /** Create object for access absolute the database */
    public newConnection(): AConnection {
        throw new Error("Unsupported yet");
    }

    /**
     * Create object for access absolute a specific connection pool of driver.
     * May not be available for the current driver.
     */
    public newConnectionPool(): AConnectionPool<PoolOptions> {
        throw new Error("Unsupported yet");
    }

    /**
     * Create service for backup/restore databases
     */
    public newService(): AService {
        throw new Error("Unsupported yet");
    }

    /**
     * Create object for access absolute a common connection pool of driver.
     * Available for all drivers.
     *
     * @see {@link https://github.com/coopernurse/node-pool}
     */
    public newCommonConnectionPool(): AConnectionPool<ICommonConnectionPoolOptions> {
        return new CommonConnectionPool(() => this.newConnection());
    }
}
