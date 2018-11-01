import {ATransaction} from "gdmn-db";
import {ITransaction} from "gdmn-orm";
import {DDLHelper} from "../ddl/DDLHelper";
import {Connection} from "./Connection";

export class Transaction implements ITransaction {

  public readonly connection: Connection;
  public readonly transaction: ATransaction;
  public readonly ddlHelper: DDLHelper;

  constructor(connection: Connection, transaction: ATransaction) {
    this.connection = connection;
    this.transaction = transaction;
    this.ddlHelper = new DDLHelper(connection.connection, transaction);
  }

  get finished(): boolean {
    return this.transaction.finished;
  }

  public async commit(): Promise<void> {
    if (!this.ddlHelper.disposed) {
      await this.ddlHelper.dispose();
      console.debug(this.ddlHelper.logs.join("\n"));
    }
    return await this.transaction.commit();
  }

  public async rollback(): Promise<void> {
    if (!this.ddlHelper.disposed) {
      await this.ddlHelper.dispose();
      console.debug(this.ddlHelper.logs.join("\n"));
    }
    return await this.transaction.rollback();
  }
}
