import {Entity, EntityAttribute, Sequence, SequenceAttribute} from "gdmn-orm";
import {DDLHelper, IFieldProps} from "../DDLHelper";
import {Prefix} from "../Prefix";
import {Builder} from "./Builder";
import {DomainResolver} from "./DomainResolver";
import {EntityBuilder} from "./EntityBuilder";

export class ERModelBuilder extends Builder {

  private readonly _entityBuilder: EntityBuilder;

  constructor(ddlHelper: DDLHelper) {
    super(ddlHelper);
    this._entityBuilder = new EntityBuilder(ddlHelper);
  }

  get entityBuilder(): EntityBuilder {
    return this._entityBuilder;
  }

  public async addSequence(sequence: Sequence): Promise<Sequence> {
    // TODO custom adapter name
    await this.ddlHelper.addSequence(sequence.name);
    return sequence;
  }

  public async removeSequence(_sequence: Sequence): Promise<void> {
    // TODO
    throw new Error("Unsupported yet");
  }

  public async addEntity(entity: Entity): Promise<Entity> {
    const tableName = Builder._getOwnRelationName(entity);
    const fields: IFieldProps[] = [];
    for (const pkAttr of entity.pk) {
      const fieldName = Builder._getFieldName(pkAttr);
      const domainName = Prefix.domain(await this.nextDDLUnique());
      await this.ddlHelper.addDomain(domainName, DomainResolver.resolve(pkAttr));
      await this._addATAttr(pkAttr, {relationName: tableName, fieldName, domainName});
      fields.push({
        name: fieldName,
        domain: domainName
      });
    }

    const pkConstName = Prefix.pkConstraint(await this.nextDDLUnique());
    await this.ddlHelper.addTable(tableName, fields);
    await this.ddlHelper.addPrimaryKey(pkConstName, tableName, fields.map((i) => i.name));
    await this.ddlHelper.cachedStatements.addToATRelations({
      relationName: tableName,
      lName: entity.lName.ru && entity.lName.ru.name,
      description: entity.lName.ru && entity.lName.ru.fullName,
      entityName: entity.name,
      semCategory: entity.semCategories
    });

    for (const pkAttr of entity.pk) {
      switch (pkAttr.type) {
        case "Sequence": {
          const _attr = pkAttr as SequenceAttribute;
          const fieldName = Builder._getFieldName(pkAttr);
          const seqAdapter = _attr.sequence.adapter;
          const triggerName = Prefix.triggerBeforeInsert(await this.nextDDLUnique());
          await this.ddlHelper.addAutoIncrementTrigger(triggerName, tableName, fieldName,
            seqAdapter ? seqAdapter.sequence : _attr.sequence.name);
          break;
        }
        case "Entity": {
          const _attr = pkAttr as EntityAttribute;
          const fkConstName = Prefix.fkConstraint(await this.nextDDLUnique());
          const fieldName = Builder._getFieldName(_attr);
          await this.ddlHelper.addForeignKey(fkConstName, {
            tableName,
            fieldName
          }, {
            tableName: Builder._getOwnRelationName(_attr.entities[0]),
            fieldName: Builder._getFieldName(_attr.entities[0].pk[0])
          });
          break;
        }
      }
    }

    for (const attr of Object.values(entity.ownAttributes)) {
      if (!entity.pk.includes(attr)) {
        await this._entityBuilder.addAttribute(entity, attr);
      }
    }

    for (const unique of entity.ownUnique) {
      await this._entityBuilder.addUnique(entity, unique);
    }

    return entity;
  }

  public removeEntity(_entity: Entity): Promise<void> {
    // TODO
    throw new Error("Unsupported yet");
  }
}
