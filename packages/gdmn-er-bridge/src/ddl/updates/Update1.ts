import {Constants} from "../Constants";
import {DDLHelper} from "../DDLHelper";
import {BaseSimpleUpdate} from "./BaseSimpleUpdate";

export class Update1 extends BaseSimpleUpdate {

  protected readonly _version: number = 1;
  protected readonly _description: string = "Обновление для чистой базы данных";

  protected async internalRun(ddlHelper: DDLHelper): Promise<void> {
    await ddlHelper.addSequence(Constants.GLOBAL_GENERATOR, true);
    await ddlHelper.addSequence(Constants.GLOBAL_DBID_GENERATOR, true);
    await ddlHelper.addSequence(Constants.GLOBAL_TRIGGERCROSS_GENERATOR, true);

    await ddlHelper.addDomain("DINTKEY", {type: "INTEGER", notNull: true, check: "CHECK (VALUE > 0)"}, true);
    await ddlHelper.addDomain("DPARENT", {type: "INTEGER"}, true);
    await ddlHelper.addDomain("DINTEGER", {type: "INTEGER"}, true);
    await ddlHelper.addDomain("DMASTERKEY", {type: "INTEGER", notNull: true}, true);
    await ddlHelper.addDomain("DFOREIGNKEY", {type: "INTEGER"}, true);
    await ddlHelper.addDomain("DLB", {type: "INTEGER", default: "1", notNull: true}, true);
    await ddlHelper.addDomain("DRB", {type: "INTEGER", default: "2", notNull: true}, true);
    await ddlHelper.addDomain("DTIMESTAMP_NOTNULL", {type: "TIMESTAMP", notNull: true}, true);
    await ddlHelper.addDomain("DBOOLEAN", {type: "SMALLINT", default: "0", check: "CHECK (VALUE IN (0, 1))"}, true);
    await ddlHelper.addDomain("DTABLENAME", {type: "VARCHAR(31)", check: "CHECK (VALUE > '')"}, true);
    await ddlHelper.addDomain("DFIELDNAME", {type: "VARCHAR(31)", check: "CHECK (VALUE > '')"}, true);
    await ddlHelper.addDomain("DINDEXNAME", {type: "VARCHAR(31)"}, true);
    await ddlHelper.addDomain("DTEXT255", {type: "VARCHAR(255)"}, true);
    await ddlHelper.addDomain("DTEXT254", {type: "VARCHAR(254)"}, true);
    await ddlHelper.addDomain("DTEXT180", {type: "VARCHAR(180)"}, true);
    await ddlHelper.addDomain("DTEXT60", {type: "VARCHAR(60)"}, true);
    await ddlHelper.addDomain("DTEXT20", {type: "VARCHAR(20)"}, true);
    await ddlHelper.addDomain("DDELETERULE", {type: "VARCHAR(11)"}, true);
    await ddlHelper.addDomain("DNAME", {type: "VARCHAR(60)", notNull: true}, true);
    await ddlHelper.addDomain("DRELATIONTYPE", {type: "VARCHAR(1)", check: "CHECK (VALUE IN ('T', 'V'))"}, true);
    await ddlHelper.addDomain("DCLASSNAME", {type: "VARCHAR(40)"}, true);
    await ddlHelper.addDomain("DNUMERATIONBLOB", {type: "BLOB SUB_TYPE -1 SEGMENT SIZE 256"}, true);
    await ddlHelper.addDomain("DBLOBTEXT80_1251", {type: "BLOB SUB_TYPE 1 SEGMENT SIZE 80"}, true);
    await ddlHelper.addDomain("DTEXTALIGNMENT", {
      type: "VARCHAR(1)", default: "'L'",
      check: "CHECK((VALUE IS NULL) OR (VALUE IN ('L', 'R', 'C', 'J')))"
    }, true);
    await ddlHelper.addDomain("DVISIBLE", {
      type: "SMALLINT",
      default: "1",
      check: "CHECK ((VALUE IS NULL) OR (VALUE IN (0, 1)))"
    }, true);
    await ddlHelper.addDomain("DCOLWIDTH", {
      type: "SMALLINT",
      default: "20",
      check: "CHECK ((VALUE IS NULL) OR (VALUE >= 0))"
    }, true);

    await ddlHelper.addDomain("DSECURITY", {type: "INTEGER", default: "-1", notNull: true}, true);
    await ddlHelper.addDomain("DSMALLINT", {type: "SMALLINT"}, true);

    await ddlHelper.addTable("AT_FIELDS", [
      {name: "ID", domain: "DINTKEY"},
      {name: "FIELDNAME", domain: "DFIELDNAME", notNull: true},
      {name: "LNAME", domain: "DNAME"},
      {name: "DESCRIPTION", domain: "DTEXT180"},
      {name: "REFTABLE", domain: "DTABLENAME"},
      {name: "SETLISTFIELD", domain: "DFIELDNAME"},
      {name: "REFCONDITION", domain: "DTEXT255"},
      {name: "REFTABLEKEY", domain: "DFOREIGNKEY"},
      {name: "REFLISTFIELDKEY", domain: "DFOREIGNKEY"},
      {name: "SETTABLE", domain: "DTABLENAME"},
      {name: "REFLISTFIELD", domain: "DFIELDNAME"},
      {name: "SETCONDITION", domain: "DTEXT255"},
      {name: "SETTABLEKEY", domain: "DFOREIGNKEY"},
      {name: "SETLISTFIELDKEY", domain: "DFOREIGNKEY"},
      {name: "ALIGNMENT", domain: "DTEXTALIGNMENT"},
      {name: "FORMAT", domain: "DTEXT60"},
      {name: "VISIBLE", domain: "DVISIBLE"},
      {name: "COLWIDTH", domain: "DCOLWIDTH"},
      {name: "READONLY", domain: "DBOOLEAN", default: "0"},
      {name: "GDCLASSNAME", domain: "DTEXT60"},
      {name: "GDSUBTYPE", domain: "DTEXT60"},
      {name: "NUMERATION", domain: "DNUMERATIONBLOB"},
      {name: "DISABLED", domain: "DBOOLEAN", default: "0"},
      {name: "RESERVED", domain: "DINTEGER"},
      {name: "EDITIONDATE", domain: "DTIMESTAMP_NOTNULL", default: "CURRENT_TIMESTAMP"}
    ], true);
    await ddlHelper.addPrimaryKey("AT_PK_FIELDS", "AT_FIELDS", ["ID"]);
    await ddlHelper.addAutoIncrementTrigger("AT_BI_FIELDS", "AT_FIELDS", "ID", Constants.GLOBAL_GENERATOR, true);
    await ddlHelper.createIndex("AT_X_FIELDS_FN", "AT_FIELDS", ["FIELDNAME"], {unique: true}, true);

    await ddlHelper.addTable("AT_RELATIONS", [
      {name: "ID", domain: "DINTKEY"},
      {name: "RELATIONNAME", domain: "DTABLENAME", notNull: true},
      {name: "RELATIONTYPE", domain: "DRELATIONTYPE"},
      {name: "LNAME", domain: "DNAME"},
      {name: "DESCRIPTION", domain: "DTEXT180"},
      {name: "SEMCATEGORY", domain: "DTEXT60"},
      {name: "REFERENCEKEY", domain: "DFOREIGNKEY"},
      {name: "LSHORTNAME", domain: "DNAME"},
      {name: "AFULL", domain: "DSECURITY "},
      {name: "ACHAG", domain: "DSECURITY "},
      {name: "AVIEW", domain: "DSECURITY "},
      {name: "ISCREATECOMMAND", domain: "DBOOLEAN"},
      {name: "RESERVED", domain: "DINTEGER"},
      {name: "EDITIONDATE", domain: "DTIMESTAMP_NOTNULL", default: "CURRENT_TIMESTAMP"},
      {name: "LISTFIELD", domain: "DFIELDNAME"},
      {name: "EXTENDEDFIELDS", domain: "DTEXT254"}
    ], true);
    await ddlHelper.addPrimaryKey("AT_PK_RELATIONS", "AT_RELATIONS", ["ID"]);
    await ddlHelper.addAutoIncrementTrigger("AT_BI_RELATIONS", "AT_RELATIONS", "ID", Constants.GLOBAL_GENERATOR, true);
    await ddlHelper.createIndex("AT_X_RELATIONS_RN", "AT_RELATIONS", ["RELATIONNAME"], {unique: true}, true);
    await ddlHelper.addForeignKey("AT_FK_RELATIONS_REFERENCEKEY",
      {tableName: "AT_RELATIONS", fieldName: "REFERENCEKEY"},
      {tableName: "AT_RELATIONS", fieldName: "ID"}
    );

    await ddlHelper.addTable("AT_RELATION_FIELDS", [
      {name: "ID", domain: "DINTKEY"},
      {name: "FIELDNAME", domain: "DFIELDNAME", notNull: true},
      {name: "RELATIONNAME", domain: "DTABLENAME", notNull: true},
      {name: "FIELDSOURCE", domain: "DFIELDNAME"},
      {name: "FIELDSOURCEKEY", domain: "DINTKEY"},
      {name: "LNAME", domain: "DNAME"},
      {name: "DESCRIPTION", domain: "DTEXT180"},
      {name: "SEMCATEGORY", domain: "DTEXT60"},
      {name: "CROSSTABLE", domain: "DTABLENAME"},
      {name: "CROSSFIELDKEY", domain: "DFOREIGNKEY"},
      {name: "CROSSTABLEKEY", domain: "DFOREIGNKEY"},
      {name: "CROSSFIELD", domain: "DFIELDNAME"},
      {name: "RELATIONKEY", domain: "DMASTERKEY"},
      {name: "LSHORTNAME", domain: "DTEXT20"},
      {name: "CATEGORY", domain: "DTEXT20"},
      {name: "CATORD", domain: "DSMALLINT"},
      {name: "VISIBLE", domain: "DBOOLEAN"},
      {name: "FORMAT", domain: "DTEXT60"},
      {name: "ALIGNMENT", domain: "DTEXTALIGNMENT"},
      {name: "COLWIDTH", domain: "DSMALLINT"},
      {name: "READONLY", domain: "DBOOLEAN", default: "0"},
      {name: "GDCLASSNAME", domain: "DTEXT180"},
      {name: "GDSUBTYPE", domain: "DTEXT180"},
      {name: "AFULL", domain: "DSECURITY"},
      {name: "ACHAG", domain: "DSECURITY"},
      {name: "AVIEW", domain: "DSECURITY"},
      {name: "OBJECTS", domain: "DBLOBTEXT80_1251"},
      {name: "DELETERULE", domain: "DDELETERULE"},
      {name: "RESERVED", domain: "DINTEGER"},
      {name: "EDITIONDATE", domain: "DTIMESTAMP_NOTNULL", default: "CURRENT_TIMESTAMP"}
    ], true);
    await ddlHelper.addPrimaryKey("AT_PK_RELATION_FIELDS", "AT_RELATION_FIELDS", ["ID"]);
    await ddlHelper.addAutoIncrementTrigger("AT_BI_RELATION_FIELDS", "AT_RELATION_FIELDS", "ID", Constants.GLOBAL_GENERATOR, true);
    await ddlHelper.createIndex("AT_X_RELATION_FIELDS_FR", "AT_RELATION_FIELDS", ["FIELDNAME", "RELATIONNAME"], {unique: true}, true);
    await ddlHelper.createIndex("AT_X_RELATION_FIELDS_RN", "AT_RELATION_FIELDS", ["RELATIONNAME"], {}, true);
    await ddlHelper.addForeignKey("AT_FK_RELATION_FIELDS_CF",
      {tableName: "AT_RELATION_FIELDS", fieldName: "CROSSFIELDKEY"},
      {tableName: "AT_RELATION_FIELDS", fieldName: "ID"},
      {onUpdate: "CASCADE", onDelete: "NO ACTION"}
    );
    await ddlHelper.addForeignKey("AT_FK_RELATION_FIELDS_CT",
      {tableName: "AT_RELATION_FIELDS", fieldName: "CROSSTABLEKEY"},
      {tableName: "AT_RELATIONS", fieldName: "ID"},
      {onUpdate: "CASCADE", onDelete: "NO ACTION"}
    );
    await ddlHelper.addForeignKey("AT_FK_RELATION_FIELDS_FS",
      {tableName: "AT_RELATION_FIELDS", fieldName: "FIELDSOURCEKEY"},
      {tableName: "AT_FIELDS", fieldName: "ID"},
      {onUpdate: "CASCADE", onDelete: "NO ACTION"}
    );
    await ddlHelper.addForeignKey("AT_FK_RELATION_FIELDS_RN",
      {tableName: "AT_RELATION_FIELDS", fieldName: "RELATIONKEY"},
      {tableName: "AT_RELATIONS", fieldName: "ID"},
      {onUpdate: "CASCADE", onDelete: "CASCADE"}
    );

    await ddlHelper.addTable("AT_TRIGGERS", [
      {name: "ID", domain: "DINTKEY"},
      {name: "RELATIONNAME", domain: "DTABLENAME", notNull: true},
      {name: "EDITIONDATE", domain: "DTIMESTAMP_NOTNULL", default: "CURRENT_TIMESTAMP"},
      {name: "RELATIONKEY", domain: "DFOREIGNKEY"},
      {name: "TRIGGERNAME", domain: "DFIELDNAME"},
      {name: "TRIGGER_INACTIVE", domain: "DBOOLEAN"}
    ], true);
    await ddlHelper.addPrimaryKey("AT_PK_TRIGGERS", "AT_TRIGGERS", ["ID"]);
    await ddlHelper.addAutoIncrementTrigger("AT_BI_TRIGGERS", "AT_TRIGGERS", "ID", Constants.GLOBAL_GENERATOR, true);
    await ddlHelper.createIndex("AT_X_TRIGGERS_RN", "AT_TRIGGERS", ["RELATIONNAME"], {}, true);
    await ddlHelper.createIndex("AT_X_TRIGGERS_TN", "AT_TRIGGERS", ["TRIGGERNAME"], {unique: true}, true);
    await ddlHelper.addForeignKey("AT_FK_TRIGGER_RELATIONKEY",
      {tableName: "AT_TRIGGERS", fieldName: "RELATIONKEY"},
      {tableName: "AT_RELATIONS", fieldName: "ID"},
      {onUpdate: "CASCADE", onDelete: "CASCADE"}
    );

    await ddlHelper.addTable("AT_GENERATORS", [
      {name: "ID", domain: "DINTKEY"},
      {name: "GENERATORNAME", domain: "DTABLENAME", notNull: true},
      {name: "EDITIONDATE", domain: "DTIMESTAMP_NOTNULL", default: "CURRENT_TIMESTAMP"}
    ], true);
    await ddlHelper.addPrimaryKey("AT_PK_GENERATORS", "AT_GENERATORS", ["ID"]);
    await ddlHelper.addAutoIncrementTrigger("AT_BI_GENERATORS", "AT_GENERATORS", "ID", Constants.GLOBAL_GENERATOR, true);
    await ddlHelper.createIndex("AT_X_GENERATORS_EN", "AT_GENERATORS", ["GENERATORNAME"], {unique: true}, true);

    await ddlHelper.addTable("AT_INDICES", [
      {name: "ID", domain: "DINTKEY"},
      {name: "RELATIONNAME", domain: "DTABLENAME", notNull: true},
      {name: "INDEX_INACTIVE", domain: "DBOOLEAN"},
      {name: "EDITIONDATE", domain: "DTIMESTAMP_NOTNULL", default: "CURRENT_TIMESTAMP"},
      {name: "INDEXNAME", domain: "DINDEXNAME"},
      {name: "FIELDLIST", domain: "DTEXT255"},
      {name: "RELATIONKEY", domain: "DMASTERKEY"},
      {name: "UNIQUE_FLAG", domain: "DBOOLEAN"}
    ], true);
    await ddlHelper.addPrimaryKey("AT_PK_INDICES", "AT_INDICES", ["ID"]);
    await ddlHelper.addAutoIncrementTrigger("AT_BI_INDICES", "AT_INDICES", "ID", Constants.GLOBAL_GENERATOR, true);
    await ddlHelper.createIndex("AT_X_INDICES_RN", "AT_INDICES", ["RELATIONNAME"], {}, true);
    await ddlHelper.createIndex("AT_X_INDICES_IN", "AT_INDICES", ["INDEXNAME"], {unique: true}, true);
    await ddlHelper.addForeignKey("AT_FK_INDICES_RELATIONKEY",
      {tableName: "AT_INDICES", fieldName: "RELATIONKEY"},
      {tableName: "AT_RELATIONS", fieldName: "ID"},
      {onUpdate: "CASCADE", onDelete: "CASCADE"}
    );

    await ddlHelper.addTable("AT_PROCEDURES", [
      {name: "ID", domain: "DINTKEY"},
      {name: "EDITIONDATE", domain: "DTIMESTAMP_NOTNULL", default: "CURRENT_TIMESTAMP"}
    ], true);
    await ddlHelper.addPrimaryKey("AT_PK_PROCEDURES", "AT_PROCEDURES", ["ID"]);
    await ddlHelper.addAutoIncrementTrigger("AT_BI_PROCEDURES", "AT_PROCEDURES", "ID", Constants.GLOBAL_GENERATOR, true);

    ///////////////////////////
    await ddlHelper.addForeignKey("AT_FK_FIELDS_RLF",
      {tableName: "AT_FIELDS", fieldName: "REFLISTFIELDKEY"},
      {tableName: "AT_RELATION_FIELDS", fieldName: "ID"},
      {onUpdate: "CASCADE", onDelete: "SET NULL"}
    );
    await ddlHelper.addForeignKey("AT_FK_FIELDS_RT",
      {tableName: "AT_FIELDS", fieldName: "REFTABLEKEY"},
      {tableName: "AT_RELATIONS", fieldName: "ID"}
    );
    await ddlHelper.addForeignKey("AT_FK_FIELDS_SLF",
      {tableName: "AT_FIELDS", fieldName: "SETLISTFIELDKEY"},
      {tableName: "AT_RELATION_FIELDS", fieldName: "ID"},
      {onUpdate: "CASCADE", onDelete: "SET NULL"}
    );
    await ddlHelper.addForeignKey("AT_FK_FIELDS_ST",
      {tableName: "AT_FIELDS", fieldName: "SETTABLEKEY"},
      {tableName: "AT_RELATIONS", fieldName: "ID"}
    );
  }
}
