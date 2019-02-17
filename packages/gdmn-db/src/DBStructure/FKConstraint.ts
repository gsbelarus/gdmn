import {DeleteRule, UpdateRule} from "./DBSchema";
import {RelationConstraint} from "./RelationConstraint";

export class FKConstraint extends RelationConstraint {

    public readonly constNameUq: string;
    public readonly updateRule: UpdateRule;
    public readonly deleteRule: DeleteRule;

    constructor(name: string,
                indexName: string,
                fields: string[],
                constNameUq: string,
                updateRule: UpdateRule,
                deleteRule: DeleteRule) {
        super(name, indexName, fields);
        this.constNameUq = constNameUq;
        this.updateRule = updateRule;
        this.deleteRule = deleteRule;
    }
}
