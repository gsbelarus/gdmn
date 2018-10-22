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

    protected constructor(statement: AStatement, type: CursorType = AResultSet.DEFAULT_TYPE) {
        super(statement);
        this._type = type;
    }

    get type(): CursorType {
        return this._type;
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

    public abstract async next(): Promise<boolean>;

    public abstract async previous(): Promise<boolean>;

    public abstract async absolute(i: number): Promise<boolean>;

    public abstract async relative(i: number): Promise<boolean>;

    public abstract async first(): Promise<boolean>;

    public abstract async last(): Promise<boolean>;

    public abstract async isBof(): Promise<boolean>;

    public abstract async isEof(): Promise<boolean>;

    /** Releases this ResultSet object's database and resources. */
    public abstract async close(): Promise<void>;
}
