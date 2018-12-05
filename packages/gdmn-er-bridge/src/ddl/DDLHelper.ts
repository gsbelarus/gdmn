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
  ignoreAT?: boolean;
  defaultIgnore?: boolean;
}

export class DDLHelper {

  public static DEFAULT_FK_OPTIONS: IFKOptions = {
    onUpdate: "NO ACTION",
    onDelete: "NO ACTION"
  };

  private readonly _connection: AConnection;
  private readonly _transaction: ATransaction;
  private readonly _cachedStatements: CachedStatements;

  private readonly _ignoreAT: boolean;
  private readonly _defaultIgnore: boolean;

  private _logs: string[] = [];

  constructor(connection: AConnection,
              transaction: ATransaction,
              ignoreAT: boolean = false,
              defaultIgnore: boolean = false) {
    this._connection = connection;
    this._transaction = transaction;
    this._cachedStatements = new CachedStatements(connection, transaction);
    this._ignoreAT = ignoreAT;
    this._defaultIgnore = defaultIgnore;
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
    {connection, transaction, ignoreAT, defaultIgnore, callback}: IExecuteDDlOptions<R>
  ): Promise<R> {
    const ddlHelper = new DDLHelper(connection, transaction, ignoreAT, defaultIgnore);
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

  public async addSequence(sequenceName: string, ignore: boolean = this._defaultIgnore): Promise<void> {
    if (ignore && await this._cachedStatements.isSequenceExists(sequenceName)) {
      return;
    }
    await this._loggedExecute(`CREATE SEQUENCE ${sequenceName}`);
    await this._loggedExecute(`ALTER SEQUENCE ${sequenceName} RESTART WITH 0`);
  }

  public async dropSequence(sequenceName: string, ignore: boolean = this._defaultIgnore): Promise<void> {
    if (ignore && !(await this._cachedStatements.isSequenceExists(sequenceName))) {
      return;
    }
    await this._loggedExecute(`DROP SEQUENCE ${sequenceName}`);
  }

  public async addTable(tableName: string,
                        scalarFields: IFieldProps[],
                        ignoreAT: boolean = this._ignoreAT,
                        ignore: boolean = this._defaultIgnore): Promise<string> {
    if (ignore && await this._cachedStatements.isTableExists(tableName)) {
      return tableName;
    }
    const fields = scalarFields.map((item) => (
      `${item.name.padEnd(31)} ${item.domain.padEnd(31)} ${DDLHelper._getColumnProps(item)}`.trim()
    ));
    await this._loggedExecute(`CREATE TABLE ${tableName} (\n  ` + fields.join(",\n  ") + `\n)`);
    if (!ignoreAT) {
      await this._cachedStatements.addToATRelations({relationName: tableName});
      for (const field of scalarFields) {
        await this._cachedStatements.addToATRelationField({
          fieldName: field.name,
          relationName: tableName,
          fieldSource: field.domain
        });
      }
    }
    return tableName;
  }

  public async dropTable(tableName: string,
                         ignoreAT: boolean = this._ignoreAT,
                         ignore: boolean = this._defaultIgnore): Promise<void> {
    if (ignore
      && !(await this._cachedStatements.isTableExists(tableName))) {
      return;
    }
    await this._loggedExecute(`DROP TABLE ${tableName}`);

    if (!ignoreAT) {
      await this._cachedStatements.dropATRelations({relationName: tableName});
    }
  }

  public async addTableCheck(constraintName: string,
                             tableName: string,
                             check: string,
                             ignore: boolean = this._defaultIgnore): Promise<void> {
    if (ignore && (await this._cachedStatements.isTableExists(tableName)
      || await this._cachedStatements.isConstraintExists(constraintName))) {
      return;
    }
    await this._loggedExecute(`ALTER TABLE ${tableName} ADD CONSTRAINT ${constraintName} CHECK (${check})`);
  }

  public async addColumns(tableName: string,
                          fields: IFieldProps[],
                          ignoreAT: boolean = this._ignoreAT,
                          ignore: boolean = this._defaultIgnore): Promise<void> {
    for (const field of fields) {
      if (ignore && await this._cachedStatements.isColumnExists(tableName, field.name)) {
        continue;
      }
      const column = field.name.padEnd(31) + " " + field.domain.padEnd(31);
      await this._loggedExecute(`ALTER TABLE ${tableName} ADD ${column} ${DDLHelper._getColumnProps(field)}`.trim());

      if (!ignoreAT) {
        await this._cachedStatements.addToATRelationField({
          fieldName: field.name,
          relationName: tableName,
          fieldSource: field.domain
        });
      }
    }
  }

  public async dropColumns(tableName: string,
                           fieldNames: string[],
                           ignoreAT: boolean = this._ignoreAT,
                           ignore: boolean = this._defaultIgnore): Promise<void> {
    for (const field of fieldNames) {
      if (ignore && !(await this._cachedStatements.isColumnExists(tableName, field))) {
        return;
      }
      await this._loggedExecute(`ALTER TABLE ${tableName} DROP ${field}`);

      if (!ignoreAT) {
        await this._cachedStatements.dropATRelationField(field);
      }
    }
  }

  public async createIndex(indexName: string,
                           tableName: string,
                           type: Sorting,
                           fieldNames: string[],
                           ignore: boolean = this._defaultIgnore): Promise<string> {
    if (ignore && await this._cachedStatements.isIndexExists(indexName)) {
      return indexName;
    }
    await this._loggedExecute(`CREATE ${type} INDEX ${indexName} ON ${tableName} (${fieldNames.join(", ")})`);
    return indexName;
  }

  public async dropIndex(indexName: string,
                         ignore: boolean = this._defaultIgnore): Promise<void> {

    if (ignore && !(await this._cachedStatements.isIndexExists(indexName))) {
      return;
    }
    await this._loggedExecute(`DROP INDEX ${indexName}`);

  }

  public async addUnique(constraintName: string,
                         tableName: string,
                         fieldNames: string[],
                         ignore: boolean = this._defaultIgnore): Promise<string> {
    if (ignore && await this._cachedStatements.isConstraintExists(constraintName)) {
      return constraintName;
    }
    const f = fieldNames.join(", ");
    await this._loggedExecute(`ALTER TABLE ${tableName} ADD CONSTRAINT ${constraintName} UNIQUE (${f})`);
    return constraintName;
  }

  public async addPrimaryKey(constraintName: string,
                             tableName: string,
                             fieldNames: string[],
                             ignore: boolean = this._defaultIgnore): Promise<string> {
    if (ignore && await this._cachedStatements.isConstraintExists(constraintName)) {
      return constraintName;
    }
    const pk = fieldNames.join(", ");
    await this._loggedExecute(`ALTER TABLE ${tableName} ADD CONSTRAINT ${constraintName} PRIMARY KEY (${pk})`);
    return constraintName;
  }

  public async dropConstraint(constraintName: string,
                              tableName: string,
                              ignore: boolean = this._defaultIgnore): Promise<void> {
    if (ignore && !(await this._cachedStatements.isConstraintExists(constraintName))) {
      return;
    }
    await this._loggedExecute(`ALTER TABLE ${tableName} DROP CONSTRAINT ${constraintName}`);
  }

  public async addForeignKey(constraintName: string,
                             from: IRelation,
                             to: IRelation,
                             options: IFKOptions = DDLHelper.DEFAULT_FK_OPTIONS,
                             ignore: boolean = this._defaultIgnore): Promise<string> {
    if (ignore && await this._cachedStatements.isConstraintExists(constraintName)) {
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
                         ignoreAT: boolean = this._ignoreAT,
                         ignore: boolean = this._defaultIgnore): Promise<string> {
    if (ignore && await this._cachedStatements.isDomainExists(domainName)) {
      return domainName;
    }
    await this._loggedExecute(`CREATE DOMAIN ${domainName.padEnd(31)} AS ${props.type.padEnd(31)}` +
      DDLHelper._getColumnProps(props));

    if (!ignoreAT) {
      await this._cachedStatements.addToATFields({fieldName: domainName});
    }
    return domainName;
  }

  public async dropDomain(domainName: string,
                          ignoreAT: boolean = this._ignoreAT,
                          ignore: boolean = this._defaultIgnore): Promise<void> {
    if (ignore && !(await this._cachedStatements.isDomainExists(domainName))) {
      return;
    }
    await this._loggedExecute(`DROP DOMAIN ${domainName}`);

    if (!ignoreAT) {
      await this._cachedStatements.dropATFields({fieldName: domainName});
    }
  }

  public async addAutoIncrementTrigger(triggerName: string,
                                       tableName: string,
                                       fieldName: string,
                                       sequenceName: string,
                                       ignore: boolean = this._defaultIgnore): Promise<string> {
    if (ignore && await this._cachedStatements.isTriggerExists(triggerName)) {
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

  public async dropAutoIncrementTrigger(triggerName: string,
                                        ignore: boolean = this._defaultIgnore): Promise<void> {
    if (ignore && !(await this._cachedStatements.isTriggerExists(triggerName))) {
      return;
    }
    await this._loggedExecute(`DROP TRIGGER ${triggerName}`);
  }

  private async _loggedExecute(sql: string): Promise<void> {
    this._logs.push(sql);
    await this._connection.execute(this._transaction, sql);
  }
}
