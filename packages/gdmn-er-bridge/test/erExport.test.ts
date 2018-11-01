import * as fs from "fs";
import {deserializeERModel, ERModel, IntegerAttribute, ParentAttribute} from "gdmn-orm";
import {DataSource} from "../src";
import {IDBDetail} from "../src/ddl/export/dbdetail";

jest.setTimeout(120000);

describe("ERExport", () => {

  const dbDetail = require("./testDB").exportTestDBDetail as IDBDetail;
  const connectionPool = dbDetail.driver.newCommonConnectionPool();
  const erModel = new ERModel(new DataSource(connectionPool));

  beforeAll(async () => {
    await connectionPool.create(dbDetail.options, {max: 1, acquireTimeoutMillis: 10000});
    await erModel.init();
  });

  afterAll(async () => {
    await connectionPool.destroy();
  });

  it("erExport", async () => {
    const serialized = erModel.serialize();
    const deserialized = deserializeERModel(serialized);

    if (fs.existsSync("c:/temp/test")) {
      fs.writeFileSync("c:/temp/test/ermodel.json",
        erModel.inspect().reduce((p, s) => `${p}${s}\n`, "")
      );
      console.log("ERModel has been written to c:/temp/test/ermodel.json");

      fs.writeFileSync("c:/temp/test/ermodel.serialized.json",
        JSON.stringify(serialized, undefined, 2)
      );
      console.log("Serialized ERModel has been written to c:/temp/test/ermodel.serialized.json");

      fs.writeFileSync("c:/temp/test/ermodel.test.json",
        JSON.stringify(deserialized.serialize(), undefined, 2)
      );
      console.log("Deserialized ERModel has been written to c:/temp/test/ermodel.test.json");
    }

    expect(serialized).toEqual(deserialized.serialize());

    /**
     * Проверка на то, что GD_PLACE древовидная таблица
     */
    const gdPlace = erModel.entity("GD_PLACE");
    expect(gdPlace).toBeDefined();
    expect(gdPlace.isTree).toBeTruthy();
    expect(gdPlace.attribute("PARENT")).toBeDefined();
    expect(gdPlace.attribute("PARENT")).toBeInstanceOf(ParentAttribute);
    expect(gdPlace.attribute("LB")).toBeDefined();
    expect(gdPlace.attribute("LB")).toBeInstanceOf(IntegerAttribute);
    expect(gdPlace.attribute("RB")).toBeDefined();
    expect(gdPlace.attribute("RB")).toBeInstanceOf(IntegerAttribute);
  });
});
