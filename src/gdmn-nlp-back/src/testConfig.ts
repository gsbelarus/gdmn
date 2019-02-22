import {ADriver, Factory, IConnectionOptions} from "gdmn-db";

export interface IDBDetail<ConnectionOptions extends IConnectionOptions = IConnectionOptions> {
  alias: string;
  driver: ADriver;
  connectionOptions: ConnectionOptions;
}

export function loadDBDetails(): IDBDetail[] {
  const testConfig = require("../../../../testConfig.json");
  if (!testConfig) {
    throw new Error("testConfig.json is not found");
  }

  return testConfig.dbDetails.map((dbDetail: any) => ({
    alias: dbDetail.alias,
    driver: Factory.getDriver(dbDetail.driver === "FBDriver" ? "firebird" : dbDetail.driver),
    connectionOptions: {
      server: dbDetail.connectionOptions.server,
      username: dbDetail.connectionOptions.username,
      password: dbDetail.connectionOptions.password,
      path: dbDetail.connectionOptions.path
    }
  }));
}
