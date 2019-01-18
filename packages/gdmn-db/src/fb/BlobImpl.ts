import {ABlob, SequentiallyCallback} from "../ABlob";
import {Transaction} from "./Transaction";
import {BlobLink} from "./utils/BlobLink";
import {BlobStream} from "./utils/BlobStream";

export class BlobImpl extends ABlob {

    public readonly blobLink: any;

    constructor(transaction: Transaction, value: any) {
        super(transaction);
        this.blobLink = value;
    }

    get transaction(): Transaction {
        return super.transaction as Transaction;
    }

    public async sequentially(callback: SequentiallyCallback): Promise<void> {
        if (this.blobLink && this.blobLink instanceof BlobLink) {
            const blobStream = await BlobStream.open(this.transaction, this.blobLink);
            try {
                const length = await blobStream.length;

                for (let i = 0; i < length; i++) {
                    const buffer = Buffer.alloc(1); // TODO
                    await blobStream.read(buffer);
                    await callback(buffer);
                }

            } catch (error) {
                if (blobStream.active) {
                    await blobStream.cancel();
                }
                throw error;
            } finally {
                if (blobStream.active) {
                    await blobStream.close();
                }
            }
        }
    }

    public async asBuffer(): Promise<null | Buffer> {
        if (this.blobLink && this.blobLink instanceof BlobLink) {
            const blobStream = await BlobStream.open(this.transaction, this.blobLink);
            try {
                const length = await blobStream.length;
                const buffer = Buffer.alloc(length);
                await blobStream.read(buffer);

                return buffer;

            } catch (error) {
                if (blobStream.active) {
                    await blobStream.cancel();
                }
                throw error;
            } finally {
                if (blobStream.active) {
                    await blobStream.close();
                }
            }
        }
        return null;
    }

    public async asString(): Promise<string> {
        const buffer = await this.asBuffer();
        if (buffer) {
            return buffer.toString();
        }
        return "";
    }
}
