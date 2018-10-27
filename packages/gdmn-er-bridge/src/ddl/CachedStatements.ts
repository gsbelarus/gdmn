import {AConnection, AStatement, ATransaction} from "gdmn-db";
import {Constants} from "./Constants";

interface IStatements {
  sequenceExists?: AStatement;
  tableExists?: AStatement;
  columnsExists?: AStatement;
  constraintExists?: AStatement;
  indexExists?: AStatement;
  domainExists?: AStatement;
  triggerExists?: AStatement;

  ddlUniqueSequence?: AStatement;
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
        WHERE rf.RDB$RELATION_NAME = :tableName and rf.RDB$FIELD_NAME = :fieldName
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
        where RDB$CONSTRAINT_NAME = :constraintName
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

  private _checkDisposed(): void | never {
    if (this._disposed) {
      throw new Error("Already disposed");
    }
  }
}
