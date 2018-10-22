import {ATransaction} from "./ATransaction";

export type SequentiallyCallback = ((buffer: Buffer) => Promise<void>) | ((buffer: Buffer) => void);

export abstract class ABlob {

    private readonly _transaction: ATransaction;

    protected constructor(transaction: ATransaction) {
        this._transaction = transaction;
    }

    get transaction(): ATransaction {
        return this._transaction;
    }

    /**
     * Retrieves the blob value as a sequentially buffers
     *
     * @param {SequentiallyCallback} callback
     * @returns {Promise<void>}
     */
    public abstract async sequentially(callback: SequentiallyCallback): Promise<void>;

    /**
     * Retrieves the blob value as a string
     *
     * @returns {Promise<null | Buffer>}
     * the column value; if the blob value is SQL NULL, the value returned is null
     */
    public abstract async asBuffer(): Promise<null | Buffer>;

    /**
     * Retrieves the blob value as a string
     *
     * @returns {string}
     * the column value; if the blob value is SQL NULL, the value returned is empty string
     */
    public abstract async asString(): Promise<string>;
}
