import {AConnection} from "gdmn-db";
import {ERBridge} from "gdmn-er-bridge";
import {SemCategory} from "gdmn-nlp";
import {EntityAttribute, ERModel} from "gdmn-orm";
import {ERTranslatorRU2} from "../src/agent2";
import {loadDBDetails} from "./testConfig";

jest.setTimeout(100 * 1000);

describe.skip("agent2", () => {

  let erModel: ERModel;
  let translator: ERTranslatorRU2;

  const dbDetail = loadDBDetails()[0];
  const connection = dbDetail.driver.newConnection();

  beforeAll(async () => {
    console.log(dbDetail.connectionOptions);

    await connection.connect(dbDetail.connectionOptions);
    await ERBridge.initDatabase(connection);

    erModel = await AConnection.executeTransaction({
      connection,
      callback: (transaction) => ERBridge.reloadERModel(connection, transaction, new ERModel())
    });
    expect(erModel).toBeDefined();
    translator = new ERTranslatorRU2({erModel, processUniform: true});
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

    translator = translator.processText("покажи организации");

    expect(translator.command.action).toEqual("QUERY");
    expect(translator.command.payload).toBeDefined();
    expect(translator.command.payload.link.entity).toEqual(company);
  });

  it("phrase3", () => {
    const company = erModel.entities.TgdcCompany;
    expect(company).toBeDefined();

    const placeKey = company.attributes.PLACEKEY;
    expect(placeKey).toBeDefined();
    expect(placeKey.semCategories).toEqual([SemCategory.ObjectLocation]);
    expect(company.attributesBySemCategory(SemCategory.ObjectLocation)).toEqual([placeKey]);

    translator = translator.processText("покажи все организации");

    expect(translator.command.action).toEqual("QUERY");
    expect(translator.command.payload).toBeDefined();
    expect(translator.command.payload.link.entity).toEqual(company);
  });

  it("phrase4", () => {
    const company = erModel.entities.TgdcCompany;
    expect(company).toBeDefined();

    const placeKey = company.attributes.PLACEKEY;
    expect(placeKey).toBeDefined();
    expect(placeKey.semCategories).toEqual([SemCategory.ObjectLocation]);
    expect(company.attributesBySemCategory(SemCategory.ObjectLocation)).toEqual([placeKey]);

    translator = translator.processText("покажи организации из минска");

    expect(translator.command.action).toEqual("QUERY");
    expect(translator.command.payload).toBeDefined();
    expect(translator.command.payload.link.entity).toEqual(company);
    expect(translator.command.payload.options).toBeDefined();
    expect(translator.command.payload.options!.where).toBeDefined();
    expect(translator.command.payload.options!.where![0].contains).toBeDefined();
    expect(translator.command.payload.options!.where![0].contains![0].alias).toEqual("PLACEKEY");
    expect(placeKey).toBeInstanceOf(EntityAttribute);
    expect(translator.command.payload.options!.where![0].contains![0].attribute)
      .toEqual((placeKey as EntityAttribute).entities[0].attribute("NAME"));
    expect(translator.command.payload.options!.where![0].contains![0].value).toEqual("минск");
  });

  it("phrase5", () => {
    const company = erModel.entities.TgdcCompany;
    expect(company).toBeDefined();

    const placeKey = company.attributes.PLACEKEY;
    expect(placeKey).toBeDefined();
    expect(placeKey.semCategories).toEqual([SemCategory.ObjectLocation]);
    expect(company.attributesBySemCategory(SemCategory.ObjectLocation)).toEqual([placeKey]);

    translator = translator.processText("покажи организации из минска, пинска");

    expect(translator.command.action).toEqual("QUERY");
    expect(translator.command.payload).toBeDefined();
    expect(translator.command.payload.link.entity).toEqual(company);
    expect(translator.command.payload.options).toBeDefined();
    expect(translator.command.payload.options!.where).toBeDefined();
    expect(translator.command.payload.options!.where![0].or).toBeDefined();
    expect(translator.command.payload.options!.where![0].or![0].contains).toBeDefined();
    expect(translator.command.payload.options!.where![0].or![0].contains![0].alias).toEqual("PLACEKEY");
    expect(placeKey).toBeInstanceOf(EntityAttribute);
    expect(translator.command.payload.options!.where![0].or![0].contains![0].attribute)
      .toEqual((placeKey as EntityAttribute).entities[0].attribute("NAME"));
    expect(translator.command.payload.options!.where![0].or![0].contains![0].value).toEqual("минск");
    expect(translator.command.payload.options!.where![0].or).toBeDefined();
    expect(translator.command.payload.options!.where![0].or![0].contains).toBeDefined();
    expect(translator.command.payload.options!.where![0].or![1].contains![0].alias).toEqual("PLACEKEY");
    expect(placeKey).toBeInstanceOf(EntityAttribute);
    expect(translator.command.payload.options!.where![0].or![1].contains![0].attribute)
      .toEqual((placeKey as EntityAttribute).entities[0].attribute("NAME"));
    expect(translator.command.payload.options!.where![0].or![1].contains![0].value).toEqual("пинск");
  });

  it("phrase6", () => {
    const company = erModel.entities.TgdcCompany;
    expect(company).toBeDefined();

    const placeKey = company.attributes.PLACEKEY;
    expect(placeKey).toBeDefined();
    expect(placeKey.semCategories).toEqual([SemCategory.ObjectLocation]);
    expect(company.attributesBySemCategory(SemCategory.ObjectLocation)).toEqual([placeKey]);

    translator = translator.processText("покажи все организации из минска");

    expect(translator.command.action).toEqual("QUERY");
    expect(translator.command.payload).toBeDefined();
    expect(translator.command.payload.link.entity).toEqual(company);
    expect(translator.command.payload.options).toBeDefined();
    expect(translator.command.payload.options!.where).toBeDefined();
    expect(translator.command.payload.options!.where![0].contains).toBeDefined();
    expect(translator.command.payload.options!.where![0].contains![0].alias).toEqual("PLACEKEY");
    expect(placeKey).toBeInstanceOf(EntityAttribute);
    expect(translator.command.payload.options!.where![0].contains![0].attribute)
      .toEqual((placeKey as EntityAttribute).entities[0].attribute("NAME"));
    expect(translator.command.payload.options!.where![0].contains![0].value).toEqual("минск");
  });

  it("phrase7", () => {
    const company = erModel.entities.TgdcCompany;
    expect(company).toBeDefined();

    const placeKey = company.attributes.PLACEKEY;
    expect(placeKey).toBeDefined();
    expect(placeKey.semCategories).toEqual([SemCategory.ObjectLocation]);
    expect(company.attributesBySemCategory(SemCategory.ObjectLocation)).toEqual([placeKey]);

    translator = translator.processText("покажи все организации из минска и пинска");

    expect(translator.command.action).toEqual("QUERY");
    expect(translator.command.payload).toBeDefined();
    expect(translator.command.payload.link.entity).toEqual(company);
    expect(translator.command.payload.options).toBeDefined();
    expect(translator.command.payload.options!.where).toBeDefined();
    expect(translator.command.payload.options!.where![0].or).toBeDefined();
    expect(translator.command.payload.options!.where![0].or![0].contains).toBeDefined();
    expect(translator.command.payload.options!.where![0].or![0].contains![0].alias).toEqual("PLACEKEY");
    expect(placeKey).toBeInstanceOf(EntityAttribute);
    expect(translator.command.payload.options!.where![0].or![0].contains![0].attribute)
      .toEqual((placeKey as EntityAttribute).entities[0].attribute("NAME"));
    expect(translator.command.payload.options!.where![0].or![0].contains![0].value).toEqual("минск");
    expect(translator.command.payload.options!.where![0].or).toBeDefined();
    expect(translator.command.payload.options!.where![0].or![0].contains).toBeDefined();
    expect(translator.command.payload.options!.where![0].or![1].contains![0].alias).toEqual("PLACEKEY");
    expect(placeKey).toBeInstanceOf(EntityAttribute);
    expect(translator.command.payload.options!.where![0].or![1].contains![0].attribute)
      .toEqual((placeKey as EntityAttribute).entities[0].attribute("NAME"));
    expect(translator.command.payload.options!.where![0].or![1].contains![0].value).toEqual("пинск");
  });

  it("phrase8", () => {
    const company = erModel.entities.TgdcCompany;
    expect(company).toBeDefined();

    const placeKey = company.attributes.PLACEKEY;
    expect(placeKey).toBeDefined();
    expect(placeKey.semCategories).toEqual([SemCategory.ObjectLocation]);
    expect(company.attributesBySemCategory(SemCategory.ObjectLocation)).toEqual([placeKey]);

    translator = translator.processText("покажи все организации из минска, пинска");

    expect(translator.command.action).toEqual("QUERY");
    expect(translator.command.payload).toBeDefined();
    expect(translator.command.payload.link.entity).toEqual(company);
    expect(translator.command.payload.options).toBeDefined();
    expect(translator.command.payload.options!.where).toBeDefined();
    expect(translator.command.payload.options!.where![0].or).toBeDefined();
    expect(translator.command.payload.options!.where![0].or![0].contains).toBeDefined();
    expect(translator.command.payload.options!.where![0].or![0].contains![0].alias).toEqual("PLACEKEY");
    expect(placeKey).toBeInstanceOf(EntityAttribute);
    expect(translator.command.payload.options!.where![0].or![0].contains![0].attribute)
      .toEqual((placeKey as EntityAttribute).entities[0].attribute("NAME"));
    expect(translator.command.payload.options!.where![0].or![0].contains![0].value).toEqual("минск");
    expect(translator.command.payload.options!.where![0].or).toBeDefined();
    expect(translator.command.payload.options!.where![0].or![0].contains).toBeDefined();
    expect(translator.command.payload.options!.where![0].or![1].contains![0].alias).toEqual("PLACEKEY");
    expect(placeKey).toBeInstanceOf(EntityAttribute);
    expect(translator.command.payload.options!.where![0].or![1].contains![0].attribute)
      .toEqual((placeKey as EntityAttribute).entities[0].attribute("NAME"));
    expect(translator.command.payload.options!.where![0].or![1].contains![0].value).toEqual("пинск");
  });

   /*
   it("phrase9", () => {
    const company = erModel.entities.TgdcCompany;
    expect(company).toBeDefined();

    const placeKey = company.attributes.PLACEKEY;
    expect(placeKey).toBeDefined();
    expect(placeKey.semCategories).toEqual([SemCategory.ObjectLocation]);
    expect(company.attributesBySemCategory(SemCategory.ObjectLocation)).toEqual([placeKey]);

    translator = translator.processText("покажи сорок пять организаций из минска", true);

    expect(translator.command.action).toEqual("QUERY");
    expect(translator.command.payload).toBeDefined();
    command.payload.options!.first
    expect(translator.command.payload.link.entity).toEqual(erModel.entities.TgdcCompany);
    expect(translator.command.payload.options).toBeDefined();
    expect(translator.command.payload.options!.first).toBeDefined();
    expect(translator.command.payload.options!.first).toEqual(45);
    expect(translator.command.payload.options!.where).toBeDefined();
    expect(translator.command.payload.options!.where![0].equals).toBeDefined();
    expect(translator.command.payload.options!.where![0].equals![0].alias).toEqual("alias2");
    expect(placeKey).toBeInstanceOf(EntityAttribute);
    expect(translator.command.payload.options!.where![0].equals![0].attribute)
      .toEqual((placeKey as EntityAttribute).entities[0].attribute("NAME"));
    expect(translator.command.payload.options!.where![0].equals![0].value).toEqual("минск");
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

    translator = translator.processText("покажи 55 организаций из минска", true);

    expect(translator.command.action).toEqual("QUERY");
    expect(translator.command.payload).toBeDefined();
    command.payload.options!.first
    expect(translator.command.payload.link.entity).toEqual(erModel.entities.TgdcCompany);
    expect(translator.command.payload.options).toBeDefined();
    expect(translator.command.payload.options!.first).toBeDefined();
    expect(translator.command.payload.options!.first).toEqual(55);
    expect(translator.command.payload.options!.where).toBeDefined();
    expect(translator.command.payload.options!.where![0].equals).toBeDefined();
    expect(translator.command.payload.options!.where![0].equals![0].alias).toEqual("alias2");
    expect(placeKey).toBeInstanceOf(EntityAttribute);
    expect(translator.command.payload.options!.where![0].equals![0].attribute)
      .toEqual((placeKey as EntityAttribute).entities[0].attribute("NAME"));
    expect(translator.command.payload.options!.where![0].equals![0].value).toEqual("минск");
   });
   */

   it("phrase11", () => {
    const company = erModel.entities.TgdcCompany;
    expect(company).toBeDefined();

    translator = translator.processText("покажи TgdcCompany");

    expect(translator.command.action).toEqual("QUERY");
    expect(translator.command.payload).toBeDefined();
    expect(translator.command.payload.link.entity).toEqual(company);
  });

  it("phrase12", () => {
    const company = erModel.entities.TgdcCompany;
    expect(company).toBeDefined();

    translator = translator.processText("покажи все TgdcCompany");

    expect(translator.command.action).toEqual("QUERY");
    expect(translator.command.payload).toBeDefined();
    expect(translator.command.payload.link.entity).toEqual(company);
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

    translator = translator.processText("Покажи все организации из Минска. Название содержит ООО. Отсутствует телефон.", true);

    expect(translator.command.action).toEqual("QUERY");
    expect(translator.command.payload).toBeDefined();
    expect(translator.command.payload.link.entity).toEqual(company);
    expect(translator.command.payload.options).toBeDefined();
    expect(translator.command.payload.options!.where).toBeDefined();
    expect(translator.command.payload.options!.where![0].equals).toBeDefined();
    expect(translator.command.payload.options!.where![0].equals![0].alias).toEqual("alias2");
    expect(placeKey).toBeInstanceOf(EntityAttribute);
    expect(translator.command.payload.options!.where![0].equals![0].attribute)
      .toEqual((placeKey as EntityAttribute).entities[0].attribute("NAME"));
    expect(translator.command.payload.options!.where![0].equals![0].value).toEqual("минск");

    expect(translator.command.payload.options!.where![0].contains).toBeDefined();
    expect(translator.command.payload.options!.where![0].contains![0].alias).toEqual("alias1");
    expect(nameKey).toBeInstanceOf(StringAttribute);
    expect(translator.command.payload.options!.where![0].contains![0].attribute)
    .toEqual(company.attribute("NAME"));
    expect(translator.command.payload.options!.where![0].contains![0].value).toEqual("ООО");

    expect(translator.command.payload.options!.where![0].isNull).toBeDefined();
    expect(translator.command.payload.options!.where![0].isNull![0].alias).toEqual("alias1");
    expect(phoneKey).toBeInstanceOf(StringAttribute);
    expect(translator.command.payload.options!.where![0].isNull![0].attribute)
      .toEqual(company.attribute("PHONE"));
  });
  */

  /*
  it("phrase14", () => {
    const company = erModel.entities.TgdcCompany;
    expect(company).toBeDefined();

    translator = translator.processText("Покажи первые 10 организаций. Адрес не содержит Минск.", true);

    expect(translator.command.action).toEqual("QUERY");
    expect(translator.command.payload).toBeDefined();
    expect(translator.command.payload.link.entity).toEqual(company);
    expect(translator.command.payload.options!.first).toBeDefined();
    expect(translator.command.payload.options!.first).toEqual(10);
    expect(translator.command.payload.options).toBeDefined();
    expect(translator.command.payload.options!.where).toBeDefined();
    expect(translator.command.payload.options!.where![0].not).toBeDefined();
    expect(translator.command.payload.options!.where![0].not![0].contains).toBeDefined();
    expect(translator.command.payload.options!.where![0].not![0].contains![0].alias).toEqual("alias1");
    expect(translator.command.payload.options!.where![0].not![0].contains![0].attribute)
      .toEqual(company.attribute("ADDRESS"));
    expect(translator.command.payload.options!.where![0].not![0].contains![0].value).toEqual("минск");
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

    translator = translator.processText("Покажи TgdcCompany. Есть телефон. Нет email. ZIP больше 220000", true);

    expect(translator.command.action).toEqual("QUERY");
    expect(translator.command.payload).toBeDefined();
    expect(translator.command.payload.link.entity).toEqual(company);
    expect(translator.command.payload.options).toBeDefined();
    expect(translator.command.payload.options!.where).toBeDefined();

    expect(translator.command.payload.options!.where![0].not).toBeDefined();
    expect(translator.command.payload.options!.where![0].not![0].isNull).toBeDefined();
    expect(translator.command.payload.options!.where![0].not![0].isNull).toBeDefined();
    expect(translator.command.payload.options!.where![0].not![0].isNull![0].alias).toEqual("alias1");
    expect(phoneKey).toBeInstanceOf(StringAttribute);
    expect(translator.command.payload.options!.where![0].not![0].isNull![0].attribute)
      .toEqual(company.attribute("PHONE"));

    expect(translator.command.payload.options!.where![0].isNull).toBeDefined();
    expect(translator.command.payload.options!.where![0].isNull).toBeDefined();
    expect(translator.command.payload.options!.where![0].isNull![0].alias).toEqual("alias1");
    expect(emailKey).toBeInstanceOf(StringAttribute);
    expect(translator.command.payload.options!.where![0].isNull![0].attribute)
      .toEqual(company.attribute("EMAIL"));

    expect(translator.command.payload.options!.where![0].greater).toBeDefined();
    expect(translator.command.payload.options!.where![0].greater![0].alias).toEqual("alias1");
    expect(zipKey).toBeInstanceOf(StringAttribute);
    expect(translator.command.payload.options!.where![0].greater![0].attribute)
      .toEqual(company.attribute("ZIP"));
    expect(translator.command.payload.options!.where![0].greater![0].value).toEqual(220000);
  });
  */
});
