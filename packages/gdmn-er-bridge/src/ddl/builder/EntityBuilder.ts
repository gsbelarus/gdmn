import {
  Attribute,
  DetailAttribute,
  Entity,
  EntityAttribute,
  ParentAttribute,
  ScalarAttribute,
  SequenceAttribute,
  SetAttribute
} from "gdmn-orm";
import {Constants} from "../Constants";
import {IFieldProps} from "../DDLHelper";
import {Prefix} from "../Prefix";
import {Builder} from "./Builder";
import {DomainResolver} from "./DomainResolver";

export class EntityBuilder extends Builder {

  public async addUnique(entity: Entity, attrs: Attribute[]): Promise<void> {
    const tableName = Builder._getOwnRelationName(entity);
    const constraintName = Prefix.uniqueConstraint(await this.nextDDLUnique());
    await this.ddlHelper.addUnique(constraintName, tableName, attrs.map((attr) => Builder._getFieldName(attr)));
  }

  public async addAttribute(entity: Entity, attr: Attribute): Promise<Attribute> {
    const tableName = Builder._getOwnRelationName(entity);

    if (ScalarAttribute.isType(attr)) {
      const fieldName = Builder._getFieldName(attr);
      const domainName = Prefix.domain(await this.nextDDLUnique());
      await this.ddlHelper.addDomain(domainName, DomainResolver.resolve(attr));
      await this.ddlHelper.addColumns(tableName, [{name: fieldName, domain: domainName}]);
      await this._addATAttr(attr, {relationName: tableName, fieldName, domainName});
      if (SequenceAttribute.isType(attr)) {
        const seqName = attr.sequence.adapter ? attr.sequence.adapter.sequence : attr.sequence.name;
        const triggerName = Prefix.triggerBeforeInsert(await this.nextDDLUnique());
        await this.ddlHelper.addAutoIncrementTrigger(triggerName, tableName, fieldName, seqName);
      }

    } else if (DetailAttribute.isType(attr)) {
      const fieldName = Builder._getFieldName(entity.pk[0]);
      let detailTableName: string;
      let detailLinkFieldName: string;
      if (attr.adapter && attr.adapter.masterLinks.length) {
        detailTableName = attr.adapter.masterLinks[0].detailRelation;
        detailLinkFieldName = attr.adapter.masterLinks[0].link2masterField;
      } else {
        detailTableName = attr.name;
        detailLinkFieldName = Constants.DEFAULT_MASTER_KEY_NAME;
      }

      const domainName = Prefix.domain(await this.nextDDLUnique());
      await this.ddlHelper.addDomain(domainName, DomainResolver.resolve(attr));
      await this.ddlHelper.addColumns(detailTableName, [{name: detailLinkFieldName, domain: domainName}]);
      const fkConstName = Prefix.fkConstraint(await this.nextDDLUnique());
      await this.ddlHelper.addForeignKey(fkConstName, {
        tableName: detailTableName,
        fieldName: detailLinkFieldName
      }, {
        tableName,
        fieldName
      });
      await this._addATAttr(attr, {
        relationName: detailTableName,
        fieldName: detailLinkFieldName,
        domainName: domainName,
        masterEntity: entity
      });
    } else if (SetAttribute.isType(attr)) {
      // create cross table
      const fields: Array<IFieldProps & { attr?: Attribute }> = [];
      const pkFields: IFieldProps[] = [];

      const ownPKDomainName = Prefix.domain(await this.nextDDLUnique());
      await this.ddlHelper.addDomain(ownPKDomainName, DomainResolver.resolve(entity.pk[0]));
      const ownPK = {
        name: Constants.DEFAULT_CROSS_PK_OWN_NAME,
        domain: ownPKDomainName
      };
      fields.push(ownPK);
      pkFields.push(ownPK);

      const refPKDomainName = Prefix.domain(await this.nextDDLUnique());
      await this.ddlHelper.addDomain(refPKDomainName, DomainResolver.resolve(attr.entities[0].pk[0]));
      const refPK = {
        name: Constants.DEFAULT_CROSS_PK_REF_NAME,
        domain: refPKDomainName
      };
      fields.push(refPK);
      pkFields.push(refPK);

      for (const crossAttr of Object.values(attr.attributes).filter((attr) => ScalarAttribute.isType(attr))) {
        const fieldName = Builder._getFieldName(crossAttr);
        const domainName = Prefix.domain(await this.nextDDLUnique());
        await this.ddlHelper.addDomain(domainName, DomainResolver.resolve(crossAttr));
        fields.push({
          attr: crossAttr,
          name: fieldName,
          domain: domainName
        });
      }

      let crossTableName: string;
      if (attr.adapter) {
        crossTableName = await this.ddlHelper.addTable(attr.adapter.crossRelation, fields);
      } else {
        crossTableName = Prefix.table(await this.nextDDLUnique());
        await this.ddlHelper.addTable(crossTableName, fields);
      }

      const crossPKConstName = Prefix.pkConstraint(await this.nextDDLUnique());
      await this.ddlHelper.addPrimaryKey(crossPKConstName, crossTableName, pkFields.map((i) => i.name));
      for (const field of fields) {
        if (field.attr) {
          await this._addATAttr(field.attr, {
            relationName: crossTableName,
            fieldName: field.name,
            domainName: field.domain
          });
        } else {
          // await this._getATHelper().insertATRelationFields();
        }
      }

      const crossTableKey = await this.ddlHelper.cachedStatements.addToATRelations({
        relationName: crossTableName
      });

      // create own table column
      const fieldName = Builder._getFieldName(attr);
      const domainName = Prefix.domain(await this.nextDDLUnique());
      await this.ddlHelper.addDomain(domainName, DomainResolver.resolve(attr));
      await this.ddlHelper.addColumns(tableName, [{name: fieldName, domain: domainName}]);
      await this._addATAttr(attr, {
        relationName: tableName,
        fieldName,
        domainName,
        crossTable: crossTableName,
        crossTableKey
      });

      // add foreign keys for cross table
      const crossFKOwnConstName = Prefix.fkConstraint(await this.nextDDLUnique());
      await this.ddlHelper.addForeignKey(crossFKOwnConstName, {
        tableName: crossTableName,
        fieldName: Constants.DEFAULT_CROSS_PK_OWN_NAME
      }, {
        tableName: Builder._getOwnRelationName(entity),
        fieldName: Builder._getFieldName(entity.pk[0])
      });
      const crossFKRefConstName = Prefix.fkConstraint(await this.nextDDLUnique());
      await this.ddlHelper.addForeignKey(crossFKRefConstName, {
        tableName: crossTableName,
        fieldName: Constants.DEFAULT_CROSS_PK_REF_NAME
      }, {
        tableName: Builder._getOwnRelationName(attr.entities[0]),
        fieldName: Builder._getFieldName(attr.entities[0].pk[0])
      });

    } else if (ParentAttribute.isType(attr)) {
      const fieldName = Builder._getFieldName(attr);
      const domainName = Prefix.fkConstraint(await this.nextDDLUnique());
      await this.ddlHelper.addDomain(domainName, DomainResolver.resolve(attr));
      await this.ddlHelper.addColumns(tableName, [{name: fieldName, domain: domainName}]);
      await this._addATAttr(attr, {relationName: tableName, fieldName, domainName});
      /*
      const lbField = attr.adapter ? attr.adapter.lbField : Constants.DEFAULT_LB_NAME;
      const rbField = attr.adapter ? attr.adapter.rbField : Constants.DEFAULT_RB_NAME;
      await this.ddlHelper.addColumns(tableName, [{name: lbField, domain: "DLB"}]);
      await this.ddlHelper.addColumns(tableName, [{name: rbField, domain: "DRB"}]);
      await this.ddlHelper.createIndex(tableName, "ASC", [lbField]);
      await this.ddlHelper.createIndex(tableName, "DESC", [rbField]);
      await this.ddlHelper.addTableCheck(tableName, [`${lbField} <= ${rbField}`]);
      */
      const fkConstName = Prefix.fkConstraint(await this.nextDDLUnique());
      await this.ddlHelper.addForeignKey(fkConstName, {
        tableName,
        fieldName
      }, {
        tableName: Builder._getOwnRelationName(attr.entities[0]),
        fieldName: Builder._getFieldName(attr.entities[0].pk[0])
      }, {
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      });

    } else if (EntityAttribute.isType(attr)) {
      const fieldName = Builder._getFieldName(attr);
      const domainName = Prefix.domain(await this.nextDDLUnique());
      await this.ddlHelper.addDomain(domainName, DomainResolver.resolve(attr));
      await this.ddlHelper.addColumns(tableName, [{name: fieldName, domain: domainName}]);
      await this._addATAttr(attr, {relationName: tableName, fieldName, domainName});
      const fkConstName = Prefix.fkConstraint(await this.nextDDLUnique());
      await this.ddlHelper.addForeignKey(fkConstName, {
        tableName,
        fieldName
      }, {
        tableName: Builder._getOwnRelationName(attr.entities[0]),
        fieldName: Builder._getFieldName(attr.entities[0].pk[0])
      });
    }

    return attr;
  }

  public async removeAttribute(_entity: Entity, _attribute: Attribute): Promise<void> {
    // TODO
    throw new Error("Unsupported yet");
  }
}
