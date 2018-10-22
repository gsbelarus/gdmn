import {AConnection} from "./AConnection";
import {TExecutor} from "./types";

export enum AccessMode {
    READ_WRITE = "READ_WRITE",
    READ_ONLY = "READ_ONLY"
}

export enum Isolation {
    READ_COMMITED = "READ_COMMITED",
    READ_UNCOMMITED = "READ_UNCOMMITED",
    REPEATABLE_READ = "REPEATABLE_READ",
    SERIALIZABLE = "SERIALIZABLE"
}

export interface ITransactionOptions {
    isolation?: Isolation;
    accessMode?: AccessMode;
}

/**
 * The transaction object
 */
export abstract class ATransaction {

    public static DEFAULT_OPTIONS: ITransactionOptions = {
        isolation: Isolation.READ_COMMITED,
        accessMode: AccessMode.READ_WRITE
    };

    protected readonly _connection: AConnection;
    protected readonly _options: ITransactionOptions;

    protected constructor(connection: AConnection, options?: ITransactionOptions) {
        this._connection = connection;
        this._options = {...ATransaction.DEFAULT_OPTIONS, ...options};
    }

    get connection(): AConnection {
        return this._connection;
    }

    /** Transaction type */
    get options(): ITransactionOptions {
        return this._options;
    }

    /**
     * Indicates was the transaction will been started.
     *
     * @returns {boolean}
     * true if the transaction was commited or rollbacked
     */
    abstract get finished(): boolean;

    public static async executeSelf<R>(selfReceiver: TExecutor<null, ATransaction>,
                                       callback: TExecutor<ATransaction, R>): Promise<R> {
        let self: undefined | ATransaction;
        try {
            self = await selfReceiver(null);
            const result = await callback(self);
            await self.commit();
            return result;
        } catch (error) {
            if (self) {
                await self.rollback();
            }
            throw error;
        }
    }

    /** Commit the transaction. */
    public abstract async commit(): Promise<void>;

    /** Rollback the transaction. */
    public abstract async rollback(): Promise<void>;
}
