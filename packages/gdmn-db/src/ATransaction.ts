import {Semaphore} from "gdmn-internals";
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

    protected _finished = false;

    private readonly _lock = new Semaphore();

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

    get isLock(): boolean {
        return !!this._lock.permits;
    }

    /**
     * Indicates was the transaction will been started.
     *
     * @returns {boolean}
     * true if the transaction was commited or rollbacked
     */
    get finished(): boolean {
        return this._finished;
    }

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
    public async commit(): Promise<void> {
        await this._executeWithLock(async () => {
            if (this._finished) {
                throw new Error("Transaction already finished");
            }
            await this._commit();
            this._finished = true;
        });
    }

    /** Commit retaining the transaction. */
    public async commitRetaining(): Promise<void> {
        await this._executeWithLock(async () => {
            if (this._finished) {
                throw new Error("Transaction already finished");
            }
            await this._commitRetaining();
        });
    }

    /** Rollback the transaction. */
    public async rollback(): Promise<void> {
        await this._executeWithLock(async () => {
            if (this._finished) {
                throw new Error("Transaction already finished");
            }
            await this._rollback();
            this._finished = true;
        });
    }

    protected async _executeWithLock<R>(callback: TExecutor<void, R>): Promise<R> {
        await this._lock.acquire();
        try {
            return await callback();
        } finally {
            this._lock.release();
        }
    }

    protected abstract async _commit(): Promise<void>;

    protected abstract async _commitRetaining(): Promise<void>;

    protected abstract async _rollback(): Promise<void>;
}
