import {existsSync, unlinkSync} from "fs";
import {AConnection, Factory, IConnectionOptions} from "gdmn-db";
import {
  DateAttribute,
  Entity,
  EntityAttribute,
  EntityQuerySet,
  ERModel,
  FloatAttribute,
  IntegerAttribute,
  SetAttribute,
  StringAttribute
} from "gdmn-orm";
import {resolve} from "path";
import {ERBridge} from "../../src";
import {SelectSet} from "../../src/crud/query/SelectSet";

const dbOptions: IConnectionOptions = {
  username: "SYSDBA",
  password: "masterkey",
  path: resolve("./GDMN_ER_BRIDGE_QUERY.FDB"),
  readTransaction: true
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
    await ERBridge.reloadERModel(connection, connection.readTransaction, erModel);

    await AConnection.executeTransaction({
      connection,
      callback: async (transaction) => {
        await ERBridge.executeSelf({
          connection,
          transaction,
          callback: async ({erBuilder, eBuilder}) => {
            const TestEntity = await erBuilder.create(erModel, new Entity({
              name: "TEST_ENTITY",
              lName: {}
            }));
            await eBuilder.createAttribute(TestEntity, new StringAttribute({
              name: "TEST_STRING",
              lName: {}
            }));
            await eBuilder.createAttribute(TestEntity, new FloatAttribute({name: "TEST_FLOAT", lName: {}}));

            const MasterEntity = await erBuilder.create(erModel, new Entity({
              name: "MASTER_ENTITY",
              lName: {}
            }));
            await eBuilder.createAttribute(MasterEntity, new StringAttribute({
              name: "TEST_STRING",
              lName: {}
            }));
            await eBuilder.createAttribute(MasterEntity, new EntityAttribute({
              name: "LINK",
              lName: {},
              entities: [TestEntity]
            }));

            const setAttr = new SetAttribute({
              name: "SET_LINK",
              lName: {},
              entities: [TestEntity]
            });
            setAttr.add(new IntegerAttribute({name: "TEST_INTEGER", lName: {}}));
            setAttr.add(new StringAttribute({name: "TEST_STRING", lName: {}}));
            setAttr.add(new DateAttribute({name: "TEST_DATE", lName: {}}));
            await eBuilder.createAttribute(MasterEntity, setAttr);
          }
        });
      }
    });
  });

  afterAll(async () => {
    await connection.dropDatabase();
  });


  it("entity set", async () => {
    const querySet = EntityQuerySet.inspectorToObject(erModel, {
      link: {
        entity: "MASTER_ENTITY",
        alias: "me",
        fields: [
          {
            attribute: "SET_LINK",
            links: [{
              entity: "TEST_ENTITY",
              alias: "s",
              fields: [
                {attribute: "TEST_STRING"}
              ]
            }]
          }
        ]
      },
      options: {
        where: [
          {
            equals: [
              {
                alias: "me",
                value: "asd"
              }
            ]
          }
        ]
      }
    });
    const {sql} = new SelectSet(querySet);

    expect(sql).toEqual("SELECT\n" +
      "  T$1.TEST_STRING AS F$1\n" +
      "FROM TABLE_12 T$2\n" +
      "  LEFT JOIN TEST_ENTITY T$1 ON T$1.ID = T$2.KEY2\n" +
      "WHERE T$2.KEY1 = :P$1");

    await ERBridge.querySet(connection, connection.readTransaction, querySet);
  });

  it("entity set with integer", async () => {
    const querySet = EntityQuerySet.inspectorToObject(erModel, {
      link: {
        entity: "MASTER_ENTITY",
        alias: "me",
        fields: [
          {
            attribute: "SET_LINK",
            setAttributes: ["TEST_INTEGER"],
            links: [{
              entity: "TEST_ENTITY",
              alias: "s",
              fields: [
                {attribute: "TEST_STRING"}
              ]
            }]
          }
        ]
      },
      options: {
        where: [
          {
            equals: [
              {
                alias: "me",
                value: "asd"
              }
            ]
          }
        ]
      }
    });
    const {sql} = new SelectSet(querySet);

    expect(sql).toEqual("SELECT\n" +
      "  T$1.TEST_INTEGER AS F$1,\n" +
      "  T$2.TEST_STRING AS F$2\n" +
      "FROM TABLE_12 T$1\n" +
      "  LEFT JOIN TEST_ENTITY T$2 ON T$2.ID = T$1.KEY2\n" +
      "WHERE T$1.KEY1 = :P$1");

    await ERBridge.querySet(connection, connection.readTransaction, querySet);
  });

  it("entity set with string", async () => {
    const querySet = EntityQuerySet.inspectorToObject(erModel, {
      link: {
        entity: "MASTER_ENTITY",
        alias: "me",
        fields: [
          {
            attribute: "SET_LINK",
            setAttributes: ["TEST_STRING"],
            links: [{
              entity: "TEST_ENTITY",
              alias: "s",
              fields: [
                {attribute: "TEST_STRING"}
              ]
            }]
          }
        ]
      },
      options: {
        where: [
          {
            equals: [
              {
                alias: "me",
                value: 55
              }
            ]
          }
        ]
      }
    });
    const {sql} = new SelectSet(querySet);

    expect(sql).toEqual("SELECT\n" +
      "  T$1.TEST_STRING AS F$1,\n" +
      "  T$2.TEST_STRING AS F$2\n" +
      "FROM TABLE_12 T$1\n" +
      "  LEFT JOIN TEST_ENTITY T$2 ON T$2.ID = T$1.KEY2\n" +
      "WHERE T$1.KEY1 = :P$1");

    await ERBridge.querySet(connection, connection.readTransaction, querySet);
  });

  it("entity set with date", async () => {
    const querySet = EntityQuerySet.inspectorToObject(erModel, {
      link: {
        entity: "MASTER_ENTITY",
        alias: "me",
        fields: [
          {
            attribute: "SET_LINK",
            setAttributes: ["TEST_DATE"],
            links: [{
              entity: "TEST_ENTITY",
              alias: "s",
              fields: [
                {attribute: "TEST_STRING"}
              ]
            }]
          }
        ]
      },
      options: {
        where: [
          {
            equals: [
              {
                alias: "me",
                value: 55
              }
            ]
          }
        ]
      }
    });
    const {sql} = new SelectSet(querySet);

    expect(sql).toEqual("SELECT\n" +
      "  T$1.TEST_DATE AS F$1,\n" +
      "  T$2.TEST_STRING AS F$2\n" +
      "FROM TABLE_12 T$1\n" +
      "  LEFT JOIN TEST_ENTITY T$2 ON T$2.ID = T$1.KEY2\n" +
      "WHERE T$1.KEY1 = :P$1");

    await ERBridge.querySet(connection, connection.readTransaction, querySet);
  });
});
