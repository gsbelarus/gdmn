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

    if (attribute instanceof ScalarAttribute) {
      // if (attribute.name === "RB") {
      //   await this.ddlHelper.addColumns(tableName, [{name: Constants.DEFAULT_RB_NAME, domain: "DRB"}]);
      // }
      // if (attribute.name === "LB") {
      //    await this.ddlHelper.addColumns(tableName, [{name: Constants.DEFAULT_LB_NAME, domain: "DLB"}]);
      // }

      const fieldName = AdapterUtils.getFieldName(attribute);
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

          // await this.ddlHelper.addColumns(tableName, [{name: Constants.DEFAULT_LB_NAME, domain: "DLB"}]);
          // await this.ddlHelper.addColumns(tableName, [{name: Constants.DEFAULT_RB_NAME, domain: "DRB"}]);

          // const indexName = Prefix.indexConstraint(await this.nextDDLUnique());
          // await this.ddlHelper.createIndex(indexName, tableName,[lbField], {sortType: "ASC"});
          // const indexName2 = Prefix.indexConstraint(await this.nextDDLUnique());
          // await this.ddlHelper.createIndex(indexName2, tableName, [rbField],{sortType:"DESC"});

          // const checkName =  Prefix.uniqueConstraint(await this.nextDDLUnique());
          // await this.ddlHelper.addTableCheck(checkName ,tableName, `${lbField} <= ${rbField}`);
          //
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

          const relationName = setAttr.adapter ? setAttr.adapter.crossRelation : Prefix.table(await this.nextDDLUnique());
          const ownPKName = setAttr.adapter ? setAttr.adapter.crossPk[0] : Constants.DEFAULT_CROSS_PK_OWN_NAME;
          const refPKName = setAttr.adapter ? setAttr.adapter.crossPk[1] : Constants.DEFAULT_CROSS_PK_REF_NAME;

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

          const crossPKConstName = Prefix.pkConstraint(await this.nextDDLUnique());
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
          const domainName = Prefix.domain(await this.nextDDLUnique());
          await this.ddlHelper.addDomain(domainName, DomainResolver.resolve(setAttr));
          await this.ddlHelper.addColumns(tableName, [{name: fieldName, domain: domainName}]);
          await this._updateATAttr(setAttr, {
            relationName: tableName,
            fieldName,
            domainName,
            crossTable: relationName
          });

          // add foreign keys for cross table
          const crossFKOwnConstName = Prefix.fkConstraint(await this.nextDDLUnique());
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
          const crossFKRefConstName = Prefix.fkConstraint(await this.nextDDLUnique());
          await this.ddlHelper.addForeignKey(crossFKRefConstName, {
            tableName: relationName,
            fieldName: refPKName
          }, {
            tableName: AdapterUtils.getOwnRelationName(setAttr.entities[0]),
            fieldName: AdapterUtils.getPKFieldName(setAttr.entities[0], AdapterUtils.getOwnRelationName(setAttr.entities[0]))
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

    return entity.add(attribute);
  }

  public async deleteAttribute(entity: Entity, attribute: Attribute): Promise<void> {
    entity.remove(attribute);
  }
}
