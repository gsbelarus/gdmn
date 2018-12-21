import {ADriver, Factory, IConnectionOptions} from "gdmn-db";

export interface IDBDetail<ConnectionOptions extends IConnectionOptions = IConnectionOptions> {
  alias: string;
  driver: ADriver;
  connectionOptions: ConnectionOptions;
}

export function loadDBDetails(): IDBDetail[] {
  const testConfig = require("../../../testConfig.json");
  if (!testConfig) {
    throw new Error("testConfig.json is not found");
  }

  return testConfig.dbDetails.map((dbDetail: any) => ({
    alias: dbDetail.alias,
    driver: resolveDriver(dbDetail.driver),
    connectionOptions: {
      server: dbDetail.connectionOptions.server,
      username: dbDetail.connectionOptions.username,
      password: dbDetail.connectionOptions.password,
      path: dbDetail.connectionOptions.path
    }
  }));
}

function resolveDriver(driverName: string): ADriver {
  switch (driverName) {
    case "FBDriver":
      return Factory.FBDriver;
    default:
      throw new Error(`Unknown driver name ${driverName}`);
  }
}
