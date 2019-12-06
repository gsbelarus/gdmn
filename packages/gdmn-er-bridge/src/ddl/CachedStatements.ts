import {AConnection, AStatement, ATransaction} from "gdmn-db";
import {semCategories2Str, SemCategory} from "gdmn-nlp";
import {Constants} from "./Constants";

export interface IATFieldsInput {
  fieldName: string;
  lName?: string;
  description?: string;
  refTable?: string;
  refCondition?: string;
  setTable?: string;
  setListField?: string;
  setCondition?: string;
  numeration?: Array<{ key: string | number, value: string }>;
}

export interface IATRelationsInput {
  relationName: string;
  relationType?: "T" | "V";
  lName?: string;
  description?: string;
  entityName?: string;
  semCategory?: SemCategory[];
  lShortName?: string;
}

export interface IATRelationFieldsInput {
  fieldName: string;
  relationName: string;
  fieldSource: string;
  lName?: string;
  description?: string;
  attrName?: string;
  masterEntityName?: string;
  semCategory?: SemCategory[];
  crossTable?: string;
  crossField?: string;
}

export interface IATTriggersInput {
  triggerName: string;
  relationName?: string;
  triggerInactive?: boolean;
}

export interface IATProceduresInput {
  procedureName: string;
}

export interface IATGeneratorInput {
  generatorName: string;
}

export interface IATIndicesInput {
  indexName: string;
  relationName?: string;
  indexInactive?: boolean;
  fieldList?: string;
  uniqueFlag?: boolean;
}

export interface IDependence {
  name: string;
  type: string;
}

interface IStatements {
  sequenceExists?: AStatement;
  tableExists?: AStatement;
  columnExists?: AStatement;
  constraintExists?: AStatement;
  indexExists?: AStatement;
  domainExists?: AStatement;
  triggerExists?: AStatement;
  procedureExists?: AStatement;  
  getDependencies?: AStatement;
  checkDependencies?: AStatement;
  getFK?: AStatement;

  ddlUniqueSequence?: AStatement;
  ddlTriggercrossSequence?: AStatement;
  ddlDBIDSequence?: AStatement;

  tableATExists?: AStatement;
  columnATExists?: AStatement;
  generatorATExists?: AStatement;
  indexATExists?: AStatement;
  domainATExists?: AStatement;
  triggerATExists?: AStatement;
  procedureATExists?: AStatement;  

  addToATFields?: AStatement;
  addToATRelations?: AStatement;
  addToATRelationField?: AStatement;
  addToATTriggers?: AStatement;
  addToATGenerator?: AStatement;
  addToATIndices?: AStatement;
  addToATProcedures?: AStatement;

  updateATFields?: AStatement;
  updateATRelations?: AStatement;
  updateATRelationField?: AStatement;
  updateATTriggers?: AStatement;

  dropATFields?: AStatement;
  dropATRelations?: AStatement;
  dropATRelationField?: AStatement;
  dropATTriggers?: AStatement;
  dropATGenerator?: AStatement;
  dropATIndices?: AStatement;
  dropATProcedures?: AStatement;  

  getDomainName?: AStatement;
}

export class CachedStatements {

  private readonly _connection: AConnection;
  private readonly _transaction: ATransaction;
  private _statements: IStatements = {};
  private _disposed: boolean = false;

  constructor(connection: AConnection, transaction: ATransaction) {
    this._connection = connection;
    this._transaction = transaction;
  }

  get disposed(): boolean {
    return this._disposed;
  }

  get connection(): AConnection {
    return this._connection;
  }

  get transaction(): ATransaction {
    return this._transaction;
  }

  public async dispose(): Promise<void> {
    this._checkDisposed();

    for (const statement of Object.values(this._statements)) {
      if (statement && !statement.disposed) {
        await statement.dispose();
      }
    }
  }

  public async isSequenceExists(sequenceName: string): Promise<boolean> {
    this._checkDisposed();

    if (!this._statements.sequenceExists) {
      this._statements.sequenceExists = await this._connection.prepare(this._transaction, `
        SELECT FIRST 1 0
        FROM RDB$GENERATORS
        WHERE RDB$GENERATOR_NAME = :sequenceName
      `);
    }
    return await AStatement.executeQueryResultSet({
      statement: this._statements.sequenceExists,
      params: {sequenceName},
      callback: (resultSet) => resultSet.next()
    });
  }

  public async isTableExists(tableName: string): Promise<boolean> {
    this._checkDisposed();

    if (!this._statements.tableExists) {
      this._statements.tableExists = await this._connection.prepare(this._transaction, `
        SELECT FIRST 1 0
        FROM RDB$RELATIONS
        WHERE RDB$RELATION_NAME = :tableName
      `);
    }
    return await AStatement.executeQueryResultSet({
      statement: this._statements.tableExists,
      params: {tableName},
      callback: (resultSet) => resultSet.next()
    });
  }

  public async isColumnExists(tableName: string, fieldName: string): Promise<boolean> {
    this._checkDisposed();

    if (!this._statements.columnExists) {
      this._statements.columnExists = await this._connection.prepare(this._transaction, `
        SELECT FIRST 1 0
        FROM RDB$RELATION_FIELDS rf
        WHERE rf.RDB$RELATION_NAME = :tableName
          and rf.RDB$FIELD_NAME = :fieldName
      `);
    }
    return await AStatement.executeQueryResultSet({
      statement: this._statements.columnExists,
      params: {tableName, fieldName},
      callback: (resultSet) => resultSet.next()
    });
  }

  public async isConstraintExists(constraintName: string): Promise<boolean> {
    this._checkDisposed();

    if (!this._statements.constraintExists) {
      this._statements.constraintExists = await this._connection.prepare(this._transaction, `
        SELECT FIRST 1 0
        FROM RDB$RELATION_CONSTRAINTS
        WHERE RDB$CONSTRAINT_NAME = :constraintName
      `);
    }
    return await AStatement.executeQueryResultSet({
      statement: this._statements.constraintExists,
      params: {constraintName},
      callback: (resultSet) => resultSet.next()
    });
  }

  public async isIndexExists(indexName: string): Promise<boolean> {
    this._checkDisposed();

    if (!this._statements.indexExists) {
      this._statements.indexExists = await this._connection.prepare(this._transaction, `
        SELECT FIRST 1 0
        FROM RDB$INDICES
        WHERE RDB$INDEX_NAME = :indexName
      `);
    }
    return await AStatement.executeQueryResultSet({
      statement: this._statements.indexExists,
      params: {indexName},
      callback: (resultSet) => resultSet.next()
    });
  }

  public async isDomainExists(domainName: string): Promise<boolean> {
    this._checkDisposed();

    if (!this._statements.domainExists) {
      this._statements.domainExists = await this._connection.prepare(this._transaction, `
        SELECT FIRST 1 0
        FROM RDB$FIELDS
        WHERE RDB$FIELD_NAME = :domainName
      `);
    }
    return await AStatement.executeQueryResultSet({
      statement: this._statements.domainExists,
      params: {domainName},
      callback: (resultSet) => resultSet.next()
    });
  }

  public async isTriggerExists(triggerName: string): Promise<boolean> {
    this._checkDisposed();

    if (!this._statements.triggerExists) {
      this._statements.triggerExists = await this._connection.prepare(this._transaction, `
        SELECT FIRST 1 0
        FROM RDB$TRIGGERS
        WHERE RDB$TRIGGER_NAME = :triggerName
      `);
    }
    return await AStatement.executeQueryResultSet({
      statement: this._statements.triggerExists,
      params: {triggerName},
      callback: (resultSet) => resultSet.next()
    });
  }

  /** Проверка, существует ли процедура */
  public async isProcedureExists(procedureName: string): Promise<boolean> {
    this._checkDisposed();

    if (!this._statements.procedureExists) {
      this._statements.procedureExists = await this._connection.prepare(this._transaction, `
        SELECT FIRST 1 0
        FROM RDB$PROCEDURES
        WHERE RDB$PROCEDURE_NAME = :procedureName
      `);
    }
    return await AStatement.executeQueryResultSet({
      statement: this._statements.procedureExists,
      params: {procedureName},
      callback: (resultSet) => resultSet.next()
    });
  }  

  public async nextDDLUnique(): Promise<number> {
    this._checkDisposed();

    if (!this._statements.ddlUniqueSequence) {
      this._statements.ddlUniqueSequence = await this._connection.prepare(this._transaction, `
        SELECT NEXT VALUE FOR ${Constants.GLOBAL_DDL_GENERATOR} FROM RDB$DATABASE
      `);
    }
    const result = await this._statements.ddlUniqueSequence.executeReturning();
    return (await result.getAll())[0];
  }

  public async nextDDLTriggercross(): Promise<number> {
    this._checkDisposed();

    if (!this._statements.ddlTriggercrossSequence) {
      this._statements.ddlTriggercrossSequence = await this._connection.prepare(this._transaction, `
        SELECT NEXT VALUE FOR ${Constants.GLOBAL_TRIGGERCROSS_GENERATOR} FROM RDB$DATABASE
      `);
    }
    const result = await this._statements.ddlTriggercrossSequence.executeReturning();
    return (await result.getAll())[0];
  }

  public async DDLdbID(): Promise<number> {
    this._checkDisposed();

    if (!this._statements.ddlDBIDSequence) {
      this._statements.ddlDBIDSequence = await this._connection.prepare(this._transaction, `
        SELECT  GEN_ID(${Constants.GLOBAL_DBID_GENERATOR}, 0) FROM RDB$DATABASE
      `);
    }
    const result = await this._statements.ddlDBIDSequence.executeReturning();
    return (await result.getAll())[0];
  }

  public async isTableATExists(tableName: string): Promise<boolean> {
    this._checkDisposed();

    if (!this._statements.tableATExists) {
      this._statements.tableATExists = await this._connection.prepare(this._transaction, `
        SELECT FIRST 1 0
        FROM AT_RELATIONS
        WHERE RELATIONNAME = :tableName
      `);
    }
    return await AStatement.executeQueryResultSet({
      statement: this._statements.tableATExists,
      params: {tableName},
      callback: (resultSet) => resultSet.next()
    });
  }

  public async isColumnATExists(tableName: string, columnName: string): Promise<boolean> {
    this._checkDisposed();

    if (!this._statements.columnATExists) {
      this._statements.columnATExists = await this._connection.prepare(this._transaction, `
        SELECT FIRST 1 0
        FROM AT_RELATION_FIELDS
        WHERE RELATIONNAME = :tableName
          AND FIELDNAME = :columnName
      `);
    }
    return await AStatement.executeQueryResultSet({
      statement: this._statements.columnATExists,
      params: {tableName, columnName},
      callback: (resultSet) => resultSet.next()
    });
  }

  public async isGeneratorATExists(generatorName: string): Promise<boolean> {
    this._checkDisposed();

    if (!this._statements.generatorATExists) {
      this._statements.generatorATExists = await this._connection.prepare(this._transaction, `
        SELECT FIRST 1 0
        FROM AT_GENERATORS
        WHERE GENERATORNAME = :generatorName
      `);
    }
    return await AStatement.executeQueryResultSet({
      statement: this._statements.generatorATExists,
      params: {generatorName},
      callback: (resultSet) => resultSet.next()
    });
  }

  public async isIndexATExists(indexName: string): Promise<boolean> {
    this._checkDisposed();

    if (!this._statements.indexATExists) {
      this._statements.indexATExists = await this._connection.prepare(this._transaction, `
        SELECT FIRST 1 0
        FROM AT_INDICES
        WHERE INDEXNAME = :indexName
      `);
    }
    return await AStatement.executeQueryResultSet({
      statement: this._statements.indexATExists,
      params: {indexName},
      callback: (resultSet) => resultSet.next()
    });
  }

  public async isDomainATExists(domainName: string): Promise<boolean> {
    this._checkDisposed();
    if (!this._statements.domainATExists) {
      this._statements.domainATExists = await this._connection.prepare(this._transaction, `
        SELECT FIRST 1 0
        FROM AT_FIELDS
        WHERE FIELDNAME = :domainName
      `);
    }
    return await AStatement.executeQueryResultSet({
      statement: this._statements.domainATExists,
      params: {domainName},
      callback: (resultSet) => resultSet.next()
    });
  }

  public async isTriggerATExists(triggerName: string): Promise<boolean> {
    this._checkDisposed();
    if (!this._statements.triggerATExists) {
      this._statements.triggerATExists = await this._connection.prepare(this._transaction, `
        SELECT FIRST 1 0
        FROM AT_TRIGGER
        WHERE TRIGGERNAME = :triggerName
      `);
    }
    return await AStatement.executeQueryResultSet({
      statement: this._statements.triggerATExists,
      params: {triggerName},
      callback: (resultSet) => resultSet.next()
    });
  }

  public async isProcudereATExists(procedureName: string): Promise<boolean> {
    this._checkDisposed();
    if (!this._statements.procedureATExists) {
      this._statements.procedureATExists = await this._connection.prepare(this._transaction, `
        SELECT FIRST 1 0
        FROM AT_PROCEDURES
        WHERE PROCEDURENAME = :procedureName
      `);
    }
    return await AStatement.executeQueryResultSet({
      statement: this._statements.procedureATExists,
      params: {procedureName},
      callback: (resultSet) => resultSet.next()
    });
  }  

  public async addToATFields(input: IATFieldsInput): Promise<number> {
    this._checkDisposed();

    if (!this._statements.addToATFields) {
      this._statements.addToATFields = await this._connection.prepare(this._transaction, `
        INSERT INTO AT_FIELDS (FIELDNAME,
                               LNAME,
                               DESCRIPTION,
                               REFTABLE,
                               REFCONDITION,
                               SETTABLE,
                               SETLISTFIELD,
                               SETCONDITION,
                               NUMERATION)
        VALUES (:fieldName,
                :lName,
                :description,
                :refTable,
                :refCondition,
                :setTable,
                :setListField,
                :setCondition,
                :numeration)
          RETURNING ID
      `);
    }
    const numeration = (input.numeration || []).map(({key, value}) => `${key};${value}`).join("\r\n");
    const result = await this._statements.addToATFields.executeReturning({
      fieldName: input.fieldName,
      lName: input.lName || input.fieldName,
      description: input.description,
      refTable: input.refTable,
      refCondition: input.refCondition,
      setTable: input.setTable,
      setListField: input.setListField,
      setCondition: input.setCondition,
      numeration: numeration.length ? Buffer.from(numeration.concat("\r\n")) : undefined,
    });
    return result.getNumber("ID");
  }

  public async dropATFields(input: IATFieldsInput): Promise<void> {
    this._checkDisposed();

    if (!this._statements.dropATFields) {
      this._statements.dropATFields = await this._connection.prepare(this._transaction, `
        DELETE
        FROM AT_FIELDS
        WHERE FIELDNAME = :fieldName
      `);
    }
    await this._statements.dropATFields.execute({
      fieldName: input.fieldName
    });
  }

  public async addToATRelations(input: IATRelationsInput): Promise<number> {
    this._checkDisposed();

    if (!this._statements.addToATRelations) {
      this._statements.addToATRelations = await this.connection.prepare(this._transaction, `
        INSERT INTO AT_RELATIONS (RELATIONNAME, RELATIONTYPE, LNAME, DESCRIPTION, SEMCATEGORY, ENTITYNAME, LSHORTNAME)
        VALUES (:relationName, :relationType, :lName, :description, :semCategory, :entityName, :lShortName)
          RETURNING ID
      `);
    }
    const result = await this._statements.addToATRelations.executeReturning({
      relationName: input.relationName,
      relationType: input.relationType || "T",
      lName: input.lName || input.relationName,
      description: input.description,
      semCategory: semCategories2Str(input.semCategory || []),
      entityName: input.relationName !== input.entityName ? input.entityName : undefined,
      lShortName: input.lShortName || input.lName || input.relationName
    });
    return result.getNumber("ID");
  }

  public async dropATRelations(input: IATRelationsInput): Promise<void> {
    this._checkDisposed();

    if (!this._statements.dropATRelations) {
      this._statements.dropATRelations = await this.connection.prepare(this._transaction, `
        DELETE
        FROM AT_RELATIONS
        WHERE RELATIONNAME = :relationName
      `);
    }
    await this._statements.dropATRelations.execute({
      relationName: input.relationName
    });
  }

  public async addToATRelationField(input: IATRelationFieldsInput): Promise<number> {
    this._checkDisposed();

    if (!this._statements.addToATRelationField) {
      this._statements.addToATRelationField = await this.connection.prepare(this._transaction, `
        INSERT INTO AT_RELATION_FIELDS (FIELDNAME,
                                        RELATIONNAME,
                                        LNAME,
                                        DESCRIPTION,
                                        FIELDSOURCE,
                                        FIELDSOURCEKEY,
                                        ATTRNAME,
                                        MASTERENTITYNAME,
                                        SEMCATEGORY,
                                        CROSSTABLE,
                                        CROSSTABLEKEY,
                                        CROSSFIELD,
                                        RELATIONKEY)
        SELECT FIRST 1
        :fieldName,
               :relationName,
               :lName,
               :description,
               :fieldSource,
               f.ID,
               :attrName,
               :masterEntityName,
               :semCategory,
               :crossTable,
               IIF(:crossTable = NULL, NULL, (SELECT FIRST 1 ID FROM AT_RELATIONS WHERE RELATIONNAME = :crossTable)),
               :crossField,
               r.ID
        FROM AT_FIELDS AS f,
             AT_RELATIONS AS r
        WHERE f.FIELDNAME = :fieldSource
          AND r.RELATIONNAME = :relationName
          RETURNING ID
      `);
    }
    const result = await this._statements.addToATRelationField.executeReturning({
      fieldName: input.fieldName,
      relationName: input.relationName,
      lName: input.lName || input.fieldName,
      description: input.description,
      fieldSource: input.fieldSource,
      attrName: input.fieldName !== input.attrName ? input.attrName : undefined,
      masterEntityName: input.masterEntityName,
      semCategory: semCategories2Str(input.semCategory || []),
      crossTable: input.crossTable,
      crossField: input.crossField
    });
    return result.getNumber("ID");
  }

  public async dropATRelationField(fieldName: string): Promise<void> {
    this._checkDisposed();

    if (!this._statements.dropATRelationField) {
      this._statements.dropATRelationField = await this.connection.prepare(this._transaction, `
        DELETE
        FROM AT_RELATION_FIELDS
        WHERE FIELDNAME = :fieldName
      `);
    }
    await this._statements.dropATRelationField.execute({
      fieldName: fieldName
    });
  }

  public async updateATRelationField(input: IATRelationFieldsInput): Promise<number> {
    this._checkDisposed();

    if (!this._statements.updateATRelationField) {
      this._statements.updateATRelationField = await this.connection.prepare(this._transaction, `
        UPDATE AT_RELATION_FIELDS
        SET LNAME            = :lName,
            DESCRIPTION      = :description,
            ATTRNAME         = :attrName,
            MASTERENTITYNAME = :masterEntityName,
            SEMCATEGORY      = :semCategory,
            CROSSTABLE       = :crossTable,
            CROSSTABLEKEY    = IIF(:crossTable = NULL, NULL, (SELECT FIRST 1 ID
                                                              FROM AT_RELATIONS
                                                              WHERE RELATIONNAME = :crossTable)),
            CROSSFIELD       = :crossField
        WHERE FIELDNAME = :fieldName
          AND RELATIONNAME = :relationName
          AND FIELDSOURCE = :fieldSource
          RETURNING ID
      `);
    }
    const result = await this._statements.updateATRelationField.executeReturning({
      fieldName: input.fieldName,
      relationName: input.relationName,
      lName: input.lName || input.fieldName,
      description: input.description,
      fieldSource: input.fieldSource,
      attrName: input.fieldName !== input.attrName ? input.attrName : undefined,
      masterEntityName: input.masterEntityName,
      semCategory: semCategories2Str(input.semCategory || []),
      crossTable: input.crossTable,
      crossField: input.crossField
    });
    return result.getNumber("ID");
  }

  public async updateATFields(input: IATFieldsInput): Promise<number> {
    this._checkDisposed();

    if (!this._statements.updateATFields) {
      this._statements.updateATFields = await this._connection.prepare(this._transaction, `
        UPDATE AT_FIELDS
        SET LNAME           = :lName,
            DESCRIPTION     = :description,
            REFTABLE        = :refTable,
            REFCONDITION    = :refCondition,
            SETTABLE        = :setTable,
            SETLISTFIELD    = :setListField,
            SETCONDITION    = :setCondition,
            NUMERATION      = :numeration,
            SETTABLEKEY     = IIF(:setTable = NULL, NULL, (SELECT FIRST 1 ID
              FROM AT_RELATIONS
              WHERE RELATIONNAME = :setTable)),
            SETLISTFIELDKEY = IIF((:setTable = NULL OR :setListField = NULL), NULL, 
              (SELECT FIRST 1 ID
                FROM AT_RELATION_FIELDS rf
                WHERE rf.RELATIONNAME = :setTable
                AND rf.FIELDNAME = :setListField))
        WHERE FIELDNAME = :fieldName
          RETURNING ID
      `);
    }
    const numeration = (input.numeration || []).map(({key, value}) => `${key};${value}`).join("\r\n");
    const result = await this._statements.updateATFields.executeReturning({
      fieldName: input.fieldName,
      lName: input.lName || input.fieldName,
      description: input.description,
      refTable: input.refTable,
      refCondition: input.refCondition,
      setTable: input.setTable,
      setListField: input.setListField,
      setCondition: input.setCondition,
      numeration: numeration.length ? Buffer.from(numeration.concat("\r\n")) : undefined,
    });
    return result.getNumber("ID");
  }

  public async updateATRelations(input: IATRelationsInput): Promise<number> {
    this._checkDisposed();

    if (!this._statements.updateATRelations) {
      this._statements.updateATRelations = await this.connection.prepare(this._transaction, `
        UPDATE AT_RELATIONS
        SET RELATIONTYPE = :relationType,
            LNAME        = :lName,
            DESCRIPTION  = :description,
            SEMCATEGORY  = :semCategory,
            ENTITYNAME   = :entityName,
            LSHORTNAME   = :lShortName
        WHERE RELATIONNAME = :relationName
          RETURNING ID
      `);
    }
    const result = await this._statements.updateATRelations.executeReturning({
      relationName: input.relationName,
      relationType: input.relationType || "T",
      lName: input.lName || input.relationName,
      description: input.description,
      semCategory: semCategories2Str(input.semCategory || []),
      entityName: input.relationName !== input.entityName ? input.entityName : undefined,
      lShortName: input.lShortName || input.lName || input.relationName
    });
    return result.getNumber("ID");
  }

  public async addToATTriggers(input: IATTriggersInput): Promise<number> {
    this._checkDisposed();

    if (!this._statements.addToATTriggers) {
      this._statements.addToATTriggers = await this.connection.prepare(this._transaction, `
        INSERT INTO AT_TRIGGERS (RELATIONNAME, TRIGGERNAME, TRIGGER_INACTIVE, RELATIONKEY)
        SELECT FIRST 1 :relationName, :triggerName, :triggerInactive, ID
        FROM AT_RELATIONS
        WHERE RELATIONNAME = :relationName
          RETURNING ID
      `);
    }
    const result = await this._statements.addToATTriggers.executeReturning({
      relationName: input.relationName,
      triggerName: input.triggerName,
      triggerInactive: input.triggerInactive
    });
    return result.getNumber("ID");
  }

  public async updateATTriggers(input: IATTriggersInput): Promise<number> {
    this._checkDisposed();

    if (!this._statements.updateATTriggers) {
      this._statements.updateATTriggers = await this.connection.prepare(this._transaction, `
        UPDATE AT_TRIGGERS
        SET TRIGGER_INACTIVE = :triggerInactive,
            RELATIONNAME     = :relationName
        WHERE TRIGGERNAME = :triggerName
      `);
    }
    const result = await this._statements.updateATTriggers.executeReturning({
      relationName: input.relationName,
      triggerName: input.triggerName,
      triggerInactive: input.triggerInactive
    });
    return result.getNumber("ID");
  }

  public async dropATTriggers(input: IATTriggersInput): Promise<void> {
    this._checkDisposed();

    if (!this._statements.dropATTriggers) {
      this._statements.dropATTriggers = await this.connection.prepare(this._transaction, `
        DELETE
        FROM AT_TRIGGERS
        WHERE TRIGGERNAME = :triggerName
          AND RELATIONNAME = :relationName

      `);
    }
    await this._statements.dropATTriggers.execute({
      relationName: input.relationName,
      triggerName: input.triggerName
    });
  }

  public async addToATGenerator(input: IATGeneratorInput): Promise<number> {
    this._checkDisposed();

    if (!this._statements.addToATGenerator) {
      this._statements.addToATGenerator = await this.connection.prepare(this._transaction, `
        INSERT INTO AT_GENERATORS (GENERATORNAME)
        VALUES (:generatorName)
          RETURNING ID
      `);
    }
    const result = await this._statements.addToATGenerator.executeReturning({
      generatorName: input.generatorName
    });
    return result.getNumber("ID");
  }

  public async addToATIndices(input: IATIndicesInput): Promise<number> {
    this._checkDisposed();

    if (!this._statements.addToATIndices) {
      this._statements.addToATIndices = await this.connection.prepare(this._transaction, `
        INSERT INTO AT_INDICES (INDEXNAME, RELATIONNAME, INDEX_INACTIVE, FIELDSLIST, RELATIONKEY, UNIQUE_FLAG)
        SELECT FIRST 1 :indexName, :relationName, :indexInactive, :fieldList, ID, :uniqueFlag
        FROM AT_RELATIONS
        WHERE RELATIONNAME = :relationName
          RETURNING ID
      `);
    }
    const result = await this._statements.addToATIndices.executeReturning({
      indexName: input.indexName,
      relationName: input.relationName,
      indexInactive: input.indexInactive,
      fieldList: input.fieldList,
      uniqueFlag: input.uniqueFlag
    });
    return result.getNumber("ID");
  }

  public async dropATGenerator(input: IATGeneratorInput): Promise<void> {
    this._checkDisposed();

    if (!this._statements.dropATGenerator) {
      this._statements.dropATGenerator = await this.connection.prepare(this._transaction, `
        DELETE
        FROM AT_GENERATORS
        WHERE GENERATORNAME = :generatorName

      `);
    }
    await this._statements.dropATGenerator.execute({
      generatorName: input.generatorName
    });
  }

  public async dropATIndices(input: IATIndicesInput): Promise<void> {
    this._checkDisposed();

    if (!this._statements.dropATIndices) {
      this._statements.dropATIndices = await this.connection.prepare(this._transaction, `
        DELETE
        FROM AT_INDICES
        WHERE INDEXNAME = :indexName

      `);
    }
    await this._statements.dropATIndices.execute({
      indexName: input.indexName
    });
  }
  /** 
  * Обработка процедур 
  */  
  /** Добавление процедуры в системную таблицу платформы - at_procuderes */
  public async addToATProcuderes(input: IATProceduresInput): Promise<number> {
    this._checkDisposed();

    if (!this._statements.addToATProcedures) {
      this._statements.addToATProcedures = await this.connection.prepare(this._transaction, `
        INSERT INTO AT_PROCEDURES (PROCEDURENAME)
        VALUES (:procedureName)
        RETURNING ID
      `);
    }
    const result = await this._statements.addToATProcedures.executeReturning({
      procedureName: input.procedureName
    });
    return result.getNumber("ID");
  }
  /** Удаление процедуры из системной таблицы платформы - at_procuderes */
  public async dropATProcuderes(input: IATProceduresInput): Promise<void> {
    this._checkDisposed();

    if (!this._statements.dropATProcedures) {
      this._statements.dropATProcedures = await this.connection.prepare(this._transaction, `
        DELETE FROM AT_PROCEDURES
        WHERE PROCEDURENAME = :procedureName
      `);
    }
    await this._statements.dropATProcedures.execute({
      procedureName: input.procedureName,
    });
  }

  public async getDependencies(tableName: string): Promise<IDependence[]> {
    this._checkDisposed();

    if (!this._statements.getDependencies) {
      this._statements.getDependencies = await this._connection.prepare(this._transaction, `
        SELECT T.RDB$TRIGGER_NAME as NAME, 'TRIGGER' as DEPTYPE
        FROM RDB$TRIGGERS T
        WHERE T.RDB$RELATION_NAME = :RELATION_NAME
          AND T.RDB$SYSTEM_FLAG = 0
        UNION
        SELECT rc.RDB$CONSTRAINT_NAME as NAME, 'CONSTRAINT' as DEPTYPE
        FROM RDB$RELATION_CONSTRAINTS rc
        WHERE rc.RDB$RELATION_NAME = :RELATION_NAME
        UNION
        SELECT i.RDB$INDEX_NAME as NAME, 'INDEX' as DEPTYPE
        FROM rdb$indices i
        WHERE i.RDB$RELATION_NAME = :RELATION_NAME
          AND i.RDB$SYSTEM_FLAG = 0
        UNION
        SELECT DISTINCT dep.RDB$DEPENDENT_NAME as NAME, 'PROCEDURE' as DEPTYPE
        FROM RDB$DEPENDENCIES dep
        WHERE dep.RDB$DEPENDED_ON_NAME = :RELATION_NAME
          AND (dep.RDB$DEPENDENT_NAME LIKE ('%_P_RESTR%')
          OR dep.RDB$DEPENDENT_NAME LIKE ('%_P_GCHC_%')
          OR dep.RDB$DEPENDENT_NAME LIKE ('%_P_CHLDCT_%')
          OR dep.RDB$DEPENDENT_NAME LIKE ('%_P_EXLIM_%')
          OR dep.RDB$DEPENDENT_NAME LIKE ('%_P_EXPANDLIMIT%')
          OR dep.RDB$DEPENDENT_NAME LIKE ('%_P_GETCHILDCOUNT%')
          OR dep.RDB$DEPENDENT_NAME LIKE ('%_P_EL_%'))
          AND dep.RDB$DEPENDENT_TYPE = 5
      `);
    }
    return await AStatement.executeQueryResultSet({
      statement: this._statements.getDependencies,
      params: {RELATION_NAME: tableName},
      callback: async (resultSet) => {
        const result: IDependence[] = [];
        while (await resultSet.next()) {
          result.push({name: await resultSet.getString('NAME'), type: await resultSet.getString('DEPTYPE')} )
        }
        return result
      }
    });
  }

  public async checkDependencies(arrDependencies: IDependence[], tableName: string): Promise<string[]> {
    this._checkDisposed();
    const dependenciesStr = `'${arrDependencies.map(dep => dep.name).join('\',\'')}'`;

    if (!this._statements.checkDependencies) {
      this._statements.checkDependencies = await this._connection.prepare(this._transaction, `
        SELECT dep.RDB$DEPENDENT_NAME
        FROM RDB$DEPENDENCIES dep
        WHERE dep.RDB$DEPENDED_ON_NAME = :RELATION_NAME
          AND dep.RDB$DEPENDENT_NAME NOT IN (${dependenciesStr})
      `);
    }
    return await AStatement.executeQueryResultSet({
      statement: this._statements.checkDependencies,
      params: { RELATION_NAME: tableName},
      callback: async (resultSet) => {
        const result: string[] = [];
        while (await resultSet.next()) {
          const name = await resultSet.getString('RDB$DEPENDENT_NAME');
         if (name) {
           result.push(name)
         }
        }
        return result
      }
    });
  }
  public async getFK(tableName: string, fieldName: string): Promise<string[]> {
    this._checkDisposed();
    if (!this._statements.getFK) {
      this._statements.getFK = await this._connection.prepare(this._transaction, `
        SELECT r.RDB$CONSTRAINT_NAME as NAME
        FROM RDB$RELATION_CONSTRAINTS r, RDB$INDEX_SEGMENTS i
        WHERE r.RDB$CONSTRAINT_NAME = i.RDB$INDEX_NAME
          AND r.RDB$RELATION_NAME = :TABLE_NAME
          AND i.RDB$FIELD_NAME = :FIELD_NAME        
      `);
    }
    return await AStatement.executeQueryResultSet({
      statement: this._statements.getFK,
      params: {TABLE_NAME: tableName, FIELD_NAME: fieldName},
      callback: async (resultSet) => {
        const result: string[] = [];
        while (await resultSet.next()) {
          result.push(await resultSet.getString('NAME'))
        }
        return result
      }
    });
  }

  private _checkDisposed(): void | never {
    if (this._disposed) {
      throw new Error("Already disposed");
    }
  }
}
