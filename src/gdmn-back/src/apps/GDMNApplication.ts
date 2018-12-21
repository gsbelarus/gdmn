import {AConnection} from "gdmn-db";
import {ERBridge} from "gdmn-er-bridge";
import {Entity, StringAttribute} from "gdmn-orm";
import {IDBDetail} from "../db/ADatabase";
import {Application} from "./base/Application";

export class GDMNApplication extends Application {

  constructor(dbDetail: IDBDetail) {
    super(dbDetail);
  }

  protected async _onCreate(): Promise<void> {
    await super._onCreate();

    await this._executeConnection((connection) => AConnection.executeTransaction({
      connection,
      callback: (transaction) => ERBridge.executeSelf({
        connection, transaction, callback: async ({erBuilder, eBuilder}) => {
          const entity = await erBuilder.create(this.erModel, new Entity({
            name: "TEST", lName: {ru: {name: "Тестовая сущность"}}
          }));

          await eBuilder.createAttribute(entity, new StringAttribute({
            name: "TEST_FILED", lName: {ru: {name: "Тестовое поле"}}, required: true, maxLength: 150
          }));
        }
      })
    }));
  }
}
