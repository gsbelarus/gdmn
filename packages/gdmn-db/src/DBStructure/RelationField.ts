export class RelationField {

    public readonly name: string;
    public readonly fieldSource: string;
    public readonly notNull: boolean;
    public readonly defaultValue: string | null;
    public readonly defaultSource: string | null;

    constructor(name: string,
                fieldSource: string,
                notNull: boolean,
                defaultValue: string | null,
                defaultSource: string | null) {
        this.name = name;
        this.fieldSource = fieldSource;
        this.notNull = notNull;
        this.defaultValue = defaultValue;
        this.defaultSource = defaultSource;
    }
}
