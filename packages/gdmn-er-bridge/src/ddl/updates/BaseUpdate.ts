import {AConnection, ATransaction} from "gdmn-db";
import {TExecutor} from "gdmn-db/src/types";

export abstract class BaseUpdate {

  protected abstract readonly _version: number;
  protected abstract readonly _description: string;

  protected _connection: AConnection;

  constructor(connection: AConnection) {
    this._connection = connection;
  }

  get version(): number {
    return this._version;
  }

  get description(): string {
    return `(-> v${this._version}) ${this._description}`.trim();
  }

  public abstract run(): Promise<void>;

  protected async _executeTransaction<R>(callback: TExecutor<ATransaction, R>): Promise<R> {
    return await AConnection.executeTransaction({
      connection: this._connection,
      callback: callback
    });
  }

  protected async _updateDatabaseVersion(transaction: ATransaction): Promise<void> {
    await this._connection.execute(transaction, `
      UPDATE OR INSERT INTO AT_DATABASE (ID, VERSION)
      VALUES (1, :version)
      MATCHING (ID)
    `, {
      version: this._version
    });
  }

  protected async _getDatabaseVersion(transaction: ATransaction): Promise<number> {
    if (!await this._isTableExists(transaction, "AT_FIELDS")) {
      return 0;
    }
    if (!await this._isTableExists(transaction, "AT_DATABASE")) {
      return 1;
    }
    const result = await this._connection.executeReturning(transaction, `
      SELECT 
        MAX(VERSION) AS "VERSION"
      FROM AT_DATABASE
    `);
    return await result.getNumber("VERSION");
  }

  private async _isTableExists(transaction: ATransaction, tableName: string): Promise<boolean> {
    const resultSet = await this._connection.executeQuery(transaction, `
      SELECT 1
      FROM RDB$RELATIONS
      WHERE RDB$RELATION_NAME = :tableName
    `, {tableName});
    try {
      return await resultSet.next();
    } finally {
      if (!resultSet.closed) {
        await resultSet.close();
      }
    }
  }
}
