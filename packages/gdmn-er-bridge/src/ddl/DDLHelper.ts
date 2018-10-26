import {AConnection, AStatement, ATransaction, DeleteRule, IBaseExecuteOptions, UpdateRule} from "gdmn-db";

export interface IColumnsProps {
  notNull?: boolean;
  default?: string;
  check?: string;
}

export interface IFieldProps extends IColumnsProps {
  name: string;
  domain: string;
}

export interface IDomainProps extends IColumnsProps {
  type: string;
}

export interface IRelation {
  tableName: string;
  fieldName: string;
}

export interface IFKOptions {
  onUpdate: UpdateRule;
  onDelete: DeleteRule;
}

export type Sorting = "ASC" | "DESC";

export interface IExecuteDDlOptions<R> extends IBaseExecuteOptions<DDLHelper, R> {
  ddlHelper: DDLHelper;
}

interface IStatements {
  sequenceExists: AStatement;
  tableExists: AStatement;
  columnsExists: AStatement;
  constraintExists: AStatement;
  indexExists: AStatement;
  domainExists: AStatement;
  triggerExists: AStatement;
}

export class DDLHelper {

  public static DEFAULT_FK_OPTIONS: IFKOptions = {
    onUpdate: "NO ACTION",
    onDelete: "NO ACTION"
  };

  private readonly _connection: AConnection;
  private readonly _transaction: ATransaction;
  private readonly _defaultIgnoreExisting: boolean;

  private _statements?: IStatements;
  private _logs: string[] = [];

  constructor(connection: AConnection, transaction: ATransaction, defaultIgnoreExisting: boolean = false) {
    this._connection = connection;
    this._transaction = transaction;
    this._defaultIgnoreExisting = defaultIgnoreExisting;
  }

  get connection(): AConnection {
    return this._connection;
  }

  get transaction(): ATransaction {
    return this._transaction;
  }

  get logs(): string[] {
    return this._logs;
  }

  get disposed(): boolean {
    return !this._statements;
  }

  public static async executePrepare<R>({ddlHelper, callback}: IExecuteDDlOptions<R>): Promise<R> {
    try {
      await ddlHelper.prepare();
      return await callback(ddlHelper);
    } finally {
      console.debug(ddlHelper.logs.join("\n"));
      if (!ddlHelper.disposed) {
        await ddlHelper.dispose();
      }
    }
  }

  private static _getColumnProps(props: IColumnsProps): string {
    return (
      (props.default ? `DEFAULT ${props.default}` : " ").padEnd(40) +
      (props.notNull ? "NOT NULL" : " ").padEnd(10) +
      (props.check || "").padEnd(62)
    );
  }

  public async prepare(): Promise<void> {
    if (this._statements) {
      throw new Error("Already prepared");
    }
    this._statements = {
      sequenceExists: await this._connection.prepare(this._transaction, `
        SELECT FIRST 1 0
        FROM RDB$GENERATORS
        WHERE RDB$GENERATOR_NAME = :sequenceName
      `),
      tableExists: await this._connection.prepare(this._transaction, `
        SELECT FIRST 1 0
        FROM RDB$RELATIONS
        WHERE RDB$RELATION_NAME = :tableName
      `),
      columnsExists: await this._connection.prepare(this._transaction, `
        SELECT FIRST 1 0
        FROM RDB$RELATION_FIELDS rf
        WHERE rf.RDB$RELATION_NAME = :tableName and rf.RDB$FIELD_NAME = :fieldName
      `),
      constraintExists: await this._connection.prepare(this._transaction, `
        SELECT FIRST 1 0 
        FROM RDB$RELATION_CONSTRAINTS
        where RDB$CONSTRAINT_NAME = :constraintName
      `),
      indexExists: await this._connection.prepare(this._transaction, `
        SELECT FIRST 1 0
        FROM RDB$INDICES
        WHERE RDB$INDEX_NAME = :indexName
      `),
      domainExists: await this._connection.prepare(this._transaction, `
        SELECT FIRST 1 0
        FROM RDB$FIELDS
        WHERE RDB$FIELD_NAME = :domainName
      `),
      triggerExists: await this._connection.prepare(this._transaction, `
        SELECT FIRST 1 0
        FROM RDB$TRIGGERS
        WHERE RDB$TRIGGER_NAME = :triggerName
      `)
    };
  }

  public async dispose(): Promise<void> {
    if (!this._statements) {
      throw new Error("Should call prepare");
    }
    await this._statements.sequenceExists.dispose();
    await this._statements.tableExists.dispose();
    await this._statements.columnsExists.dispose();
    await this._statements.constraintExists.dispose();
    await this._statements.indexExists.dispose();
    await this._statements.domainExists.dispose();
    await this._statements.triggerExists.dispose();
    this._statements = undefined;
  }

  public async addSequence(sequenceName: string, ignoreExisting: boolean = this._defaultIgnoreExisting): Promise<void> {
    if (ignoreExisting && await this.isSequenceExists(sequenceName)) {
      return;
    }
    await this._loggedExecute(`CREATE SEQUENCE ${sequenceName}`);
    await this._loggedExecute(`ALTER SEQUENCE ${sequenceName} RESTART WITH 0`);
  }

  public async addTable(tableName: string,
                        scalarFields: IFieldProps[],
                        ignoreExisting: boolean = this._defaultIgnoreExisting): Promise<string> {
    if (ignoreExisting && await this.isTableExists(tableName)) {
      return tableName;
    }
    const fields = scalarFields.map((item) => (
      `${item.name.padEnd(31)} ${item.domain.padEnd(31)} ${DDLHelper._getColumnProps(item)}`.trim()
    ));
    await this._loggedExecute(`CREATE TABLE ${tableName} (\n  ` + fields.join(",\n  ") + `\n)`);
    return tableName;
  }

  public async addTableCheck(constraintName: string,
                             tableName: string,
                             check: string,
                             ignoreExisting: boolean = this._defaultIgnoreExisting): Promise<void> {
    if (ignoreExisting && await this.isTableExists(constraintName)) {
      return;
    }
    await this._loggedExecute(`ALTER TABLE ${tableName} ADD CONSTRAINT ${constraintName} CHECK (${check})`);
  }

  public async addColumns(tableName: string,
                          fields: IFieldProps[],
                          ignoreExisting: boolean = this._defaultIgnoreExisting): Promise<void> {
    for (const field of fields) {
      if (ignoreExisting && await this.isColumnExists(tableName, field.name)) {
        continue;
      }
      const column = field.name.padEnd(31) + " " + field.domain.padEnd(31);
      await this._loggedExecute(`ALTER TABLE ${tableName} ADD ${column} ${DDLHelper._getColumnProps(field)}`.trim());
    }
  }

  public async createIndex(indexName: string,
                           tableName: string,
                           type: Sorting,
                           fieldNames: string[],
                           ignoreExisting: boolean = this._defaultIgnoreExisting): Promise<string> {
    if (ignoreExisting && await this.isIndexExists(indexName)) {
      return indexName;
    }
    await this._loggedExecute(`CREATE ${type} INDEX ${indexName} ON ${tableName} (${fieldNames.join(", ")})`);
    return indexName;
  }

  public async addUnique(constraintName: string,
                         tableName: string,
                         fieldNames: string[],
                         ignoreExisting: boolean = this._defaultIgnoreExisting): Promise<string> {
    if (ignoreExisting && await this.isConstraintExists(constraintName)) {
      return constraintName;
    }
    const f = fieldNames.join(", ");
    await this._loggedExecute(`ALTER TABLE ${tableName} ADD CONSTRAINT ${constraintName} UNIQUE (${f})`);
    return constraintName;
  }

  public async addPrimaryKey(constraintName: string,
                             tableName: string,
                             fieldNames: string[],
                             ignoreExisting: boolean = this._defaultIgnoreExisting): Promise<string> {
    if (ignoreExisting && await this.isConstraintExists(constraintName)) {
      return constraintName;
    }
    const pk = fieldNames.join(", ");
    await this._loggedExecute(`ALTER TABLE ${tableName} ADD CONSTRAINT ${constraintName} PRIMARY KEY (${pk})`);
    return constraintName;
  }

  public async addForeignKey(constraintName: string,
                             from: IRelation,
                             to: IRelation,
                             options: IFKOptions = DDLHelper.DEFAULT_FK_OPTIONS,
                             ignoreExisting: boolean = this._defaultIgnoreExisting): Promise<string> {
    if (ignoreExisting && await this.isConstraintExists(constraintName)) {
      return constraintName;
    }
    await this._loggedExecute(
      `ALTER TABLE ${from.tableName} ADD CONSTRAINT ${constraintName} FOREIGN KEY (${from.fieldName}) ` +
      `REFERENCES ${to.tableName} (${to.fieldName}) ` +
      (options.onUpdate ? `ON UPDATE ${options.onUpdate} ` : "") +
      (options.onDelete ? `ON DELETE ${options.onDelete} ` : "")
    );
    return constraintName;
  }

  public async addDomain(domainName: string,
                         props: IDomainProps,
                         ignoreExisting: boolean = this._defaultIgnoreExisting): Promise<string> {
    if (ignoreExisting && await this.isDomainExists(domainName)) {
      return domainName;
    }
    await this._loggedExecute(`CREATE DOMAIN ${domainName.padEnd(31)} AS ${props.type.padEnd(31)}` +
      DDLHelper._getColumnProps(props));
    return domainName;
  }

  public async addAutoIncrementTrigger(triggerName: string,
                                       tableName: string,
                                       fieldName: string,
                                       sequenceName: string,
                                       ignoreExisting: boolean = this._defaultIgnoreExisting): Promise<string> {
    if (ignoreExisting && await this.isTriggerExists(triggerName)) {
      return triggerName;
    }
    await this._loggedExecute(`
      CREATE TRIGGER ${triggerName} FOR ${tableName}
        ACTIVE BEFORE INSERT POSITION 0
      AS
      BEGIN
        IF (NEW.${fieldName} IS NULL) THEN NEW.${fieldName} = NEXT VALUE FOR ${sequenceName};
      END
    `);
    return triggerName;
  }

  public async isSequenceExists(sequenceName: string): Promise<boolean> {
    return await AConnection.executeQueryResultSet({
      connection: this._connection,
      transaction: this._transaction,
      sql: `
        SELECT FIRST 1 0
        FROM RDB$GENERATORS
        WHERE RDB$GENERATOR_NAME = :sequenceName
      `,
      params: {sequenceName},
      callback: (resultSet) => resultSet.next()
    });
  }

  public async isTableExists(tableName: string): Promise<boolean> {
    if (!this._statements) {
      throw new Error("Should call prepare");
    }
    return await AStatement.executeQueryResultSet({
      statement: this._statements.tableExists,
      params: {tableName},
      callback: (resultSet) => resultSet.next()
    });
  }

  public async isColumnExists(tableName: string, fieldName: string): Promise<boolean> {
    if (!this._statements) {
      throw new Error("Should call prepare");
    }
    return await AStatement.executeQueryResultSet({
      statement: this._statements.columnsExists,
      params: {tableName, fieldName},
      callback: (resultSet) => resultSet.next()
    });
  }

  public async isConstraintExists(constraintName: string): Promise<boolean> {
    if (!this._statements) {
      throw new Error("Should call prepare");
    }
    return await AStatement.executeQueryResultSet({
      statement: this._statements.constraintExists,
      params: {constraintName},
      callback: (resultSet) => resultSet.next()
    });
  }

  public async isIndexExists(indexName: string): Promise<boolean> {
    if (!this._statements) {
      throw new Error("Should call prepare");
    }
    return await AStatement.executeQueryResultSet({
      statement: this._statements.indexExists,
      params: {indexName},
      callback: (resultSet) => resultSet.next()
    });
  }

  public async isDomainExists(domainName: string): Promise<boolean> {
    if (!this._statements) {
      throw new Error("Should call prepare");
    }
    return await AStatement.executeQueryResultSet({
      statement: this._statements.domainExists,
      params: {domainName},
      callback: (resultSet) => resultSet.next()
    });
  }

  public async isTriggerExists(triggerName: string): Promise<boolean> {
    if (!this._statements) {
      throw new Error("Should call prepare");
    }
    return await AStatement.executeQueryResultSet({
      statement: this._statements.triggerExists,
      params: {triggerName},
      callback: (resultSet) => resultSet.next()
    });
  }

  private async _loggedExecute(sql: string): Promise<void> {
    this._logs.push(sql);
    await this._connection.execute(this._transaction, sql);
  }
}
