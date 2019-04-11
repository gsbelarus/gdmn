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
import {ERBridge} from "../../src";
import {Select} from "../../src/crud/query/Select";

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

            const DetailEntity = await erBuilder.create(erModel, new Entity({
              name: "DETAIL_ENTITY",
              lName: {}
            }));
            await eBuilder.createAttribute(DetailEntity, new StringAttribute({
              name: "TEST_STRING1",
              lName: {}
            }));
            await eBuilder.createAttribute(DetailEntity, new StringAttribute({
              name: "TEST_STRING2",
              lName: {}
            }));
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

            await eBuilder.createAttribute(ChildEntity, new StringAttribute({
              name: "TEST_STRING",
              lName: {}
            }));
            await eBuilder.createAttribute(ChildEntity, new StringAttribute({
              name: "TEST_STRING1",
              lName: {}
            }));
            await eBuilder.createAttribute(ChildEntity, new StringAttribute({name: "RB", lName: {}}));
            await eBuilder.createAttribute(ChildEntity, new StringAttribute({name: "LB", lName: {}}));
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
            await eBuilder.createAttribute(ChildEntity2, new StringAttribute({
              name: "TEST_STRING",
              lName: {}
            }));
            await eBuilder.createAttribute(ChildEntity2, new StringAttribute({
              name: "TEST_STRING2",
              lName: {}
            }));
            await eBuilder.createAttribute(ChildEntity2, new StringAttribute({
              name: "RB",
              lName: {}
            }));
            await eBuilder.createAttribute(ChildEntity2, new StringAttribute({
              name: "LB",
              lName: {}
            }));
            await eBuilder.createAttribute(ChildEntity2, new ParentAttribute({
              name: "PARENT",
              lName: {},
              entities: [ChildEntity2]
            }));

            const TestEntity2 = await erBuilder.create(erModel, new Entity({
              name: "TEST_ENTITY2",
              lName: {}
            }));
            await eBuilder.createAttribute(TestEntity2, new StringAttribute({
              name: "TEST_STRING",
              lName: {}
            }));
            await eBuilder.createAttribute(TestEntity2, new FloatAttribute({
              name: "TEST_FLOAT",
              lName: {}
            }));
            await eBuilder.createAttribute(TestEntity2, new ParentAttribute({
              name: "PARENT",
              lName: {},
              entities: [TestEntity2]
            }));


            const TestEntity5 = await erBuilder.create(erModel, new Entity({
              name: "TEST_ENTITY5",
              lName: {}
            }));
            await eBuilder.createAttribute(TestEntity5, new StringAttribute({
              name: "TEST_STRING1",
              lName: {}
            }));
            await eBuilder.createAttribute(TestEntity5, new ParentAttribute({
              name: "PARENT",
              lName: {},
              entities: [TestEntity5]
            }));

            const ChildEntity5 = await erBuilder.create(erModel, new Entity({
              name: "CHILD_ENTITY5",
              lName: {},
              parent: TestEntity5
            }));
            await eBuilder.createAttribute(ChildEntity5, new StringAttribute({
              name: "TEST_STRING",
              lName: {}
            }));

            const MasterEntity6 = await erBuilder.create(erModel, new Entity({
              name: "MASTER_ENTITY6",
              lName: {}
            }));
            await eBuilder.createAttribute(MasterEntity6, new StringAttribute({
              name: "TEST_STRING",
              lName: {}
            }));
            await eBuilder.createAttribute(MasterEntity6, new EntityAttribute({
              name: "LINK",
              lName: {},
              entities: [TestEntity5]
            }));

            const TestEntity10 = await erBuilder.create(erModel, new Entity({
              name: "TEST_ENTITY10",
              lName: {}
            }));
            await eBuilder.createAttribute(TestEntity10, new StringAttribute({
              name: "TEST_STRING10",
              lName: {}
            }));
            await eBuilder.createAttribute(TestEntity10, new StringAttribute({
              name: "TEST_FLOAT10",
              lName: {}
            }));
            await eBuilder.createAttribute(TestEntity10, new ParentAttribute({
              name: "PARENT",
              lName: {},
              entities: [TestEntity10]
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

    await AConnection.executeQueryResultSet({
      connection, transaction: connection.readTransaction, sql, params, callback: () => 0
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
            links: [{
              entity: "TEST_ENTITY",
              alias: "te",
              fields: [
                {attribute: "TEST_STRING"}
              ]
            }]
          }
        ]
      }
    }));

    expect(sql).toEqual("SELECT\n" +
      "  T$1.TEST_STRING AS F$1\n" +
      "FROM MASTER_ENTITY T$2\n" +
      "  LEFT JOIN TEST_ENTITY T$1 ON T$1.ID = T$2.LINK");

    await AConnection.executeQueryResultSet({
      connection, transaction: connection.readTransaction, sql, params, callback: () => 0
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
            links: [{
              entity: "DETAIL_ENTITY",
              alias: "de",
              fields: [
                {attribute: "TEST_STRING2"}
              ]
            }]
          }
        ]
      }
    }));

    expect(sql).toEqual("SELECT\n" +
      "  T$1.TEST_STRING2 AS F$1\n" +
      "FROM MASTER_ENTITY T$2\n" +
      "  LEFT JOIN DETAIL_ENTITY T$1 ON T$1.MASTERKEY = T$2.ID");

    await AConnection.executeQueryResultSet({
      connection, transaction: connection.readTransaction, sql, params, callback: () => 0
    });
  });

  it("entity set", async () => {
    const query = EntityQuery.inspectorToObject(erModel, {
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
      }
    });
    const {sql} = new Select(query);

    expect(sql).toEqual("SELECT\n" +
      "  T$1.TEST_INTEGER AS F$1,\n" +
      "  T$2.TEST_STRING AS F$2\n" +
      "FROM MASTER_ENTITY T$3\n" +
      "  LEFT JOIN TABLE_21 T$1 ON T$1.KEY1 = T$3.ID\n" +
      "  LEFT JOIN TEST_ENTITY T$2 ON T$2.ID = T$1.KEY2");

    const result = await ERBridge.query(connection, connection.readTransaction, query);
    const resultAttrs = Object.entries(result.aliases).map(([alias, info]) => {
      const link = query.link.deepFindLink(info.linkAlias)!;

      const findField = link.fields.find((field) => field.attribute.name === info.attribute)!;
      if (info.setAttribute) {
        const setAttribute = findField.setAttributes!.find((attr) => attr.name === info.setAttribute);
        return {alias, attribute: findField.attribute, setAttribute};
      }
      return {alias, attribute: findField.attribute};
    });

    expect(resultAttrs[0].alias).toEqual("F$1");
    expect(resultAttrs[0].attribute).toEqual(erModel.entities["MASTER_ENTITY"].attribute("SET_LINK"));
    expect(resultAttrs[0].setAttribute)
      .toEqual((erModel.entities["MASTER_ENTITY"].attribute("SET_LINK") as SetAttribute).attributes["TEST_INTEGER"]);
    expect(resultAttrs[1].alias).toEqual("F$2");
    expect(resultAttrs[1].attribute).toEqual(erModel.entities["TEST_ENTITY"].attribute("TEST_STRING"));
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
      "FROM TEST_ENTITY T$2\n" +
      "  JOIN CHILD_ENTITY T$1 ON T$1.INHERITEDKEY = T$2.ID");


    await AConnection.executeQueryResultSet({
      connection, transaction: connection.readTransaction, sql, params, callback: () => 0
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

    await AConnection.executeQueryResultSet({
      connection, transaction: connection.readTransaction, sql, params, callback: () => 0
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
            links: [{
              entity: "TEST_ENTITY",
              alias: "te",
              fields: [
                {attribute: "TEST_STRING"}
              ]
            }]
          },
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
          },
          {
            attribute: "DETAIL_ENTITY",
            links: [{
              entity: "DETAIL_ENTITY",
              alias: "de",
              fields: [
                {attribute: "TEST_STRING2"},
                {
                  attribute: "LINK",
                  links: [{
                    entity: "TEST_ENTITY",
                    alias: "te",
                    fields: [
                      {attribute: "TEST_STRING"}
                    ]
                  }]
                }
              ]
            }]
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

    await AConnection.executeQueryResultSet({
      connection, transaction: connection.readTransaction, sql, params, callback: () => 0
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
            links: [{
              entity: "TEST_ENTITY",
              alias: "te",
              fields: []
            }]
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

    await AConnection.executeQueryResultSet({
      connection, transaction: connection.readTransaction, sql, params, callback: () => 0
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
            links: [{
              entity: "TEST_ENTITY",
              alias: "te",
              fields: []
            }]
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
      "WHERE (UPPER(T$1.TEST_STRING1) = UPPER(:P$1) AND T$2.TEST_FLOAT = :P$2)\n" +
      "  AND (NOT T$1.TEST_STRING1 IS NULL OR NOT T$2.TEST_FLOAT IS NULL)");
    expect(params).toEqual({"P$1": "asd", "P$2": 10});

    await AConnection.executeQueryResultSet({
      connection, transaction: connection.readTransaction, sql, params, callback: () => 0
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
            links: [{
              entity: "CHILD_ENTITY",
              alias: "parent",
              fields: [
                {attribute: "ID"}
              ]
            }]
          }
        ]
      }

    }));

    expect(sql).toEqual("SELECT\n" +
      "  T$1.ID AS F$1\n" +
      "FROM TEST_ENTITY T$2\n" +
      "  JOIN CHILD_ENTITY T$3 ON T$3.INHERITEDKEY = T$2.ID\n" +
      "  LEFT JOIN TEST_ENTITY T$1 ON T$1.ID = T$3.PARENT");

    await AConnection.executeQueryResultSet({
      connection, transaction: connection.readTransaction, sql, params, callback: () => 0
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
            links: [{
              entity: "CHILD_ENTITY2",
              alias: "parent",
              fields: [
                {attribute: "ID"}
              ]
            }]
          }
        ]
      }

    }));

    expect(sql).toEqual("SELECT\n" +
      "  T$1.ID AS F$1\n" +
      "FROM TEST_ENTITY T$2\n" +
      "  JOIN CHILD_ENTITY T$3 ON T$3.INHERITEDKEY = T$2.ID\n" +
      "  JOIN CHILD_ENTITY2 T$4 ON T$4.INHERITEDKEY = T$2.ID\n" +
      "  LEFT JOIN TEST_ENTITY T$1 ON T$1.ID = T$4.PARENT");

    await AConnection.executeQueryResultSet({
      connection, transaction: connection.readTransaction, sql, params, callback: () => 0
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
            links: [{
              entity: "CHILD_ENTITY2",
              alias: "parent",
              fields: [
                {attribute: "TEST_STRING1"}
              ]
            }]
          }
        ]
      }

    }));

    expect(sql).toEqual("SELECT\n" +
      "  T$1.TEST_STRING1 AS F$1\n" +
      "FROM TEST_ENTITY T$2\n" +
      "  JOIN CHILD_ENTITY T$3 ON T$3.INHERITEDKEY = T$2.ID\n" +
      "  JOIN CHILD_ENTITY2 T$4 ON T$4.INHERITEDKEY = T$2.ID\n" +
      "  LEFT JOIN CHILD_ENTITY T$1 ON T$1.INHERITEDKEY = T$4.PARENT");

    await AConnection.executeQueryResultSet({
      connection, transaction: connection.readTransaction, sql, params, callback: () => 0
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
            links: [{
              entity: "CHILD_ENTITY2",
              alias: "parent",
              fields: [
                {attribute: "TEST_STRING2"}
              ]
            }]
          }
        ]
      }

    }));

    expect(sql).toEqual("SELECT\n" +
      "  T$1.TEST_STRING2 AS F$1\n" +
      "FROM TEST_ENTITY T$2\n" +
      "  JOIN CHILD_ENTITY T$3 ON T$3.INHERITEDKEY = T$2.ID\n" +
      "  JOIN CHILD_ENTITY2 T$4 ON T$4.INHERITEDKEY = T$2.ID\n" +
      "  LEFT JOIN CHILD_ENTITY2 T$1 ON T$1.INHERITEDKEY = T$4.PARENT");

    await AConnection.executeQueryResultSet({
      connection, transaction: connection.readTransaction, sql, params, callback: () => 0
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
            links: [{
              entity: "CHILD_ENTITY2",
              alias: "parent",
              fields: [
                {attribute: "ID"}

              ],
              options: {
                hasRoot: true
              }
            }]
          }
        ]
      }
    }));

    expect(sql).toEqual("SELECT\n" +
      "  T$1.ID AS F$1\n" +
      "FROM TEST_ENTITY T$2\n" +
      "  JOIN CHILD_ENTITY T$3 ON T$3.INHERITEDKEY = T$2.ID\n" +
      "  JOIN CHILD_ENTITY2 T$4 ON T$4.INHERITEDKEY = T$2.ID\n" +
      "  JOIN CHILD_ENTITY2 T$5 ON T$5.LB <= T$4.LB AND T$5.RB >= T$4.RB\n" +
      "  LEFT JOIN TEST_ENTITY T$1 ON T$1.ID = T$4.PARENT");

    await AConnection.executeQueryResultSet({
      connection, transaction: connection.readTransaction, sql, params, callback: () => 0
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
            links: [{
              entity: "CHILD_ENTITY2",
              alias: "parent",
              fields: [
                {attribute: "TEST_STRING1"}

              ],
              options: {
                hasRoot: true
              }
            }]
          }
        ]
      }
    }));

    expect(sql).toEqual("SELECT\n" +
      "  T$1.TEST_STRING1 AS F$1\n" +
      "FROM TEST_ENTITY T$2\n" +
      "  JOIN CHILD_ENTITY T$3 ON T$3.INHERITEDKEY = T$2.ID\n" +
      "  JOIN CHILD_ENTITY2 T$4 ON T$4.INHERITEDKEY = T$2.ID\n" +
      "  JOIN CHILD_ENTITY2 T$5 ON T$5.LB <= T$4.LB AND T$5.RB >= T$4.RB\n" +
      "  LEFT JOIN CHILD_ENTITY T$1 ON T$1.INHERITEDKEY = T$4.PARENT");

    await AConnection.executeQueryResultSet({
      connection, transaction: connection.readTransaction, sql, params, callback: () => 0
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
            links: [{
              entity: "CHILD_ENTITY2",
              alias: "parent",
              fields: [
                {attribute: "TEST_STRING2"}
              ],
              options: {
                hasRoot: true
              }
            }]
          }
        ]
      }
    }));

    expect(sql).toEqual("SELECT\n" +
      "  T$1.TEST_STRING2 AS F$1\n" +
      "FROM TEST_ENTITY T$2\n" +
      "  JOIN CHILD_ENTITY T$3 ON T$3.INHERITEDKEY = T$2.ID\n" +
      "  JOIN CHILD_ENTITY2 T$4 ON T$4.INHERITEDKEY = T$2.ID\n" +
      "  JOIN CHILD_ENTITY2 T$1 ON T$1.LB <= T$4.LB AND T$1.RB >= T$4.RB");

    await AConnection.executeQueryResultSet({
      connection, transaction: connection.readTransaction, sql, params, callback: () => 0
    });
  });

  it("simple tree", async () => {
    const {sql, params} = new Select(EntityQuery.inspectorToObject(erModel, {
      link: {
        entity: "TEST_ENTITY5",
        alias: "child/parent",
        fields: [
          {
            attribute: "PARENT",
            links: [{
              entity: "TEST_ENTITY5",
              alias: "parent",
              fields: [
                {attribute: "TEST_STRING1"}
              ]
            }]
          }
        ]
      }
    }));

    expect(sql).toEqual("SELECT\n" +
      "  T$1.TEST_STRING1 AS F$1\n" +
      "FROM (\n" +
      "  WITH RECURSIVE TREE AS (\n" +
      "    SELECT\n" +
      "      T$2.ID,\n" +
      "      T$2.PARENT,\n" +
      "      T$2.TEST_STRING1\n" +
      "    FROM TEST_ENTITY5 T$2\n" +
      "    WHERE T$2.PARENT = :P$1" +
      "\n\n    UNION ALL\n\n" +
      "    SELECT\n" +
      "      T$3.ID,\n" +
      "      T$3.PARENT,\n" +
      "      T$3.TEST_STRING1\n" +
      "    FROM TEST_ENTITY5 T$3\n" +
      "      JOIN TREE T$4 ON T$4.ID = T$3.PARENT\n" +
      "  )\n" +
      "  SELECT\n" +
      "    T$5.ID,\n" +
      "    T$5.PARENT,\n" +
      "    T$5.TEST_STRING1\n" +
      "  FROM TREE T$5\n" +
      ") T$1");

    await AConnection.executeQueryResultSet({
      connection, transaction: connection.readTransaction, sql, params, callback: () => 0
    });
  });

  it("simple entity: string field", async () => {
    const {sql, params} = new Select(EntityQuery.inspectorToObject(erModel, {
      link: {
        entity: "TEST_ENTITY5",
        alias: "se",
        fields: [
          {attribute: "TEST_STRING1"}
        ]
      }
    }));

    expect(sql).toEqual("SELECT\n" +
      "  T$1.TEST_STRING1 AS F$1\n" +
      "FROM TEST_ENTITY5 T$1");

    await AConnection.executeQueryResultSet({
      connection, transaction: connection.readTransaction, sql, params, callback: () => 0
    });
  });

  it("ParentAttribute: link", async () => {
    const {sql, params} = new Select(EntityQuery.inspectorToObject(erModel, {
      link: {
        entity: "MASTER_ENTITY6",
        alias: "me",
        fields: [
          {
            attribute: "LINK",
            links: [{
              entity: "TEST_ENTITY5",
              alias: "te",
              fields: [
                {attribute: "TEST_STRING1"}
              ]
            }]
          }
        ]
      }
    }));

    expect(sql).toEqual("SELECT\n" +
      "  T$1.TEST_STRING1 AS F$1\n" +
      "FROM MASTER_ENTITY6 T$2\n" +
      "  LEFT JOIN TEST_ENTITY5 T$1 ON T$1.ID = T$2.LINK");

    await AConnection.executeQueryResultSet({
      connection, transaction: connection.readTransaction, sql, params, callback: () => 0
    });
  });

  it("Tree: two string filed", async () => {
    const {sql, params} = new Select(EntityQuery.inspectorToObject(erModel, {
      link: {
        entity: "TEST_ENTITY10",
        alias: "ce",
        fields: [
          {attribute: "TEST_STRING10"},
          {attribute: "TEST_FLOAT10"}
        ]
      }
    }));

    expect(sql).toEqual("SELECT\n" +
      "  T$1.TEST_STRING10 AS F$1,\n" +
      "  T$1.TEST_FLOAT10 AS F$2\n" +
      "FROM TEST_ENTITY10 T$1");

    await AConnection.executeQueryResultSet({
      connection, transaction: connection.readTransaction, sql, params, callback: () => 0
    });
  });

  it("where: containing", async () => {
    const {sql, params} = new Select(EntityQuery.inspectorToObject(erModel, {
      link: {
        entity: "DETAIL_ENTITY",
        alias: "de",
        fields: [
          {attribute: "TEST_STRING1"},
        ]
      },
      options: {
        where: [{
          contains: [{
            alias: "de",
            attribute: "TEST_STRING1",
            value: "asd"
          }]
        }]
      }
    }));

    expect(sql).toEqual("SELECT\n" +
      "  T$1.TEST_STRING1 AS F$1\n" +
      "FROM DETAIL_ENTITY T$1\n" +
      "WHERE T$1.TEST_STRING1 CONTAINING :P$1");

    await AConnection.executeQueryResultSet({
      connection, transaction: connection.readTransaction, sql, params, callback: () => 0
    });
  });

  it("where: Comparison operators", async () => {
    const {sql, params} = new Select(EntityQuery.inspectorToObject(erModel, {
      link: {
        entity: "TEST_ENTITY",
        alias: "te",
        fields: [
          {attribute: "TEST_STRING"},
        ]
      },
      options: {
        where: [{
          greater: [{
            alias: "te",
            attribute: "ID",
            value: 1
          }]
        },
          {
            less: [{
              alias: "te",
              attribute: "ID",
              value: 5
            }]
          }]
      }
    }));

    expect(sql).toEqual("SELECT\n" +
      "  T$1.TEST_STRING AS F$1\n" +
      "FROM TEST_ENTITY T$1\n" +
      "WHERE T$1.ID > :P$1\n" +
      "  AND T$1.ID < :P$2");

    await AConnection.executeQueryResultSet({
      connection, transaction: connection.readTransaction, sql, params, callback: () => 0
    });
  });
});
