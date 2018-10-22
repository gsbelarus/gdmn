import {AConnection, ATransaction} from "gdmn-db";
import {
  DetailAttribute,
  Entity,
  EntityAttribute,
  ParentAttribute,
  Sequence,
  SequenceAttribute,
  SetAttribute
} from "gdmn-orm";
import {Builder} from "./Builder";
import {DDLHelper, IFieldProps} from "./DDLHelper";
import {DomainResolver} from "./DomainResolver";
import {EntityBuilder} from "./EntityBuilder";

export class ERModelBuilder extends Builder {

  private _entityBuilder: EntityBuilder | undefined;

  get entityBuilder(): EntityBuilder {
    if (!this._entityBuilder || !this._entityBuilder.prepared) {
      throw new Error("Need call prepare");
    }
    return this._entityBuilder;
  }

  public async prepare(connection: AConnection, transaction: ATransaction): Promise<void> {
    await super.prepare(connection, transaction);

    this._entityBuilder = new EntityBuilder(this._getDDLHelper(), this._getATHelper());
  }

  public async addSequence(sequence: Sequence): Promise<Sequence> {
    // TODO custom adapter name
    await this._getDDLHelper().addSequence(sequence.name);
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
      const domainName = await this._getDDLHelper().addDomain(DomainResolver.resolve(pkAttr));
      await this._insertATAttr(pkAttr, {relationName: tableName, fieldName, domainName});
      fields.push({
        name: fieldName,
        domain: domainName
      });
    }

    await this._getDDLHelper().addTable(tableName, fields);
    await this._getDDLHelper().addPrimaryKey(tableName, fields.map((i) => i.name));
    await this._insertATEntity(entity, {relationName: tableName});

    for (const pkAttr of entity.pk) {
      if (SequenceAttribute.isType(pkAttr)) {
        const fieldName = Builder._getFieldName(pkAttr);
        const seqAdapter = pkAttr.sequence.adapter;
        await this._getDDLHelper().addAutoIncrementTrigger(tableName, fieldName,
          seqAdapter ? seqAdapter.sequence : pkAttr.sequence.name);
      } else if (DetailAttribute.isType(pkAttr)) {
        // ignore
      } else if (ParentAttribute.isType(pkAttr)) {
        // ignore
      } else if (SetAttribute.isType(pkAttr)) {
        // ignore
      } else if (EntityAttribute.isType(pkAttr)) { // for inheritance
        const fieldName = Builder._getFieldName(pkAttr);
        await this._getDDLHelper().addForeignKey(DDLHelper.DEFAULT_FK_OPTIONS, {
          tableName,
          fieldName
        }, {
          tableName: Builder._getOwnRelationName(pkAttr.entities[0]),
          fieldName: Builder._getFieldName(pkAttr.entities[0].pk[0])
        });
      }
    }

    for (const attr of Object.values(entity.ownAttributes)) {
      if (!entity.pk.includes(attr)) {
        await this.entityBuilder.addAttribute(entity, attr);
      }
    }

    for (const unique of entity.unique) {
      await this.entityBuilder.addUnique(entity, unique);
    }

    return entity;
  }

  public removeEntity(_entity: Entity): Promise<void> {
    // TODO
    throw new Error("Unsupported yet");
  }
}
