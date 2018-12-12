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
import {ERBridge} from "../src";
import {Select} from "../src/crud/query/Select";

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

            const ChildEntity = await erBuilder.create(erModel, new Entity({
              name: "CHILD_ENTITY",
              lName: {},
              parent: TestEntity
            }));
            await eBuilder.createAttribute(ChildEntity, new StringAttribute({name: "TEST_STRING", lName: {}}));
            await eBuilder.createAttribute(ChildEntity, new StringAttribute({name: "TEST_STRING1", lName: {}}));
          }
        });
      }
    });
  });

  afterAll(async () => {
    await connection.dropDatabase();
  });

  it("simple entity", async () => {
    const {sql, params} = new Select(EntityQuery.inspectorToObject(erModel, {
      link: {
        entity: "TEST_ENTITY",
        alias: "se",
        fields: [
          {attribute: "TEST_STRING"}
        ]
      }
    }));

    expect(sql).toEqual("SELECT\n" +
      "  E$1.TEST_STRING AS A$1\n" +
      "FROM TEST_ENTITY E$1");

    await AConnection.executeTransaction({
      connection,
      callback: (transaction) => AConnection.executeQueryResultSet({
        connection, transaction, sql, params,
        callback: () => 0
      })
    });
  });

  it("entity link", async () => {
    const {sql, params} = new Select(EntityQuery.inspectorToObject(erModel, {
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
      "  E$1.TEST_STRING AS A$1\n" +
      "FROM MASTER_ENTITY E$2\n" +
      "  LEFT JOIN TEST_ENTITY E$1 ON E$1.ID = E$2.LINK");

    await AConnection.executeTransaction({
      connection,
      callback: (transaction) => AConnection.executeQueryResultSet({
        connection, transaction, sql, params,
        callback: () => 0
      })
    });
  });

  it("entity master/detail", async () => {
    const {sql, params} = new Select(EntityQuery.inspectorToObject(erModel, {
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
      "  E$1.TEST_STRING2 AS A$1\n" +
      "FROM MASTER_ENTITY E$2\n" +
      "  LEFT JOIN DETAIL_ENTITY E$1 ON E$1.MASTERKEY = E$2.ID");

    await AConnection.executeTransaction({
      connection,
      callback: (transaction) => AConnection.executeQueryResultSet({
        connection, transaction, sql, params,
        callback: () => 0
      })
    });
  });

  it("entity set", async () => {
    const {sql, params} = new Select(EntityQuery.inspectorToObject(erModel, {
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
      "  E$1_1.TEST_INTEGER AS A$1_1,\n" +
      "  E$2.TEST_STRING AS A$2\n" +
      "FROM MASTER_ENTITY E$3\n" +
      "  LEFT JOIN TABLE_21 E$1_1 ON E$1_1.KEY1 = E$3.ID\n" +
      "  LEFT JOIN TEST_ENTITY E$2 ON E$2.ID = E$1_1.KEY2");

    await AConnection.executeTransaction({
      connection,
      callback: (transaction) => AConnection.executeQueryResultSet({
        connection, transaction, sql, params,
        callback: () => 0
      })
    });
  });

  it("inheritance without parent attributes", async () => {
    const {sql, params} = new Select(EntityQuery.inspectorToObject(erModel, {
      link: {
        entity: "CHILD_ENTITY",
        alias: "ce",
        fields: [
          {attribute: "TEST_STRING"}
        ]
      }
    }));

    expect(sql).toEqual("SELECT\n" +
      "  E$1.TEST_STRING AS A$1\n" +
      "FROM CHILD_ENTITY E$1");

    await AConnection.executeTransaction({
      connection,
      callback: (transaction) => AConnection.executeQueryResultSet({
        connection, transaction, sql, params,
        callback: () => 0
      })
    });
  });

  it("inheritance", async () => {
    const {sql, params} = new Select(EntityQuery.inspectorToObject(erModel, {
      link: {
        entity: "CHILD_ENTITY",
        alias: "ce",
        fields: [
          {attribute: "TEST_STRING"},
          {attribute: "TEST_FLOAT"}
        ]
      }
    }));
    expect(sql).toEqual("SELECT\n" +
      "  E$1.TEST_STRING AS A$1,\n" +
      "  E$1_2.TEST_FLOAT AS A$2\n" +
      "FROM TEST_ENTITY E$1_2\n" +
      "  LEFT JOIN CHILD_ENTITY E$1 ON E$1.INHERITEDKEY = E$1_2.ID");

    await AConnection.executeTransaction({
      connection,
      callback: (transaction) => AConnection.executeQueryResultSet({
        connection, transaction, sql, params,
        callback: () => 0
      })
    });
  });

  it("nested entities", async () => {
    const {sql, params} = new Select(EntityQuery.inspectorToObject(erModel, {
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
      "  E$1.TEST_STRING AS A$1,\n" +
      "  E$1_1.TEST_INTEGER AS A$2_1,\n" +
      "  E$3.TEST_STRING AS A$3,\n" +
      "  E$4.TEST_STRING2 AS A$4,\n" +
      "  E$5.TEST_STRING AS A$5\n" +
      "FROM MASTER_ENTITY E$6\n" +
      "  LEFT JOIN TEST_ENTITY E$1 ON E$1.ID = E$6.LINK\n" +
      "  LEFT JOIN TABLE_21 E$1_1 ON E$1_1.KEY1 = E$6.ID\n" +
      "  LEFT JOIN TEST_ENTITY E$3 ON E$3.ID = E$1_1.KEY2\n" +
      "  LEFT JOIN DETAIL_ENTITY E$4 ON E$4.MASTERKEY = E$6.ID\n" +
      "  LEFT JOIN TEST_ENTITY E$5 ON E$5.ID = E$4.LINK");

    await AConnection.executeTransaction({
      connection,
      callback: (transaction) => AConnection.executeQueryResultSet({
        connection, transaction, sql, params,
        callback: () => 0
      })
    });
  });

  it("order", async () => {
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
        order: [{
          alias: "de",
          attribute: "TEST_STRING2"
        }, {
          alias: "te",
          attribute: "TEST_FLOAT",
          type: "DESC"
        }]
      }
    }));

    expect(sql).toEqual("SELECT\n" +
      "  E$1.TEST_STRING1 AS A$1\n" +
      "FROM DETAIL_ENTITY E$1\n" +
      "  LEFT JOIN TEST_ENTITY E$2 ON E$2.ID = E$1.LINK\n" +
      "ORDER BY E$1.TEST_STRING2 ASC, E$2.TEST_FLOAT DESC");

    await AConnection.executeTransaction({
      connection,
      callback: (transaction) => AConnection.executeQueryResultSet({
        connection, transaction, sql, params,
        callback: () => 0
      })
    });
  });

  it("where", async () => {
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
        where: [
          {
            equals: [
              {
                alias: "de",
                attribute: "TEST_STRING1",
                value: "asd"
              }, {
                alias: "te",
                attribute: "TEST_FLOAT",
                value: 10
              }
            ]
          }, {
            or: [
              {
                not: [{isNull: [{alias: "de", attribute: "TEST_STRING1"}]}]
              }, {
                not: [{isNull: [{alias: "te", attribute: "TEST_FLOAT"}]}]
              }
            ]
          }
        ]
      }
    }));

    expect(sql).toEqual("SELECT\n" +
      "  E$1.TEST_STRING1 AS A$1\n" +
      "FROM DETAIL_ENTITY E$1\n" +
      "  LEFT JOIN TEST_ENTITY E$2 ON E$2.ID = E$1.LINK\n" +
      "WHERE (E$1.TEST_STRING1 = :P$1 AND E$2.TEST_FLOAT = :P$2)\n" +
      "  AND (E$1.TEST_STRING1 IS NULL OR E$2.TEST_FLOAT IS NULL)");
    expect(params).toEqual({"P$1": "asd", "P$2": 10});

    await AConnection.executeTransaction({
      connection,
      callback: (transaction) => AConnection.executeQueryResultSet({
        connection, transaction, sql, params,
        callback: () => 0
      })
    });
  });
});
