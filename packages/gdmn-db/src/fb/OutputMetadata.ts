import {AMetadata, Types} from "../AMetadata";
import {Statement} from "./Statement";
import {SQLTypes} from "./utils/constants";
import {createDescriptors, IDescriptor} from "./utils/fb-utils";

export interface IResultSetMetadataSource {
    descriptors: IDescriptor[];
    fixedDescriptors: IDescriptor[];
}

function instanceOfResultSet(object: any): object is IResultSetMetadataSource {
    return "descriptors" in object && "fixedDescriptors" in object;
}

export class OutputMetadata extends AMetadata {

    private _source?: IResultSetMetadataSource;

    protected constructor(source: IResultSetMetadataSource) {
        super();
        this._source = source;
    }

    get descriptors(): IDescriptor[] {
        return this._source!.fixedDescriptors;
    }

    get columnCount(): number {
        return this._source!.descriptors.length;
    }

    public static async getMetadata(
        params: Statement | IResultSetMetadataSource): Promise<OutputMetadata> {
        if (params instanceof Statement) {
            const statement = params;
            const result: IResultSetMetadataSource = await statement.transaction.connection.client
                .statusAction(async (status) => {
                    const metadata = await statement.source!.handler.getOutputMetadataAsync(status);
                    try {
                        const descriptors = createDescriptors(status, metadata!);

                        return {
                            descriptors,
                            fixedDescriptors: statement.source!.outDescriptors
                        };
                    } finally {
                        await metadata!.releaseAsync();
                    }
                });
            return new OutputMetadata(result);
        }

        if (instanceOfResultSet(params)) { return new OutputMetadata(params); }

        throw new Error("Invalid params");
    }

    protected _getColumnLabel(i: number): string | undefined {
        return this._source!.descriptors[i].alias;
    }

    protected _getColumnName(i: number): string | undefined {
        return this._source!.descriptors[i].field;
    }

    protected _getColumnType(i: number): Types {
        switch (this._source!.descriptors[i].type) {
            case SQLTypes.SQL_BLOB:
                return Types.BLOB;
            case SQLTypes.SQL_BOOLEAN:
                return Types.BOOLEAN;
            case SQLTypes.SQL_DOUBLE:
                return Types.DOUBLE;
            case SQLTypes.SQL_FLOAT:
                return Types.FLOAT;
            case SQLTypes.SQL_INT64:
                return Types.BIGINT;
            case SQLTypes.SQL_LONG:
                return Types.INTEGER;
            case SQLTypes.SQL_SHORT:
                return Types.SMALLINT;
            case SQLTypes.SQL_TIMESTAMP:
                return Types.TIMESTAMP;
            case SQLTypes.SQL_TYPE_DATE:
                return Types.DATE;
            case SQLTypes.SQL_TYPE_TIME:
                return Types.TIME;
            case SQLTypes.SQL_NULL:
                return Types.NULL;
            case SQLTypes.SQL_TEXT:
                return Types.VARCHAR;
            case SQLTypes.SQL_VARYING:
                return Types.CHAR;
            default:
                return Types.OTHER;
        }
    }

    protected _getColumnRelation(i: number): string | undefined {
        return this._source!.descriptors[i].relation;
    }

    protected _isNullable(i: number): boolean {
        return this._source!.descriptors[i].isNullable;
    }
}
