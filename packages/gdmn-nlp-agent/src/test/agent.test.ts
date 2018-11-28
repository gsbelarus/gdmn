import fs from "fs";
import {AConnection, ADriver, IConnectionOptions} from "gdmn-db";
import {ERBridge} from "gdmn-er-bridge";
import {parsePhrase, RusPhrase, SemCategory} from "gdmn-nlp";
import {deserializeERModel, ERModel} from "gdmn-orm";
import {ERTranslatorRU} from "../agent";
import {Determiner} from "../command";

export interface IDBDetail<ConnectionOptions extends IConnectionOptions = IConnectionOptions> {
  alias: string;
  driver: ADriver;
  options: ConnectionOptions;
}

jest.setTimeout(100 * 1000);

describe("erModel", () => {

  let erModel: ERModel;
  let translator: ERTranslatorRU;

  const dbDetail = require("./testDB").testDB[0] as IDBDetail;
  const {driver, options}: IDBDetail = dbDetail;
  const connection = driver.newConnection();

  beforeAll(async () => {
    await connection.connect(options);
    await ERBridge.initDatabase(connection);

    const erModel2 = await AConnection.executeTransaction({
      connection,
      callback: (transaction) => ERBridge.reloadERModel(connection, transaction, new ERModel())
    });
    expect(erModel2).toBeDefined();
    const serialized = erModel2.serialize();
    erModel = deserializeERModel(serialized);
    translator = new ERTranslatorRU(erModel);
    expect(translator).toBeDefined();

    if (fs.existsSync("c:/temp/test")) {
      fs.writeFileSync("c:/temp/test/ermodel.json",
        erModel2.inspect().reduce((p, s) => `${p}${s}\n`, "")
      );
      console.log("ERModel has been written to c:/temp/test/ermodel.json");

      fs.writeFileSync("c:/temp/test/ermodel.serialized.json",
        JSON.stringify(erModel.serialize(), undefined, 2)
      );
      console.log("Serialized ERModel has been written to c:/temp/test/ermodel.serialized.json");
    }
  });

  afterAll(async () => {
    await connection.disconnect();
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
