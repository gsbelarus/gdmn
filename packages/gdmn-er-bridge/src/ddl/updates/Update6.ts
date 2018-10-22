import {DDLHelper} from "../builder/DDLHelper";
import {BaseSimpleUpdate} from "./BaseSimpleUpdate";

export class Update6 extends BaseSimpleUpdate {

  protected readonly _version: number = 6;
  protected readonly _description: string = "Дополнительные поля для AT_DATABASE";

  protected async internalRun(ddlHelper: DDLHelper): Promise<void> {
    await ddlHelper.addColumns("AT_DATABASE", [
      {name: "UPGRADED", domain: "DTIMESTAMP_NOTNULL", default: "CURRENT_TIMESTAMP"}
    ]);

    await ddlHelper.addUnique("AT_DATABASE", ["VERSION"]);
  }
}
