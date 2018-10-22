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

export abstract class AResultMetadata {

    abstract get columnCount(): number;

    public abstract getColumnLabel(i: number): string;

    public abstract getColumnName(i: number): string;

    public abstract getColumnType(i: number): Types;

    public abstract isNullable(i: number): boolean;
}
