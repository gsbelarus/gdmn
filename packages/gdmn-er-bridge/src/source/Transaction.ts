import {AConnection, ATransaction} from "gdmn-db";
import {ITransaction} from "gdmn-orm";
import {DDLHelper} from "../ddl/DDLHelper";

export class Transaction implements ITransaction {

  private readonly _connection: AConnection;
  private readonly _transaction: ATransaction;
  private readonly _ddlHelper: DDLHelper;

  constructor(connection: AConnection, transaction: ATransaction) {
    this._connection = connection;
    this._transaction = transaction;
    this._ddlHelper = new DDLHelper(connection, transaction);
  }

  get finished(): boolean {
    return this._transaction.finished;
  }

  get dbTransaction(): ATransaction {
    return this._transaction;
  }

  get ddlHelper(): DDLHelper {
    return this._ddlHelper;
  }

  public async commit(): Promise<void> {
    if (!this._ddlHelper.disposed) {
      await this._ddlHelper.dispose();
    }
    return await this._transaction.commit();
  }

  public async rollback(): Promise<void> {
    if (!this._ddlHelper.disposed) {
      await this._ddlHelper.dispose();
    }
    return await this._transaction.rollback();
  }
}
