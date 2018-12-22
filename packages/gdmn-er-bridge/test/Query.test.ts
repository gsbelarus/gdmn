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
  ParentAttribute,
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
            await eBuilder.createAttribute(ChildEntity, new ParentAttribute({
              name: "PARENT",
              lName: {},
              entities: [ChildEntity]
            }));

            const ChildEntity2 = await erBuilder.create(erModel, new Entity({
              name: "CHILD_ENTITY2",
              lName: {},
              parent: ChildEntity
            }));
            await eBuilder.createAttribute(ChildEntity2, new StringAttribute({name: "TEST_STRING", lName: {}}));
            await eBuilder.createAttribute(ChildEntity2, new StringAttribute({name: "TEST_STRING2", lName: {}}));
            await eBuilder.createAttribute(ChildEntity2, new ParentAttribute({
              name: "PARENT",
              lName: {},
              entities: [ChildEntity2]
            }));
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
      "  T$1.TEST_STRING AS F$1\n" +
      "FROM TEST_ENTITY T$1");

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
      "  T$1.TEST_STRING AS F$1\n" +
      "FROM MASTER_ENTITY T$2\n" +
      "  LEFT JOIN TEST_ENTITY T$1 ON T$1.ID = T$2.LINK");

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
      "  T$1.TEST_STRING2 AS F$1\n" +
      "FROM MASTER_ENTITY T$2\n" +
      "  LEFT JOIN DETAIL_ENTITY T$1 ON T$1.MASTERKEY = T$2.ID");

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
      "  T$1.TEST_INTEGER AS F$1,\n" +
      "  T$2.TEST_STRING AS F$2\n" +
      "FROM MASTER_ENTITY T$3\n" +
      "  LEFT JOIN TABLE_21 T$1 ON T$1.KEY1 = T$3.ID\n" +
      "  LEFT JOIN TEST_ENTITY T$2 ON T$2.ID = T$1.KEY2");

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
      "  T$1.TEST_STRING AS F$1\n" +
      "FROM CHILD_ENTITY T$1");

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
      "  T$1.TEST_STRING AS F$1,\n" +
      "  T$2.TEST_FLOAT AS F$2\n" +
      "FROM TEST_ENTITY T$2\n" +
      "  JOIN CHILD_ENTITY T$1 ON T$1.INHERITEDKEY = T$2.ID");

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
      "  T$1.TEST_STRING AS F$1,\n" +
      "  T$2.TEST_INTEGER AS F$2,\n" +
      "  T$3.TEST_STRING AS F$3,\n" +
      "  T$4.TEST_STRING2 AS F$4,\n" +
      "  T$5.TEST_STRING AS F$5\n" +
      "FROM MASTER_ENTITY T$6\n" +
      "  LEFT JOIN TEST_ENTITY T$1 ON T$1.ID = T$6.LINK\n" +
      "  LEFT JOIN TABLE_21 T$2 ON T$2.KEY1 = T$6.ID\n" +
      "  LEFT JOIN TEST_ENTITY T$3 ON T$3.ID = T$2.KEY2\n" +
      "  LEFT JOIN DETAIL_ENTITY T$4 ON T$4.MASTERKEY = T$6.ID\n" +
      "  LEFT JOIN TEST_ENTITY T$5 ON T$5.ID = T$4.LINK");

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
      "  T$1.TEST_STRING1 AS F$1\n" +
      "FROM DETAIL_ENTITY T$1\n" +
      "  LEFT JOIN TEST_ENTITY T$2 ON T$2.ID = T$1.LINK\n" +
      "ORDER BY T$1.TEST_STRING2 ASC, T$2.TEST_FLOAT DESC");

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
      "  T$1.TEST_STRING1 AS F$1\n" +
      "FROM DETAIL_ENTITY T$1\n" +
      "  LEFT JOIN TEST_ENTITY T$2 ON T$2.ID = T$1.LINK\n" +
      "WHERE (T$1.TEST_STRING1 = :P$1 AND T$2.TEST_FLOAT = :P$2)\n" +
      "  AND (T$1.TEST_STRING1 IS NULL OR T$2.TEST_FLOAT IS NULL)");
    expect(params).toEqual({"P$1": "asd", "P$2": 10});

    await AConnection.executeTransaction({
      connection,
      callback: (transaction) => AConnection.executeQueryResultSet({
        connection, transaction, sql, params,
        callback: () => 0
      })
    });
  });

  it("ParentAttribute: simple", async () => {
    const {sql, params} = new Select(EntityQuery.inspectorToObject(erModel, {
      link: {
        entity: "CHILD_ENTITY",
        alias: "child/parent",
        fields: [
          {
            attribute: "PARENT",
            link: {
              entity: "CHILD_ENTITY",
              alias: "parent",
              fields: [
                {attribute: "ID"}
              ]
            }
          }
        ]
      }

    }));

    expect(sql).toEqual("SELECT\n" +
      "  T$1.ID AS F$1\n" +
      "FROM TEST_ENTITY T$2\n" +
      "  JOIN CHILD_ENTITY T$3 ON T$3.INHERITEDKEY = T$2.ID\n" +
      "  LEFT JOIN TEST_ENTITY T$1 ON T$1.ID = T$3.PARENT");
    await AConnection.executeTransaction({
      connection,
      callback: (transaction) => AConnection.executeQueryResultSet({
        connection, transaction, sql, params,
        callback: () => 0
      })
    });
  });

  it("ParentAttribute: inheritance, parentRelationFields", async () => {
    const {sql, params} = new Select(EntityQuery.inspectorToObject(erModel, {
      link: {
        entity: "CHILD_ENTITY2",
        alias: "child/parent",
        fields: [
          {
            attribute: "PARENT",
            link: {
              entity: "CHILD_ENTITY2",
              alias: "parent",
              fields: [
                {attribute: "ID"}
              ]
            }
          }
        ]
      }

    }));

    expect(sql).toEqual("SELECT\n" +
      "  T$1.ID AS F$1\n" +
      "FROM TEST_ENTITY T$2\n" +
      "  JOIN CHILD_ENTITY2 T$3 ON T$3.INHERITEDKEY = T$2.ID\n" +
      "  LEFT JOIN TEST_ENTITY T$1 ON T$1.ID = T$3.PARENT");
    await AConnection.executeTransaction({
      connection,
      callback: (transaction) => AConnection.executeQueryResultSet({
        connection, transaction, sql, params,
        callback: () => 0
      })
    });
  });

  it("ParentAttribute: inheritance: ParentAttribute, middleRelationFields", async () => {
    const {sql, params} = new Select(EntityQuery.inspectorToObject(erModel, {
      link: {
        entity: "CHILD_ENTITY2",
        alias: "child/parent",
        fields: [
          {
            attribute: "PARENT",
            link: {
              entity: "CHILD_ENTITY2",
              alias: "parent",
              fields: [
                {attribute: "TEST_STRING1"}
              ]
            }
          }
        ]
      }

    }));

    expect(sql).toEqual("SELECT\n" +
      "  T$1.TEST_STRING1 AS F$1\n" +
      "FROM CHILD_ENTITY T$2\n" +
      "  JOIN CHILD_ENTITY2 T$3 ON T$3.INHERITEDKEY = T$2.INHERITEDKEY\n" +
      "  LEFT JOIN CHILD_ENTITY T$1 ON T$1.INHERITEDKEY = T$3.PARENT");
    await AConnection.executeTransaction({
      connection,
      callback: (transaction) => AConnection.executeQueryResultSet({
        connection, transaction, sql, params,
        callback: () => 0
      })
    });
  });

  it("ParentAttribute: inheritance: ParentAttribute, ownRelationFields", async () => {
    const {sql, params} = new Select(EntityQuery.inspectorToObject(erModel, {
      link: {
        entity: "CHILD_ENTITY2",
        alias: "child/parent",
        fields: [
          {
            attribute: "PARENT",
            link: {
              entity: "CHILD_ENTITY2",
              alias: "parent",
              fields: [
                {attribute: "TEST_STRING2"}
              ]
            }
          }
        ]
      }

    }));

    expect(sql).toEqual("SELECT\n" +
      "  T$1.TEST_STRING2 AS F$1\n" +
      "FROM CHILD_ENTITY2 T$2\n" +
      "  LEFT JOIN CHILD_ENTITY2 T$1 ON T$1.INHERITEDKEY = T$2.PARENT");
    await AConnection.executeTransaction({
      connection,
      callback: (transaction) => AConnection.executeQueryResultSet({
        connection, transaction, sql, params,
        callback: () => 0
      })
    });
  });

  it("ParentAttribute: inheritance: ParentAttribute, HasRoot parentRelationFields", async () => {
    const {sql, params} = new Select(EntityQuery.inspectorToObject(erModel, {
      link: {
        entity: "CHILD_ENTITY2",
        alias: "child/parent",
        fields: [
          {
            attribute: "PARENT",
            link: {
              entity: "CHILD_ENTITY2",
              alias: "parent",
              fields: [
                {attribute: "ID"}

              ],
              options: {
                hasRoot: true
              }
            }
          }
        ]
      }
    }));

    expect(sql).toEqual("SELECT\n" +
      "  T$1.ID AS F$1\n" +
      "FROM TEST_ENTITY T$2\n" +
      "  JOIN CHILD_ENTITY2 T$3 ON T$3.INHERITEDKEY = T$2.ID\n" +
      "  JOIN CHILD_ENTITY2 T$4 ON T$4.LB <= T$3.LB AND T$4.RB >= T$3.RB\n" +
      "  LEFT JOIN TEST_ENTITY T$1 ON T$1.ID = T$3.PARENT");
    await AConnection.executeTransaction({
      connection,
      callback: (transaction) => AConnection.executeQueryResultSet({
        connection, transaction, sql, params,
        callback: () => 0
      })
    });
  });

  it("ParentAttribute: inheritance: ParentAttribute, HasRoot middleRelationFields", async () => {
    const {sql, params} = new Select(EntityQuery.inspectorToObject(erModel, {
      link: {
        entity: "CHILD_ENTITY2",
        alias: "child/parent",
        fields: [
          {
            attribute: "PARENT",
            link: {
              entity: "CHILD_ENTITY2",
              alias: "parent",
              fields: [
                {attribute: "TEST_STRING1"}

              ],
              options: {
                hasRoot: true
              }
            }
          }
        ]
      }
    }));

    expect(sql).toEqual("SELECT\n" +
      "  T$1.TEST_STRING1 AS F$1\n" +
      "FROM CHILD_ENTITY T$2\n" +
      "  JOIN CHILD_ENTITY2 T$3 ON T$3.INHERITEDKEY = T$2.INHERITEDKEY\n" +
      "  JOIN CHILD_ENTITY2 T$4 ON T$4.LB <= T$3.LB AND T$4.RB >= T$3.RB\n" +
      "  LEFT JOIN CHILD_ENTITY T$1 ON T$1.INHERITEDKEY = T$3.PARENT");
    await AConnection.executeTransaction({
      connection,
      callback: (transaction) => AConnection.executeQueryResultSet({
        connection, transaction, sql, params,
        callback: () => 0
      })
    });
  });

  it("ParentAttribute: inheritance: ParentAttribute, HasRoot ownRelationFields", async () => {
    const {sql, params} = new Select(EntityQuery.inspectorToObject(erModel, {
      link: {
        entity: "CHILD_ENTITY2",
        alias: "child/parent",
        fields: [
          {
            attribute: "PARENT",
            link: {
              entity: "CHILD_ENTITY2",
              alias: "parent",
              fields: [
                {attribute: "TEST_STRING2"}
              ],
              options: {
                hasRoot: true
              }
            }
          }
        ]
      }
    }));

    expect(sql).toEqual("SELECT\n" +
      "  T$1.TEST_STRING2 AS F$1\n" +
      "FROM CHILD_ENTITY2 T$2\n" +
      "  JOIN CHILD_ENTITY2 T$1 ON T$1.LB <= T$2.LB AND T$1.RB >= T$2.RB");
    await AConnection.executeTransaction({
      connection,
      callback: (transaction) => AConnection.executeQueryResultSet({
        connection, transaction, sql, params,
        callback: () => 0
      })
    });
  });
});
