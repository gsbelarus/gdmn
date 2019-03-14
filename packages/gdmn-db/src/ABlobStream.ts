import {Semaphore} from "gdmn-internals";
import {ATransaction} from "./ATransaction";
import {TExecutor} from "./types";

export abstract class ABlobStream {

    protected readonly _transaction: ATransaction;

    private _finished = false;

    private readonly _lock = new Semaphore();

    protected constructor(transaction: ATransaction) {
        this._transaction = transaction;
    }

    get transaction(): ATransaction {
        return this._transaction;
    }

    get isLock(): boolean {
        return !!this._lock.permits;
    }

    get finished(): boolean {
        return this._finished;
    }

    public async getLength(): Promise<number> {
        if (this.isLock) {
            await this.waitUnlock();
        }
        if (this._finished) {
            throw new Error("Stream already finished");
        }
        return await this._getLength();
    }

    public async close(): Promise<void> {
        await this._executeWithLock(async () => {
            if (this._finished) {
                throw new Error("Stream already finished");
            }
            await this._close();
            this._finished = true;
        });
    }

    public async cancel(): Promise<void> {
        await this._executeWithLock(async () => {
            if (this._finished) {
                throw new Error("Stream already finished");
            }
            await this._cancel();
            this._finished = true;
        });
    }

    public async read(buffer: Buffer): Promise<number> {
        if (this.isLock) {
            await this.waitUnlock();
        }
        if (this._finished) {
            throw new Error("Stream already finished");
        }
        return await this._read(buffer);
    }

    public async write(buffer: Buffer): Promise<void> {
        if (this.isLock) {
            await this.waitUnlock();
        }
        if (this._finished) {
            throw new Error("Stream already finished");
        }
        await this._write(buffer);
    }

    /**
     * Wait unlock stream. Lock occurs when closing and canceling
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

    protected abstract async _getLength(): Promise<number>;

    protected abstract async _close(): Promise<void>;

    protected abstract async _cancel(): Promise<void>;

    protected abstract async _read(buffer: Buffer): Promise<number>;

    protected abstract async _write(buffer: Buffer): Promise<void>;
}
