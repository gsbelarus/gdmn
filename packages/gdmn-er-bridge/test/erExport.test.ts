import * as fs from "fs";
import {AConnection} from "gdmn-db";
import {deserializeERModel, ERModel, IntegerAttribute, ParentAttribute} from "gdmn-orm";
import {IDBDetail} from "../src/ddl/export/dbdetail";
import {ERBridge} from "../src/ERBridge";
import {exportTestDBDetail} from "./testDB";

// async function createDatabaseAndLoadERModel(dbDetail: IDBDetail) {
//   const {driver, options}: IDBDetail = dbDetail;
//
//   console.log(JSON.stringify(options, undefined, 2));
//   console.time("Total load time");
//   const connection = driver.newConnection();
//   await connection.createDatabase(options);
//   const erBridge = new ERBridge(connection);
//   await erBridge.initDatabase();
//   const result = await AConnection.executeTransaction({
//     connection,
//     callback: async (transaction) => {
//       console.time("DBStructure load time");
//       const dbStructure = await driver.readDBStructure(connection, transaction);
//       console.log(`DBStructure: ${Object.entries(dbStructure.relations).length} relations loaded...`);
//       console.timeEnd("DBStructure load time");
//       console.time("erModel load time");
//       const erModel = await erBridge.exportFromDatabase(dbStructure, transaction, new ERModel());
//       console.log(`erModel: loaded ${Object.entries(erModel.entities).length} entities`);
//       console.timeEnd("erModel load time");
//       return {
//         dbStructure,
//         erModel
//       };
//     }
//   });
//   await connection.disconnect();
//   return result;
// }

async function loadERModel(dbDetail: IDBDetail) {
  const {driver, options}: IDBDetail = dbDetail;

  console.log(JSON.stringify(options, undefined, 2));
  console.time("Total load time");
  return await AConnection.executeConnection({
    connection: driver.newConnection(),
    options,
    callback: async (connection) => {
      const erBridge = new ERBridge(connection);
      return await AConnection.executeTransaction({
        connection,
        callback: async (transaction) => {
          console.time("DBStructure load time");
          const dbStructure = await driver.readDBStructure(connection, transaction);
          console.log(`DBStructure: ${Object.entries(dbStructure.relations).length} relations loaded...`);
          console.timeEnd("DBStructure load time");
          console.time("erModel load time");
          const erModel = await erBridge.exportFromDatabase(dbStructure, transaction, new ERModel());
          console.log(`erModel: loaded ${Object.entries(erModel.entities).length} entities`);
          console.timeEnd("erModel load time");
          return {
            dbStructure,
            erModel
          };
        }
      });
    }
  });
}

describe("ERExport", () => {

  it("erExport", async () => {
    // const result = await loadERModel(importTestDBDetail);
    const result = await loadERModel(exportTestDBDetail);
    const serialized = result.erModel.serialize();
    const deserialized = deserializeERModel(serialized);

    if (fs.existsSync("c:/temp/test")) {
      fs.writeFileSync("c:/temp/test/ermodel.json",
        result.erModel.inspect().reduce((p, s) => `${p}${s}\n`, "")
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
    const gdPlace = result.erModel.entities["GD_PLACE"];
    expect(gdPlace).toBeDefined();
    expect(gdPlace.isTree).toBeTruthy();
    expect(gdPlace.attributes["PARENT"]).toBeDefined();
    expect(gdPlace.attributes["PARENT"]).toBeInstanceOf(ParentAttribute);
    expect(gdPlace.attributes["LB"]).toBeDefined();
    expect(gdPlace.attributes["LB"]).toBeInstanceOf(IntegerAttribute);
    expect(gdPlace.attributes["RB"]).toBeDefined();
    expect(gdPlace.attributes["RB"]).toBeInstanceOf(IntegerAttribute);
  }, 120000);
});
