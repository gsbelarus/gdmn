import {IRDB$RELATIONCONSTRAINT, IRDB$RELATIONFIELD} from "./DBSchema";
import {FKConstraint} from "./FKConstraint";
import {RelationConstraint} from "./RelationConstraint";
import {RelationField} from "./RelationField";

export interface IRelationFields {
    [name: string]: RelationField;
}

export interface IRefConstraints {
    [name: string]: FKConstraint;
}

export interface IUqConstraints {
    [name: string]: RelationConstraint;
}

export class Relation {

    private _relationFields: IRelationFields = {};
    private _primaryKey: RelationConstraint | null = null;
    private _foreignKeys: IRefConstraints = {};
    private _unique: IUqConstraints = {};

    constructor(public readonly name: string) {
    }

    get relationFields(): IRelationFields {
        return this._relationFields;
    }

    get primaryKey(): RelationConstraint | null {
        return this._primaryKey;
    }

    get foreignKeys(): IRefConstraints {
        return this._foreignKeys;
    }

    get unique(): IUqConstraints {
        return this._unique;
    }

    public loadField(field: IRDB$RELATIONFIELD): void {
        this._relationFields[field.RDB$FIELD_NAME] = new RelationField(field.RDB$FIELD_NAME, field.RDB$FIELD_SOURCE,
            !!field.RDB$NULL_FLAG, field.RDB$DEFAULT_SOURCE);
    }

    public loadConstraintField(constraint: IRDB$RELATIONCONSTRAINT): void {
        switch (constraint.RDB$CONSTRAINT_TYPE) {
            case "PRIMARY KEY":
                if (!this._primaryKey) {
                    this._primaryKey = new RelationConstraint(constraint.RDB$CONSTRAINT_NAME, constraint.RDB$INDEX_NAME,
                        [constraint.RDB$FIELD_NAME]);
                } else {
                    this._primaryKey.loadField(constraint);
                }
                break;

            case "FOREIGN KEY":
                if (!this._foreignKeys[constraint.RDB$CONSTRAINT_NAME]) {
                    this._foreignKeys[constraint.RDB$CONSTRAINT_NAME] = new FKConstraint(
                        constraint.RDB$CONSTRAINT_NAME,
                        constraint.RDB$INDEX_NAME,
                        [constraint.RDB$FIELD_NAME],
                        constraint.RDB$CONST_NAME_UQ,
                        constraint.RDB$UPDATE_RULE,
                        constraint.RDB$DELETE_RULE
                    );
                } else {
                    this._foreignKeys[constraint.RDB$CONSTRAINT_NAME].loadField(constraint);
                }
                break;

            case "UNIQUE":
                if (!this.unique[constraint.RDB$CONSTRAINT_NAME]) {
                    this.unique[constraint.RDB$CONSTRAINT_NAME] = new RelationConstraint(
                        constraint.RDB$CONSTRAINT_NAME,
                        constraint.RDB$INDEX_NAME,
                        [constraint.RDB$FIELD_NAME]
                    );
                } else {
                    this.unique[constraint.RDB$CONSTRAINT_NAME].loadField(constraint);
                }
        }
    }
}
