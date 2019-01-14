import {AResultMetadata, Types} from "../AResultMetadata";
import {Statement} from "./Statement";
import {SQLTypes} from "./utils/constants";
import {createDescriptors, IDescriptor} from "./utils/fb-utils";

export interface IResultSetMetadataSource {
    descriptors: IDescriptor[];
    fixedDescriptors: IDescriptor[];
}

export class ResultMetadata extends AResultMetadata {

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

    public static async getMetadata(statement: Statement): Promise<ResultMetadata> {
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
        return new ResultMetadata(result);
    }

    public getColumnLabel(i: number): string {
        return this._source!.descriptors[i].alias || "";
    }

    public getColumnName(i: number): string {
        return this._source!.descriptors[i].field || "";
    }

    public getColumnType(i: number): Types {
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

    public isNullable(i: number): boolean {
        return this._source!.descriptors[i].isNullable;
    }
}
