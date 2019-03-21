import {Blob, Status} from "node-firebird-native-api";
import {ABlobStream} from "../ABlobStream";
import {BlobLink} from "./BlobLink";
import {Transaction} from "./Transaction";
import {blobInfo} from "./utils/constants";
import {getPortableInteger} from "./utils/fb-utils";

export class BlobStream extends ABlobStream {

    public static readonly MAX_SEGMENT_SIZE = 65535;

    public blobLink: BlobLink;
    public handler?: Blob;

    protected constructor(transaction: Transaction, blobLink: BlobLink, handler?: Blob) {
        super(transaction);
        this.blobLink = blobLink;
        this.handler = handler;
    }

    get transaction(): Transaction {
        return super.transaction as Transaction;
    }

    public static async create(transaction: Transaction): Promise<BlobStream> {
        return await transaction.connection.client.statusAction(async (status) => {
            const blobId = new Uint8Array(8);
            const blobHandler = await transaction.connection.handler!.createBlobAsync(
                status, transaction.handler, blobId, 0, undefined);

            const blobLink = new BlobLink(blobId);

            return new BlobStream(transaction, blobLink, blobHandler);
        });
    }

    public static async open(transaction: Transaction,
                             blob: BlobLink): Promise<BlobStream> {
        return await transaction.connection.client.statusAction(async (status) => {
            const blobHandler = await transaction.connection.handler!.openBlobAsync(
                status, transaction.handler, blob.id, 0, undefined);
            return new BlobStream(transaction, blob, blobHandler);
        });
    }

    protected async _getLength(): Promise<number> {
        return this.transaction.connection.client.statusAction(async (status) => {
            const infoReq = new Uint8Array([blobInfo.totalLength]);
            const infoRet = new Uint8Array(20);
            await this.handler!.getInfoAsync(status, infoReq.byteLength, infoReq, infoRet.byteLength, infoRet);

            // tslint:disable
            if (infoRet[0] != blobInfo.totalLength) {
                throw new Error("Unrecognized response from BlobObj::getInfo.");
            }
            // tslint:enable

            const size = getPortableInteger(infoRet.subarray(1), 2);
            return getPortableInteger(infoRet.subarray(3), size);
        });
    }

    protected async _close(): Promise<void> {
        await this.transaction.connection.client.statusAction((status) => this.handler!.closeAsync(status));
        this.handler = undefined;
    }

    protected async _cancel(): Promise<void> {
        await this.transaction.connection.client.statusAction((status) => this.handler!.cancelAsync(status));
        this.handler = undefined;
    }

    protected async _read(buffer: Buffer): Promise<number> {
        return await this.transaction.connection.client.statusAction(async (status) => {
            let size = 0;
            while (buffer.length > 0) {
                const readingBytes = Math.min(buffer.length, BlobStream.MAX_SEGMENT_SIZE);
                const segLength = new Uint32Array(1);
                const result = await this.handler!.getSegmentAsync(status, readingBytes, buffer, segLength);
                buffer = buffer.slice(readingBytes);

                size += segLength[0];
                if (result === Status.RESULT_NO_DATA) {
                    break;
                }
            }
            return size;
        });
    }

    protected async _write(buffer: Buffer): Promise<void> {
        await this.transaction.connection.client.statusAction(async (status) => {
            while (buffer.length > 0) {
                const writingBytes = Math.min(buffer.length, BlobStream.MAX_SEGMENT_SIZE);
                await this.handler!.putSegmentAsync(status, writingBytes, buffer);
                buffer = buffer.slice(writingBytes);
            }
        });
    }
}
