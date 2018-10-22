import {DDLHelper} from "../builder/DDLHelper";
import {BaseSimpleUpdate} from "./BaseSimpleUpdate";

export class Update3 extends BaseSimpleUpdate {

  protected readonly _version: number = 3;
  protected readonly _description: string = "Дополнительные поля для AT_RELATION_FIELDS";

  protected async internalRun(ddlHelper: DDLHelper): Promise<void> {
    await ddlHelper.addColumns("AT_RELATION_FIELDS", [
      {name: "MASTERENTITYNAME", domain: "DTABLENAME"},
      {name: "ISPARENT", domain: "DBOOLEAN"}    // // TODO delete this column
    ]);
  }
}
