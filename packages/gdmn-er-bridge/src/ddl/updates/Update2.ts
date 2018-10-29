import {Constants} from "../Constants";
import {DDLHelper} from "../DDLHelper";
import {BaseSimpleUpdate} from "./BaseSimpleUpdate";

export class Update2 extends BaseSimpleUpdate {

  protected readonly _version: number = 2;
  protected readonly _description: string = "Обновление для бд Гедымина, включающее поддержку gdmn web";

  public async run(): Promise<void> {
    await super.run();
    // must be call in other transaction
    await this._executeTransaction((transaction) => this._updateDatabaseVersion(transaction));
  }

  protected async internalRun(ddlHelper: DDLHelper): Promise<void> {
    await ddlHelper.addSequence(Constants.GLOBAL_DDL_GENERATOR);

    await ddlHelper.addSequence(Constants.GLOBAL_DDL_GENERATOR);

    await ddlHelper.addTable("AT_DATABASE", [
      {name: "ID", domain: "DINTKEY"},
      {name: "VERSION", domain: "DINTKEY"}
    ]);
    await ddlHelper.addPrimaryKey("AT_PK_DATABASE", "AT_DATABASE", ["ID"]);

    await ddlHelper.addColumns("AT_RELATION_FIELDS", [
      {name: "ATTRNAME", domain: "DFIELDNAME"}
    ]);
  }
}
