import {DDLHelper} from "../builder/DDLHelper";
import {BaseUpdate} from "./BaseUpdate";

export abstract class BaseSimpleUpdate extends BaseUpdate {

  public async run(): Promise<void> {
    await this._executeTransaction(async (transaction) => {
      const ddlHelper = new DDLHelper(this._connection, transaction);
      try {
        await ddlHelper.prepare();

        await this.internalRun(ddlHelper);
        await this._updateDatabaseVersion(transaction);

      } finally {
        console.debug(ddlHelper.logs.join("\n"));
        if (ddlHelper.prepared) {
          await ddlHelper.dispose();
        }
      }
    });
  }

  protected abstract internalRun(ddlHelper: DDLHelper): Promise<void>;
}
