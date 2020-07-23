import {Factory, IConnectionOptions} from "../src";
import path from "path";
import {existsSync, unlinkSync} from "fs";

const driver = Factory.getDriver("firebird");

const testFBServer = require('../../../testFBServer.json');

export const dbOptions: IConnectionOptions = {
  ...testFBServer,
  path: path.resolve("./GDMN_DB_FB2.FDB")
};

export const dbOptionsFail: IConnectionOptions = {
  ...dbOptions,
  username: "some_unexisting_user",
  password: "and_his_password"
};

jest.setTimeout(600 * 1000);

describe("Firebird driver tests", () => {

  const connection = driver.newConnection();

  beforeAll(async () => {
    if (existsSync(dbOptions.path)) {
      unlinkSync(dbOptions.path);
    }

    await connection.createDatabase(dbOptions);
    await connection.disconnect();
  });

  afterAll(async () => {
    await connection.connect(dbOptions);
    await connection.dropDatabase();
  });

  it("100 successful connections", async () => {
    for (let i = 0; i < 100; i++) {
      await connection.connect(dbOptions);
      await connection.disconnect();
    }
  });

  it("10 unsuccessful connections", async () => {
    for (let i = 0; i < 10; i++) {
      try {
        await connection.connect(dbOptionsFail);
        await connection.disconnect();
      } catch (error) {
        if (connection.connected) {
          throw new Error('couldn\'t be here');
        }
      }
    }
  });
});
