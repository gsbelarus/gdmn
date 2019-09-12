import { AMetadata, Types } from "../AMetadata";
import { SQLTypes } from "./utils/constants";
import { IDescriptor } from "./utils/fb-utils";

export interface IResultSetMetadataSource {
    descriptors: IDescriptor[];
    fixedDescriptors: IDescriptor[];
}

export class InputMetadata extends AMetadata {

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

    public static async getMetadata(descriptiors: IResultSetMetadataSource): Promise<InputMetadata> {
        return new InputMetadata(descriptiors);
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
