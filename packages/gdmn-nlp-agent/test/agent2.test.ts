import fs from "fs";
import {AConnection} from "gdmn-db";
import {ERBridge} from "gdmn-er-bridge";
import {parsePhrase, RusPhrase, SemCategory} from "gdmn-nlp";
import {deserializeERModel, EntityAttribute, ERModel, StringAttribute} from "gdmn-orm";
import {ERTranslatorRU2} from "../src/agent2";
import {loadDBDetails} from "./testConfig";

jest.setTimeout(100 * 1000);

describe("agent2", () => {

  let erModel: ERModel;
  let translator: ERTranslatorRU2;

  const dbDetail = loadDBDetails()[0];
  const connection = dbDetail.driver.newConnection();

  beforeAll(async () => {
    await connection.connect(dbDetail.connectionOptions);
    await ERBridge.initDatabase(connection);

    erModel = await AConnection.executeTransaction({
      connection,
      callback: (transaction) => ERBridge.reloadERModel(connection, transaction, new ERModel())
    });
    expect(erModel).toBeDefined();
    translator = new ERTranslatorRU2(erModel);
    expect(translator).toBeDefined();
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

    const command = translator.processText("покажи организации", true);

    expect(command.action).toEqual("QUERY");
    expect(command.payload).toBeDefined();
    expect(command.payload.link.entity).toEqual(company);
  });

  it("phrase3", () => {
    const company = erModel.entities.TgdcCompany;
    expect(company).toBeDefined();

    const placeKey = company.attributes.PLACEKEY;
    expect(placeKey).toBeDefined();
    expect(placeKey.semCategories).toEqual([SemCategory.ObjectLocation]);
    expect(company.attributesBySemCategory(SemCategory.ObjectLocation)).toEqual([placeKey]);

    const command = translator.processText("покажи все организации", true);

    expect(command.action).toEqual("QUERY");
    expect(command.payload).toBeDefined();
    expect(command.payload.link.entity).toEqual(company);
  });

  it("phrase4", () => {
    const company = erModel.entities.TgdcCompany;
    expect(company).toBeDefined();

    const placeKey = company.attributes.PLACEKEY;
    expect(placeKey).toBeDefined();
    expect(placeKey.semCategories).toEqual([SemCategory.ObjectLocation]);
    expect(company.attributesBySemCategory(SemCategory.ObjectLocation)).toEqual([placeKey]);

    const command = translator.processText("покажи организации из минска", true);

    expect(command.action).toEqual("QUERY");
    expect(command.payload).toBeDefined();
    expect(command.payload.link.entity).toEqual(company);
    expect(command.payload.options).toBeDefined();
    expect(command.payload.options!.where).toBeDefined();
    expect(command.payload.options!.where![0].contains).toBeDefined();
    expect(command.payload.options!.where![0].contains![0].alias).toEqual("PLACEKEY");
    expect(placeKey).toBeInstanceOf(EntityAttribute);
    expect(command.payload.options!.where![0].contains![0].attribute)
      .toEqual((placeKey as EntityAttribute).entities[0].attribute("NAME"));
    expect(command.payload.options!.where![0].contains![0].value).toEqual("минск");
  });

  it("phrase5", () => {
    const company = erModel.entities.TgdcCompany;
    expect(company).toBeDefined();

    const placeKey = company.attributes.PLACEKEY;
    expect(placeKey).toBeDefined();
    expect(placeKey.semCategories).toEqual([SemCategory.ObjectLocation]);
    expect(company.attributesBySemCategory(SemCategory.ObjectLocation)).toEqual([placeKey]);

    const command = translator.processText("покажи организации из минска, пинска", true);

    expect(command.action).toEqual("QUERY");
    expect(command.payload).toBeDefined();
    expect(command.payload.link.entity).toEqual(company);
    expect(command.payload.options).toBeDefined();
    expect(command.payload.options!.where).toBeDefined();
    expect(command.payload.options!.where![0].or).toBeDefined();
    expect(command.payload.options!.where![0].or![0].contains).toBeDefined();
    expect(command.payload.options!.where![0].or![0].contains![0].alias).toEqual("PLACEKEY");
    expect(placeKey).toBeInstanceOf(EntityAttribute);
    expect(command.payload.options!.where![0].or![0].contains![0].attribute)
      .toEqual((placeKey as EntityAttribute).entities[0].attribute("NAME"));
    expect(command.payload.options!.where![0].or![0].contains![0].value).toEqual("минск");
    expect(command.payload.options!.where![0].or).toBeDefined();
    expect(command.payload.options!.where![0].or![0].contains).toBeDefined();
    expect(command.payload.options!.where![0].or![1].contains![0].alias).toEqual("PLACEKEY");
    expect(placeKey).toBeInstanceOf(EntityAttribute);
    expect(command.payload.options!.where![0].or![1].contains![0].attribute)
      .toEqual((placeKey as EntityAttribute).entities[0].attribute("NAME"));
    expect(command.payload.options!.where![0].or![1].contains![0].value).toEqual("пинск");
  });

  it("phrase6", () => {
    const company = erModel.entities.TgdcCompany;
    expect(company).toBeDefined();

    const placeKey = company.attributes.PLACEKEY;
    expect(placeKey).toBeDefined();
    expect(placeKey.semCategories).toEqual([SemCategory.ObjectLocation]);
    expect(company.attributesBySemCategory(SemCategory.ObjectLocation)).toEqual([placeKey]);

    const command = translator.processText("покажи все организации из минска", true);

    expect(command.action).toEqual("QUERY");
    expect(command.payload).toBeDefined();
    expect(command.payload.link.entity).toEqual(company);
    expect(command.payload.options).toBeDefined();
    expect(command.payload.options!.where).toBeDefined();
    expect(command.payload.options!.where![0].contains).toBeDefined();
    expect(command.payload.options!.where![0].contains![0].alias).toEqual("PLACEKEY");
    expect(placeKey).toBeInstanceOf(EntityAttribute);
    expect(command.payload.options!.where![0].contains![0].attribute)
      .toEqual((placeKey as EntityAttribute).entities[0].attribute("NAME"));
    expect(command.payload.options!.where![0].contains![0].value).toEqual("минск");
  });

  it("phrase7", () => {
    const company = erModel.entities.TgdcCompany;
    expect(company).toBeDefined();

    const placeKey = company.attributes.PLACEKEY;
    expect(placeKey).toBeDefined();
    expect(placeKey.semCategories).toEqual([SemCategory.ObjectLocation]);
    expect(company.attributesBySemCategory(SemCategory.ObjectLocation)).toEqual([placeKey]);

    const command = translator.processText("покажи все организации из минска и пинска", true);

    expect(command.action).toEqual("QUERY");
    expect(command.payload).toBeDefined();
    expect(command.payload.link.entity).toEqual(company);
    expect(command.payload.options).toBeDefined();
    expect(command.payload.options!.where).toBeDefined();
    expect(command.payload.options!.where![0].or).toBeDefined();
    expect(command.payload.options!.where![0].or![0].contains).toBeDefined();
    expect(command.payload.options!.where![0].or![0].contains![0].alias).toEqual("PLACEKEY");
    expect(placeKey).toBeInstanceOf(EntityAttribute);
    expect(command.payload.options!.where![0].or![0].contains![0].attribute)
      .toEqual((placeKey as EntityAttribute).entities[0].attribute("NAME"));
    expect(command.payload.options!.where![0].or![0].contains![0].value).toEqual("минск");
    expect(command.payload.options!.where![0].or).toBeDefined();
    expect(command.payload.options!.where![0].or![0].contains).toBeDefined();
    expect(command.payload.options!.where![0].or![1].contains![0].alias).toEqual("PLACEKEY");
    expect(placeKey).toBeInstanceOf(EntityAttribute);
    expect(command.payload.options!.where![0].or![1].contains![0].attribute)
      .toEqual((placeKey as EntityAttribute).entities[0].attribute("NAME"));
    expect(command.payload.options!.where![0].or![1].contains![0].value).toEqual("пинск");
  });

  it("phrase8", () => {
    const company = erModel.entities.TgdcCompany;
    expect(company).toBeDefined();

    const placeKey = company.attributes.PLACEKEY;
    expect(placeKey).toBeDefined();
    expect(placeKey.semCategories).toEqual([SemCategory.ObjectLocation]);
    expect(company.attributesBySemCategory(SemCategory.ObjectLocation)).toEqual([placeKey]);

    const command = translator.processText("покажи все организации из минска, пинска", true);

    expect(command.action).toEqual("QUERY");
    expect(command.payload).toBeDefined();
    expect(command.payload.link.entity).toEqual(company);
    expect(command.payload.options).toBeDefined();
    expect(command.payload.options!.where).toBeDefined();
    expect(command.payload.options!.where![0].or).toBeDefined();
    expect(command.payload.options!.where![0].or![0].contains).toBeDefined();
    expect(command.payload.options!.where![0].or![0].contains![0].alias).toEqual("PLACEKEY");
    expect(placeKey).toBeInstanceOf(EntityAttribute);
    expect(command.payload.options!.where![0].or![0].contains![0].attribute)
      .toEqual((placeKey as EntityAttribute).entities[0].attribute("NAME"));
    expect(command.payload.options!.where![0].or![0].contains![0].value).toEqual("минск");
    expect(command.payload.options!.where![0].or).toBeDefined();
    expect(command.payload.options!.where![0].or![0].contains).toBeDefined();
    expect(command.payload.options!.where![0].or![1].contains![0].alias).toEqual("PLACEKEY");
    expect(placeKey).toBeInstanceOf(EntityAttribute);
    expect(command.payload.options!.where![0].or![1].contains![0].attribute)
      .toEqual((placeKey as EntityAttribute).entities[0].attribute("NAME"));
    expect(command.payload.options!.where![0].or![1].contains![0].value).toEqual("пинск");
  });

   /*
   it("phrase9", () => {
    const company = erModel.entities.TgdcCompany;
    expect(company).toBeDefined();

    const placeKey = company.attributes.PLACEKEY;
    expect(placeKey).toBeDefined();
    expect(placeKey.semCategories).toEqual([SemCategory.ObjectLocation]);
    expect(company.attributesBySemCategory(SemCategory.ObjectLocation)).toEqual([placeKey]);

    const command = translator.processText("покажи сорок пять организаций из минска", true);

    expect(command.action).toEqual("QUERY");
    expect(command.payload).toBeDefined();
    command.payload.options!.first
    expect(command.payload.link.entity).toEqual(erModel.entities.TgdcCompany);
    expect(command.payload.options).toBeDefined();
    expect(command.payload.options!.first).toBeDefined();
    expect(command.payload.options!.first).toEqual(45);
    expect(command.payload.options!.where).toBeDefined();
    expect(command.payload.options!.where![0].equals).toBeDefined();
    expect(command.payload.options!.where![0].equals![0].alias).toEqual("alias2");
    expect(placeKey).toBeInstanceOf(EntityAttribute);
    expect(command.payload.options!.where![0].equals![0].attribute)
      .toEqual((placeKey as EntityAttribute).entities[0].attribute("NAME"));
    expect(command.payload.options!.where![0].equals![0].value).toEqual("минск");
   });
   */

   /*
   it("phrase10", () => {
    const company = erModel.entities.TgdcCompany;
    expect(company).toBeDefined();

    const placeKey = company.attributes.PLACEKEY;
    expect(placeKey).toBeDefined();
    expect(placeKey.semCategories).toEqual([SemCategory.ObjectLocation]);
    expect(company.attributesBySemCategory(SemCategory.ObjectLocation)).toEqual([placeKey]);

    const command = translator.processText("покажи 55 организаций из минска", true);

    expect(command.action).toEqual("QUERY");
    expect(command.payload).toBeDefined();
    command.payload.options!.first
    expect(command.payload.link.entity).toEqual(erModel.entities.TgdcCompany);
    expect(command.payload.options).toBeDefined();
    expect(command.payload.options!.first).toBeDefined();
    expect(command.payload.options!.first).toEqual(55);
    expect(command.payload.options!.where).toBeDefined();
    expect(command.payload.options!.where![0].equals).toBeDefined();
    expect(command.payload.options!.where![0].equals![0].alias).toEqual("alias2");
    expect(placeKey).toBeInstanceOf(EntityAttribute);
    expect(command.payload.options!.where![0].equals![0].attribute)
      .toEqual((placeKey as EntityAttribute).entities[0].attribute("NAME"));
    expect(command.payload.options!.where![0].equals![0].value).toEqual("минск");
   });
   */

   it("phrase11", () => {
    const company = erModel.entities.TgdcCompany;
    expect(company).toBeDefined();

    const command = translator.processText("покажи TgdcCompany", true);

    expect(command.action).toEqual("QUERY");
    expect(command.payload).toBeDefined();
    expect(command.payload.link.entity).toEqual(company);
  });

  it("phrase12", () => {
    const company = erModel.entities.TgdcCompany;
    expect(company).toBeDefined();

    const command = translator.processText("покажи все TgdcCompany", true);

    expect(command.action).toEqual("QUERY");
    expect(command.payload).toBeDefined();
    expect(command.payload.link.entity).toEqual(company);
  });

  /*
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

    const command = translator.processText("Покажи все организации из Минска. Название содержит ООО. Отсутствует телефон.", true);

    expect(command.action).toEqual("QUERY");
    expect(command.payload).toBeDefined();
    expect(command.payload.link.entity).toEqual(company);
    expect(command.payload.options).toBeDefined();
    expect(command.payload.options!.where).toBeDefined();
    expect(command.payload.options!.where![0].equals).toBeDefined();
    expect(command.payload.options!.where![0].equals![0].alias).toEqual("alias2");
    expect(placeKey).toBeInstanceOf(EntityAttribute);
    expect(command.payload.options!.where![0].equals![0].attribute)
      .toEqual((placeKey as EntityAttribute).entities[0].attribute("NAME"));
    expect(command.payload.options!.where![0].equals![0].value).toEqual("минск");

    expect(command.payload.options!.where![0].contains).toBeDefined();
    expect(command.payload.options!.where![0].contains![0].alias).toEqual("alias1");
    expect(nameKey).toBeInstanceOf(StringAttribute);
    expect(command.payload.options!.where![0].contains![0].attribute)
    .toEqual(company.attribute("NAME"));
    expect(command.payload.options!.where![0].contains![0].value).toEqual("ООО");

    expect(command.payload.options!.where![0].isNull).toBeDefined();
    expect(command.payload.options!.where![0].isNull![0].alias).toEqual("alias1");
    expect(phoneKey).toBeInstanceOf(StringAttribute);
    expect(command.payload.options!.where![0].isNull![0].attribute)
      .toEqual(company.attribute("PHONE"));
  });
  */

  /*
  it("phrase14", () => {
    const company = erModel.entities.TgdcCompany;
    expect(company).toBeDefined();

    const command = translator.processText("Покажи первые 10 организаций. Адрес не содержит Минск.", true);

    expect(command.action).toEqual("QUERY");
    expect(command.payload).toBeDefined();
    expect(command.payload.link.entity).toEqual(company);
    expect(command.payload.options!.first).toBeDefined();
    expect(command.payload.options!.first).toEqual(10);
    expect(command.payload.options).toBeDefined();
    expect(command.payload.options!.where).toBeDefined();
    expect(command.payload.options!.where![0].not).toBeDefined();
    expect(command.payload.options!.where![0].not![0].contains).toBeDefined();
    expect(command.payload.options!.where![0].not![0].contains![0].alias).toEqual("alias1");
    expect(command.payload.options!.where![0].not![0].contains![0].attribute)
      .toEqual(company.attribute("ADDRESS"));
    expect(command.payload.options!.where![0].not![0].contains![0].value).toEqual("минск");
  });
  */

  /*
  it("phrase15", () => {
    const company = erModel.entities.TgdcCompany;
    expect(company).toBeDefined();

    const phoneKey = company.attributes.PHONE;
    expect(phoneKey).toBeDefined();

    const emailKey = company.attributes.EMAIL;
    expect(emailKey).toBeDefined();

    const zipKey = company.attributes.ZIP;
    expect(zipKey).toBeDefined();

    const command = translator.processText("Покажи TgdcCompany. Есть телефон. Нет email. ZIP больше 220000", true);

    expect(command.action).toEqual("QUERY");
    expect(command.payload).toBeDefined();
    expect(command.payload.link.entity).toEqual(company);
    expect(command.payload.options).toBeDefined();
    expect(command.payload.options!.where).toBeDefined();

    expect(command.payload.options!.where![0].not).toBeDefined();
    expect(command.payload.options!.where![0].not![0].isNull).toBeDefined();
    expect(command.payload.options!.where![0].not![0].isNull).toBeDefined();
    expect(command.payload.options!.where![0].not![0].isNull![0].alias).toEqual("alias1");
    expect(phoneKey).toBeInstanceOf(StringAttribute);
    expect(command.payload.options!.where![0].not![0].isNull![0].attribute)
      .toEqual(company.attribute("PHONE"));

    expect(command.payload.options!.where![0].isNull).toBeDefined();
    expect(command.payload.options!.where![0].isNull).toBeDefined();
    expect(command.payload.options!.where![0].isNull![0].alias).toEqual("alias1");
    expect(emailKey).toBeInstanceOf(StringAttribute);
    expect(command.payload.options!.where![0].isNull![0].attribute)
      .toEqual(company.attribute("EMAIL"));

    expect(command.payload.options!.where![0].greater).toBeDefined();
    expect(command.payload.options!.where![0].greater![0].alias).toEqual("alias1");
    expect(zipKey).toBeInstanceOf(StringAttribute);
    expect(command.payload.options!.where![0].greater![0].attribute)
      .toEqual(company.attribute("ZIP"));
    expect(command.payload.options!.where![0].greater![0].value).toEqual(220000);
  });
  */
});
