import {AConnection, ATransaction, DeleteRule, UpdateRule} from "gdmn-db";
import {Prefix} from "../Prefix";
import {DDLUniqueGenerator} from "./DDLUniqueGenerator";

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

export class DDLHelper {

  public static DEFAULT_FK_OPTIONS: IFKOptions = {
    onUpdate: "NO ACTION",
    onDelete: "NO ACTION"
  };

  private readonly _connection: AConnection;
  private readonly _transaction: ATransaction;

  private _ddlUniqueGen = new DDLUniqueGenerator();

  private _logs: string[] = [];

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

  get logs(): string[] {
    return this._logs;
  }

  get prepared(): boolean {
    return this._ddlUniqueGen.prepared;
  }

  private static _getConstraint(constraintName?: string): string {
    return constraintName ? `CONSTRAINT ${constraintName}` : "";
  }

  private static _getColumnProps(props: IColumnsProps): string {
    return (
      (props.default ? `DEFAULT ${props.default}` : " ").padEnd(40) +
      (props.notNull ? "NOT NULL" : " ").padEnd(10) +
      (props.check || "").padEnd(62)
    );
  }

  public async prepare(): Promise<void> {
    await this._ddlUniqueGen.prepare(this._connection, this._transaction);
  }

  public async dispose(): Promise<void> {
    await this._ddlUniqueGen.dispose();
  }

  public async addSequence(sequenceName: string): Promise<void> {
    await this._loggedExecute(`CREATE SEQUENCE ${sequenceName}`);
    await this._loggedExecute(`ALTER SEQUENCE ${sequenceName} RESTART WITH 0`);
  }

  public async addTable(scalarFields: IFieldProps[]): Promise<string>
  public async addTable(tableName: string, scalarFields: IFieldProps[]): Promise<string>
  public async addTable(tableName: any, scalarFields?: IFieldProps[]): Promise<string> {
    if (!scalarFields) {
      scalarFields = tableName as IFieldProps[];
      tableName = undefined;
    }
    if (!tableName) {
      tableName = Prefix.join(`${await this._ddlUniqueGen.next()}`, Prefix.TABLE);
    }
    const fields = scalarFields.map((item) => (
      `${item.name.padEnd(31)} ${item.domain.padEnd(31)} ${DDLHelper._getColumnProps(item)}`.trim()
    ));
    await this._loggedExecute(`CREATE TABLE ${tableName} (\n  ` + fields.join(",\n  ") + `\n)`);
    return tableName;
  }

  public async addTableCheck(tableName: string, checks: string[]): Promise<void>
  public async addTableCheck(constraintName: string, tableName: string, checks: string[]): Promise<void>
  public async addTableCheck(constraintName: any, tableName: any, checks?: string[]): Promise<void> {
    if (!checks) {
      checks = tableName as string[];
      tableName = constraintName;
      constraintName = undefined;
    }
    for (const check of checks) {
      await this._loggedExecute(`ALTER TABLE ${tableName} ADD ${DDLHelper._getConstraint(constraintName)} CHECK (${check})`);
    }
  }

  public async addColumns(tableName: string, fields: IFieldProps[]): Promise<void> {
    for (const field of fields) {
      const column = field.name.padEnd(31) + " " + field.domain.padEnd(31);
      await this._loggedExecute(`ALTER TABLE ${tableName} ADD ${column} ${DDLHelper._getColumnProps(field)}`.trim());
    }
  }

  public async createIndex(tableName: string, type: Sorting, fieldNames: string[]): Promise<string>
  public async createIndex(indexName: string, tableName: string, type: Sorting, fieldNames: string[]): Promise<string>
  public async createIndex(indexName: any, tableName: any, type: any, fieldNames?: string[]): Promise<string> {
    if (!fieldNames) {
      fieldNames = type as string[];
      type = tableName;
      tableName = indexName;
      indexName = undefined;
    }
    if (!indexName) {
      indexName = Prefix.join(`${await this._ddlUniqueGen.next()}`, Prefix.INDEX);
    }
    await this._loggedExecute(`CREATE ${type} INDEX ${indexName} ON ${tableName} (${fieldNames.join(", ")})`);
    return indexName;
  }

  public async addUnique(tableName: string, fieldNames: string[]): Promise<string>;
  public async addUnique(constraintName: string, tableName: string, fieldNames: string[]): Promise<string>;
  public async addUnique(constraintName: any, tableName: any, fieldNames?: string[]): Promise<string> {
    if (!fieldNames) {
      fieldNames = tableName as string[];
      tableName = constraintName;
      constraintName = undefined;
    }
    if (!constraintName) {
      constraintName = Prefix.join(`${await this._ddlUniqueGen.next()}`, Prefix.UNIQUE);
    }
    const f = fieldNames.join(", ");
    await this._loggedExecute(`ALTER TABLE ${tableName} ADD ${DDLHelper._getConstraint(constraintName)} UNIQUE (${f})`);
    return constraintName;
  }

  public async addPrimaryKey(tableName: string, fieldNames: string[]): Promise<string>;
  public async addPrimaryKey(constraintName: string, tableName: string, fieldNames: string[]): Promise<string>;
  public async addPrimaryKey(constraintName: any, tableName: any, fieldNames?: string[]): Promise<string> {
    if (!fieldNames) {
      fieldNames = tableName as string[];
      tableName = constraintName;
      constraintName = undefined;
    }
    const pk = fieldNames.join(", ");
    await this._loggedExecute(`ALTER TABLE ${tableName} ADD ${DDLHelper._getConstraint(constraintName)} PRIMARY KEY (${pk})`);
    return constraintName;
  }

  public async addForeignKey(options: IFKOptions, from: IRelation, to: IRelation): Promise<string>;
  public async addForeignKey(constraintName: string, options: IFKOptions, from: IRelation, to: IRelation): Promise<string>;
  public async addForeignKey(constraintName: any, options: any, from: any, to?: IRelation): Promise<string> {
    if (!to) {
      to = from as IRelation;
      from = options;
      options = constraintName;
      constraintName = undefined;
    }
    const {tableName, fieldName} = from;
    await this._loggedExecute(
      `ALTER TABLE ${tableName} ADD ${DDLHelper._getConstraint(constraintName)} FOREIGN KEY (${fieldName}) ` +
      `REFERENCES ${to.tableName} (${to.fieldName}) ` +
      (options.onUpdate ? `ON UPDATE ${options.onUpdate} ` : "") +
      (options.onDelete ? `ON DELETE ${options.onDelete} ` : "")
    );
    return constraintName;
  }

  public async addDomain(props: IDomainProps): Promise<string>;
  public async addDomain(domainName: string, props: IDomainProps): Promise<string>;
  public async addDomain(domainName: any, props?: IDomainProps): Promise<string> {
    if (!props) {
      props = domainName as IDomainProps;
      domainName = undefined;
    }
    if (!domainName) {
      domainName = Prefix.join(`${await this._ddlUniqueGen.next()}`, Prefix.DOMAIN);
    }
    await this._loggedExecute(`CREATE DOMAIN ${domainName.padEnd(31)} AS ${props.type.padEnd(31)}` +
      DDLHelper._getColumnProps(props));
    return domainName;
  }

  public async addAutoIncrementTrigger(tableName: string, fieldName: string, sequenceName: string): Promise<string>;
  public async addAutoIncrementTrigger(triggerName: string, tableName: string, fieldName: string, sequenceName: string): Promise<string>;
  public async addAutoIncrementTrigger(triggerName: any, tableName: any, fieldName: any, sequenceName?: string): Promise<string> {
    if (!sequenceName) {
      sequenceName = fieldName;
      fieldName = tableName;
      tableName = triggerName;
      triggerName = undefined;
    }
    if (!triggerName) {
      triggerName = Prefix.join(`${await this._ddlUniqueGen.next()}`, Prefix.TRIGGER_BI);
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
