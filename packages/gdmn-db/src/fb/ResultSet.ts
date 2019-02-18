import {ResultSet as NativeResultSet, Statement as NativeStatement, Status} from "node-firebird-native-api";
import {AResultSet, CursorType} from "../AResultSet";
import {BlobImpl} from "./BlobImpl";
import {Result} from "./Result";
import {ResultMetadata} from "./ResultMetadata";
import {IStatementSource, Statement} from "./Statement";
import {dataWrite} from "./utils/fb-utils";

export interface IResultSetSource {
    handler: NativeResultSet;
    result: Result;
}

enum ResultStatus {
    ERROR = Status.RESULT_ERROR,
    NO_DATA = Status.RESULT_NO_DATA,
    OK = Status.RESULT_OK,
    SEGMENT = Status.RESULT_SEGMENT
}

export class ResultSet extends AResultSet {

    public disposeStatementOnClose: boolean = false;
    public source?: IResultSetSource;

    protected constructor(statement: Statement, source: IResultSetSource, type?: CursorType) {
        super(statement, type);
        this.source = source;
        this.statement.resultSetsCount++;
    }

    get statement(): Statement {
        return super.statement as Statement;
    }

    get closed(): boolean {
        return !this.source;
    }

    get metadata(): ResultMetadata {
        return this.source!.result.metadata;
    }

    public static async open(statement: Statement, params: any[], type?: CursorType): Promise<ResultSet> {
        const source: IResultSetSource = await statement.transaction.connection.client.statusAction(async (status) => {
            const {inMetadata, outMetadata, inDescriptors}: IStatementSource = statement.source!;
            const inBuffer = new Uint8Array(inMetadata.getMessageLengthSync(status));
            const buffer = new Uint8Array(outMetadata.getMessageLengthSync(status));

            await dataWrite(statement, inDescriptors, inBuffer, params);

            const handler = await statement.source!.handler.openCursorAsync(status, statement.transaction.handler,
                inMetadata, inBuffer, outMetadata, type || AResultSet.DEFAULT_TYPE === CursorType.SCROLLABLE
                    ? NativeStatement.CURSOR_TYPE_SCROLLABLE : 0);

            return {
                handler: handler!,
                result: await Result.get(statement, {metadata: await ResultMetadata.getMetadata(statement), buffer})
            };
        });
        return new ResultSet(statement, source, type);
    }

    public getBlob(i: number): BlobImpl;
    public getBlob(name: string): BlobImpl;
    public getBlob(field: any): BlobImpl {
        this._checkClosed();
        return this.source!.result.getBlob(field);
    }

    public getBoolean(i: number): boolean;
    public getBoolean(name: string): boolean;
    public getBoolean(field: any): boolean {
        this._checkClosed();
        return this.source!.result.getBoolean(field);
    }

    public getDate(i: number): null | Date;
    public getDate(name: string): null | Date;
    public getDate(field: any): null | Date {
        this._checkClosed();
        return this.source!.result.getDate(field);
    }

    public getNumber(i: number): number;
    public getNumber(name: string): number;
    public getNumber(field: any): number {
        this._checkClosed();
        return this.source!.result.getNumber(field);
    }

    public getString(i: number): string;
    public getString(name: string): string;
    public getString(field: any): string {
        this._checkClosed();
        return this.source!.result.getString(field);
    }

    public async getAny(i: number): Promise<any>;
    public async getAny(name: string): Promise<any>;
    public async getAny(field: any): Promise<any> {
        this._checkClosed();
        return this.source!.result.getAny(field);
    }

    public async getAll(): Promise<any[]> {
        this._checkClosed();
        return this.source!.result.getAll();
    }

    public isNull(i: number): boolean;
    public isNull(name: string): boolean;
    public isNull(field: any): boolean {
        this._checkClosed();
        return this.source!.result.isNull(field);
    }

    protected async _close(): Promise<void> {
        this._checkClosed();

        await this.statement.transaction.connection.client
            .statusAction((status) => this.source!.handler.closeAsync(status));
        this.source = undefined;
        this.statement.resultSetsCount--;

        if (this.disposeStatementOnClose) {
            await this.statement.dispose();
        }
    }

    protected async _next(): Promise<boolean> {
        this._checkClosed();

        return await this._executeMove((status) => (
            this.source!.handler.fetchNextAsync(status, this.source!.result.source.buffer)
        ));
    }

    protected async _previous(): Promise<boolean> {
        this._checkClosed();

        return await this._executeMove((status) => (
            this.source!.handler.fetchPriorAsync(status, this.source!.result.source.buffer)
        ));
    }

    protected async _absolute(i: number): Promise<boolean> {
        this._checkClosed();

        return await this._executeMove((status) => (
            this.source!.handler.fetchAbsoluteAsync(status, i, this.source!.result.source.buffer)
        ));
    }

    protected async _relative(i: number): Promise<boolean> {
        this._checkClosed();

        return await this._executeMove((status) => (
            this.source!.handler.fetchRelativeAsync(status, i, this.source!.result.source.buffer)
        ));
    }

    protected async _first(): Promise<boolean> {
        this._checkClosed();

        return await this._executeMove((status) => (
            this.source!.handler.fetchFirstAsync(status, this.source!.result.source.buffer)
        ));
    }

    protected async _last(): Promise<boolean> {
        this._checkClosed();

        return await this._executeMove((status) => (
            this.source!.handler.fetchLastAsync(status, this.source!.result.source.buffer)
        ));
    }

    protected async _isBof(): Promise<boolean> {
        this._checkClosed();

        return await this.statement.transaction.connection.client.statusAction(async (status) => {
            return await this.source!.handler.isBofAsync(status);
        });
    }

    protected async _isEof(): Promise<boolean> {
        this._checkClosed();

        return await this.statement.transaction.connection.client.statusAction(async (status) => {
            return await this.source!.handler.isEofAsync(status);
        });
    }

    private _checkClosed(): void {
        if (!this.source) {
            throw new Error("ResultSet is closed");
        }
    }

    private async _executeMove(callback: (status: any) => Promise<ResultStatus>): Promise<boolean> {
        let result = ResultStatus.ERROR;
        try {
            result = await this.statement.transaction.connection.client.statusAction(async (status) => {
                return await callback(status);
            });
        } catch (error) {
            throw error;    // TODO replace on own errors
        }
        return result === Status.RESULT_OK;
    }
}
