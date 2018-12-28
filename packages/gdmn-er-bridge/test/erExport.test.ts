import fs from "fs";
import {AConnection} from "gdmn-db";
import {deserializeERModel, EntityQuery, ERModel, IntegerAttribute, ParentAttribute} from "gdmn-orm";
import {Select} from "../src";
import {ERBridge} from "../src/ERBridge";
import {loadDBDetails} from "./testConfig";

jest.setTimeout(120000);

describe("ERExport", () => {

  const dbDetail = loadDBDetails()[0];
  const connection = dbDetail.driver.newConnection();
  const erModel = new ERModel();

  beforeAll(async () => {
    await connection.connect(dbDetail.connectionOptions);
    await ERBridge.initDatabase(connection);

    await AConnection.executeTransaction({
      connection,
      callback: (transaction) => ERBridge.reloadERModel(connection, transaction, erModel)
    });
  });

  afterAll(async () => {
    await connection.disconnect();
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

  it("simple entity", async () => {
    const {sql, params} = new Select(EntityQuery.inspectorToObject(erModel, {
      link: {
        entity: "OurCompany",
        alias: "oc",
        fields: [
          {attribute: "FULLNAME"}
        ]
      }
    }));

    expect(sql).toEqual("SELECT\n" +
      "  T$1.FULLNAME AS F$1\n" +
      "FROM GD_CONTACT T$2\n" +
      "  JOIN GD_COMPANY T$1 ON T$1.CONTACTKEY = T$2.ID\n" +
      "  LEFT JOIN GD_COMPANYCODE T$3 ON T$3.COMPANYKEY = T$2.ID\n" +
      "  JOIN GD_OURCOMPANY T$4 ON T$4.COMPANYKEY = T$2.ID");

    await AConnection.executeTransaction({
      connection,
      callback: (transaction) => AConnection.executeQueryResultSet({
        connection, transaction, sql, params,
        callback: () => 0
      })
    });
  });

  it("simple entity", async () => {
    const {sql, params} = new Select(EntityQuery.inspectorToObject(erModel, {
      link: {
        entity: "OurCompany",
        alias: "oc",
        fields: [
          {attribute: "NAME"}
        ]
      }
    }));

    expect(sql).toEqual("SELECT\n" +
      "  T$1.NAME AS F$1\n" +
      "FROM GD_CONTACT T$1\n" +
      "  JOIN GD_COMPANY T$2 ON T$2.CONTACTKEY = T$1.ID\n" +
      "  LEFT JOIN GD_COMPANYCODE T$3 ON T$3.COMPANYKEY = T$1.ID\n" +
      "  JOIN GD_OURCOMPANY T$4 ON T$4.COMPANYKEY = T$1.ID\n" +
      "WHERE T$1.CONTACTTYPE = :P$1");

    await AConnection.executeTransaction({
      connection,
      callback: (transaction) => AConnection.executeQueryResultSet({
        connection, transaction, sql, params,
        callback: () => 0
      })
    });
  });
});
