export enum Types {
    BIGINT,
    INTEGER,
    SMALLINT,

    BLOB,
    BOOLEAN,

    CHAR,
    VARCHAR,

    DATE,
    TIME,
    TIMESTAMP,

    DOUBLE,
    FLOAT,

    NULL,

    OTHER
}

export abstract class AMetadata {

    abstract get columnCount(): number;

    public getColumnLabel(i: number): string | undefined {
        this._checkIndexRange(i);
        return this._getColumnLabel(i);
    }

    public getColumnName(i: number): string | undefined {
        this._checkIndexRange(i);
        return this._getColumnName(i);
    }

    public getColumnType(i: number): Types {
        this._checkIndexRange(i);
        return this._getColumnType(i);
    }

    public getColumnRelation(i: number): string | undefined {
        this._checkIndexRange(i);
        return this._getColumnRelation(i);
    }

    public isNullable(i: number): boolean {
        this._checkIndexRange(i);
        return this._isNullable(i);
    }

    protected _checkIndexRange(i: number): void {
        if (i < 0 || i >= this.columnCount) {
            throw new Error("Index out of range");
        }
    }

    protected abstract _getColumnLabel(i: number): string | undefined;

    protected abstract _getColumnName(i: number): string | undefined;

    protected abstract _getColumnType(i: number): Types;

    protected abstract _getColumnRelation(i: number): string | undefined;

    protected abstract _isNullable(i: number): boolean;
}
