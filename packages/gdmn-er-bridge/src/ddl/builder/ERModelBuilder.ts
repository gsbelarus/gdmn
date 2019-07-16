import {
  appendAdapter,
  Attribute,
  Entity,
  EntityAttribute,
  ERModel,
  relationName2Adapter,
  Sequence,
  SequenceAttribute
} from "gdmn-orm";
import {AdapterUtils} from "../../AdapterUtils";
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
      let pkAttrs: Attribute[] = [];
      if (entity.parent) {
        if (!entity.hasOwnAttribute(Constants.DEFAULT_INHERITED_KEY_NAME)) {
          pkAttrs.push(
            entity.add(new EntityAttribute({
              name: Constants.DEFAULT_INHERITED_KEY_NAME,
              required: true,
              lName: {ru: {name: "Родитель"}},
              entities: [entity.parent],
              adapter: {
                relation: AdapterUtils.getOwnRelationName(entity),
                field: Constants.DEFAULT_INHERITED_KEY_NAME
              }
            }))
          );
        }
      } else {
        if (!entity.hasOwnAttribute(Constants.DEFAULT_ID_NAME)) {
          entity.add(new SequenceAttribute({
            name: Constants.DEFAULT_ID_NAME,
            lName: {ru: {name: "Идентификатор"}},
            sequence: erModel.sequence(Constants.GLOBAL_GENERATOR),
            adapter: {
              relation: AdapterUtils.getOwnRelationName(entity),
              field: Constants.DEFAULT_ID_NAME
            }
          }));
          pkAttrs = entity.pk;
        }
      }

      const tableName = AdapterUtils.getOwnRelationName(entity);
      const fields: IFieldProps[] = [];
      for (const pkAttr of pkAttrs) {
        const fieldName = AdapterUtils.getFieldName(pkAttr);
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

      for (const pkAttr of pkAttrs) {
        switch (pkAttr.type) {
          case "Sequence": {
            const _attr = pkAttr as SequenceAttribute;
            const fieldName = AdapterUtils.getFieldName(pkAttr);
            const seqAdapter = _attr.sequence.adapter;
            const triggerName = Prefix.triggerBeforeInsert(await this.nextDDLUnique());
            await this.ddlHelper.addAutoIncrementTrigger(triggerName, tableName, fieldName,
              seqAdapter ? seqAdapter.sequence : _attr.sequence.name);
            break;
          }
          case "Entity": {
            const _attr = pkAttr as EntityAttribute;
            const fkConstName = Prefix.fkConstraint(await this.nextDDLUnique());
            const fieldName = AdapterUtils.getFieldName(_attr);
            await this.ddlHelper.addForeignKey(fkConstName, {
              tableName,
              fieldName
            }, {
              tableName: AdapterUtils.getOwnRelationName(_attr.entities[0]),
              fieldName: AdapterUtils.getPKFieldName(_attr.entities[0], AdapterUtils.getOwnRelationName(_attr.entities[0]))
              //fieldName: Builder._getFieldName(_attr.entities[0].pk[0])
            }, {
              onUpdate: "CASCADE",
              onDelete: "CASCADE"
            });
            break;
          }
        }
      }
      const pk = [...entity.pk];
      const attributes = Object.values(entity.ownAttributes);
      attributes.forEach((attr) => entity.remove(attr));
      for (const attr of attributes) {
        if (pk.includes(attr) || pkAttrs.includes(attr)) {
          entity.add(attr);
        } else {
          await this.eBuilder.createAttribute(entity, attr);
        }
      }

      const uniques = entity.unique;
      uniques.forEach((unq) => entity.removeUnique(unq));
      for (const unique of uniques) {
        await this.eBuilder.addUnique(entity, unique);
      }

      if (!entity.adapter) {
        const adapterPK = AdapterUtils.getPK4Adapter(fields.map((field) => field.name));
        entity.adapter = entity.parent
          ? appendAdapter(entity.parent.adapter!, tableName, adapterPK)
          : relationName2Adapter(tableName, adapterPK);
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
      const tableName = AdapterUtils.getOwnRelationName(source);


      const foundParent = Object.entries(erModel.entities).reduce(
        (prev, [_name, entity]) => {
          if (entity === source) {
            return prev;
          }

          if (entity.parent === source) {
            prev.push(entity);
          }
          return prev;
        },
        [] as Entity[]
      );

      if (foundParent.length) {
        throw new Error(`Entity ${source.name} are the parent link to other entities ${foundParent.map((entity) => entity.name).join(',')}.`);
      }

      const foundEntities = Object.entries(erModel.entities).reduce(
        (prev, [_name, entity]) => {
          if (entity === source) {
            return prev;
          }
          entity.adapter!.relation.forEach((rel) => {
            if (rel.relationName === tableName) {
              prev.push(entity);
            }
          });
          return prev;
        },
        [] as Entity[]
      );
      if (!foundEntities.length) {
        await this.ddlHelper.checkAndDropTable(tableName);
      }
      erModel.remove(source);
    }
  }
}
