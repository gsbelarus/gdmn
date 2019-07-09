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

interface IStatements {
  sequenceExists?: AStatement;
  tableExists?: AStatement;
  columnExists?: AStatement;
  constraintExists?: AStatement;
  indexExists?: AStatement;
  domainExists?: AStatement;
  triggerExists?: AStatement;

  ddlUniqueSequence?: AStatement;

  tableATExists?: AStatement;
  columnATExists?: AStatement;
  generatorATExists?: AStatement;
  indexATExists?: AStatement;
  domainATExists?: AStatement;
  triggerATExists?: AStatement;

  addToATFields?: AStatement;
  addToATRelations?: AStatement;
  addToATRelationField?: AStatement;
  addToATTriggers?: AStatement;
  addToATGenerator?: AStatement;
  addToATIndices?: AStatement;

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
    const numeration = (input.numeration || []).map(({key, value}) => `${key}=${value}`).join("#13#10");
    const result = await this._statements.addToATFields.executeReturning({
      fieldName: input.fieldName,
      lName: input.lName || input.fieldName,
      description: input.description,
      refTable: input.refTable,
      refCondition: input.refCondition,
      setTable: input.setTable,
      setListField: input.setListField,
      setCondition: input.setCondition,
      numeration: numeration.length ? Buffer.from(numeration) : undefined
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
        SET LNAME        = :lName,
            DESCRIPTION  = :description,
            REFTABLE     = :refTable,
            REFCONDITION = :refCondition,
            SETTABLE     = :setTable,
            SETLISTFIELD = :setListField,
            SETCONDITION = :setCondition,
            NUMERATION   = :numeration
        WHERE FIELDNAME = :fieldName
          RETURNING ID
      `);
    }
    const numeration = (input.numeration || []).map(({key, value}) => `${key}=${value}`).join("#13#10");
    const result = await this._statements.updateATFields.executeReturning({
      fieldName: input.fieldName,
      lName: input.lName || input.fieldName,
      description: input.description,
      refTable: input.refTable,
      refCondition: input.refCondition,
      setTable: input.setTable,
      setListField: input.setListField,
      setCondition: input.setCondition,
      numeration: numeration.length ? Buffer.from(numeration) : undefined
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
        INSERT INTO AT_INDICES (INDEXNAME, RELATIONNAME, INDEX_INACTIVE, FIELDLIST, RELATIONKEY, UNIQUE_FLAG)
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

  public async getDomainName(input: IATIndicesInput): Promise<string>{
    this._checkDisposed();

    if (!this._statements.getDomainName) {
      this._statements.getDomainName = await this.connection.prepare(this._transaction, `        
        SELECT FIELDSOURCE
        FROM AT_RELATION_FIELDS
        WHERE RELATIONNAME = :relationName 
             AND FIELDNAME = :fieldName 
      `);
    }
    const result = await this._statements.getDomainName.executeReturning({
      relationName: input.relationName,
      fieldName: input.indexName,
    });
    return result.getString("FIELDSOURCE");
  }

  private _checkDisposed(): void | never {
    if (this._disposed) {
      throw new Error("Already disposed");
    }
  }
}
