import {
  Attribute,
  DetailAttribute,
  Entity,
  EntityAttribute,
  IAttributeAdapter,
  IDetailAttributeAdapter,
  ISetAttributeAdapter,
  ParentAttribute,
  ScalarAttribute,
  SequenceAttribute,
  SetAttribute
} from "gdmn-orm";
import {AdapterUtils} from "../../AdapterUtils";
import {Constants} from "../Constants";
import {IFieldProps} from "../DDLHelper";
import {Prefix} from "../Prefix";
import {Builder} from "./Builder";
import {DomainResolver} from "./DomainResolver";
import { ddlUtils } from "../utils";

export class EntityBuilder extends Builder {

  public async addUnique(entity: Entity, attributes: Attribute[]): Promise<void> {
    const tableName = AdapterUtils.getOwnRelationName(entity);
    const constraintName = Prefix.uniqueConstraint(await this.nextDDLUnique());

    await this.ddlHelper.addUnique(constraintName, tableName, attributes.map((attr) => AdapterUtils.getFieldName(attr)));
    entity.addUnique(attributes);
  }

  public async removeUnique(entity: Entity, attributes: Attribute[]): Promise<void> {
    // TODO
    throw new Error("Unsupported yet");
  }

  public async createAttribute<Attr extends Attribute>(entity: Entity, attribute: Attr): Promise<Attr> {
    const tableName = AdapterUtils.getOwnRelationName(entity);
    const tablePk = entity.hasOwnAttribute(Constants.DEFAULT_INHERITED_KEY_NAME) ? Constants.DEFAULT_INHERITED_KEY_NAME : Constants.DEFAULT_ID_NAME;

    if (attribute instanceof ScalarAttribute) {      
      const fieldName = AdapterUtils.getFieldName(attribute);
      // TODO добавлять для системных полей определённые домены: ID: DINTKEY; LB: DLB; RB: DRB; PARENT: DPARENT; etc
      const domainName = Prefix.domain(await this.nextDDLUnique());
      await this.ddlHelper.addDomain(domainName, DomainResolver.resolve(attribute));
      await this.ddlHelper.addColumns(tableName, [{name: fieldName, domain: domainName}]);
      await this._updateATAttr(attribute, {relationName: tableName, fieldName, domainName});
      if (attribute.type === "Sequence" && attribute instanceof SequenceAttribute) {
        const seqName = attribute.sequence.adapter ? attribute.sequence.adapter.sequence : attribute.sequence.name;
        const triggerName = Prefix.triggerBeforeInsert(await this.nextDDLUnique());
        await this.ddlHelper.addAutoIncrementTrigger(triggerName, tableName, fieldName, seqName);
      }

      if (!attribute.adapter) {
        attribute.adapter = {
          relation: tableName,
          field: fieldName
        } as IAttributeAdapter;
      }

    } else if (attribute instanceof EntityAttribute) {
      switch (attribute.type) {
        case "Detail": {
          const dAttr = attribute as DetailAttribute;
          const fieldName = AdapterUtils.getPKFieldName(entity, AdapterUtils.getOwnRelationName(entity));
          let detailTableName: string;
          let detailLinkFieldName: string;
          if (dAttr.adapter && dAttr.adapter.masterLinks.length) {
            detailTableName = dAttr.adapter.masterLinks[0].detailRelation;
            detailLinkFieldName = dAttr.adapter.masterLinks[0].link2masterField;
          } else {
            detailTableName = dAttr.name;
            detailLinkFieldName = Constants.DEFAULT_MASTER_KEY_NAME;
          }

          const domainName = Prefix.domain(await this.nextDDLUnique());
          await this.ddlHelper.addDomain(domainName, DomainResolver.resolve(dAttr));
          await this.ddlHelper.addColumns(detailTableName, [{name: detailLinkFieldName, domain: domainName}]);
          const fkConstName = Prefix.fkConstraint(await this.nextDDLUnique());
          await this.ddlHelper.addForeignKey(fkConstName, {
            tableName: detailTableName,
            fieldName: detailLinkFieldName
          }, {
            tableName,
            fieldName
          }, {
            onUpdate: "CASCADE",
            onDelete: "CASCADE"
          });
          await this._updateATAttr(dAttr, {
            relationName: detailTableName,
            fieldName: detailLinkFieldName,
            domainName: domainName,
            masterEntity: entity
          });

          if (!attribute.adapter) {
            attribute.adapter = {
              masterLinks: [{
                detailRelation: detailTableName,
                link2masterField: detailLinkFieldName
              }]
            } as IDetailAttributeAdapter;
          }
          break;
        }
        case "Parent": {
          //throw new Error("Unsupported yet");
          const pAttr = attribute as ParentAttribute;
          const fieldName = AdapterUtils.getFieldName(pAttr);
          const domainName = Prefix.domain(await this.nextDDLUnique());
          await this.ddlHelper.addDomain(domainName, DomainResolver.resolve(pAttr));
          await this.ddlHelper.addColumns(tableName, [{name: fieldName, domain: domainName}]);
          await this._updateATAttr(pAttr, {relationName: tableName, fieldName, domainName});
          
          const fkConstName = Prefix.fkConstraint(await this.nextDDLUnique());
          await this.ddlHelper.addForeignKey(fkConstName, {
            tableName,
            fieldName
          }, {            
            tableName: AdapterUtils.getOwnRelationName(pAttr.entities[0]),            
            fieldName: AdapterUtils.getPKFieldName(pAttr.entities[0], AdapterUtils.getOwnRelationName(pAttr.entities[0]))
          }, {
            onUpdate: "CASCADE",
            onDelete: "CASCADE"
          });

          if (!attribute.adapter) {
            attribute.adapter = {
              relation: tableName,
              field: fieldName
            } as IAttributeAdapter;
          }
          break;
        }
        case "Entity": {
          const eAttr = attribute as EntityAttribute;
          const fieldName = AdapterUtils.getFieldName(eAttr);
          const domainName = Prefix.domain(await this.nextDDLUnique());
          await this.ddlHelper.addDomain(domainName, DomainResolver.resolve(eAttr));
          await this.ddlHelper.addColumns(tableName, [{name: fieldName, domain: domainName}]);
          await this._updateATAttr(eAttr, {relationName: tableName, fieldName, domainName});
          const fkConstName = Prefix.fkConstraint(await this.nextDDLUnique());
          await this.ddlHelper.addForeignKey(fkConstName, {
            tableName,
            fieldName
          }, {
            tableName: AdapterUtils.getOwnRelationName(eAttr.entities[0]),
            fieldName: AdapterUtils.getPKFieldName(eAttr.entities[0], AdapterUtils.getOwnRelationName(eAttr.entities[0]))
          });

          if (!attribute.adapter) {
            attribute.adapter = {
              relation: tableName,
              field: fieldName
            };
          }
          break;
        }
        case "Set": {
          if (!(attribute instanceof SetAttribute)) {
            throw new Error("Never throws");
          }
          const setAttr = attribute as SetAttribute;
          const position = await this.nextDDLTriggercross();
          const relationName = setAttr.adapter ? setAttr.adapter.crossRelation : Prefix.crossTable(position, await this.DDLdbID());
          const setTable = AdapterUtils.getOwnRelationName(setAttr.entities[0]);
          const ownPKName = setAttr.adapter ? setAttr.adapter.crossPk[0] : Constants.DEFAULT_USR_PREFIX.concat(ddlUtils.stripUserPrefix(tableName)).concat("KEY");
          const refPKName = setAttr.adapter ? setAttr.adapter.crossPk[1] :
            setTable ? Constants.DEFAULT_USR_PREFIX.concat(ddlUtils.stripUserPrefix(setTable)).concat("KEY") :
              Constants.DEFAULT_CROSS_PK_REF_NAME;
          const setTablePk = setAttr.entities[0].hasOwnAttribute(Constants.DEFAULT_INHERITED_KEY_NAME) ?
             Constants.DEFAULT_INHERITED_KEY_NAME : Constants.DEFAULT_ID_NAME;

          // create cross table
          const fields: Array<IFieldProps & { attr?: Attribute }> = [];
          const pkFields: IFieldProps[] = [];

          const ownPKDomainName = Prefix.domain(await this.nextDDLUnique());
          await this.ddlHelper.addDomain(ownPKDomainName, DomainResolver.resolve(entity.pk[0]));
          const ownPK = {
            name: ownPKName,
            domain: ownPKDomainName
          };
          fields.push(ownPK);
          pkFields.push(ownPK);

          const refPKDomainName = Prefix.domain(await this.nextDDLUnique());
          await this.ddlHelper.addDomain(refPKDomainName, DomainResolver.resolve(setAttr.entities[0].pk[0]));
          const refPK = {
            name: refPKName,
            domain: refPKDomainName
          };
          fields.push(refPK);
          pkFields.push(refPK);

          for (const crossAttr of Object.values(setAttr.attributes).filter((attr) => attr instanceof ScalarAttribute)) {
            const fieldName = AdapterUtils.getFieldName(crossAttr);
            const domainName = Prefix.domain(await this.nextDDLUnique());
            await this.ddlHelper.addDomain(domainName, DomainResolver.resolve(crossAttr));
            fields.push({
              attr: crossAttr,
              name: fieldName,
              domain: domainName
            });
            if (!crossAttr.adapter) {
              crossAttr.adapter = {
                relation: relationName,
                field: fieldName
              } as IAttributeAdapter;
            }
          }

          await this.ddlHelper.addTable(relationName, fields);

          const crossPKConstName = Prefix.crossPkConstraint(relationName);
          await this.ddlHelper.addPrimaryKey(crossPKConstName, relationName, pkFields.map((i) => i.name));
          for (const field of fields) {
            if (field.attr) {
              await this._updateATAttr(field.attr, {
                relationName,
                fieldName: field.name,
                domainName: field.domain
              });
            }
          }

          // create own table column
          const fieldName = AdapterUtils.getFieldName(setAttr);

          // Находим поле для отображения в множестве из Entity в Referense
          // NAME либо USR$NAME либо ALIAS либо первое строковое поле, либо DEFAULT_ID_NAME
          const crossFieldAttr = setAttr.entities[0].presentAttribute();
          const crossField = crossFieldAttr? AdapterUtils.getFieldName(crossFieldAttr) : Constants.DEFAULT_ID_NAME;
          const domainName = Prefix.domain(await this.nextDDLUnique());
          await this.ddlHelper.addDomain(domainName, DomainResolver.resolve(setAttr));
          await this.ddlHelper.addColumns(tableName, [{name: fieldName, domain: domainName}]);
          await this._updateATAttr(setAttr, {
            relationName: tableName,
            fieldName,
            domainName,
            crossTable: relationName,
            crossField: crossField,
            setTable: setTable
          });
          const presLen = setAttr.presLen;
          const triggerName = Constants.DEFAULT_USR_PREFIX.concat(Prefix.triggerBeforeInsert(relationName));
          if (presLen > 0) {
            await this.ddlHelper.addBICrossTrigger(triggerName, tableName, fieldName, setTable,
              crossField, relationName, ownPKName, refPKName, presLen, String(position), tablePk, setTablePk);
          }

          // add foreign keys for cross table
          const crossFKOwnConstName = Prefix.crossFkConstraint(1, relationName);
          await this.ddlHelper.addForeignKey(crossFKOwnConstName, {
            tableName: relationName,
            fieldName: ownPKName
          }, {
            tableName: AdapterUtils.getOwnRelationName(entity),
            fieldName: AdapterUtils.getPKFieldName(entity, AdapterUtils.getOwnRelationName(entity))
          }, {
            onUpdate: "CASCADE",
            onDelete: "CASCADE"
          });
          const crossFKRefConstName = Prefix.crossFkConstraint(2, relationName);
          await this.ddlHelper.addForeignKey(crossFKRefConstName, {
            tableName: relationName,
            fieldName: refPKName
          }, {
            tableName: setTable,
            fieldName: AdapterUtils.getPKFieldName(setAttr.entities[0], setTable)
          }, {
            onUpdate: "CASCADE",
            onDelete: "NO ACTION"
          });

          if (!attribute.adapter) {
            attribute.adapter = {
              crossRelation: relationName,
              crossPk: [ownPKName, refPKName]
            } as ISetAttributeAdapter;
          }
          break;
        }
      }
    }

    if ((attribute.name === Constants.DEFAULT_RB_NAME && entity.hasOwnAttribute(Constants.DEFAULT_LB_NAME)) ||  
      (attribute.name === Constants.DEFAULT_LB_NAME && entity.hasOwnAttribute(Constants.DEFAULT_RB_NAME))) {
      /* 
        Если присутствуют поля LB RB (entity type "lb-rb tree"), добавляем для поддержки:
        1) Индексы для LB и RB (DESCENDING)
        2) check
        3) ХП - USR$_P_EL        
        4) ХП - USR$_P_GCHС        
        5) ХП - USR$_P_RESTRUCT        
        6) bi trigger
        7) bu trigger        
      */  
     
      // 1) Добавляем indices
      const indexName = Prefix.indexConstraint(await this.nextDDLUnique());
      await this.ddlHelper.createIndex(indexName, tableName, [Constants.DEFAULT_LB_NAME], {sortType: "ASC"});
      const indexName2 = Prefix.indexConstraint(await this.nextDDLUnique());
      await this.ddlHelper.createIndex(indexName2, tableName, [Constants.DEFAULT_RB_NAME], {sortType:"DESC"});
      // 2) Добавляем check
      const checkName =  Prefix.uniqueConstraint(await this.nextDDLUnique());
      await this.ddlHelper.addTableCheck(checkName ,tableName, `${Constants.DEFAULT_LB_NAME} <= ${Constants.DEFAULT_RB_NAME}`);
      // 3) Добавляем процедуры
      // 3.1) el
      await this.ddlHelper.addELProcedure(tableName);
      // 3.2) gchc
      await this.ddlHelper.addGCHCProcedure(tableName);      
      // 3.2) restruct
      await this.ddlHelper.addRestructProcedure(tableName);            
      // 4) Добавляем триггеры
      // 4.1) bi
      await this.ddlHelper.addLBRBBITrigger(tableName);      
      // 4.2) bu
      await this.ddlHelper.addLBRBBUTrigger(tableName);      
    }
    return entity.add(attribute);
  }

  public async deleteAttribute(entity: Entity, attribute: Attribute): Promise<void> {
    switch (attribute.type) {
      case "Set":
        await this.ddlHelper.cachedStatements.dropATRelationField(attribute.name);
        await this.ddlHelper.cachedStatements.dropATRelations({relationName: attribute.adapter!.crossRelation});
        await this.ddlHelper.dropTable(attribute.adapter!.crossRelation);
        await this.ddlHelper.dropColumns(entity.name, [attribute.name]);
        break;
      case "Entity":
      case "Parent":
        const arrFF = await this.ddlHelper.cachedStatements.getFK(attribute.adapter!.relation, attribute.adapter!.field);
        for await (const fk of arrFF) {
          await this.ddlHelper.dropConstraint(fk, attribute.adapter!.relation);
        }
        await this.ddlHelper.dropColumns(attribute.adapter!.relation, [attribute.adapter!.field]);
        break;
      default:
        await this.ddlHelper.dropColumns(attribute.adapter!.relation, [attribute.adapter!.field]);
    }
    entity.remove(attribute);
  }
}
