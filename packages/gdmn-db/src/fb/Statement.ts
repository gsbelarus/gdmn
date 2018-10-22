import {MessageMetadata, Statement as NativeStatement} from "node-firebird-native-api";
import {CursorType} from "../AResultSet";
import {AStatement, IParams} from "../AStatement";
import {CommonParamsAnalyzer} from "../common/CommonParamsAnalyzer";
import {Result} from "./Result";
import {ResultSet} from "./ResultSet";
import {Transaction} from "./Transaction";
import {createDescriptors, dataWrite, fixMetadata, IDescriptor} from "./utils/fb-utils";

export interface IStatementSource {
    handler: NativeStatement;
    inMetadata: MessageMetadata;
    inDescriptors: IDescriptor[];
}

export class Statement extends AStatement {

    public static EXCLUDE_PATTERNS = [
        /-{2}.*/g,                      // in-line comments
        /\/\*[\s\S]*?\*\//g,            // block comments
        /'[\s\S]*?'/g,                  // values
        /\bBEGIN\b[\s\S]*\bEND\b/gi     // begin ... end
    ];
    public static PLACEHOLDER_PATTERN = /(:[a-zA-Z0-9_$]+)/g;

    public resultSets = new Set<ResultSet>();
    public source?: IStatementSource;
    private readonly _paramsAnalyzer: CommonParamsAnalyzer;

    protected constructor(transaction: Transaction,
                          paramsAnalyzer: CommonParamsAnalyzer,
                          source?: IStatementSource) {
        super(transaction, paramsAnalyzer.sql);
        this._paramsAnalyzer = paramsAnalyzer;
        this.source = source;

        this.transaction.statements.add(this);
    }

    get transaction(): Transaction {
        return super.transaction as Transaction;
    }

    get disposed(): boolean {
        return !this.source;
    }

    public static async prepare(transaction: Transaction,
                                sql: string): Promise<Statement> {
        const paramsAnalyzer = new CommonParamsAnalyzer(sql, Statement.EXCLUDE_PATTERNS,
            Statement.PLACEHOLDER_PATTERN);
        const source: IStatementSource = await transaction.connection.client.statusAction(async (status) => {
            const handler = await transaction.connection.handler!.prepareAsync(status, transaction.handler,
                0, paramsAnalyzer.sql, 3, NativeStatement.PREPARE_PREFETCH_ALL);

            const inMetadata = fixMetadata(status, await handler!.getInputMetadataAsync(status))!;
            const inDescriptors = createDescriptors(status, inMetadata);

            return {
                handler: handler!,
                inMetadata,
                inDescriptors
            };
        });

        return new Statement(transaction, paramsAnalyzer, source);
    }

    public async dispose(): Promise<void> {
        if (!this.source) {
            throw new Error("Statement already disposed");
        }

        await this._closeChildren();

        this.source.inMetadata.releaseSync();
        await this.transaction.connection.client.statusAction((status) => this.source!.handler.freeAsync(status));
        this.source = undefined;
        this.transaction.statements.delete(this);
    }

    public async executeQuery(params?: IParams, type?: CursorType): Promise<ResultSet> {
        if (!this.source) {
            throw new Error("Statement already disposed");
        }

        return ResultSet.open(this, this._paramsAnalyzer.prepareParams(params), type);
    }

    public async executeReturning(params?: IParams): Promise<Result> {
        if (!this.source) {
            throw new Error("Statement already disposed");
        }

        return Result.get(this, this._paramsAnalyzer.prepareParams(params));
    }

    public async execute(params?: IParams): Promise<void> {
        if (!this.source) {
            throw new Error("Statement already disposed");
        }

        await this.transaction.connection.client.statusAction(async (status) => {
            const outMetadata = fixMetadata(status, await this.source!.handler.getOutputMetadataAsync(status));
            const inBuffer = new Uint8Array(this.source!.inMetadata.getMessageLengthSync(status));

            try {
                await dataWrite(this, this.source!.inDescriptors, inBuffer, this._paramsAnalyzer.prepareParams(params));

                const newTransaction = await this.source!.handler.executeAsync(status, this.transaction.handler,
                    this.source!.inMetadata, inBuffer, outMetadata, undefined);

                if (newTransaction && this.transaction.handler !== newTransaction) {
                    //// FIXME: newTransaction.releaseSync();
                }
            } finally {
                if (outMetadata) {
                    await outMetadata.releaseAsync();
                }
            }
        });
    }

    private async _closeChildren(): Promise<void> {
        if (this.resultSets.size) {
            console.warn("Not all resultSets closed, they will be closed");
        }

        await Promise.all(Array.from(this.resultSets).reduceRight((promises, resultSet) => {
            resultSet.disposeStatementOnClose = false;
            promises.push(resultSet.close());
            return promises;
        }, [] as Array<Promise<void>>));
    }
}
