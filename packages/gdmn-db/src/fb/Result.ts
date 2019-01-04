import {AResult} from "../AResult";
import {BlobImpl} from "./BlobImpl";
import {ResultMetadata} from "./ResultMetadata";
import {Statement} from "./Statement";
import {BlobLink} from "./utils/BlobLink";
import {SQL_BLOB_SUB_TYPE} from "./utils/constants";
import {bufferToValue, dataWrite, IDescriptor} from "./utils/fb-utils";

export interface IResultSource {
    metadata: ResultMetadata;
    buffer: Uint8Array;
}

export class Result extends AResult {

    public source: IResultSource;

    protected constructor(statement: Statement, source: IResultSource) {
        super(statement);
        this.source = source;
    }

    get statement(): Statement {
        return super.statement as Statement;
    }

    get metadata(): ResultMetadata {
        return this.source.metadata;
    }

    public static async get(statement: Statement, source: IResultSource): Promise<Result>;
    public static async get(statement: Statement, params: any[]): Promise<Result>;
    public static async get(statement: Statement, source: any): Promise<Result> {
        if (Array.isArray(source)) {
            source = await statement.transaction.connection.client.statusAction(async (status) => {
                const {inMetadata, outMetadata, inDescriptors} = statement.source!;
                const inBuffer = new Uint8Array(inMetadata.getMessageLengthSync(status));
                const buffer = new Uint8Array(outMetadata.getMessageLengthSync(status));

                await dataWrite(statement, inDescriptors, inBuffer, source);

                const newTransaction = await statement.source!.handler.executeAsync(status,
                    statement.transaction.handler, inMetadata, inBuffer, outMetadata, buffer);

                if (newTransaction && statement.transaction.handler !== newTransaction) {
                    //// FIXME: newTransaction.releaseSync();
                }

                return {
                    metadata: await ResultMetadata.getMetadata(statement),
                    buffer
                };
            });
        }
        return new Result(statement, source);
    }

    private static _throwIfBlob(value: any): void {
        if (value instanceof BlobLink) {
            throw new Error("Invalid typecasting");
        }
    }

    public getBlob(i: number): BlobImpl;
    public getBlob(name: string): BlobImpl;
    public getBlob(field: any): BlobImpl {
        return new BlobImpl(this.statement.transaction, this._getValue(field));
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

    public async getAny(i: number): Promise<any>;
    public async getAny(name: string): Promise<any>;
    public async getAny(field: any): Promise<any> {
        const value = this._getValue(field);
        if (value instanceof BlobLink) {
            const descriptor = this.getOutDescriptor(field);
            if (descriptor.subType === SQL_BLOB_SUB_TYPE.TEXT) {
                return await this.getBlob(field).asString();
            } else {
                return await this.getBlob(field).asBuffer();
            }
        }
        return value;
    }

    public async getAll(): Promise<any[]> {
        const result = [];
        for (let i = 0; i < this.metadata.columnCount; i++) {
            result.push(await this.getAny(i));
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
        return bufferToValue(this.statement, descriptor, this.source.buffer);
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
