import {AConnection, ATransaction, DeleteRule, IBaseExecuteOptions, UpdateRule} from "gdmn-db";
import {CachedStatements} from "./CachedStatements";
import { Constants } from "./Constants";
import { ddlUtils } from "./utils";
import {Prefix} from "./Prefix";

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

export interface IIndexOptions {
  sortType?: "ASC" | "DESC";
  unique?: boolean;
}

export interface IExecuteDDlOptions<R> extends IBaseExecuteOptions<DDLHelper, R> {
  connection: AConnection;
  transaction: ATransaction;
  skipAT?: boolean;
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

  private readonly _skipAT: boolean;
  private readonly _defaultIgnore: boolean;

  private _logs: string[] = [];

  constructor(connection: AConnection,
              transaction: ATransaction,
              skipAT: boolean = false,
              defaultIgnore: boolean = false) {
    this._connection = connection;
    this._transaction = transaction;
    this._cachedStatements = new CachedStatements(connection, transaction);
    this._skipAT = skipAT;
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
    {connection, transaction, skipAT, defaultIgnore, callback}: IExecuteDDlOptions<R>
  ): Promise<R> {
    const ddlHelper = new DDLHelper(connection, transaction, skipAT, defaultIgnore);
    try {
      return await callback(ddlHelper);
    } finally {
      const logs = ddlHelper.logs.join("\n");
      if (logs) {
        console.debug(logs);
      }
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

  public async addSequence(sequenceName: string,
                           skipAT: boolean = this._skipAT,
                           ignore: boolean = this._defaultIgnore): Promise<void> {
    if (!(ignore && await this._cachedStatements.isSequenceExists(sequenceName))) {
      await this._loggedExecute(`CREATE SEQUENCE ${sequenceName}`);
      await this._loggedExecute(`ALTER SEQUENCE ${sequenceName} RESTART WITH 0`);
      await this._transaction.commitRetaining();
    }

    if (!skipAT && !(ignore && await this._cachedStatements.isGeneratorATExists(sequenceName))) {
      await this._cachedStatements.addToATGenerator({generatorName: sequenceName});
    }
  }

  public async dropSequence(sequenceName: string, ignore: boolean = this._defaultIgnore): Promise<void> {
    if (ignore && !(await this._cachedStatements.isSequenceExists(sequenceName))) {
      return;
    }
    await this._loggedExecute(`DROP SEQUENCE ${sequenceName}`);
    await this._transaction.commitRetaining();
    // TODO remove from AT
  }

  public async addTable(tableName: string,
                        scalarFields: IFieldProps[],
                        skipAT: boolean = this._skipAT,
                        ignore: boolean = this._defaultIgnore): Promise<string> {
    if (!(ignore && await this._cachedStatements.isTableExists(tableName))) {
      const fields = scalarFields.map((item) => (
        `${item.name.padEnd(31)} ${item.domain.padEnd(31)} ${DDLHelper._getColumnProps(item)}`.trim()
      ));
      await this._loggedExecute(`CREATE TABLE ${tableName} (\n  ` + fields.join(",\n  ") + `\n)`);
      await this._transaction.commitRetaining();
    }

    if (!skipAT && !(ignore && await this._cachedStatements.isTableATExists(tableName))) {
      await this._cachedStatements.addToATRelations({relationName: tableName});
      for (const field of scalarFields) {
        if (!(ignore && await this._cachedStatements.isColumnATExists(tableName, field.name))) {
          await this._cachedStatements.addToATRelationField({
            fieldName: field.name,
            relationName: tableName,
            fieldSource: field.domain
          });
        }
      }
    }
    return tableName;
  }

  public async dropTable(tableName: string,
                         skipAT: boolean = this._skipAT,
                         ignore: boolean = this._defaultIgnore): Promise<void> {
    if (ignore && !(await this._cachedStatements.isTableExists(tableName))) {
      return;
    }
    await this._loggedExecute(`DROP TABLE ${tableName}`);
    await this._transaction.commitRetaining();

    if (!skipAT && !(ignore && !(await this._cachedStatements.isTableATExists(tableName)))) {
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
    await this._transaction.commitRetaining();
  }

  public async addColumns(tableName: string,
                          fields: IFieldProps[],
                          skipAT: boolean = this._skipAT,
                          ignore: boolean = this._defaultIgnore): Promise<void> {
    for (const field of fields) {
      if (!(ignore && await this._cachedStatements.isColumnExists(tableName, field.name))) {
        const column = field.name.padEnd(31) + " " + field.domain.padEnd(31);
        await this._loggedExecute(`ALTER TABLE ${tableName} ADD ${column} ${DDLHelper._getColumnProps(field)}`.trim());
      }
    }
    await this._transaction.commitRetaining();

    if (!skipAT) {
      for (const field of fields) {
        if (!(ignore && await this._cachedStatements.isColumnATExists(tableName, field.name))) {
          await this._cachedStatements.addToATRelationField({
            fieldName: field.name,
            relationName: tableName,
            fieldSource: field.domain
          });
        }
      }
    }
  }

  public async dropColumns(tableName: string,
                           fieldNames: string[],
                           skipAT: boolean = this._skipAT,
                           ignore: boolean = this._defaultIgnore): Promise<void> {
    for (const fieldName of fieldNames) {
      if (!(ignore && !(await this._cachedStatements.isColumnExists(tableName, fieldName)))) {
        await this._loggedExecute(`ALTER TABLE ${tableName} DROP ${fieldName}`);
      }
    }
    await this._transaction.commitRetaining();

    if (!skipAT) {
      for (const fieldName of fieldNames) {
        if (!(ignore && !(await this._cachedStatements.isColumnATExists(tableName, fieldName)))) {
          await this._cachedStatements.dropATRelationField(fieldName);
        }
      }
    }
  }

  public async createIndex(indexName: string,
                           tableName: string,
                           fieldNames: string[],
                           options: IIndexOptions = {},
                           skipAT: boolean = this._skipAT,
                           ignore: boolean = this._defaultIgnore): Promise<string> {
    if (!(ignore && await this._cachedStatements.isIndexExists(indexName))) {
      const sortType = options.sortType || "";
      const unique = options.unique ? "UNIQUE" : "";
      const opt = `${unique} ${sortType}`.trim();
      await this._loggedExecute(`CREATE ${opt} INDEX ${indexName} ON ${tableName} (${fieldNames.join(", ")})`);
      await this._transaction.commitRetaining();
    }

    if (!skipAT && !(ignore && await this._cachedStatements.isIndexATExists(indexName))) {
      await this._cachedStatements.addToATIndices({indexName: indexName, relationName: tableName});
    }
    return indexName;
  }

  public async dropIndex(indexName: string,
                         skipAT: boolean = this._skipAT,
                         ignore: boolean = this._defaultIgnore): Promise<void> {

    if (!(ignore && !(await this._cachedStatements.isIndexExists(indexName)))) {
      await this._loggedExecute(`DROP INDEX ${indexName}`);
      await this._transaction.commitRetaining();
    }

    if (!skipAT && !(ignore && !(await this._cachedStatements.isIndexATExists(indexName)))) {
      await this._cachedStatements.dropATIndices({indexName: indexName});
    }
  }

  public async addUnique(constraintName: string,
                         tableName: string,
                         fieldNames: string[],
                         ignore: boolean = this._defaultIgnore): Promise<string> {
    if (!(ignore && await this._cachedStatements.isConstraintExists(constraintName))) {
      const f = fieldNames.join(", ");
      await this._loggedExecute(`ALTER TABLE ${tableName} ADD CONSTRAINT ${constraintName} UNIQUE (${f})`);
      await this._transaction.commitRetaining();
    }

    return constraintName;
  }

  public async addPrimaryKey(constraintName: string,
                             tableName: string,
                             fieldNames: string[],
                             ignore: boolean = this._defaultIgnore): Promise<string> {
    if (!(ignore && await this._cachedStatements.isConstraintExists(constraintName))) {
      const pk = fieldNames.join(", ");
      await this._loggedExecute(`ALTER TABLE ${tableName} ADD CONSTRAINT ${constraintName} PRIMARY KEY (${pk})`);
      await this._transaction.commitRetaining();
    }

    return constraintName;
  }

  public async dropConstraint(constraintName: string,
                              tableName: string,
                              ignore: boolean = this._defaultIgnore): Promise<void> {
    if (!(ignore && !(await this._cachedStatements.isConstraintExists(constraintName)))) {
      await this._loggedExecute(`ALTER TABLE ${tableName} DROP CONSTRAINT ${constraintName}`);
      await this._transaction.commitRetaining();
    }
  }

  public async addForeignKey(constraintName: string,
                             from: IRelation,
                             to: IRelation,
                             options: IFKOptions = DDLHelper.DEFAULT_FK_OPTIONS,
                             ignore: boolean = this._defaultIgnore): Promise<string> {
    if (!(ignore && await this._cachedStatements.isConstraintExists(constraintName))) {
      await this._loggedExecute(
        `ALTER TABLE ${from.tableName} ADD CONSTRAINT ${constraintName} FOREIGN KEY (${from.fieldName}) ` +
        `REFERENCES ${to.tableName} (${to.fieldName}) ` +
        (options.onUpdate ? `ON UPDATE ${options.onUpdate} ` : "") +
        (options.onDelete ? `ON DELETE ${options.onDelete} ` : "")
      );
      await this._transaction.commitRetaining();
    }

    return constraintName;
  }

  public async addDomain(domainName: string,
                         props: IDomainProps,
                         skipAT: boolean = this._skipAT,
                         ignore: boolean = this._defaultIgnore): Promise<string> {
    if (!(ignore && await this._cachedStatements.isDomainExists(domainName))) {
      await this._loggedExecute(`CREATE DOMAIN ${domainName.padEnd(31)} AS ${props.type.padEnd(31)}` +
        DDLHelper._getColumnProps(props));
      await this._transaction.commitRetaining();
    }

    if (!skipAT && !(ignore && await this._cachedStatements.isDomainATExists(domainName))) {
      await this._cachedStatements.addToATFields({fieldName: domainName});
    }
    return domainName;
  }

  public async dropDomain(domainName: string,
                          skipAT: boolean = this._skipAT,
                          ignore: boolean = this._defaultIgnore): Promise<void> {
    if (!(ignore && !(await this._cachedStatements.isDomainExists(domainName)))) {
      await this._loggedExecute(`DROP DOMAIN ${domainName}`);
      await this._transaction.commitRetaining();
    }

    if (!skipAT && !(ignore && !(await this._cachedStatements.isDomainATExists(domainName)))) {
      await this._cachedStatements.dropATFields({fieldName: domainName});
    }
  }

  public async addAutoIncrementTrigger(triggerName: string,
                                       tableName: string,
                                       fieldName: string,
                                       sequenceName: string,
                                       skipAT: boolean = this._skipAT,
                                       ignore: boolean = this._defaultIgnore): Promise<string> {
    if (!(ignore && await this._cachedStatements.isTriggerExists(triggerName))) {
      await this._loggedExecute(`
      CREATE TRIGGER ${triggerName} FOR ${tableName}
        ACTIVE BEFORE INSERT POSITION 0
      AS
      BEGIN
        IF (NEW.${fieldName} IS NULL) THEN NEW.${fieldName} = NEXT VALUE FOR ${sequenceName};
      END
    `);
      await this._transaction.commitRetaining();
    }

    if (!skipAT && !(ignore && await this._cachedStatements.isTriggerATExists(triggerName))) {
      await this._cachedStatements.addToATTriggers({relationName: tableName, triggerName: triggerName});
    }
    return triggerName;
  }
  
   /** Добавление BI триггера для поля EDITIONDATE */
  public async addBIeditionDateTrigger( tableName: string,
                                        skipAT: boolean = this._skipAT,
                                        ignore: boolean = this._defaultIgnore): Promise<string> {
    const triggerName = `${Constants.DEFAULT_USR_PREFIX}${Prefix.triggerBeforeInsert(ddlUtils.stripUserPrefix(tableName))}5`;
    if (!(ignore && await this._cachedStatements.isTriggerExists(triggerName))) {
      await this._loggedExecute(`
      CREATE TRIGGER ${triggerName} FOR ${tableName}
      ACTIVE BEFORE INSERT POSITION 5
      AS
        BEGIN
          IF (NEW.${Constants.DEFAULT_EDITIONDATE_NAME} IS NULL) THEN NEW.${Constants.DEFAULT_EDITIONDATE_NAME} = CURRENT_TIMESTAMP(0);
        END
      `);
      await this._transaction.commitRetaining();
    }

    if (!skipAT && !(ignore && await this._cachedStatements.isTriggerATExists(triggerName))) {
      await this._cachedStatements.addToATTriggers({relationName: tableName, triggerName: triggerName});
    }
    return triggerName;
  }

   /** Добавление BU триггера для поля EDITIONDATE */
  public async addBUeditionDateTrigger( tableName: string,
                                        skipAT: boolean = this._skipAT,
                                        ignore: boolean = this._defaultIgnore): Promise<string> {
    const triggerName = `${Constants.DEFAULT_USR_PREFIX}BU_${ddlUtils.stripUserPrefix(tableName)}5`;
    if (!(ignore && await this._cachedStatements.isTriggerExists(triggerName))) {
      await this._loggedExecute(`
      CREATE TRIGGER ${triggerName} FOR ${tableName}
      ACTIVE BEFORE UPDATE POSITION 5
      AS
      BEGIN
        IF (NEW.${Constants.DEFAULT_EDITIONDATE_NAME} IS NULL) THEN NEW.${Constants.DEFAULT_EDITIONDATE_NAME} = CURRENT_TIMESTAMP(0);
      END
      `);
      await this._transaction.commitRetaining();
    }

    if (!skipAT && !(ignore && await this._cachedStatements.isTriggerATExists(triggerName))) {
      await this._cachedStatements.addToATTriggers({relationName: tableName, triggerName: triggerName});
    }
    return triggerName;
  }

   /** Добавление BI триггера для поля EDITIONDATE и EDITORKEY */
   public async addBIeditionDateEditorKeyTrigger( tableName: string,
                                                  skipAT: boolean = this._skipAT,
                                                  ignore: boolean = this._defaultIgnore): Promise<string> {
    const triggerName = `${Constants.DEFAULT_USR_PREFIX}${Prefix.triggerBeforeInsert(ddlUtils.stripUserPrefix(tableName))}5`;
    if (!(ignore && await this._cachedStatements.isTriggerExists(triggerName))) {
      await this._loggedExecute(`
        CREATE TRIGGER ${triggerName} FOR ${tableName}
        ACTIVE BEFORE INSERT POSITION 5
        AS
        BEGIN
        IF (NEW.${Constants.DEFAULT_EDITORKEY_NAME} IS NULL) THEN 
          NEW.${Constants.DEFAULT_EDITORKEY_NAME} = RDB$GET_CONTEXT('USER_SESSION', 'GD_CONTACTKEY');
        IF (NEW.${Constants.DEFAULT_EDITIONDATE_NAME} IS NULL) THEN NEW.${Constants.DEFAULT_EDITIONDATE_NAME} = CURRENT_TIMESTAMP(0);
        END
        `);
      await this._transaction.commitRetaining();
      }

    if (!skipAT && !(ignore && await this._cachedStatements.isTriggerATExists(triggerName))) {
      await this._cachedStatements.addToATTriggers({relationName: tableName, triggerName: triggerName});
    }
    return triggerName;
  }

/** Добавление BU триггера для поля EDITIONDATE  и EDITORKEY */
public async addBUeditionDateEditorKeyTrigger( tableName: string,
                                                skipAT: boolean = this._skipAT,
                                                ignore: boolean = this._defaultIgnore): Promise<string> {
    const triggerName = `${Constants.DEFAULT_USR_PREFIX}BU_${ddlUtils.stripUserPrefix(tableName)}5`;
    if (!(ignore && await this._cachedStatements.isTriggerExists(triggerName))) {
      await this._loggedExecute(`
        CREATE TRIGGER ${triggerName} FOR ${tableName}
        ACTIVE BEFORE UPDATE POSITION 5
        AS
        BEGIN
        IF (NEW.${Constants.DEFAULT_EDITORKEY_NAME} IS NULL) THEN 
          NEW.${Constants.DEFAULT_EDITORKEY_NAME} = RDB$GET_CONTEXT('USER_SESSION', 'GD_CONTACTKEY');
        IF (NEW.${Constants.DEFAULT_EDITIONDATE_NAME} IS NULL) THEN NEW.${Constants.DEFAULT_EDITIONDATE_NAME} = CURRENT_TIMESTAMP(0);
        END
        `);
      await this._transaction.commitRetaining();
      }

    if (!skipAT && !(ignore && await this._cachedStatements.isTriggerATExists(triggerName))) {
      await this._cachedStatements.addToATTriggers({relationName: tableName, triggerName: triggerName});
    }
    return triggerName;
  }

  public async addBICrossTrigger(tableName: string,
                                fieldName: string,
                                setTable: string,
                                crossField: string,
                                relationName: string,
                                ownPKName: string,
                                refPKName: string,
                                presLen: number,
                                position: string,
                                tablePk: string,
                                setTablePk: string,
                                skipAT: boolean = this._skipAT,
                                ignore: boolean = this._defaultIgnore): Promise<string> {
    const triggerName = `${Constants.DEFAULT_USR_PREFIX}${Prefix.triggerBeforeInsert(relationName)}`;
    if (!(ignore && await this._cachedStatements.isTriggerExists(triggerName))) {
      await this._loggedExecute(`
      CREATE TRIGGER ${triggerName} FOR ${tableName}
      ACTIVE BEFORE UPDATE POSITION ${position}
      AS
        DECLARE VARIABLE attr VARCHAR(8192); 
        DECLARE VARIABLE text VARCHAR(8192) = ''; 
      BEGIN
      FOR 
        SELECT L.${crossField}
          FROM 
            ${relationName} C JOIN ${setTable} L ON C.${refPKName} = L.${setTablePk} 
          WHERE C.${ownPKName} = NEW.${tablePk} AND COALESCE(L.${crossField}, '') > '' 
          INTO :attr 
          DO 
          BEGIN 
            IF (CHARACTER_LENGTH(:text) > ${presLen}) THEN 
              LEAVE; 
            text = :text || SUBSTRING(:attr FROM 1 FOR 254) || ' '; 
          END 
          NEW.${fieldName} = TRIM(SUBSTRING(:text FROM 1 FOR ${presLen})); 
      END
      `);
      await this._transaction.commitRetaining();
    }

    if (!skipAT && !(ignore && await this._cachedStatements.isTriggerATExists(triggerName))) {
     await this._cachedStatements.addToATTriggers({relationName: tableName, triggerName: triggerName});
    }
    return triggerName;
  }

  /** Добавление el процедуры для поддержки LB-RB дерева */  
  public async addELProcedure(tableName: string,
                               skipAT: boolean = this._skipAT,
                               ignore: boolean = this._defaultIgnore): Promise<void> {
    const procedureName = `${Constants.DEFAULT_USR_PREFIX}_P_EL_${ddlUtils.stripUserPrefix(tableName)}`;
    if (!(ignore && await this._cachedStatements.isProcedureExists(procedureName))) {                            
      await this._loggedExecute(`
        CREATE PROCEDURE ${procedureName}
            (Parent INTEGER, LB2 INTEGER, RB2 INTEGER)        
          RETURNS (LeftBorder INTEGER, RightBorder INTEGER)
        AS
          DECLARE VARIABLE R     INTEGER = NULL;
          DECLARE VARIABLE L     INTEGER = NULL;
          DECLARE VARIABLE Prev  INTEGER;
          DECLARE VARIABLE LChld INTEGER = NULL;
          DECLARE VARIABLE RChld INTEGER = NULL;
          DECLARE VARIABLE Delta INTEGER;
          DECLARE VARIABLE Dist  INTEGER;
          DECLARE VARIABLE Diff  INTEGER;
          DECLARE VARIABLE WasUnlock INTEGER;
        BEGIN
          IF (:LB2 = -1 AND :RB2 = -1) THEN
            Delta = CAST(COALESCE(RDB$GET_CONTEXT('USER_TRANSACTION', 'LBRB_DELTA'), 10) AS INTEGER);
          ELSE
            Delta = :RB2 - :LB2;

          SELECT lb, rb
          FROM ${tableName}
          WHERE id = :Parent
          INTO :L, :R;

          IF (:L IS NULL) THEN
            EXCEPTION tree_e_invalid_parent 'Invalid parent specified.';

          Prev = :L + 1;
          LeftBorder = NULL;

          FOR SELECT lb, rb FROM ${tableName} WHERE parent = :Parent ORDER BY lb ASC INTO :LChld, :RChld
          DO BEGIN
            IF ((:LChld - :Prev) > :Delta) THEN 
            BEGIN
              LeftBorder = :Prev;
              LEAVE;
            END ELSE
              Prev = :RChld + 1;
          END

          LeftBorder = COALESCE(:LeftBorder, :Prev);
          RightBorder = :LeftBorder + :Delta;

          WasUnlock = RDB$GET_CONTEXT('USER_TRANSACTION', 'LBRB_UNLOCK');
          IF (:WasUnlock IS NULL) THEN
            RDB$SET_CONTEXT('USER_TRANSACTION', 'LBRB_UNLOCK', 1);

          IF (:RightBorder >= :R) THEN
          BEGIN
            Diff = :R - :L;
            IF (:RightBorder >= (:R + :Diff)) THEN
              Diff = :RightBorder - :R + 1;

            IF (:Delta < 1000) THEN
              Diff = :Diff + :Delta * 10;
            ELSE
              Diff = :Diff + 10000;

            /* Сдвигаем все интервалы справа */
            UPDATE ${tableName} SET lb = lb + :Diff, rb = rb + :Diff
              WHERE lb > :R;

            /* Расширяем родительские интервалы */
            UPDATE ${tableName} SET rb = rb + :Diff
              WHERE lb <= :L AND rb >= :R;

            IF (:LB2 <> -1 AND :RB2 <> -1) THEN
            BEGIN
              IF (:LB2 > :R) THEN
              BEGIN
                LB2 = :LB2 + :Diff;
                RB2 = :RB2 + :Diff;
              END
              Dist = :LeftBorder - :LB2;
              UPDATE ${tableName} SET lb = lb + :Dist, rb = rb + :Dist 
                WHERE lb > :LB2 AND rb <= :RB2;
            END
          END ELSE
          BEGIN
            IF (:LB2 <> -1 AND :RB2 <> -1) THEN
            BEGIN
              Dist = :LeftBorder - :LB2;
              UPDATE ${tableName} SET lb = lb + :Dist, rb = rb + :Dist 
                WHERE lb > :LB2 AND rb <= :RB2;
            END
          END

          IF (:WasUnlock IS NULL) THEN
            RDB$SET_CONTEXT('USER_TRANSACTION', 'LBRB_UNLOCK', NULL);
        END;
      `);        
      await this._transaction.commitRetaining();
    }

    if (!skipAT && !(ignore && await this._cachedStatements.isProcudereATExists(procedureName))) {
      await this._cachedStatements.addToATProcuderes({procedureName: procedureName});
    }
  }

  /** Добавление gchc процедуры для поддержки LB-RB дерева */  
  public async addGCHCProcedure(tableName: string,
                               skipAT: boolean = this._skipAT,
                               ignore: boolean = this._defaultIgnore): Promise<void> {
    const procedureName = `${Constants.DEFAULT_USR_PREFIX}_P_GCHC_${ddlUtils.stripUserPrefix(tableName)}`;
    if (!(ignore && await this._cachedStatements.isProcedureExists(procedureName))) {                            
      await this._loggedExecute(`
        CREATE PROCEDURE ${procedureName}
          (Parent INTEGER, FirstIndex INTEGER)
          RETURNS (LastIndex INTEGER)
        AS
          DECLARE VARIABLE ChildKey INTEGER;
        BEGIN
          LastIndex = :FirstIndex + 1;
        
          /* Изменяем границы детей */
          FOR
            SELECT id
            FROM ${tableName}
            WHERE parent = :Parent
            INTO :ChildKey
          DO
          BEGIN
            EXECUTE PROCEDURE ${procedureName} (:ChildKey, :LastIndex)
              RETURNING_VALUES :LastIndex;
          END
        
          LastIndex = :LastIndex + CAST(COALESCE(RDB$GET_CONTEXT('USER_TRANSACTION', 'LBRB_DELTA'), 10) AS INTEGER) - 1;
        
          /* Изменяем границы родителя */
          UPDATE ${tableName} SET lb = :FirstIndex + 1, rb = :LastIndex
            WHERE id = :Parent;
        END;
      `);        
      await this._transaction.commitRetaining();
    }

    if (!skipAT && !(ignore && await this._cachedStatements.isProcudereATExists(procedureName))) {
      await this._cachedStatements.addToATProcuderes({procedureName: procedureName});
    }
  }  

  /** Добавление restruct процедуры для поддержки LB-RB дерева */  
  public async addRestructProcedure(tableName: string,
                               skipAT: boolean = this._skipAT,
                               ignore: boolean = this._defaultIgnore): Promise<void> {
    const procedureName = `${Constants.DEFAULT_USR_PREFIX}_P_RESTRUCT_${ddlUtils.stripUserPrefix(tableName)}`;
    const gchcprocedureName = `${Constants.DEFAULT_USR_PREFIX}_P_GCHC_${ddlUtils.stripUserPrefix(tableName)}`;    
    if (!(ignore && await this._cachedStatements.isProcedureExists(procedureName))) {                            
      await this._loggedExecute(`
        CREATE PROCEDURE ${procedureName}
        AS
          DECLARE VARIABLE CurrentIndex INTEGER;
          DECLARE VARIABLE ChildKey INTEGER;
          DECLARE VARIABLE WasUnlock INTEGER;
        BEGIN
          CurrentIndex = 1;

          WasUnlock = RDB$GET_CONTEXT('USER_TRANSACTION', 'LBRB_UNLOCK');
          IF (:WasUnlock IS NULL) THEN
            RDB$SET_CONTEXT('USER_TRANSACTION', 'LBRB_UNLOCK', 1);

          /* Для всех корневых элементов ... */
          FOR
            SELECT id
            FROM ${tableName}
            WHERE parent IS NULL
            INTO :ChildKey
          DO
          BEGIN
            /* ... меняем границы детей */
            EXECUTE PROCEDURE ${gchcprocedureName} (:ChildKey, :CurrentIndex)
              RETURNING_VALUES :CurrentIndex;
          END

          IF (:WasUnlock IS NULL) THEN
            RDB$SET_CONTEXT('USER_TRANSACTION', 'LBRB_UNLOCK', NULL);
        END;
      `);        
      await this._transaction.commitRetaining();
    }

    if (!skipAT && !(ignore && await this._cachedStatements.isProcudereATExists(procedureName))) {
      await this._cachedStatements.addToATProcuderes({procedureName: procedureName});
    }
  }    

  /** Добавление BI триггера для поддержки LB-RB дерева */
  public async addLBRBBITrigger(tableName: string,
                                skipAT: boolean = this._skipAT,
                                ignore: boolean = this._defaultIgnore): Promise<void> {
    const triggerName = `${Constants.DEFAULT_USR_PREFIX}__BI_${ddlUtils.stripUserPrefix(tableName)}`;    
    const exlimProcedureName = `${Constants.DEFAULT_USR_PREFIX}_P_EL_${ddlUtils.stripUserPrefix(tableName)}`;
    if (!(ignore && await this._cachedStatements.isTriggerExists(triggerName))) {
      await this._loggedExecute(`
        CREATE TRIGGER ${triggerName} FOR ${tableName}
          ACTIVE 
          BEFORE INSERT 
          POSITION 32000
        AS
          DECLARE VARIABLE D    INTEGER;
          DECLARE VARIABLE L    INTEGER;
          DECLARE VARIABLE R    INTEGER;
          DECLARE VARIABLE Prev INTEGER;
        BEGIN
          IF (NEW.parent IS NULL) THEN
          BEGIN
            D = CAST(COALESCE(RDB$GET_CONTEXT('USER_TRANSACTION', 'LBRB_DELTA'), 10) AS INTEGER);
            Prev = 1;
            NEW.lb = NULL;

            FOR SELECT lb, rb FROM ${tableName} WHERE parent IS NULL ORDER BY lb INTO :L, :R
            DO BEGIN
              IF ((:L - :Prev) > :D) THEN 
              BEGIN
                NEW.lb = :Prev;
                LEAVE;
              END ELSE
                Prev = :R + 1;
            END

            NEW.lb = COALESCE(NEW.lb, :Prev);
            NEW.rb = NEW.lb + :D;
          END ELSE
          BEGIN
            EXECUTE PROCEDURE ${exlimProcedureName} (NEW.parent, -1, -1)
              RETURNING_VALUES NEW.lb, NEW.rb;
          END
        END;
      `);
      await this._transaction.commitRetaining();
    }

    if (!skipAT && !(ignore && await this._cachedStatements.isTriggerATExists(triggerName))) {
     await this._cachedStatements.addToATTriggers({triggerName: triggerName});
    }
  }

  /** Добавление BU триггера для поддержки LB-RB дерева */
  public async addLBRBBUTrigger(tableName: string,
                                skipAT: boolean = this._skipAT,
                                ignore: boolean = this._defaultIgnore): Promise<void> {
    const triggerName = `${Constants.DEFAULT_USR_PREFIX}__BU_${ddlUtils.stripUserPrefix(tableName)}`;    
    const exlimProcedureName = `${Constants.DEFAULT_USR_PREFIX}_P_EL_${ddlUtils.stripUserPrefix(tableName)}`;
    if (!(ignore && await this._cachedStatements.isTriggerExists(triggerName))) {
      await this._loggedExecute(`
        CREATE TRIGGER ${triggerName} FOR ${tableName}
          ACTIVE         
          BEFORE UPDATE
          POSITION 32000
        AS
          DECLARE VARIABLE OldDelta  INTEGER;
          DECLARE VARIABLE D         INTEGER;
          DECLARE VARIABLE L         INTEGER;
          DECLARE VARIABLE R         INTEGER;
          DECLARE VARIABLE Prev      INTEGER;
          DECLARE VARIABLE WasUnlock INTEGER;
        BEGIN
          IF (NEW.parent IS DISTINCT FROM OLD.parent) THEN
          BEGIN
            /* Делаем проверку на зацикливание */
            IF (EXISTS (SELECT * FROM ${tableName}
                  WHERE id = NEW.parent AND lb >= OLD.lb AND rb <= OLD.rb)) THEN
              EXCEPTION tree_e_invalid_parent 'Attempt to cycle branch in table ${tableName}.';
    
            IF (NEW.parent IS NULL) THEN
            BEGIN
              D = OLD.rb - OLD.lb;
              Prev = 1;
              NEW.lb = NULL;
    
              FOR SELECT lb, rb FROM ${tableName} WHERE parent IS NULL ORDER BY lb ASC INTO :L, :R
              DO BEGIN
                IF ((:L - :Prev) > :D) THEN 
                BEGIN
                  NEW.lb = :Prev;
                  LEAVE;
                END ELSE
                  Prev = :R + 1;
              END
    
              NEW.lb = COALESCE(NEW.lb, :Prev);
              NEW.rb = NEW.lb + :D;
    
              /* Определяем величину сдвига */
              OldDelta = NEW.lb - OLD.lb;
              /* Сдвигаем границы детей */
              WasUnlock = RDB$GET_CONTEXT('USER_TRANSACTION', 'LBRB_UNLOCK');
              IF (:WasUnlock IS NULL) THEN
                RDB$SET_CONTEXT('USER_TRANSACTION', 'LBRB_UNLOCK', 1);
              UPDATE ${tableName} SET lb = lb + :OldDelta, rb = rb + :OldDelta
                WHERE lb > OLD.lb AND rb <= OLD.rb;
              IF (:WasUnlock IS NULL) THEN
                RDB$SET_CONTEXT('USER_TRANSACTION', 'LBRB_UNLOCK', NULL);
            END ELSE
              EXECUTE PROCEDURE ${exlimProcedureName} (NEW.parent, OLD.lb, OLD.rb)
                RETURNING_VALUES NEW.lb, NEW.rb;
          END ELSE
          BEGIN
            IF ((NEW.rb <> OLD.rb) OR (NEW.lb <> OLD.lb)) THEN
            BEGIN
              IF (RDB$GET_CONTEXT('USER_TRANSACTION', 'LBRB_UNLOCK') IS NULL) THEN
              BEGIN
                NEW.lb = OLD.lb;
                NEW.rb = OLD.rb;
              END
            END
          END
    
          WHEN ANY DO
          BEGIN
            RDB$SET_CONTEXT('USER_TRANSACTION', 'LBRB_UNLOCK', NULL);
            EXCEPTION;
          END
        END;      
      `);
      await this._transaction.commitRetaining();
    }

    if (!skipAT && !(ignore && await this._cachedStatements.isTriggerATExists(triggerName))) {
     await this._cachedStatements.addToATTriggers({triggerName: triggerName});
    }
  }  

  /** Удаление триггера */
  public async dropTrigger(triggerName: string,
                           skipAT: boolean = this._skipAT,
                           ignore: boolean = this._defaultIgnore): Promise<void> {
    if (!(ignore && !(await this._cachedStatements.isTriggerExists(triggerName)))) {
      await this._loggedExecute(`DROP TRIGGER ${triggerName}`);
      await this._transaction.commitRetaining();
    }

    if (!skipAT && !(ignore && !(await this._cachedStatements.isTriggerATExists(triggerName)))) {
      await this._cachedStatements.dropATTriggers({triggerName});
    }
  }

  public async checkAndDropTable(tableName: string,
                                 ignore: boolean = this._defaultIgnore): Promise<void> {
    // получаем список зависимостей объекта : триггера, ограничения, индексы и процедуры
    const listDependencies = await this._cachedStatements.getDependencies(tableName);
    // проверяем есть ли в RDB$DEPENDENCIES зависимости, которых нет в ранее полученом списке
    const hasDependencies = await this._cachedStatements.checkDependencies(listDependencies, tableName);
    if (hasDependencies && hasDependencies.length){
     throw new Error(`Entity has dependencies ${hasDependencies.map((dep) => dep.replace(/\s+/g,'')).join(',')}`)
    }
    // удаляем зависимости
    for await (const dependence of listDependencies) {
      switch (dependence.type) {
        case 'TRIGGER':
          await this.dropTrigger(dependence.name);
          break;
        case 'CONSTRAINT':
          await this.dropConstraint(dependence.name, tableName);
          break;
        case 'INDEX':
          await this.dropIndex(dependence.name);
          break;
        case 'PROCEDURE':
          await this.dropProcedure(dependence.name);
          break;
      }
    }
    // удаляем физическую таблицу
     await this.dropTable(tableName);
  }

  public async addDefaultProcedure(tableName: string,
                                 ignore: boolean = this._defaultIgnore): Promise<void> {
    await this._loggedExecute(`
      CREATE PROCEDURE ${tableName+'1'}
      AS
        DECLARE variable i integer;
      BEGIN      
        SELECT count(*)
        FROM ${tableName}
        INTO: i;
      END
    `);
    await this._transaction.commitRetaining();
  }

  public async dropProcedure(procedureName: string,
                             skipAT: boolean = this._skipAT,
                             ignore: boolean = this._defaultIgnore): Promise<void> {

    if (!(ignore && !(await this._cachedStatements.isProcedureExists(procedureName)))) {
      await this._loggedExecute(`DROP PROCEDURE ${procedureName}`);
      await this._transaction.commitRetaining();
    }

    if (!skipAT && !(ignore && !(await this._cachedStatements.isProcudereATExists(procedureName)))) {
      await this._cachedStatements.dropATProcuderes({procedureName});
    }                              
  }

  private async _loggedExecute(sql: string): Promise<void> {
    this._logs.push(sql);
    await this._connection.execute(this._transaction, sql);
  }

  public async addDefaultCalculatedFields(tableName: string,
                                   fieldName1: string,
                                   fieldName2: string,
                                   ignore: boolean = this._defaultIgnore): Promise<void> {
    await this._loggedExecute(`
      ALTER TABLE ${tableName} 
      ADD CALC VARCHAR(74) GENERATED ALWAYS AS (${fieldName1} || ${fieldName2})
    `);
    await this._transaction.commitRetaining();
  }

  public async addDefaultUnique(tableName: string,
                                ignore: boolean = this._defaultIgnore): Promise<void> {
    await this._loggedExecute(`
      ALTER TABLE ${tableName} 
      ADD TEST_UNIQUE VARCHAR(74) UNIQUE
    `);
    await this._transaction.commitRetaining();
  }
}
