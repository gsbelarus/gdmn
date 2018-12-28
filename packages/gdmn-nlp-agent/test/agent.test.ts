import fs from "fs";
import {AConnection} from "gdmn-db";
import {ERBridge} from "gdmn-er-bridge";
import {parsePhrase, RusPhrase, SemCategory} from "gdmn-nlp";
import {deserializeERModel, EntityAttribute, ERModel} from "gdmn-orm";
import {ERTranslatorRU} from "../src/agent";
import {loadDBDetails} from "./testConfig";

jest.setTimeout(100 * 1000);

describe("erModel", () => {

  let erModel: ERModel;
  let translator: ERTranslatorRU;

  const dbDetail = loadDBDetails()[0];
  const connection = dbDetail.driver.newConnection();

  beforeAll(async () => {
    await connection.connect(dbDetail.connectionOptions);
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

    const phrase = parsePhrase("покажи организации").phrase;
    expect(phrase).toBeDefined();
    expect(phrase instanceof RusPhrase).toBeTruthy();

    const commands = translator.process(phrase as RusPhrase);

    expect(commands[0].action).toEqual("QUERY");
    expect(commands[0].payload).toBeDefined();
    expect(commands[0].payload.link.entity).toEqual(erModel.entities.Company);
  });

  it("phrase2", () => {
    const company = erModel.entities.Company;
    expect(company).toBeDefined();

    const placeKey = company.attributes.PLACEKEY;
    expect(placeKey).toBeDefined();
    expect(placeKey.semCategories).toEqual([SemCategory.ObjectLocation]);
    expect(company.attributesBySemCategory(SemCategory.ObjectLocation)).toEqual([placeKey]);

    const phrase = parsePhrase("покажи минские организации").phrase;
    expect(phrase).toBeDefined();
    expect(phrase instanceof RusPhrase).toBeTruthy();

    const commands = translator.process(phrase as RusPhrase);

    expect(commands[0].action).toEqual("QUERY");
    expect(commands[0].payload).toBeDefined();
    expect(commands[0].payload.link.entity).toEqual(erModel.entities.Company);
    expect(commands[0].payload.options).toBeDefined();
    expect(commands[0].payload.options!.where).toBeDefined();
    expect(commands[0].payload.options!.where![0].equals).toBeDefined();
    expect(commands[0].payload.options!.where![0].equals![0].alias).toEqual("alias2");
    expect(placeKey).toBeInstanceOf(EntityAttribute);
    expect(commands[0].payload.options!.where![0].equals![0].attribute)
      .toEqual((placeKey as EntityAttribute).entities[0].attribute("NAME"));
    expect(commands[0].payload.options!.where![0].equals![0].value).toEqual("минск");
  });

  it("phrase3", () => {
    const company = erModel.entities.Company;
    expect(company).toBeDefined();

    const placeKey = company.attributes.PLACEKEY;
    expect(placeKey).toBeDefined();
    expect(placeKey.semCategories).toEqual([SemCategory.ObjectLocation]);
    expect(company.attributesBySemCategory(SemCategory.ObjectLocation)).toEqual([placeKey]);

    const phrase = parsePhrase("покажи все организации").phrase;
    expect(phrase).toBeDefined();
    expect(phrase instanceof RusPhrase).toBeTruthy();

    const commands = translator.process(phrase as RusPhrase);

    expect(commands[0].action).toEqual("QUERY");
    expect(commands[0].payload).toBeDefined();
    expect(commands[0].payload.link.entity).toEqual(erModel.entities.Company);
  });

  it("phrase4", () => {
    const company = erModel.entities.Company;
    expect(company).toBeDefined();

    const placeKey = company.attributes.PLACEKEY;
    expect(placeKey).toBeDefined();
    expect(placeKey.semCategories).toEqual([SemCategory.ObjectLocation]);
    expect(company.attributesBySemCategory(SemCategory.ObjectLocation)).toEqual([placeKey]);

    const phrase = parsePhrase("покажи организации из минска").phrase;
    expect(phrase).toBeDefined();
    expect(phrase instanceof RusPhrase).toBeTruthy();

    const commands = translator.process(phrase as RusPhrase);

    expect(commands[0].action).toEqual("QUERY");
    expect(commands[0].payload).toBeDefined();
    expect(commands[0].payload.link.entity).toEqual(erModel.entities.Company);
    expect(commands[0].payload.options).toBeDefined();
    expect(commands[0].payload.options!.where).toBeDefined();
    expect(commands[0].payload.options!.where![0].equals).toBeDefined();
    expect(commands[0].payload.options!.where![0].equals![0].alias).toEqual("alias2");
    expect(placeKey).toBeInstanceOf(EntityAttribute);
    expect(commands[0].payload.options!.where![0].equals![0].attribute)
      .toEqual((placeKey as EntityAttribute).entities[0].attribute("NAME"));
    expect(commands[0].payload.options!.where![0].equals![0].value).toEqual("минск");
  });

  it("phrase5", () => {
    const company = erModel.entities.Company;
    expect(company).toBeDefined();

    const placeKey = company.attributes.PLACEKEY;
    expect(placeKey).toBeDefined();
    expect(placeKey.semCategories).toEqual([SemCategory.ObjectLocation]);
    expect(company.attributesBySemCategory(SemCategory.ObjectLocation)).toEqual([placeKey]);

    const phrase = parsePhrase("покажи организации из минска, пинска").phrase;
    expect(phrase).toBeDefined();
    expect(phrase instanceof RusPhrase).toBeTruthy();

    const commands = translator.process(phrase as RusPhrase);

    expect(commands[0].action).toEqual("QUERY");
    expect(commands[0].payload).toBeDefined();
    expect(commands[0].payload.link.entity).toEqual(erModel.entities.Company);
    expect(commands[0].payload.options).toBeDefined();
    expect(commands[0].payload.options!.where).toBeDefined();
    expect(commands[0].payload.options!.where![0].equals).toBeDefined();
    expect(commands[0].payload.options!.where![0].equals![0].alias).toEqual("alias2");
    expect(placeKey).toBeInstanceOf(EntityAttribute);
    expect(commands[0].payload.options!.where![0].equals![0].attribute)
      .toEqual((placeKey as EntityAttribute).entities[0].attribute("NAME"));
    expect(commands[0].payload.options!.where![0].equals![0].value).toEqual("минск");
    expect(commands[0].payload.options!.where![0].equals![0].alias).toEqual("alias2");
    expect(placeKey).toBeInstanceOf(EntityAttribute);
    expect(commands[0].payload.options!.where![0].equals![0].attribute)
      .toEqual((placeKey as EntityAttribute).entities[0].attribute("NAME"));
    expect(commands[0].payload.options!.where![0].equals![1].value).toEqual("пинск");
  });

  it("phrase6", () => {
    const company = erModel.entities.Company;
    expect(company).toBeDefined();

    const placeKey = company.attributes.PLACEKEY;
    expect(placeKey).toBeDefined();
    expect(placeKey.semCategories).toEqual([SemCategory.ObjectLocation]);
    expect(company.attributesBySemCategory(SemCategory.ObjectLocation)).toEqual([placeKey]);

    const phrase = parsePhrase("покажи все организации из минска").phrase;
    expect(phrase).toBeDefined();
    expect(phrase instanceof RusPhrase).toBeTruthy();

    const commands = translator.process(phrase as RusPhrase);

    expect(commands[0].action).toEqual("QUERY");
    expect(commands[0].payload).toBeDefined();
    expect(commands[0].payload.link.entity).toEqual(erModel.entities.Company);
    expect(commands[0].payload.options).toBeDefined();
    expect(commands[0].payload.options!.where).toBeDefined();
    expect(commands[0].payload.options!.where![0].equals).toBeDefined();
    expect(commands[0].payload.options!.where![0].equals![0].alias).toEqual("alias2");
    expect(placeKey).toBeInstanceOf(EntityAttribute);
    expect(commands[0].payload.options!.where![0].equals![0].attribute)
      .toEqual((placeKey as EntityAttribute).entities[0].attribute("NAME"));
    expect(commands[0].payload.options!.where![0].equals![0].value).toEqual("минск");
  });

  it("phrase7", () => {
    const company = erModel.entities.Company;
    expect(company).toBeDefined();

    const placeKey = company.attributes.PLACEKEY;
    expect(placeKey).toBeDefined();
    expect(placeKey.semCategories).toEqual([SemCategory.ObjectLocation]);
    expect(company.attributesBySemCategory(SemCategory.ObjectLocation)).toEqual([placeKey]);

    const phrase = parsePhrase("покажи все организации из минска и пинска").phrase;
    expect(phrase).toBeDefined();
    expect(phrase instanceof RusPhrase).toBeTruthy();

    const commands = translator.process(phrase as RusPhrase);

    expect(commands[0].action).toEqual("QUERY");
    expect(commands[0].payload).toBeDefined();
    expect(commands[0].payload.link.entity).toEqual(erModel.entities.Company);
    expect(commands[0].payload.options).toBeDefined();
    expect(commands[0].payload.options!.where).toBeDefined();
    expect(commands[0].payload.options!.where![0].equals).toBeDefined();
    expect(commands[0].payload.options!.where![0].equals![0].alias).toEqual("alias2");
    expect(placeKey).toBeInstanceOf(EntityAttribute);
    expect(commands[0].payload.options!.where![0].equals![0].attribute)
      .toEqual((placeKey as EntityAttribute).entities[0].attribute("NAME"));
    expect(commands[0].payload.options!.where![0].equals![0].value).toEqual("минск");
    expect(commands[0].payload.options!.where![0].equals![0].alias).toEqual("alias2");
    expect(placeKey).toBeInstanceOf(EntityAttribute);
    expect(commands[0].payload.options!.where![0].equals![0].attribute)
      .toEqual((placeKey as EntityAttribute).entities[0].attribute("NAME"));
    expect(commands[0].payload.options!.where![0].equals![1].value).toEqual("пинск");
  });

  it("phrase8", () => {
    const company = erModel.entities.Company;
    expect(company).toBeDefined();

    const placeKey = company.attributes.PLACEKEY;
    expect(placeKey).toBeDefined();
    expect(placeKey.semCategories).toEqual([SemCategory.ObjectLocation]);
    expect(company.attributesBySemCategory(SemCategory.ObjectLocation)).toEqual([placeKey]);

    const phrase = parsePhrase("покажи все организации из минска, пинска").phrase;
    expect(phrase).toBeDefined();
    expect(phrase instanceof RusPhrase).toBeTruthy();

    const commands = translator.process(phrase as RusPhrase);

    expect(commands[0].action).toEqual("QUERY");
    expect(commands[0].payload).toBeDefined();
    expect(commands[0].payload.link.entity).toEqual(erModel.entities.Company);
    expect(commands[0].payload.options).toBeDefined();
    expect(commands[0].payload.options!.where).toBeDefined();
    expect(commands[0].payload.options!.where![0].equals).toBeDefined();
    expect(commands[0].payload.options!.where![0].equals![0].alias).toEqual("alias2");
    expect(placeKey).toBeInstanceOf(EntityAttribute);
    expect(commands[0].payload.options!.where![0].equals![0].attribute)
      .toEqual((placeKey as EntityAttribute).entities[0].attribute("NAME"));
    expect(commands[0].payload.options!.where![0].equals![0].value).toEqual("минск");
    expect(commands[0].payload.options!.where![0].equals![0].alias).toEqual("alias2");
    expect(placeKey).toBeInstanceOf(EntityAttribute);
    expect(commands[0].payload.options!.where![0].equals![0].attribute)
      .toEqual((placeKey as EntityAttribute).entities[0].attribute("NAME"));
    expect(commands[0].payload.options!.where![0].equals![1].value).toEqual("пинск");
  });

  // it("phrase6", () => {
  //  const company = erModel.entities.Company;
  //  expect(company).toBeDefined();

  //  const placeKey = company.attributes.PLACEKEY;
  //  expect(placeKey).toBeDefined();
  //  expect(placeKey.semCategories).toEqual([SemCategory.ObjectLocation]);
  //  expect(company.attributesBySemCategory(SemCategory.ObjectLocation)).toEqual([placeKey]);

  //  const phrase = parsePhrase("покажи минские организации из минска").phrase;
  //  expect(phrase).toBeDefined();
  //  expect(phrase instanceof RusPhrase).toBeTruthy();

  //  const commands = translator.process(phrase as RusPhrase);

  //  expect(commands[0].action).toEqual("QUERY");
  //  expect(commands[0].payload).toBeDefined();
  //  expect(commands[0].payload.link.entity).toEqual(erModel.entities.Company);
  //  expect(commands[0].payload.options).toBeDefined();
  //  expect(commands[0].payload.options!.where).toBeDefined();
  //  expect(commands[0].payload.options!.where![0].equals).toBeDefined();
  //  expect(commands[0].payload.options!.where![0].equals![0].alias).toEqual("aliasL2");
  //  expect(commands[0].payload.options!.where![0].equals![0].attribute).toEqual(placeKey);
  //  expect(commands[0].payload.options!.where![0].equals![0].value).toEqual("минск");
  //  expect(commands[0].payload.options!.where![0].equals![1].alias).toEqual("aliasL2");
  //  expect(commands[0].payload.options!.where![0].equals![1].attribute).toEqual(placeKey);
  //  expect(commands[0].payload.options!.where![0].equals![1].value).toEqual("минск");
  // });
});
