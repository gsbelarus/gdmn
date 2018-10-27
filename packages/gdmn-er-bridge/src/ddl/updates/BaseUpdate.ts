import {AConnection, ATransaction, TExecutor} from "gdmn-db";
import {CachedStatements} from "../CachedStatements";

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
    const cachedStatements = new CachedStatements(this._connection, transaction);
    try {
      if (!await cachedStatements.isTableExists("AT_FIELDS")) {
        return 0;
      }
      if (!await cachedStatements.isTableExists("AT_DATABASE")) {
        return 1;
      }
    } finally {
      await cachedStatements.dispose();
    }
    const result = await this._connection.executeReturning(transaction, `
      SELECT 
        MAX(VERSION) AS "VERSION"
      FROM AT_DATABASE
    `);
    return await result.getNumber("VERSION");
  }
}
