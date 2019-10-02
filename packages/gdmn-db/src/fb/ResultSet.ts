import {ResultSet as NativeResultSet, Statement as NativeStatement, Status} from "node-firebird-native-api";
import {AResultSet, CursorType} from "../AResultSet";
import {OutputMetadata} from "./OutputMetadata";
import {Result} from "./Result";
import {IStatementSource, Statement} from "./Statement";
import {dataWrite} from "./utils/fb-utils";

export interface IResultSetSource {
    handler: NativeResultSet;
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

    protected constructor(statement: Statement, result: Result, source: IResultSetSource, type?: CursorType) {
        super(statement, result, type);
        this.source = source;
        this.statement.resultSetsCount++;
    }

    get statement(): Statement {
        return super.statement as Statement;
    }

    get result(): Result {
        return super.result as Result;
    }

    get metadata(): OutputMetadata {
        return super.metadata as OutputMetadata;
    }

    public static async open(statement: Statement, params: any[], type?: CursorType): Promise<ResultSet> {
        const source: IResultSetSource & { result: Result }
            = await statement.transaction.connection.client.statusAction(async (status) => {
            const {inMetadataMsg, outMetadataMsg, inDescriptors}: IStatementSource = statement.source!;
            const inBuffer = new Uint8Array(inMetadataMsg.getMessageLengthSync(status));
            const buffer = new Uint8Array(outMetadataMsg.getMessageLengthSync(status));

            await dataWrite(statement.transaction, inDescriptors, inBuffer, params);

            const handler = await statement.source!.handler.openCursorAsync(status, statement.transaction.handler,
                inMetadataMsg, inBuffer, outMetadataMsg, type || AResultSet.DEFAULT_TYPE === CursorType.SCROLLABLE
                    ? NativeStatement.CURSOR_TYPE_SCROLLABLE : 0);

            const metadata = await OutputMetadata.getMetadata(statement);
            const result = await Result.get(statement, {metadata, buffer});

            return {
                handler: handler!,
                result
            };
        });

        return new ResultSet(statement, source.result, source, type);
    }

    protected async _close(): Promise<void> {
        await this.statement.transaction.connection.client
            .statusAction((status) => this.source!.handler.closeAsync(status));
        this.source = undefined;
        this.statement.resultSetsCount--;

        if (this.disposeStatementOnClose) {
            await this.statement.dispose();
        }
    }

    protected async _next(): Promise<boolean> {
        return await this._executeMove((status) => (
            this.source!.handler.fetchNextAsync(status, this.result.source.buffer)
        ));
    }

    protected async _previous(): Promise<boolean> {
        return await this._executeMove((status) => (
            this.source!.handler.fetchPriorAsync(status, this.result.source.buffer)
        ));
    }

    protected async _absolute(i: number): Promise<boolean> {
        return await this._executeMove((status) => (
            this.source!.handler.fetchAbsoluteAsync(status, i, this.result.source.buffer)
        ));
    }

    protected async _relative(i: number): Promise<boolean> {
        return await this._executeMove((status) => (
            this.source!.handler.fetchRelativeAsync(status, i, this.result.source.buffer)
        ));
    }

    protected async _first(): Promise<boolean> {
        return await this._executeMove((status) => (
            this.source!.handler.fetchFirstAsync(status, this.result.source.buffer)
        ));
    }

    protected async _last(): Promise<boolean> {
        return await this._executeMove((status) => (
            this.source!.handler.fetchLastAsync(status, this.result.source.buffer)
        ));
    }

    protected async _isBof(): Promise<boolean> {
        return await this.statement.transaction.connection.client.statusAction(async (status) => {
            return await this.source!.handler.isBofAsync(status);
        });
    }

    protected async _isEof(): Promise<boolean> {
        return await this.statement.transaction.connection.client.statusAction(async (status) => {
            return await this.source!.handler.isEofAsync(status);
        });
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
