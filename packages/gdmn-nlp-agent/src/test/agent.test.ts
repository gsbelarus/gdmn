import fs from "fs";
import {AConnection} from "gdmn-db";
import {ERBridge} from "gdmn-er-bridge";
import {parsePhrase, RusPhrase, SemCategory} from "gdmn-nlp";
import {deserializeERModel, ERModel} from "gdmn-orm";
import {ERTranslatorRU} from "../agent";
import { Determiner } from "../command";
import {IDBDetail, testDB} from "./testDB";

async function loadERModel(dbDetail: IDBDetail) {
  const {driver, options}: IDBDetail = dbDetail;

  console.log(JSON.stringify(options, undefined, 2));
  console.time("Total load time");
  const result = await AConnection.executeConnection({
    connection: driver.newConnection(),
    options,
    callback: (connection) => AConnection.executeTransaction({
      connection,
      callback: async (transaction) => {
        console.time("DBStructure load time");
        const dbStructure = await driver.readDBStructure(connection, transaction);
        // console.log(`DBStructure: ${Object.entries(dbStructure.relations).length} relations loaded...`);
        console.timeEnd("DBStructure load time");
        console.time("erModel load time");
        const erModel = await new ERBridge(connection).exportFromDatabase(dbStructure, transaction, new ERModel());
        // console.log(`erModel: loaded ${Object.entries(erModel.entities).length} entities`);
        console.timeEnd("erModel load time");
        return {
          dbStructure,
          erModel
        };
      }
    })
  });

  return result;
}

jest.setTimeout(100 * 1000);

describe("erModel", () => {

  let erModel: ERModel;
  let translator: ERTranslatorRU;

  beforeAll(async () => {
    const loaded = await loadERModel(testDB[0]);
    expect(loaded.erModel).toBeDefined();
    const serialized = loaded.erModel.serialize();
    erModel = deserializeERModel(serialized);
    translator = new ERTranslatorRU(erModel);
    expect(translator).toBeDefined();

    if (fs.existsSync("c:/temp/test")) {
      fs.writeFileSync("c:/temp/test/ermodel.json",
        loaded.erModel.inspect().reduce((p, s) => `${p}${s}\n`, "")
      );
      console.log("ERModel has been written to c:/temp/test/ermodel.json");

      fs.writeFileSync("c:/temp/test/ermodel.serialized.json",
        JSON.stringify(erModel.serialize(), undefined, 2)
      );
      console.log("Serialized ERModel has been written to c:/temp/test/ermodel.serialized.json");
    }
  });

  it("phrase", () => {
    const company = erModel.entities.Company;
    expect(company).toBeDefined();

    const placeKey = company.attributes.PLACEKEY;
    expect(placeKey).toBeDefined();
    expect(placeKey.semCategories).toEqual([SemCategory.ObjectLocation]);
    expect(company.attributesBySemCategory(SemCategory.ObjectLocation)).toEqual([placeKey]);

    const phrase = parsePhrase("покажи все организации из минска").phrase;
    expect(phrase).toBeDefined();
    expect(phrase instanceof RusPhrase).toBeTruthy();

    const command = translator.process(phrase as RusPhrase);

    expect(command.action).toEqual("SHOW");
    expect(command.objects).toBeDefined();
    expect(command.objects!.length).toEqual(1);
    expect(command.objects![0].determiner).toEqual(Determiner.All);
    expect(command.objects![0].entity).toEqual(erModel.entities.Company);
    expect(command.objects![0].conditions.length).toEqual(1);
    expect(command.objects![0].conditions![0].attr).toEqual(placeKey);
    expect(command.objects![0].conditions![0].op).toEqual("HASROOT");
    expect(command.objects![0].conditions![0].value).toEqual("минск");
  });

  it("phrase2", () => {
    const company = erModel.entities.Company;
    expect(company).toBeDefined();

    const placeKey = company.attributes.PLACEKEY;
    expect(placeKey).toBeDefined();
    expect(placeKey.semCategories).toEqual([SemCategory.ObjectLocation]);
    expect(company.attributesBySemCategory(SemCategory.ObjectLocation)).toEqual([placeKey]);

    const phrase = parsePhrase("уничтожь все организации из минска").phrase;
    expect(phrase).toBeDefined();
    expect(phrase instanceof RusPhrase).toBeTruthy();

    const command = translator.process(phrase as RusPhrase);

    expect(command.action).toEqual("DELETE");
    expect(command.objects).toBeDefined();
    expect(command.objects!.length).toEqual(1);
    expect(command.objects![0].determiner).toEqual(Determiner.All);
    expect(command.objects![0].entity).toEqual(erModel.entities.Company);
    expect(command.objects![0].conditions.length).toEqual(1);
    expect(command.objects![0].conditions![0].attr).toEqual(placeKey);
    expect(command.objects![0].conditions![0].op).toEqual("HASROOT");
    expect(command.objects![0].conditions![0].value).toEqual("минск");
  });

  it("phrase3", () => {
    const company = erModel.entities.Company;
    expect(company).toBeDefined();

    const placeKey = company.attributes.PLACEKEY;
    expect(placeKey).toBeDefined();
    expect(placeKey.semCategories).toEqual([SemCategory.ObjectLocation]);
    expect(company.attributesBySemCategory(SemCategory.ObjectLocation)).toEqual([placeKey]);

    const phrase = parsePhrase("уничтожь минские организации").phrase;
    expect(phrase).toBeDefined();
    expect(phrase instanceof RusPhrase).toBeTruthy();

    const command = translator.process(phrase as RusPhrase);

    expect(command.action).toEqual("DELETE");
    expect(command.objects).toBeDefined();
    expect(command.objects!.length).toEqual(1);
    expect(command.objects![0].determiner).toEqual(Determiner.All);
    expect(command.objects![0].entity).toEqual(erModel.entities.Company);
    expect(command.objects![0].conditions.length).toEqual(1);
    expect(command.objects![0].conditions![0].attr).toEqual(placeKey);
    expect(command.objects![0].conditions![0].op).toEqual("HASROOT");
    expect(command.objects![0].conditions![0].value).toEqual("минск");
  });
});
