import {FieldType} from "./DBSchema";

export class Field {

    public readonly fieldType: FieldType;
    public readonly notNull: boolean;
    public readonly defaultSource: string | null;
    public readonly fieldLength: number;
    public readonly fieldScale: number;
    public readonly validationSource: string | null;
    public readonly fieldSubType: number | null;
    public readonly fieldPrecision: number;

    constructor(fieldType: FieldType, notNull: boolean, defaultSource: string | null,
                fieldLength: number, fieldScale: number, validationSource: string | null,
                fieldSubType: number | null, fieldPrecision: number) {
        this.fieldType = fieldType;
        this.notNull = notNull;
        this.defaultSource = defaultSource;
        this.fieldLength = fieldLength;
        this.fieldScale = fieldScale;
        this.validationSource = validationSource;
        this.fieldSubType = fieldSubType;
        this.fieldPrecision = fieldPrecision;
    }
}
