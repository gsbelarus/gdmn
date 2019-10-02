import {AResult} from "../AResult";
import {BlobLink} from "./BlobLink";
import {OutputMetadata} from "./OutputMetadata";
import {IStatementSource, Statement} from "./Statement";
import {bufferToValue, dataWrite, IDescriptor} from "./utils/fb-utils";

export interface IResultSource {
    metadata: OutputMetadata;
    buffer: Uint8Array;
}

export class Result extends AResult {

    public source: IResultSource;

    protected constructor(source: IResultSource) {
        super();
        this.source = source;
    }

    get metadata(): OutputMetadata {
        return this.source.metadata;
    }

    public static async get(statement: Statement, source: IResultSource): Promise<Result>;
    public static async get(statement: Statement, params: any[]): Promise<Result>;
    public static async get(statement: Statement, source: any): Promise<Result> {
        if (Array.isArray(source)) {
            source = await statement.transaction.connection.client.statusAction(async (status) => {
                const {inMetadataMsg, outMetadataMsg, inDescriptors}: IStatementSource = statement.source!;
                const inBuffer = new Uint8Array(inMetadataMsg.getMessageLengthSync(status));
                const buffer = new Uint8Array(outMetadataMsg.getMessageLengthSync(status));

                await dataWrite(statement.transaction, inDescriptors, inBuffer, source);

                const newTransaction = await statement.source!.handler.executeAsync(status,
                    statement.transaction.handler, inMetadataMsg, inBuffer, outMetadataMsg, buffer);

                if (newTransaction && statement.transaction.handler !== newTransaction) {
                    //// FIXME: newTransaction.releaseSync();
                }

                const metadata = await OutputMetadata.getMetadata(statement);

                return {
                    metadata,
                    buffer
                };
            });
        }
        return new Result(source);
    }

    private static _throwIfBlob(value: any): void {
        if (value instanceof BlobLink) {
            throw new Error("Invalid typecasting");
        }
    }

    public getBlob(i: number): null | BlobLink;
    public getBlob(name: string): null | BlobLink;
    public getBlob(field: any): null | BlobLink {
        const value = this._getValue(field);
        if (value !== null && value !== undefined && !(value instanceof BlobLink)) {
            throw new Error("Invalid typecasting");
        }
        return value;
    }

    public getBoolean(i: number): boolean;
    public getBoolean(name: string): boolean;
    public getBoolean(field: any): boolean {
        const value = this._getValue(field);
        Result._throwIfBlob(value);

        if (value === null || value === undefined) {
            return false;
        }
        return Boolean(value);
    }

    public getDate(i: number): null | Date;
    public getDate(name: string): null | Date;
    public getDate(field: any): null | Date {
        const value = this._getValue(field);
        Result._throwIfBlob(value);

        if (value === null || value === undefined) {
            return null;
        }
        if (value instanceof Date) {
            return value;
        }
        const date = new Date(value);
        return isNaN(date.getTime()) ? null : date;
    }

    public getNumber(i: number): number;
    public getNumber(name: string): number;
    public getNumber(field: any): number {
        const value = this._getValue(field);
        Result._throwIfBlob(value);

        if (value === null || value === undefined) {
            return 0;
        }
        return Number.parseFloat(value);
    }

    public getString(i: number): string;
    public getString(name: string): string;
    public getString(field: any): string {
        const value = this._getValue(field);
        Result._throwIfBlob(value);

        if (value === null || value === undefined) {
            return "";
        }
        return String(value);
    }

    public getAny(i: number): any;
    public getAny(name: string): any;
    public getAny(field: any): any {
        return this._getValue(field);
    }

    public getAll(): any[] {
        const result = [];
        for (let i = 0; i < this.metadata.columnCount; i++) {
            result.push(this.getAny(i));
        }
        return result;
    }

    public isNull(i: number): boolean;
    public isNull(name: string): boolean;
    public isNull(field: any): boolean {
        const value = this._getValue(field);
        return value === null || value === undefined;
    }

    private _getValue(field: number | string): any {
        const descriptor = this.getOutDescriptor(field);
        return bufferToValue(descriptor, this.source.buffer);
    }

    private getOutDescriptor(field: number | string): IDescriptor {
        const outDescriptors = this.source.metadata.descriptors;
        if (typeof field === "number") {
            if (field >= outDescriptors.length) {
                throw new Error("Index not found");
            }
            return outDescriptors[field];
        } else {
            const outDescriptor = outDescriptors.find((item) => item.alias === field);
            if (!outDescriptor) {
                throw new Error("Name not found");
            }
            return outDescriptor;
        }
    }
}
