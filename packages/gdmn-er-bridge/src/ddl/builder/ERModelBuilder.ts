import {Entity, EntityAttribute, ERModel, Sequence, SequenceAttribute} from "gdmn-orm";
import {Constants} from "../Constants";
import {DDLHelper, IFieldProps} from "../DDLHelper";
import {Prefix} from "../Prefix";
import {Builder} from "./Builder";
import {DomainResolver} from "./DomainResolver";
import {EntityBuilder} from "./EntityBuilder";

export class ERModelBuilder extends Builder {

  public readonly eBuilder: EntityBuilder;

  constructor(ddlHelper: DDLHelper) {
    super(ddlHelper);
    this.eBuilder = new EntityBuilder(ddlHelper);
  }

  public async create(erModel: ERModel, sequence: Sequence): Promise<Sequence>;
  public async create(erModel: ERModel, entity: Entity): Promise<Entity>;
  public async create(erModel: ERModel, source: Sequence | Entity): Promise<Sequence | Entity> {
    if (source instanceof Sequence) {
      // TODO custom adapter name
      const sequence = source;
      await this.ddlHelper.addSequence(sequence.name);
      return erModel.add(sequence);

    } else if (source instanceof Entity) {
      const entity = source;
      if (entity.parent) {
        if (!entity.hasOwnAttribute(Constants.DEFAULT_INHERITED_KEY_NAME)) {
          entity.add(new EntityAttribute({
            name: Constants.DEFAULT_INHERITED_KEY_NAME,
            required: true,
            lName: {ru: {name: "Родитель"}},
            entities: [entity.parent]
          }));
        }

      } else if (!entity.hasOwnAttribute(Constants.DEFAULT_ID_NAME)) {
        entity.add(new SequenceAttribute({
          name: Constants.DEFAULT_ID_NAME,
          lName: {ru: {name: "Идентификатор"}},
          sequence: erModel.sequence(Constants.GLOBAL_GENERATOR),
          adapter: {
            relation: Builder._getOwnRelationName(entity),
            field: Constants.DEFAULT_ID_NAME
          }
        }));
      }

      const tableName = Builder._getOwnRelationName(entity);
      const fields: IFieldProps[] = [];
      for (const pkAttr of entity.pk) {
        const fieldName = Builder._getFieldName(pkAttr);
        const domainName = Prefix.domain(await this.nextDDLUnique());
        await this.ddlHelper.addDomain(domainName, DomainResolver.resolve(pkAttr));
        await this._updateATAttr(pkAttr, {relationName: tableName, fieldName, domainName});
        fields.push({
          name: fieldName,
          domain: domainName
        });
      }

      const pkConstName = Prefix.pkConstraint(await this.nextDDLUnique());
      await this.ddlHelper.addTable(tableName, fields);
      await this.ddlHelper.addPrimaryKey(pkConstName, tableName, fields.map((i) => i.name));
      await this.ddlHelper.cachedStatements.updateATRelations({
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
          await this.eBuilder.create(entity, attr);
        }
      }

      for (const unique of entity.ownUnique) {
        await this.eBuilder.create(entity, unique);
      }

      return erModel.add(entity);
    } else {
      throw new Error("Unknown type of arg");
    }
  }

  public async delete(erModel: ERModel, sequence: Sequence): Promise<void>;
  public async delete(erModel: ERModel, entity: Entity): Promise<void>;
  public async delete(erModel: ERModel, source: Sequence | Entity): Promise<void> {
    if (source instanceof Sequence) {
      // TODO
      throw new Error("Unsupported yet");

    } else if (source instanceof Entity) {
      // TODO
      throw new Error("Unsupported yet");
    }
  }
}
