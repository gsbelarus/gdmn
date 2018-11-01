import {AConnection} from "gdmn-db";
import {IConnection} from "gdmn-orm";

export class Connection implements IConnection {

  public readonly connection: AConnection;

  constructor(connection: AConnection) {
    this.connection = connection;
  }

  get connected(): boolean {
    return this.connection.connected;
  }

  public async disconnect(): Promise<void> {
    await this.connection.disconnect();
  }
}
