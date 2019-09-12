import {Semaphore} from "gdmn-internals";
import {ABlobLink} from "./ABlobLink";
import {AMetadata} from "./AMetadata";
import {AResult} from "./AResult";
import {AStatement} from "./AStatement";
import {TExecutor} from "./types";

export enum CursorType {
    FORWARD_ONLY,
    SCROLLABLE
}

export abstract class AResultSet extends AResult {

    public static DEFAULT_TYPE = CursorType.FORWARD_ONLY;

    protected readonly _statement: AStatement;
    protected readonly _result: AResult;
    protected readonly _type: CursorType;

    protected _closed = false;

    private readonly _lock = new Semaphore();

    protected constructor(statement: AStatement, result: AResult, type: CursorType = AResultSet.DEFAULT_TYPE) {
        super();
        this._statement = statement;
        this._result = result;
        this._type = type;
    }

    get statement(): AStatement {
        return this._statement;
    }

    get metadata(): AMetadata {
        return this._result.metadata;
    }

    get result(): AResult {
        return this._result;
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
    get closed(): boolean {
        return this._closed;
    }

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
        await this._executeWithLock(async () => {
            if (this._closed) {
                throw new Error("ResultSet already closed");
            }
            await this._close();
            this._closed = true;
        });
    }

    public async next(): Promise<boolean> {
        if (this.isLock) {
            await this.waitUnlock();
        }
        if (this._closed) {
            throw new Error("ResultSet already closed");
        }
        return await this._next();
    }

    public async previous(): Promise<boolean> {
        if (this.isLock) {
            await this.waitUnlock();
        }
        if (this._closed) {
            throw new Error("ResultSet already closed");
        }
        return await this._previous();
    }

    public async absolute(i: number): Promise<boolean> {
        if (this.isLock) {
            await this.waitUnlock();
        }
        if (this._closed) {
            throw new Error("ResultSet already closed");
        }
        return await this._absolute(i);
    }

    public async relative(i: number): Promise<boolean> {
        if (this.isLock) {
            await this.waitUnlock();
        }
        if (this._closed) {
            throw new Error("ResultSet already closed");
        }
        return await this._relative(i);
    }

    public async first(): Promise<boolean> {
        if (this.isLock) {
            await this.waitUnlock();
        }
        if (this._closed) {
            throw new Error("ResultSet already closed");
        }
        return await this._first();
    }

    public async last(): Promise<boolean> {
        if (this.isLock) {
            await this.waitUnlock();
        }
        if (this._closed) {
            throw new Error("ResultSet already closed");
        }
        return await this._last();
    }

    public async isBof(): Promise<boolean> {
        if (this.isLock) {
            await this.waitUnlock();
        }
        if (this._closed) {
            throw new Error("ResultSet already closed");
        }
        return await this._isBof();
    }

    public async isEof(): Promise<boolean> {
        if (this.isLock) {
            await this.waitUnlock();
        }
        if (this._closed) {
            throw new Error("ResultSet already closed");
        }
        return await this._isEof();
    }

    public getBlob(i: number): null | ABlobLink;
    public getBlob(name: string): null | ABlobLink;
    public getBlob(field: any): null | ABlobLink {
        return this._result.getBlob(field);
    }

    public getBoolean(i: number): boolean;
    public getBoolean(name: string): boolean;
    public getBoolean(field: any): boolean {
        return this._result.getBoolean(field);
    }

    public getDate(i: number): null | Date;
    public getDate(name: string): null | Date;
    public getDate(field: any): null | Date {
        return this._result.getDate(field);
    }

    public getNumber(i: number): number;
    public getNumber(name: string): number;
    public getNumber(field: any): number {
        return this._result.getNumber(field);
    }

    public getString(i: number): string;
    public getString(name: string): string;
    public getString(field: any): string {
        return this._result.getString(field);
    }

    public getAny(i: number): any;
    public getAny(name: string): any;
    public getAny(field: any): any {
        return this._result.getAny(field);
    }

    public getAll(): any[] {
        return this._result.getAll();
    }

    public isNull(i: number): boolean;
    public isNull(name: string): boolean;
    public isNull(field: any): boolean {
        return this._result.isNull(field);
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
