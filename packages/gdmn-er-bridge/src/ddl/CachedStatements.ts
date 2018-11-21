import {AConnection, AStatement, ATransaction} from "gdmn-db";
import {semCategories2Str, SemCategory} from "gdmn-nlp";
import {Constants} from "./Constants";

export interface IAddATFields {
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

export interface IAddATRelations {
  relationName: string;
  relationType?: "T" | "V";
  lName?: string;
  description?: string;
  entityName?: string;
  semCategory?: SemCategory[];
}

export interface IAddATRelationFields {
  fieldName: string;
  relationName: string;
  lName?: string;
  description?: string;
  fieldSource: string;
  fieldSourceKey: number;
  attrName?: string;
  masterEntityName?: string;
  semCategory?: SemCategory[];
  crossTable?: string;
  crossTableKey?: number;
  crossField?: string;
}

interface IStatements {
  sequenceExists?: AStatement;
  tableExists?: AStatement;
  columnsExists?: AStatement;
  constraintExists?: AStatement;
  indexExists?: AStatement;
  domainExists?: AStatement;
  triggerExists?: AStatement;

  ddlUniqueSequence?: AStatement;

  addToATFields?: AStatement;
  addToATRelations?: AStatement;
  addToATRelationField?: AStatement;
}

export class CachedStatements {

  private readonly _connection: AConnection;
  private readonly _transaction: ATransaction;

  private _disposed: boolean = false;
  private _statements: IStatements = {};

  constructor(connection: AConnection, transaction: ATransaction) {
    this._connection = connection;
    this._transaction = transaction;
  }

  get connection(): AConnection {
    return this._connection;
  }

  get transaction(): ATransaction {
    return this._transaction;
  }

  get disposed(): boolean {
    return this._disposed;
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

    if (!this._statements.columnsExists) {
      this._statements.columnsExists = await this._connection.prepare(this._transaction, `
        SELECT FIRST 1 0
        FROM RDB$RELATION_FIELDS rf
        WHERE rf.RDB$RELATION_NAME = :tableName
          and rf.RDB$FIELD_NAME = :fieldName
      `);
    }
    return await AStatement.executeQueryResultSet({
      statement: this._statements.columnsExists,
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

  public async addToATFields(input: IAddATFields): Promise<number> {
    this._checkDisposed();

    if (!this._statements.addToATFields) {
      this._statements.addToATFields = await this._connection.prepare(this._transaction, `
        INSERT INTO AT_FIELDS (FIELDNAME, LNAME, DESCRIPTION, REFTABLE, REFCONDITION, SETTABLE, SETLISTFIELD,
                               SETCONDITION, NUMERATION)
        VALUES (:fieldName, :lName, :description, :refTable, :refCondition, :setTable, :setListField,
                :setCondition, :numeration)
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

  public async addToATRelations(input: IAddATRelations): Promise<number> {
    this._checkDisposed();

    if (!this._statements.addToATRelations) {
      this._statements.addToATRelations = await this.connection.prepare(this._transaction, `
        INSERT INTO AT_RELATIONS (RELATIONNAME, RELATIONTYPE, LNAME, DESCRIPTION, SEMCATEGORY, ENTITYNAME)
        VALUES (:relationName, :relationType, :lName, :description, :semCategory, :entityName)
               RETURNING ID
      `);
    }
    const result = await this._statements.addToATRelations.executeReturning({
      relationName: input.relationName,
      relationType: input.relationType || "T",
      lName: input.lName || input.relationName,
      description: input.description,
      semCategory: semCategories2Str(input.semCategory || []),
      entityName: input.relationName !== input.entityName ? input.entityName : undefined
    });
    return result.getNumber("ID");
  }

  public async addToATRelationField(input: IAddATRelationFields): Promise<number> {
    this._checkDisposed();

    if (!this._statements.addToATRelationField) {
      this._statements.addToATRelationField = await this.connection.prepare(this._transaction, `
        INSERT INTO AT_RELATION_FIELDS (FIELDNAME, RELATIONNAME, LNAME, DESCRIPTION, FIELDSOURCE, FIELDSOURCEKEY,
                                        ATTRNAME, MASTERENTITYNAME, SEMCATEGORY, CROSSTABLE, CROSSTABLEKEY, CROSSFIELD)
        VALUES (:fieldName, :relationName, :lName, :description, :fieldSource, :fieldSourceKey,
                :attrName, :masterEntityName, :semCategory, :crossTable, :crossTableKey, :crossField)
               RETURNING ID
      `);
    }
    const result = await this._statements.addToATRelationField.executeReturning({
      fieldName: input.fieldName,
      relationName: input.relationName,
      lName: input.lName || input.fieldName,
      description: input.description,
      fieldSource: input.fieldSource,
      fieldSourceKey: input.fieldSourceKey,
      attrName: input.fieldName !== input.attrName ? input.attrName : undefined,
      masterEntityName: input.masterEntityName,
      semCategory: semCategories2Str(input.semCategory || []),
      crossTable: input.crossTable,
      crossTableKey: input.crossTableKey,
      crossField: input.crossField
    });
    return result.getNumber("ID");
  }

  private _checkDisposed(): void | never {
    if (this._disposed) {
      throw new Error("Already disposed");
    }
  }
}
