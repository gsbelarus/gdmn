import {DDLHelper} from "../builder/DDLHelper";
import {BaseSimpleUpdate} from "./BaseSimpleUpdate";

export class Update4 extends BaseSimpleUpdate {

  protected readonly _version: number = 4;
  protected readonly _description: string = "Дополнительное поле для AT_RELATIONS";

  protected async internalRun(ddlHelper: DDLHelper): Promise<void> {
    await ddlHelper.addColumns("AT_RELATIONS", [
      {name: "ENTITYNAME", domain: "DTABLENAME"}
    ]);
  }
}
