import fs from "fs";
import {AConnection} from "gdmn-db";
import {ERBridge} from "gdmn-er-bridge";
import {parsePhrase, RusPhrase, SemCategory} from "gdmn-nlp";
import {deserializeERModel, EntityAttribute, ERModel, StringAttribute} from "gdmn-orm";
import {ERTranslatorRU} from "../src/agent";
import {loadDBDetails} from "./testConfig";

jest.setTimeout(100 * 1000);

describe.skip("erModel", () => {

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
        erModel2.inspect().join('\n')
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
    const company = erModel.entities.TgdcCompany;
    expect(company).toBeDefined();

    const placeKey = company.attributes.PLACEKEY;
    expect(placeKey).toBeDefined();
    expect(placeKey.semCategories).toEqual([SemCategory.ObjectLocation]);
    expect(company.attributesBySemCategory(SemCategory.ObjectLocation)).toEqual([placeKey]);

    const phrase = parsePhrase("покажи организации")[0].phrase;
    expect(phrase).toBeDefined();
    expect(phrase instanceof RusPhrase).toBeTruthy();

    const commands = translator.process([phrase] as RusPhrase[]);

    expect(commands[0].action).toEqual("QUERY");
    expect(commands[0].payload).toBeDefined();
    expect(commands[0].payload.link.entity).toEqual(company);
  });

  it("phrase2", () => {
    const company = erModel.entities.TgdcCompany;
    expect(company).toBeDefined();

    const placeKey = company.attributes.PLACEKEY;
    expect(placeKey).toBeDefined();
    expect(placeKey.semCategories).toEqual([SemCategory.ObjectLocation]);
    expect(company.attributesBySemCategory(SemCategory.ObjectLocation)).toEqual([placeKey]);

    const phrase = parsePhrase("покажи минские организации")[0].phrase;
    expect(phrase).toBeDefined();
    expect(phrase instanceof RusPhrase).toBeTruthy();

    const commands = translator.process([phrase] as RusPhrase[]);

    expect(commands[0].action).toEqual("QUERY");
    expect(commands[0].payload).toBeDefined();
    expect(commands[0].payload.link.entity).toEqual(company);
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
    const company = erModel.entities.TgdcCompany;
    expect(company).toBeDefined();

    const placeKey = company.attributes.PLACEKEY;
    expect(placeKey).toBeDefined();
    expect(placeKey.semCategories).toEqual([SemCategory.ObjectLocation]);
    expect(company.attributesBySemCategory(SemCategory.ObjectLocation)).toEqual([placeKey]);

    const phrase = parsePhrase("покажи все организации")[0].phrase;
    expect(phrase).toBeDefined();
    expect(phrase instanceof RusPhrase).toBeTruthy();

    const commands = translator.process([phrase] as RusPhrase[]);

    expect(commands[0].action).toEqual("QUERY");
    expect(commands[0].payload).toBeDefined();
    expect(commands[0].payload.link.entity).toEqual(company);
  });

  it("phrase4", () => {
    const company = erModel.entities.TgdcCompany;
    expect(company).toBeDefined();

    const placeKey = company.attributes.PLACEKEY;
    expect(placeKey).toBeDefined();
    expect(placeKey.semCategories).toEqual([SemCategory.ObjectLocation]);
    expect(company.attributesBySemCategory(SemCategory.ObjectLocation)).toEqual([placeKey]);

    const phrase = parsePhrase("покажи организации из минска")[0].phrase;
    expect(phrase).toBeDefined();
    expect(phrase instanceof RusPhrase).toBeTruthy();

    const commands = translator.process([phrase] as RusPhrase[]);

    expect(commands[0].action).toEqual("QUERY");
    expect(commands[0].payload).toBeDefined();
    expect(commands[0].payload.link.entity).toEqual(company);
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
    const company = erModel.entities.TgdcCompany;
    expect(company).toBeDefined();

    const placeKey = company.attributes.PLACEKEY;
    expect(placeKey).toBeDefined();
    expect(placeKey.semCategories).toEqual([SemCategory.ObjectLocation]);
    expect(company.attributesBySemCategory(SemCategory.ObjectLocation)).toEqual([placeKey]);

    const phrase = parsePhrase("покажи организации из минска, пинска")[0].phrase;
    expect(phrase).toBeDefined();
    expect(phrase instanceof RusPhrase).toBeTruthy();

    const commands = translator.process([phrase] as RusPhrase[]);

    expect(commands[0].action).toEqual("QUERY");
    expect(commands[0].payload).toBeDefined();
    expect(commands[0].payload.link.entity).toEqual(company);
    expect(commands[0].payload.options).toBeDefined();
    expect(commands[0].payload.options!.where).toBeDefined();
    expect(commands[0].payload.options!.where![0].or).toBeDefined();
    expect(commands[0].payload.options!.where![0].or![0].equals).toBeDefined();
    expect(commands[0].payload.options!.where![0].or![0].equals![0].alias).toEqual("alias2");
    expect(placeKey).toBeInstanceOf(EntityAttribute);
    expect(commands[0].payload.options!.where![0].or![0].equals![0].attribute)
      .toEqual((placeKey as EntityAttribute).entities[0].attribute("NAME"));
    expect(commands[0].payload.options!.where![0].or![0].equals![0].value).toEqual("минск");
    expect(commands[0].payload.options!.where![0].or).toBeDefined();
    expect(commands[0].payload.options!.where![0].or![0].equals).toBeDefined();
    expect(commands[0].payload.options!.where![0].or![1].equals![0].alias).toEqual("alias2");
    expect(placeKey).toBeInstanceOf(EntityAttribute);
    expect(commands[0].payload.options!.where![0].or![1].equals![0].attribute)
      .toEqual((placeKey as EntityAttribute).entities[0].attribute("NAME"));
    expect(commands[0].payload.options!.where![0].or![1].equals![0].value).toEqual("пинск");
  });

  it("phrase6", () => {
    const company = erModel.entities.TgdcCompany;
    expect(company).toBeDefined();

    const placeKey = company.attributes.PLACEKEY;
    expect(placeKey).toBeDefined();
    expect(placeKey.semCategories).toEqual([SemCategory.ObjectLocation]);
    expect(company.attributesBySemCategory(SemCategory.ObjectLocation)).toEqual([placeKey]);

    const phrase = parsePhrase("покажи все организации из минска")[0].phrase;
    expect(phrase).toBeDefined();
    expect(phrase instanceof RusPhrase).toBeTruthy();

    const commands = translator.process([phrase] as RusPhrase[]);

    expect(commands[0].action).toEqual("QUERY");
    expect(commands[0].payload).toBeDefined();
    expect(commands[0].payload.link.entity).toEqual(company);
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
    const company = erModel.entities.TgdcCompany;
    expect(company).toBeDefined();

    const placeKey = company.attributes.PLACEKEY;
    expect(placeKey).toBeDefined();
    expect(placeKey.semCategories).toEqual([SemCategory.ObjectLocation]);
    expect(company.attributesBySemCategory(SemCategory.ObjectLocation)).toEqual([placeKey]);

    const phrase = parsePhrase("покажи все организации из минска и пинска")[0].phrase;
    expect(phrase).toBeDefined();
    expect(phrase instanceof RusPhrase).toBeTruthy();

    const commands = translator.process([phrase] as RusPhrase[]);

    expect(commands[0].action).toEqual("QUERY");
    expect(commands[0].payload).toBeDefined();
    expect(commands[0].payload.link.entity).toEqual(company);
    expect(commands[0].payload.options).toBeDefined();
    expect(commands[0].payload.options!.where).toBeDefined();
    expect(commands[0].payload.options!.where![0].or).toBeDefined();
    expect(commands[0].payload.options!.where![0].or![0].equals).toBeDefined();
    expect(commands[0].payload.options!.where![0].or![0].equals![0].alias).toEqual("alias2");
    expect(placeKey).toBeInstanceOf(EntityAttribute);
    expect(commands[0].payload.options!.where![0].or![0].equals![0].attribute)
      .toEqual((placeKey as EntityAttribute).entities[0].attribute("NAME"));
    expect(commands[0].payload.options!.where![0].or![0].equals![0].value).toEqual("минск");
    expect(commands[0].payload.options!.where![0].or).toBeDefined();
    expect(commands[0].payload.options!.where![0].or![0].equals).toBeDefined();
    expect(commands[0].payload.options!.where![0].or![1].equals![0].alias).toEqual("alias2");
    expect(placeKey).toBeInstanceOf(EntityAttribute);
    expect(commands[0].payload.options!.where![0].or![1].equals![0].attribute)
      .toEqual((placeKey as EntityAttribute).entities[0].attribute("NAME"));
    expect(commands[0].payload.options!.where![0].or![1].equals![0].value).toEqual("пинск");
  });

  it("phrase8", () => {
    const company = erModel.entities.TgdcCompany;
    expect(company).toBeDefined();

    const placeKey = company.attributes.PLACEKEY;
    expect(placeKey).toBeDefined();
    expect(placeKey.semCategories).toEqual([SemCategory.ObjectLocation]);
    expect(company.attributesBySemCategory(SemCategory.ObjectLocation)).toEqual([placeKey]);

    const phrase = parsePhrase("покажи все организации из минска, пинска")[0].phrase;
    expect(phrase).toBeDefined();
    expect(phrase instanceof RusPhrase).toBeTruthy();

    const commands = translator.process([phrase] as RusPhrase[]);

    expect(commands[0].action).toEqual("QUERY");
    expect(commands[0].payload).toBeDefined();
    expect(commands[0].payload.link.entity).toEqual(company);
    expect(commands[0].payload.options).toBeDefined();
    expect(commands[0].payload.options!.where).toBeDefined();
    expect(commands[0].payload.options!.where![0].or).toBeDefined();
    expect(commands[0].payload.options!.where![0].or![0].equals).toBeDefined();
    expect(commands[0].payload.options!.where![0].or![0].equals![0].alias).toEqual("alias2");
    expect(placeKey).toBeInstanceOf(EntityAttribute);
    expect(commands[0].payload.options!.where![0].or![0].equals![0].attribute)
      .toEqual((placeKey as EntityAttribute).entities[0].attribute("NAME"));
    expect(commands[0].payload.options!.where![0].or![0].equals![0].value).toEqual("минск");
    expect(commands[0].payload.options!.where![0].or).toBeDefined();
    expect(commands[0].payload.options!.where![0].or![0].equals).toBeDefined();
    expect(commands[0].payload.options!.where![0].or![1].equals![0].alias).toEqual("alias2");
    expect(placeKey).toBeInstanceOf(EntityAttribute);
    expect(commands[0].payload.options!.where![0].or![1].equals![0].attribute)
      .toEqual((placeKey as EntityAttribute).entities[0].attribute("NAME"));
    expect(commands[0].payload.options!.where![0].or![1].equals![0].value).toEqual("пинск");
  });

   it("phrase9", () => {
    const company = erModel.entities.TgdcCompany;
    expect(company).toBeDefined();

    const placeKey = company.attributes.PLACEKEY;
    expect(placeKey).toBeDefined();
    expect(placeKey.semCategories).toEqual([SemCategory.ObjectLocation]);
    expect(company.attributesBySemCategory(SemCategory.ObjectLocation)).toEqual([placeKey]);

    const phrase = parsePhrase("покажи сорок пять организаций из минска")[0].phrase;
    expect(phrase).toBeDefined();
    expect(phrase instanceof RusPhrase).toBeTruthy();

    const commands = translator.process([phrase] as RusPhrase[]);

    expect(commands[0].action).toEqual("QUERY");
    expect(commands[0].payload).toBeDefined();
    commands[0].payload.options!.first
    expect(commands[0].payload.link.entity).toEqual(erModel.entities.TgdcCompany);
    expect(commands[0].payload.options).toBeDefined();
    expect(commands[0].payload.options!.first).toBeDefined();
    expect(commands[0].payload.options!.first).toEqual(45);
    expect(commands[0].payload.options!.where).toBeDefined();
    expect(commands[0].payload.options!.where![0].equals).toBeDefined();
    expect(commands[0].payload.options!.where![0].equals![0].alias).toEqual("alias2");
    expect(placeKey).toBeInstanceOf(EntityAttribute);
    expect(commands[0].payload.options!.where![0].equals![0].attribute)
      .toEqual((placeKey as EntityAttribute).entities[0].attribute("NAME"));
    expect(commands[0].payload.options!.where![0].equals![0].value).toEqual("минск");
   });

   it("phrase10", () => {
    const company = erModel.entities.TgdcCompany;
    expect(company).toBeDefined();

    const placeKey = company.attributes.PLACEKEY;
    expect(placeKey).toBeDefined();
    expect(placeKey.semCategories).toEqual([SemCategory.ObjectLocation]);
    expect(company.attributesBySemCategory(SemCategory.ObjectLocation)).toEqual([placeKey]);

    const phrase = parsePhrase("покажи 55 организаций из минска")[0].phrase;
    expect(phrase).toBeDefined();
    expect(phrase instanceof RusPhrase).toBeTruthy();

    const commands = translator.process([phrase] as RusPhrase[]);

    expect(commands[0].action).toEqual("QUERY");
    expect(commands[0].payload).toBeDefined();
    commands[0].payload.options!.first
    expect(commands[0].payload.link.entity).toEqual(erModel.entities.TgdcCompany);
    expect(commands[0].payload.options).toBeDefined();
    expect(commands[0].payload.options!.first).toBeDefined();
    expect(commands[0].payload.options!.first).toEqual(55);
    expect(commands[0].payload.options!.where).toBeDefined();
    expect(commands[0].payload.options!.where![0].equals).toBeDefined();
    expect(commands[0].payload.options!.where![0].equals![0].alias).toEqual("alias2");
    expect(placeKey).toBeInstanceOf(EntityAttribute);
    expect(commands[0].payload.options!.where![0].equals![0].attribute)
      .toEqual((placeKey as EntityAttribute).entities[0].attribute("NAME"));
    expect(commands[0].payload.options!.where![0].equals![0].value).toEqual("минск");
   });

   it("phrase11", () => {
    const company = erModel.entities.TgdcCompany;
    expect(company).toBeDefined();

    const placeKey = company.attributes.PLACEKEY;
    expect(placeKey).toBeDefined();
    expect(placeKey.semCategories).toEqual([SemCategory.ObjectLocation]);
    expect(company.attributesBySemCategory(SemCategory.ObjectLocation)).toEqual([placeKey]);

    const phrase = parsePhrase("покажи TgdcCompany")[0].phrase;
    expect(phrase).toBeDefined();
    expect(phrase instanceof RusPhrase).toBeTruthy();

    const commands = translator.process([phrase] as RusPhrase[]);

    expect(commands[0].action).toEqual("QUERY");
    expect(commands[0].payload).toBeDefined();
    expect(commands[0].payload.link.entity).toEqual(company);
  });

  it("phrase12", () => {
    const company = erModel.entities.TgdcCompany;
    expect(company).toBeDefined();

    const placeKey = company.attributes.PLACEKEY;
    expect(placeKey).toBeDefined();
    expect(placeKey.semCategories).toEqual([SemCategory.ObjectLocation]);
    expect(company.attributesBySemCategory(SemCategory.ObjectLocation)).toEqual([placeKey]);

    const phrase = parsePhrase("покажи все TgdcCompany")[0].phrase;
    expect(phrase).toBeDefined();
    expect(phrase instanceof RusPhrase).toBeTruthy();

    const commands = translator.process([phrase] as RusPhrase[]);

    expect(commands[0].action).toEqual("QUERY");
    expect(commands[0].payload).toBeDefined();
    expect(commands[0].payload.link.entity).toEqual(company);
  });

  it("phrase13", () => {
    const company = erModel.entities.TgdcCompany;
    expect(company).toBeDefined();

    const placeKey = company.attributes.PLACEKEY;
    expect(placeKey).toBeDefined();
    expect(placeKey.semCategories).toEqual([SemCategory.ObjectLocation]);
    expect(company.attributesBySemCategory(SemCategory.ObjectLocation)).toEqual([placeKey]);

    const phoneKey = company.attributes.PHONE;
    expect(phoneKey).toBeDefined();

    const nameKey = company.attributes.NAME;
    expect(nameKey).toBeDefined();

    const phrases = parsePhrase("Покажи все организации из Минска. Название содержит ООО. Отсутствует телефон.")
      .map((pars) => {return pars.phrase});
    expect(phrases).toBeDefined();

    const commands = translator.process(phrases as RusPhrase[]);

    expect(commands[0].action).toEqual("QUERY");
    expect(commands[0].payload).toBeDefined();
    expect(commands[0].payload.link.entity).toEqual(company);
    expect(commands[0].payload.options).toBeDefined();
    expect(commands[0].payload.options!.where).toBeDefined();
    expect(commands[0].payload.options!.where![0].equals).toBeDefined();
    expect(commands[0].payload.options!.where![0].equals![0].alias).toEqual("alias2");
    expect(placeKey).toBeInstanceOf(EntityAttribute);
    expect(commands[0].payload.options!.where![0].equals![0].attribute)
      .toEqual((placeKey as EntityAttribute).entities[0].attribute("NAME"));
    expect(commands[0].payload.options!.where![0].equals![0].value).toEqual("минск");

    expect(commands[0].payload.options!.where![0].contains).toBeDefined();
    expect(commands[0].payload.options!.where![0].contains![0].alias).toEqual("alias1");
    expect(nameKey).toBeInstanceOf(StringAttribute);
    expect(commands[0].payload.options!.where![0].contains![0].attribute)
    .toEqual(company.attribute("NAME"));
    expect(commands[0].payload.options!.where![0].contains![0].value).toEqual("ООО");

    expect(commands[0].payload.options!.where![0].isNull).toBeDefined();
    expect(commands[0].payload.options!.where![0].isNull![0].alias).toEqual("alias1");
    expect(phoneKey).toBeInstanceOf(StringAttribute);
    expect(commands[0].payload.options!.where![0].isNull![0].attribute)
      .toEqual(company.attribute("PHONE"));
  });

  it("phrase14", () => {
    const company = erModel.entities.TgdcCompany;
    expect(company).toBeDefined();

    const phrases = parsePhrase("Покажи первые 10 организаций. Адрес не содержит Минск.")
      .map((pars) => {return pars.phrase});
    expect(phrases).toBeDefined();

    const commands = translator.process(phrases as RusPhrase[]);

    expect(commands[0].action).toEqual("QUERY");
    expect(commands[0].payload).toBeDefined();
    expect(commands[0].payload.link.entity).toEqual(company);
    expect(commands[0].payload.options!.first).toBeDefined();
    expect(commands[0].payload.options!.first).toEqual(10);
    expect(commands[0].payload.options).toBeDefined();
    expect(commands[0].payload.options!.where).toBeDefined();
    expect(commands[0].payload.options!.where![0].not).toBeDefined();
    expect(commands[0].payload.options!.where![0].not![0].contains).toBeDefined();
    expect(commands[0].payload.options!.where![0].not![0].contains![0].alias).toEqual("alias1");
    expect(commands[0].payload.options!.where![0].not![0].contains![0].attribute)
      .toEqual(company.attribute("ADDRESS"));
    expect(commands[0].payload.options!.where![0].not![0].contains![0].value).toEqual("минск");
  });

  it("phrase15", () => {
    const company = erModel.entities.TgdcCompany;
    expect(company).toBeDefined();

    const phoneKey = company.attributes.PHONE;
    expect(phoneKey).toBeDefined();

    const emailKey = company.attributes.EMAIL;
    expect(emailKey).toBeDefined();

    const zipKey = company.attributes.ZIP;
    expect(zipKey).toBeDefined();

    const phrases = parsePhrase("Покажи TgdcCompany. Есть телефон. Нет email. ZIP больше 220000")
      .map((pars) => {return pars.phrase});
    expect(phrases).toBeDefined();

    const commands = translator.process(phrases as RusPhrase[]);

    expect(commands[0].action).toEqual("QUERY");
    expect(commands[0].payload).toBeDefined();
    expect(commands[0].payload.link.entity).toEqual(company);
    expect(commands[0].payload.options).toBeDefined();
    expect(commands[0].payload.options!.where).toBeDefined();

    expect(commands[0].payload.options!.where![0].not).toBeDefined();
    expect(commands[0].payload.options!.where![0].not![0].isNull).toBeDefined();
    expect(commands[0].payload.options!.where![0].not![0].isNull).toBeDefined();
    expect(commands[0].payload.options!.where![0].not![0].isNull![0].alias).toEqual("alias1");
    expect(phoneKey).toBeInstanceOf(StringAttribute);
    expect(commands[0].payload.options!.where![0].not![0].isNull![0].attribute)
      .toEqual(company.attribute("PHONE"));

    expect(commands[0].payload.options!.where![0].isNull).toBeDefined();
    expect(commands[0].payload.options!.where![0].isNull).toBeDefined();
    expect(commands[0].payload.options!.where![0].isNull![0].alias).toEqual("alias1");
    expect(emailKey).toBeInstanceOf(StringAttribute);
    expect(commands[0].payload.options!.where![0].isNull![0].attribute)
      .toEqual(company.attribute("EMAIL"));

    expect(commands[0].payload.options!.where![0].greater).toBeDefined();
    expect(commands[0].payload.options!.where![0].greater![0].alias).toEqual("alias1");
    expect(zipKey).toBeInstanceOf(StringAttribute);
    expect(commands[0].payload.options!.where![0].greater![0].attribute)
      .toEqual(company.attribute("ZIP"));
    expect(commands[0].payload.options!.where![0].greater![0].value).toEqual(220000);
  });
});
