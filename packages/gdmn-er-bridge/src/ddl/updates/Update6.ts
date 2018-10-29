import {DDLHelper} from "../DDLHelper";
import {BaseSimpleUpdate} from "./BaseSimpleUpdate";

export class Update6 extends BaseSimpleUpdate {

  protected readonly _version: number = 6;
  protected readonly _description: string = "Дополнительные поля для AT_DATABASE";

  protected async internalRun(ddlHelper: DDLHelper): Promise<void> {
    await ddlHelper.addColumns("AT_DATABASE", [
      {name: "UPGRADED", domain: "DTIMESTAMP_NOTNULL", default: "CURRENT_TIMESTAMP"}
    ]);

    // TODO change constraint name
    await ddlHelper.addUnique("UQ_1", "AT_DATABASE", ["VERSION"]);
  }
}
