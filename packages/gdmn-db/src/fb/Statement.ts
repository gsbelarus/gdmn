import { MessageMetadata, Statement as NativeStatement } from "node-firebird-native-api";
import { CursorType } from "../AResultSet";
import { AStatement, IParams } from "../AStatement";
import { CommonParamsAnalyzer } from "../common/CommonParamsAnalyzer";
import { InputMetadata } from "./InputMetadata";
import { OutputMetadata } from "./OutputMetadata";
import { Result } from "./Result";
import { ResultSet } from "./ResultSet";
import { Transaction } from "./Transaction";
import { createDescriptors, createInDescriptors, dataWrite, fixMetadata, IDescriptor } from "./utils/fb-utils";

export interface IStatementSource {
    inMetadata: InputMetadata;
    outMetadata: OutputMetadata;
    handler: NativeStatement;
    inMetadataMsg: MessageMetadata;
    outMetadataMsg: MessageMetadata;
    inDescriptors: IDescriptor[];
    outDescriptors: IDescriptor[];
}

const DIALECT_NUMBER = 3;
export class Statement extends AStatement {
    public static EXCLUDE_PATTERNS = [
        /-{2}.*/g,                      // in-line comments
        /\/\*[\s\S]*?\*\//g,            // block comments
        /'[\s\S]*?'/g,                  // values
        /\bBEGIN\b[\s\S]*\bEND\b/gi     // begin ... end
    ];
    public static PLACEHOLDER_PATTERN = /(:[a-zA-Z0-9_$]+)/g;

    public resultSetsCount = 0;
    public source?: IStatementSource;
    private readonly _paramsAnalyzer: CommonParamsAnalyzer;

    protected constructor(transaction: Transaction,
        paramsAnalyzer: CommonParamsAnalyzer,
        source?: IStatementSource) {
        super(transaction, paramsAnalyzer.sql);
        this._paramsAnalyzer = paramsAnalyzer;
        this.source = source;

        this.transaction.statementsCount++;
    }

    get transaction(): Transaction {
        return super.transaction as Transaction;
    }

    get inMetadata(): InputMetadata {
        return this.source!.inMetadata;
    }

    get outMetadata(): OutputMetadata {
        return this.source!.outMetadata;
    }

    public static async prepare(transaction: Transaction,
        sql: string): Promise<Statement> {
        const paramsAnalyzer = new CommonParamsAnalyzer(sql, Statement.EXCLUDE_PATTERNS,
            Statement.PLACEHOLDER_PATTERN);
        const source: IStatementSource = await transaction.connection.client.statusAction(async (status) => {
            const handler = await transaction.connection.handler!.prepareAsync(status, transaction.handler,
                0, paramsAnalyzer.sql, DIALECT_NUMBER, NativeStatement.PREPARE_PREFETCH_ALL);

            const rawInMetadata = await handler!.getInputMetadataAsync(status);
            const rawInDescriptors = createInDescriptors(status, rawInMetadata, paramsAnalyzer.paramNameList);

            const rawOutMetadata = await handler!.getOutputMetadataAsync(status);
            const rawOutDescriptors = createDescriptors(status, rawOutMetadata);

            const inMetadataMsg = fixMetadata(status, await handler!.getInputMetadataAsync(status))!;
            const outMetadataMsg = fixMetadata(status, await handler!.getOutputMetadataAsync(status))!;

            const inDescriptors = createInDescriptors(status, inMetadataMsg, paramsAnalyzer.paramNameList);
            const outDescriptors = createDescriptors(status, outMetadataMsg);

            const inMetadata = await InputMetadata.getMetadata({
                descriptors: rawInDescriptors,
                fixedDescriptors: inDescriptors
            });

            const outMetadata = await OutputMetadata.getMetadata({
                descriptors: rawOutDescriptors,
                fixedDescriptors: outDescriptors
            });

            return {
                inMetadata,
                outMetadata,
                handler: handler!,
                inMetadataMsg,
                outMetadataMsg,
                inDescriptors,
                outDescriptors
            };
        });
        return new Statement(transaction, paramsAnalyzer, source);
    }

    public async getPlan(): Promise<string | undefined> {
        return this.transaction.connection.client.statusActionSync((status) =>
        this.source!.handler.getPlanSync(status, false));
    }

    protected async _dispose(): Promise<void> {
        if (this.resultSetsCount > 0) {
            throw new Error("Not all resultSets closed");
        }

        this.source!.outMetadataMsg.releaseSync();
        this.source!.inMetadataMsg.releaseSync();

        await this.transaction.connection.client.statusAction((status) => this.source!.handler.freeAsync(status));
        this.source = undefined;
        this.transaction.statementsCount--;
    }

    protected async _executeQuery(params?: IParams, type?: CursorType): Promise<ResultSet> {
        return ResultSet.open(this, this._paramsAnalyzer.prepareParams(params), type);
    }

    protected async _executeReturning(params?: IParams): Promise<Result> {
        return Result.get(this, this._paramsAnalyzer.prepareParams(params));
    }

    protected async _execute(params?: IParams): Promise<void> {
        await this.transaction.connection.client.statusAction(async (status) => {
            const { inMetadataMsg, outMetadataMsg, inDescriptors }: IStatementSource = this.source!;
            const inBuffer = new Uint8Array(inMetadataMsg.getMessageLengthSync(status));
            const outBuffer = new Uint8Array(outMetadataMsg.getMessageLengthSync(status));

            await dataWrite(this.transaction, inDescriptors, inBuffer, this._paramsAnalyzer.prepareParams(params));

            const newTransaction = await this.source!.handler.executeAsync(status, this.transaction.handler,
                inMetadataMsg, inBuffer, outMetadataMsg, outBuffer);

            if (newTransaction && this.transaction.handler !== newTransaction) {
                //// FIXME: newTransaction.releaseSync();
            }
        });
    }
}
