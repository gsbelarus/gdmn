import {existsSync, unlinkSync} from "fs";
import {AConnection, Factory, IConnectionOptions} from "gdmn-db";
import {
  DetailAttribute,
  Entity,
  EntityAttribute,
  EntityQuery,
  ERModel,
  FloatAttribute,
  IntegerAttribute,
  SetAttribute,
  StringAttribute
} from "gdmn-orm";
import {resolve} from "path";
import {ERBridge, Select} from "../src";

const dbOptions: IConnectionOptions = {
  username: "SYSDBA",
  password: "masterkey",
  path: resolve("./GDMN_ER_BRIDGE_QUERY.FDB")
};

jest.setTimeout(60 * 1000);

describe("Query", () => {

  const erModel = new ERModel();
  const connection = Factory.FBDriver.newConnection();

  beforeAll(async () => {
    if (existsSync(dbOptions.path)) {
      unlinkSync(dbOptions.path);
    }
    await connection.createDatabase(dbOptions);
    await ERBridge.initDatabase(connection);

    await AConnection.executeTransaction({
      connection,
      callback: async (transaction) => {
        await ERBridge.reloadERModel(connection, transaction, erModel);
        await ERBridge.executeSelf({
          connection,
          transaction,
          callback: async ({erBuilder, eBuilder}) => {
            const TestEntity = await erBuilder.create(erModel, new Entity({name: "TEST_ENTITY", lName: {}}));
            await eBuilder.createAttribute(TestEntity, new StringAttribute({name: "TEST_STRING", lName: {}}));
            await eBuilder.createAttribute(TestEntity, new FloatAttribute({name: "TEST_FLOAT", lName: {}}));

            const MasterEntity = await erBuilder.create(erModel, new Entity({name: "MASTER_ENTITY", lName: {}}));
            await eBuilder.createAttribute(MasterEntity, new StringAttribute({name: "TEST_STRING", lName: {}}));
            await eBuilder.createAttribute(MasterEntity, new EntityAttribute({
              name: "LINK",
              lName: {},
              entities: [TestEntity]
            }));

            const DetailEntity = await erBuilder.create(erModel, new Entity({name: "DETAIL_ENTITY", lName: {}}));
            await eBuilder.createAttribute(DetailEntity, new StringAttribute({name: "TEST_STRING1", lName: {}}));
            await eBuilder.createAttribute(DetailEntity, new StringAttribute({name: "TEST_STRING2", lName: {}}));
            await eBuilder.createAttribute(DetailEntity, new EntityAttribute({
              name: "LINK",
              lName: {},
              entities: [TestEntity]
            }));

            await eBuilder.createAttribute(MasterEntity, new DetailAttribute({
              name: "DETAIL_ENTITY",
              lName: {},
              entities: [DetailEntity]
            }));

            const setAttr = new SetAttribute({
              name: "SET_LINK",
              lName: {},
              entities: [TestEntity]
            });
            setAttr.add(new IntegerAttribute({name: "TEST_INTEGER", lName: {}}));
            await eBuilder.createAttribute(MasterEntity, setAttr);
          }
        });
      }
    });

    await AConnection.executeTransaction({
      connection,
      callback: (transaction) => ERBridge.reloadERModel(connection, transaction, erModel)
    });
  });

  beforeAll(async () => {
    await connection.dropDatabase();
  });

  it("simple entity", () => {
    const {sql} = new Select(EntityQuery.inspectorToObject(erModel, {
      link: {
        entity: "TEST_ENTITY",
        alias: "se",
        fields: [
          {attribute: "TEST_STRING"}
        ]
      }
    }));

    expect(sql).toEqual("SELECT\n" +
      "  E$1.TEST_STRING AS F$1\n" +
      "FROM TEST_ENTITY E$1");
  });

  it("entity link", () => {
    const {sql} = new Select(EntityQuery.inspectorToObject(erModel, {
      link: {
        entity: "MASTER_ENTITY",
        alias: "me",
        fields: [
          {
            attribute: "LINK",
            link: {
              entity: "TEST_ENTITY",
              alias: "te",
              fields: [
                {attribute: "TEST_STRING"}
              ]
            }
          }
        ]
      }
    }));

    expect(sql).toEqual("SELECT\n" +
      "  E$2.TEST_STRING AS F$1\n" +
      "FROM MASTER_ENTITY E$1\n" +
      "  LEFT JOIN TEST_ENTITY E$2 ON E$2.ID = E$1.LINK");
  });

  it("entity master/detail", () => {
    const {sql} = new Select(EntityQuery.inspectorToObject(erModel, {
      link: {
        entity: "MASTER_ENTITY",
        alias: "me",
        fields: [
          {
            attribute: "DETAIL_ENTITY",
            link: {
              entity: "DETAIL_ENTITY",
              alias: "de",
              fields: [
                {attribute: "TEST_STRING2"}
              ]
            }
          }
        ]
      }
    }));

    expect(sql).toEqual("SELECT\n" +
      "  E$2.TEST_STRING2 AS F$1\n" +
      "FROM MASTER_ENTITY E$1\n" +
      "  LEFT JOIN DETAIL_ENTITY E$2 ON E$2.DETAIL_ENTITY = E$1.ID");
  });

  it("entity set", () => {
    const {sql} = new Select(EntityQuery.inspectorToObject(erModel, {
      link: {
        entity: "MASTER_ENTITY",
        alias: "me",
        fields: [
          {
            attribute: "SET_LINK",
            setAttributes: ["TEST_INTEGER"],
            link: {
              entity: "TEST_ENTITY",
              alias: "s",
              fields: [
                {attribute: "TEST_STRING"}
              ]
            }
          }
        ]
      }
    }));

    expect(sql).toEqual("SELECT\n" +
      "  E$1_2$S.TEST_INTEGER AS F$1_1,\n" +
      "  E$2.TEST_STRING AS F$2\n" +
      "FROM MASTER_ENTITY E$1\n" +
      "  LEFT JOIN TABLE_24 E$1_2$S ON E$1_2$S.KEY1 = E$1.ID\n" +
      "  LEFT JOIN TEST_ENTITY E$2 ON E$2.ID = E$1_2$S.KEY2");
  });

  it("nested entities", () => {
    const {sql} = new Select(EntityQuery.inspectorToObject(erModel, {
      link: {
        entity: "MASTER_ENTITY",
        alias: "me",
        fields: [
          {
            attribute: "LINK",
            link: {
              entity: "TEST_ENTITY",
              alias: "te",
              fields: [
                {attribute: "TEST_STRING"}
              ]
            }
          },
          {
            attribute: "SET_LINK",
            setAttributes: ["TEST_INTEGER"],
            link: {
              entity: "TEST_ENTITY",
              alias: "s",
              fields: [
                {attribute: "TEST_STRING"}
              ]
            }
          },
          {
            attribute: "DETAIL_ENTITY",
            link: {
              entity: "DETAIL_ENTITY",
              alias: "de",
              fields: [
                {attribute: "TEST_STRING2"},
                {
                  attribute: "LINK",
                  link: {
                    entity: "TEST_ENTITY",
                    alias: "te",
                    fields: [
                      {attribute: "TEST_STRING"}
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    }));

    expect(sql).toEqual("SELECT\n" +
      "  E$2.TEST_STRING AS F$1,\n" +
      "  E$1_2$S.TEST_INTEGER AS F$2_1,\n" +
      "  E$3.TEST_STRING AS F$3,\n" +
      "  E$4.TEST_STRING2 AS F$4,\n" +
      "  E$5.TEST_STRING AS F$5\n" +
      "FROM MASTER_ENTITY E$1\n" +
      "  LEFT JOIN TEST_ENTITY E$2 ON E$2.ID = E$1.LINK\n" +
      "  LEFT JOIN TABLE_24 E$1_2$S ON E$1_2$S.KEY1 = E$1.ID\n" +
      "  LEFT JOIN TEST_ENTITY E$3 ON E$3.ID = E$1_2$S.KEY2\n" +
      "  LEFT JOIN DETAIL_ENTITY E$4 ON E$4.DETAIL_ENTITY = E$1.ID\n" +
      "  LEFT JOIN TEST_ENTITY E$5 ON E$5.ID = E$4.LINK");
  });

  it("order", () => {
    const {sql} = new Select(EntityQuery.inspectorToObject(erModel, {
      link: {
        entity: "DETAIL_ENTITY",
        alias: "de",
        fields: [
          {attribute: "TEST_STRING1"},
          {
            attribute: "LINK",
            link: {
              entity: "TEST_ENTITY",
              alias: "te",
              fields: []
            }
          }
        ]
      },
      options: {
        order: {
          "de": {"TEST_STRING2": "asc"},
          "te": {"TEST_FLOAT": "dsc"}
        }
      }
    }));

    expect(sql).toEqual("SELECT\n" +
      "  E$1.TEST_STRING1 AS F$1\n" +
      "FROM DETAIL_ENTITY E$1\n" +
      "  LEFT JOIN TEST_ENTITY E$2 ON E$2.ID = E$1.LINK\n" +
      "ORDER BY E$1.TEST_STRING2 ASC, E$2.TEST_FLOAT DSC");
  });

  it("where", () => {
    const {sql, params} = new Select(EntityQuery.inspectorToObject(erModel, {
      link: {
        entity: "DETAIL_ENTITY",
        alias: "de",
        fields: [
          {attribute: "TEST_STRING1"},
          {
            attribute: "LINK",
            link: {
              entity: "TEST_ENTITY",
              alias: "te",
              fields: []
            }
          }
        ]
      },
      options: {
        where: {
          equals: {
            "de": {"TEST_STRING1": "test1", "TEST_STRING2": "test2"},
            "te": {"TEST_FLOAT": 1}
          }
        }
      }
    }));

    expect(sql).toEqual("SELECT\n" +
      "  E$1.TEST_STRING1 AS F$1\n" +
      "FROM DETAIL_ENTITY E$1\n" +
      "  LEFT JOIN TEST_ENTITY E$2 ON E$2.ID = E$1.LINK\n" +
      "WHERE (E$1.TEST_STRING1 = :P$1 AND E$1.TEST_STRING2 = :P$2)\n" +
      "  AND E$2.TEST_FLOAT = :P$3");
    expect(params).toEqual({"P$1": "test1", "P$2": "test2", "P$3": 1});
  });
});
