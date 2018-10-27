import {AConnection, ATransaction, DeleteRule, IBaseExecuteOptions, UpdateRule} from "gdmn-db";
import {CachedStatements} from "./CachedStatements";

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
  connection: AConnection;
  transaction: ATransaction;
  defaultIgnoreExisting?: boolean;
}

export class DDLHelper {

  public static DEFAULT_FK_OPTIONS: IFKOptions = {
    onUpdate: "NO ACTION",
    onDelete: "NO ACTION"
  };

  private readonly _connection: AConnection;
  private readonly _transaction: ATransaction;
  private readonly _cachedStatements: CachedStatements;
  private readonly _defaultIgnoreExisting: boolean;

  private _logs: string[] = [];

  constructor(connection: AConnection, transaction: ATransaction, defaultIgnoreExisting: boolean = false) {
    this._connection = connection;
    this._transaction = transaction;
    this._cachedStatements = new CachedStatements(connection, transaction);
    this._defaultIgnoreExisting = defaultIgnoreExisting;
  }

  get connection(): AConnection {
    return this._connection;
  }

  get transaction(): ATransaction {
    return this._transaction;
  }

  get cachedStatements(): CachedStatements {
    return this._cachedStatements;
  }

  get logs(): string[] {
    return this._logs;
  }

  get disposed(): boolean {
    return this._cachedStatements.disposed;
  }

  public static async executeSelf<R>(
    {connection, transaction, defaultIgnoreExisting, callback}: IExecuteDDlOptions<R>
  ): Promise<R> {
    const ddlHelper = new DDLHelper(connection, transaction, defaultIgnoreExisting);
    try {
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

  public async dispose(): Promise<void> {
    await this._cachedStatements.dispose();
  }

  public async addSequence(sequenceName: string, ignoreExisting: boolean = this._defaultIgnoreExisting): Promise<void> {
    if (ignoreExisting && await this._cachedStatements.isSequenceExists(sequenceName)) {
      return;
    }
    await this._loggedExecute(`CREATE SEQUENCE ${sequenceName}`);
    await this._loggedExecute(`ALTER SEQUENCE ${sequenceName} RESTART WITH 0`);
  }

  public async addTable(tableName: string,
                        scalarFields: IFieldProps[],
                        ignoreExisting: boolean = this._defaultIgnoreExisting): Promise<string> {
    if (ignoreExisting && await this._cachedStatements.isTableExists(tableName)) {
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
    if (ignoreExisting && await this._cachedStatements.isTableExists(constraintName)) {
      return;
    }
    await this._loggedExecute(`ALTER TABLE ${tableName} ADD CONSTRAINT ${constraintName} CHECK (${check})`);
  }

  public async addColumns(tableName: string,
                          fields: IFieldProps[],
                          ignoreExisting: boolean = this._defaultIgnoreExisting): Promise<void> {
    for (const field of fields) {
      if (ignoreExisting && await this._cachedStatements.isColumnExists(tableName, field.name)) {
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
    if (ignoreExisting && await this._cachedStatements.isIndexExists(indexName)) {
      return indexName;
    }
    await this._loggedExecute(`CREATE ${type} INDEX ${indexName} ON ${tableName} (${fieldNames.join(", ")})`);
    return indexName;
  }

  public async addUnique(constraintName: string,
                         tableName: string,
                         fieldNames: string[],
                         ignoreExisting: boolean = this._defaultIgnoreExisting): Promise<string> {
    if (ignoreExisting && await this._cachedStatements.isConstraintExists(constraintName)) {
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
    if (ignoreExisting && await this._cachedStatements.isConstraintExists(constraintName)) {
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
    if (ignoreExisting && await this._cachedStatements.isConstraintExists(constraintName)) {
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
    if (ignoreExisting && await this._cachedStatements.isDomainExists(domainName)) {
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
    if (ignoreExisting && await this._cachedStatements.isTriggerExists(triggerName)) {
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

  private async _loggedExecute(sql: string): Promise<void> {
    this._logs.push(sql);
    await this._connection.execute(this._transaction, sql);
  }
}
