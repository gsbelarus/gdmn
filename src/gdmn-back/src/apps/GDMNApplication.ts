import {AConnection} from "gdmn-db";
import {Entity, StringAttribute} from "gdmn-orm";
import log4js from "log4js";
import {IDBDetail} from "../db/ADatabase";
import {Application} from "./base/Application";

export class GDMNApplication extends Application {

  constructor(dbDetail: IDBDetail) {
    super(dbDetail, log4js.getLogger("GDMNApp"));
  }

  protected async _onCreate(_connection: AConnection): Promise<void> {
    await super._onCreate(_connection);

    const connection = await this.erModel.createConnection();
    try {
      const transaction = await this.erModel.startTransaction(connection);
      try {

        const entity = await this.erModel.create(new Entity({
          name: "TEST", lName: {ru: {name: "Тестовая сущность"}}
        }), connection, transaction);

        await entity.create(new StringAttribute({
          name: "TEST_FILED", lName: {ru: {name: "Тестовое поле"}}, required: true, maxLength: 150
        }), connection, transaction);

        await transaction.commit();
      } catch (error) {
        await transaction.rollback();
      }
    } finally {
      if (connection.connected) {
        await connection.disconnect();
      }
    }
  }
}
