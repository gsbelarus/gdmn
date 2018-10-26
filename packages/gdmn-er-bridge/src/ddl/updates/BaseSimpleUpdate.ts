import {DDLHelper} from "../DDLHelper";
import {BaseUpdate} from "./BaseUpdate";

export abstract class BaseSimpleUpdate extends BaseUpdate {

  public async run(): Promise<void> {
    await this._executeTransaction(async (transaction) => {
      const ddlHelper = new DDLHelper(this._connection, transaction, true);
      await DDLHelper.executePrepare({
        ddlHelper,
        callback: async (ddlHelper) => {
          await this.internalRun(ddlHelper);
          await this._updateDatabaseVersion(transaction);
        }
      });
    });
  }

  protected abstract internalRun(ddlHelper: DDLHelper): Promise<void>;
}
