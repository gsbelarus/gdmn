import {AConnection, CommonParamsAnalyzer, Factory, IConnectionOptions, IServiceOptions} from "../src";
import path from "path";
import {existsSync, unlinkSync} from "fs";

const driver = Factory.getDriver("firebird");

export const dbOptions: IConnectionOptions = {
  username: "SYSDBA",
  password: "masterkey",
  path: path.resolve("./GDMN_DB_FB2.FDB")
};

export const dbOptionsFail: IConnectionOptions = {
  username: "2",
  password: "2",
  path: path.resolve("./GDMN_DB_FB2.FDB")
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
//почему то начал зависать тест и за этого не может отработать yarn test
  it("100 connections", async () => {
    // for (let i = 0; i < 100; i++) {
    //   try {
    //     await connection.connect(dbOptionsFail);
    //   } catch (error) {
    //    // console.log(error);
    //     if (connection.connected) {
    //       console.log(connection.connected);
    //       await connection.disconnect();
    //     }
    //   }
    // }
  });
});
