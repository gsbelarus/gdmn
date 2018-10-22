import {Connection} from "../Connection";

export class BlobLink {

    public connection: Connection;

    /** Gets the blob's id. */
    public readonly id = new Uint8Array(8);

    constructor(connection: Connection, id: Uint8Array) {
        this.connection = connection;
        this.id.set(id);
    }
}
