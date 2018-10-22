import {AConnection, ATransaction} from "gdmn-db";
import {ITransaction} from "gdmn-orm";
import {ERModelBuilder} from "../ddl/builder/ERModelBuilder";

export class Transaction implements ITransaction {

  private readonly _connection: AConnection;
  private readonly _transaction: ATransaction;
  private readonly _builder: ERModelBuilder = new ERModelBuilder();

  constructor(connection: AConnection, transaction: ATransaction) {
    this._connection = connection;
    this._transaction = transaction;
  }

  get finished(): boolean {
    return this._transaction.finished;
  }

  get dbTransaction(): ATransaction {
    return this._transaction;
  }

  public async getBuilder(): Promise<ERModelBuilder> {
    if (!this._builder.prepared) {
      await this._builder.prepare(this._connection, this._transaction);
    }
    return this._builder;
  }

  public async commit(): Promise<void> {
    if (this._builder.prepared) {
      await this._builder.dispose();
    }
    return await this._transaction.commit();
  }

  public async rollback(): Promise<void> {
    if (this._builder.prepared) {
      await this._builder.dispose();
    }
    return await this._transaction.rollback();
  }
}
