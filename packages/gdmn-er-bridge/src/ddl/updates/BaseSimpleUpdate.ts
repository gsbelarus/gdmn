import {DDLHelper} from "../DDLHelper";
import {BaseUpdate} from "./BaseUpdate";

export abstract class BaseSimpleUpdate extends BaseUpdate {

  public async run(): Promise<void> {
    await this._executeTransaction(async (transaction) => {
      await DDLHelper.executeSelf({
        connection: this._connection,
        transaction,
        defaultIgnore: true,
        callback: async (ddlHelper) => {
          await this.internalRun(ddlHelper);

          if (await ddlHelper.cachedStatements.isTableExists("AT_DATABASE")) {
            await this._updateDatabaseVersion(transaction);
          }
        }
      });
    });
  }

  protected abstract internalRun(ddlHelper: DDLHelper): Promise<void>;
}
