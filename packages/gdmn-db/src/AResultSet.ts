import {Semaphore} from "gdmn-internals";
import {AResult} from "./AResult";
import {AStatement} from "./AStatement";
import {TExecutor} from "./types";

export enum CursorType {
    FORWARD_ONLY,
    SCROLLABLE
}

export abstract class AResultSet extends AResult {

    public static DEFAULT_TYPE = CursorType.FORWARD_ONLY;

    protected readonly _type: CursorType;

    private readonly _lock = new Semaphore();

    protected constructor(statement: AStatement, type: CursorType = AResultSet.DEFAULT_TYPE) {
        super(statement);
        this._type = type;
    }

    get type(): CursorType {
        return this._type;
    }

    get isLock(): boolean {
        return !!this._lock.permits;
    }

    /**
     * Retrieves whether this ResultSet object has been closed.
     * A ResultSet is closed if the method close has been called
     * on it.
     *
     * @returns {boolean}
     * true if this ResultSet object is closed;
     * false if it is still open
     */
    abstract get closed(): boolean;

    public static async executeSelf<R>(selfReceiver: TExecutor<null, AResultSet>,
                                       callback: TExecutor<AResultSet, R>): Promise<R> {
        let self: undefined | AResultSet;
        try {
            self = await selfReceiver(null);
            return await callback(self);
        } finally {
            if (self) {
                await self.close();
            }
        }
    }

    /** Releases this ResultSet object's database and resources. */
    public async close(): Promise<void> {
        await this._executeWithLock(() => this._close());
    }

    public async next(): Promise<boolean> {
        if (this.isLock) {
            await this.waitUnlock();
        }
        return await this._next();
    }

    public async previous(): Promise<boolean> {
        if (this.isLock) {
            await this.waitUnlock();
        }
        return await this._previous();
    }

    public async absolute(i: number): Promise<boolean> {
        if (this.isLock) {
            await this.waitUnlock();
        }
        return await this._absolute(i);
    }

    public async relative(i: number): Promise<boolean> {
        if (this.isLock) {
            await this.waitUnlock();
        }
        return await this._relative(i);
    }

    public async first(): Promise<boolean> {
        if (this.isLock) {
            await this.waitUnlock();
        }
        return await this._first();
    }

    public async last(): Promise<boolean> {
        if (this.isLock) {
            await this.waitUnlock();
        }
        return await this._last();
    }

    public async isBof(): Promise<boolean> {
        if (this.isLock) {
            await this.waitUnlock();
        }
        return await this._isBof();
    }

    public async isEof(): Promise<boolean> {
        if (this.isLock) {
            await this.waitUnlock();
        }
        return await this._isEof();
    }

    /**
     * Wait unlock statement. Lock occurs when disposing
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

    protected abstract async _close(): Promise<void>;

    protected abstract async _next(): Promise<boolean>;

    protected abstract async _previous(): Promise<boolean>;

    protected abstract async _absolute(i: number): Promise<boolean>;

    protected abstract async _relative(i: number): Promise<boolean>;

    protected abstract async _first(): Promise<boolean>;

    protected abstract async _last(): Promise<boolean>;

    protected abstract async _isBof(): Promise<boolean>;

    protected abstract async _isEof(): Promise<boolean>;
}
