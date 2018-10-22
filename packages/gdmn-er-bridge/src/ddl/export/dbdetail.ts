import {ADriver, IConnectionOptions} from "gdmn-db";

export interface IDBDetail<ConnectionOptions extends IConnectionOptions = IConnectionOptions> {
  alias: string;
  driver: ADriver;
  options: ConnectionOptions;
}
