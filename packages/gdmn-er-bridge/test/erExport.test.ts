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
    const withAdapters = true;
    const serialized = erModel.serialize(withAdapters);
    const deserialized = deserializeERModel(serialized, withAdapters);

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
        JSON.stringify(deserialized.serialize(withAdapters), undefined, 2)
      );
      console.log("Deserialized ERModel has been written to c:/temp/test/ermodel.test.json");
    }

    expect(JSON.stringify(serialized)).toEqual(JSON.stringify(deserialized.serialize(withAdapters)));

    /**
     * Проверка на то, что GD_PLACE древовидная таблица
     */
    const gdPlace = erModel.entity("TgdcPlace");
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
        entity: "TgdcOurCompany",
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
        entity: "TgdcOurCompany",
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
      "  JOIN GD_OURCOMPANY T$4 ON T$4.COMPANYKEY = T$1.ID");

    await AConnection.executeTransaction({
      connection,
      callback: (transaction) => AConnection.executeQueryResultSet({
        connection, transaction, sql, params,
        callback: () => 0
      })
    });
  });

  // it("simple entity with multi links in EntityAttribute", async () => {
  //   const {sql, params} = new Select(EntityQuery.inspectorToObject(erModel, {
  //     link: {
  //       entity: "TgdcCompany",
  //       alias: "com",
  //       fields: [
  //         {attribute: "ID"},
  //         {attribute: "NAME"},
  //         {
  //           attribute: "EDITORKEY",
  //           links: [
  //             {
  //               entity: "TgdcBaseContact",
  //               alias: "per",
  //               fields: [
  //                 {attribute: "ID"},
  //                 {attribute: "NAME"}
  //               ]
  //             },
  //             // {
  //             //   entity: "TgdcCompany",
  //             //   alias: "com2",
  //             //   fields: [
  //             //     {attribute: "ID"},
  //             //     {attribute: "FULLNAME"}
  //             //   ]
  //             // }
  //           ]
  //         }
  //       ]
  //     }
  //   }));

  //   expect(sql).toEqual("SELECT\n" +
  //     "  T$1.ID AS F$1,\n" +
  //     "  T$1.NAME AS F$2,\n" +
  //     "  T$2.ID AS F$3,\n" +
  //     "  T$3.MIDDLENAME AS F$4,\n" +
  //     "  T$4.ID AS F$5,\n" +
  //     "  T$5.FULLNAME AS F$6\n" +
  //     "FROM GD_CONTACT T$1\n" +
  //     "  JOIN GD_COMPANY T$6 ON T$6.CONTACTKEY = T$1.ID\n" +
  //     "  LEFT JOIN GD_COMPANYCODE T$7 ON T$7.COMPANYKEY = T$1.ID\n" +
  //     "  LEFT JOIN GD_CONTACT T$2 ON T$2.ID = T$1.EDITORKEY\n" +
  //     "  LEFT JOIN GD_PEOPLE T$3 ON T$3.CONTACTKEY = T$2.ID\n" +
  //     "  LEFT JOIN GD_CONTACT T$4 ON T$4.ID = T$1.EDITORKEY\n" +
  //     "  LEFT JOIN GD_COMPANY T$5 ON T$5.CONTACTKEY = T$4.ID\n" +
  //     "WHERE T$1.CONTACTTYPE = :P$1");

  //   await AConnection.executeTransaction({
  //     connection,
  //     callback: (transaction) => AConnection.executeQueryResultSet({
  //       connection, transaction, sql, params,
  //       callback: () => 0
  //     })
  //   });
  // });
});
