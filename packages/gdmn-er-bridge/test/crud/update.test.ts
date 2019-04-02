import {existsSync, unlinkSync} from "fs";
import {AConnection, Factory, IConnectionOptions} from "gdmn-db";
import {
    DetailAttribute,
    Entity,
    EntityAttribute,
    EntityInsert,
    EntityUpdate,
    ERModel,
    ParentAttribute,
    SetAttribute,
    StringAttribute
} from "gdmn-orm";
import {resolve} from "path";
import {ERBridge, Update} from "gdmn-er-bridge";

const dbOptions: IConnectionOptions = {
  username: "SYSDBA",
  password: "masterkey",
  path: resolve("./GDMN_ER_BRIDGE_UPDATE.FDB"),
  readTransaction: true
};

jest.setTimeout(60 * 1000);

describe("Update", () => {

  const erModel = new ERModel();
  const connection = Factory.FBDriver.newConnection();
  let setAttributeTableName = "";
  let childID = 0;

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
            const MainEntity = await erBuilder.create(erModel, new Entity({
              name: "MAIN_ENTITY",
              lName: {}
            }));
            await eBuilder.createAttribute(MainEntity, new StringAttribute({
              name: "TEST_STRING",
              lName: {}
            }));


            const DetailEntity = await erBuilder.create(erModel, new Entity({
              name: "DETAIL_ENTITY",
              lName: {}
            }));
            await eBuilder.createAttribute(DetailEntity, new StringAttribute({
              name: "TEST_STRING",
              lName: {}
            }));

            const ChildEntity = await erBuilder.create(erModel, new Entity({
              name: "CHILD_ENTITY",
              lName: {},
              parent: MainEntity
            }));
            await eBuilder.createAttribute(ChildEntity, new StringAttribute({
              name: "TEST_STRING1",
              lName: {}
            }));
            await eBuilder.createAttribute(ChildEntity, new StringAttribute({
              name: "TEST_STRING2",
              lName: {}
            }));
            await eBuilder.createAttribute(ChildEntity, new EntityAttribute({
              name: "LINK",
              lName: {},
              entities: [MainEntity]
            }));
            await eBuilder.createAttribute(ChildEntity, new ParentAttribute({
              name: "PARENT",
              lName: {},
              entities: [ChildEntity]
            }));

            const setAttr = new SetAttribute({
              name: "SET_LINK",
              lName: {},
              entities: [MainEntity]
            });
            setAttr.add(new StringAttribute({
              name: "TOTAL",
              lName: {}
            }));
              setAttr.add(new StringAttribute({
                  name: "ALIES",
                  lName: {}
              }));


            const setAttribute = await eBuilder.createAttribute(ChildEntity, setAttr);
            const setAttr1 = setAttribute as SetAttribute;
            setAttributeTableName = setAttr1.adapter!.crossRelation;

            await eBuilder.createAttribute(ChildEntity, new DetailAttribute({
              name: "DETAIL_ENTITY",
              lName: {},
              entities: [DetailEntity]
            }));

              const entityInsert = EntityInsert.inspectorToObject(erModel, {
                  entity: "CHILD_ENTITY",
                  fields: [{
                          attribute: "TEST_STRING1",
                          value: "asdasdas"
                      }]
              });

              const result = await AConnection.executeTransaction({
                  connection,
                  callback: (transaction) => ERBridge.insert(connection, transaction, entityInsert)
              });
              childID = result[0];

              const entityUpdate = EntityUpdate.inspectorToObject(erModel, {
                  entity: "CHILD_ENTITY",
                  fields: [{
                          attribute: "SET_LINK",
                          value: [{
                            pkValues: [childID],
                            setAttributes: [{attribute: "TOTAL", value: "111"},{attribute: "ALIES", value: "111"} ]
                          }]
                      }],
                  pkValues: [childID]
              });
              await AConnection.executeTransaction({
                  connection,
                  callback: (transaction) => ERBridge.update(connection, transaction, entityUpdate)
              });
          }
        });
      }
    });
  });

  afterAll(async () => {
    await connection.dropDatabase();
  });
  it("Update: two string", async () => {

    const {sql, params} = new Update(EntityUpdate.inspectorToObject(erModel, {
      entity: "CHILD_ENTITY",
      fields: [
        {
          attribute: "TEST_STRING1",
          value: "asas"
        },
        {
          attribute: "TEST_STRING2",
          value: "asa"
        }
      ],
      pkValues: [36]

    }));

    expect(sql).toEqual("EXECUTE BLOCK(P$1 BLOB SUB_TYPE TEXT = :P$1," +
      " P$2 BLOB SUB_TYPE TEXT = :P$2, ParentID INTEGER = :ParentID)\n" +
      "AS\n" +
      "DECLARE Key1Value INTEGER;\n" +
      "BEGIN\n" +
      "  UPDATE CHILD_ENTITY SET\n" +
      "  TEST_STRING1 = :P$1, TEST_STRING2 = :P$2\n" +
      "  WHERE INHERITEDKEY = :ParentID;\n" +
      "END");

    await AConnection.executeTransaction({
      connection,
      callback: (transaction) => connection.execute(transaction, sql, params)
    });
  });

  it("Update: tree ", async () => {

    const {sql, params} = new Update(EntityUpdate.inspectorToObject(erModel, {
      entity: "CHILD_ENTITY",
      fields: [
        {
          attribute: "TEST_STRING",
          value: "grj"
        },
        {
          attribute: "TEST_STRING1",
          value: "asas"
        }
      ],
      pkValues: [36]

    }));
    expect(sql).toEqual("EXECUTE BLOCK(P$1 BLOB SUB_TYPE TEXT = :P$1," +
      " P$2 BLOB SUB_TYPE TEXT = :P$2, ParentID INTEGER = :ParentID)\n" +
      "AS\n" +
      "DECLARE Key1Value INTEGER;\n" +
      "BEGIN\n" +
      "  UPDATE MAIN_ENTITY SET\n" +
      "  TEST_STRING = :P$1\n" +
      "  WHERE ID = :ParentID;\n" +
      "\n" +
      "  UPDATE CHILD_ENTITY SET\n" +
      "  TEST_STRING1 = :P$2\n" +
      "  WHERE INHERITEDKEY = :ParentID;\n" +
      "END");

    await AConnection.executeTransaction({
      connection,
      callback: (transaction) => connection.execute(transaction, sql, params)
    });
  });

  it("Update: LINK ", async () => {

    const {sql, params} = new Update(EntityUpdate.inspectorToObject(erModel, {
      entity: "CHILD_ENTITY",
      fields: [
        {
          attribute: "LINK",
          value: 36
        },
        {
          attribute: "TEST_STRING2",
          value: "g,j"
        }

      ],
      pkValues: [36]
    }));
    expect(sql).toEqual("EXECUTE BLOCK(P$1 INTEGER = :P$1," +
      " P$2 BLOB SUB_TYPE TEXT = :P$2, ParentID INTEGER = :ParentID)\n" +
      "AS\n" +
      "DECLARE Key1Value INTEGER;\n" +
      "BEGIN\n" +
      "  UPDATE CHILD_ENTITY SET\n" +
      "  LINK = :P$1, TEST_STRING2 = :P$2\n" +
      "  WHERE INHERITEDKEY = :ParentID;\n" +
      "END");


    await AConnection.executeTransaction({
      connection,
      callback: (transaction) => connection.execute(transaction, sql, params)
    });
  });

  it("Update: PARENT ", async () => {

    const {sql, params} = new Update(EntityUpdate.inspectorToObject(erModel, {
      entity: "CHILD_ENTITY",
      fields: [
        {
          attribute: "TEST_STRING1",
          value: "dfdfd"
        },
        {
          attribute: "PARENT",
          value: 36
        }
      ],
      pkValues: [36]

    }));
    expect(sql).toEqual("EXECUTE BLOCK(P$1 BLOB SUB_TYPE TEXT = :P$1," +
      " P$2 INTEGER = :P$2, ParentID INTEGER = :ParentID)\n" +
      "AS\n" +
      "DECLARE Key1Value INTEGER;\n" +
      "BEGIN\n" +
      "  UPDATE CHILD_ENTITY SET\n" +
      "  TEST_STRING1 = :P$1, PARENT = :P$2\n" +
      "  WHERE INHERITEDKEY = :ParentID;\n" +
      "END");


    await AConnection.executeTransaction({
      connection,
      callback: (transaction) => connection.execute(transaction, sql, params)
    });
  });

  it("Update: Attribute Detail not support yet ", async () => {

    expect(() => {
      new Update(EntityUpdate.inspectorToObject(erModel, {

        entity: "CHILD_ENTITY",
        fields: [
          {
            attribute: "DETAIL_ENTITY",
            value: [11]
          }
        ],
        pkValues: [36]

      }));
    }).toThrowError(new Error("Attribute Detail not support yet"));
  });

  it("Update: SET_LINK ", async () => {

    const {sql, params} = new Update(EntityUpdate.inspectorToObject(erModel, {
      entity: "CHILD_ENTITY",
      fields: [
        {
          attribute: "SET_LINK",
          value: [
            {
              pkValues: [childID],
              setAttributes: [{attribute: "TOTAL", value: "111"}]

            }
          ]
        }
      ],
      pkValues: [childID]
    }));
    expect(sql).toEqual("EXECUTE BLOCK(P$1 INTEGER = :P$1, P$2 VARCHAR(3) = :P$2, ParentID INTEGER = :ParentID)\n" +
      "AS\n" +
      "DECLARE Key1Value INTEGER;\n" +
      "BEGIN\n" +
      `  DELETE\n` +
      `  FROM ${setAttributeTableName}\n` +
      `  WHERE KEY1 = :ParentID;\n` +
      "\n" +
      `  INSERT INTO ${setAttributeTableName}(KEY1, KEY2, TOTAL)\n` +
      "  VALUES(:ParentID, :P$1, :P$2);\n" +
      "END");
    await AConnection.executeTransaction({
      connection,
      callback: (transaction) => connection.execute(transaction, sql, params)
    });
  });

  it("Update: full ", async () => {

    const {sql, params} = new Update(EntityUpdate.inspectorToObject(erModel, {
      entity: "CHILD_ENTITY",
      fields: [
        {
          attribute: "TEST_STRING1",
          value: "dfdfd"
        },
        {
          attribute: "PARENT",
          value: childID
        },
        {
          attribute: "LINK",
          value: childID
        },
        {
          attribute: "SET_LINK",
          value: [
            {
              pkValues: [childID],
              setAttributes: [{attribute: "TOTAL", value: "111"}]
            }
          ]
        }
      ],
      pkValues: [childID]
    }));
    expect(sql).toEqual("EXECUTE BLOCK(P$1 BLOB SUB_TYPE TEXT = :P$1, P$2 INTEGER = :P$2," +
      " P$3 INTEGER = :P$3, P$4 INTEGER = :P$4, P$5 VARCHAR(3) = :P$5, ParentID INTEGER = :ParentID)\n" +
      "AS\n" +
      "DECLARE Key1Value INTEGER;\n" +
      "BEGIN\n" +
      "  UPDATE CHILD_ENTITY SET\n" +
      "  TEST_STRING1 = :P$1, PARENT = :P$2, LINK = :P$3\n" +
      "  WHERE INHERITEDKEY = :ParentID;\n" +
      "\n" +
      "  DELETE\n" +
      "  FROM TABLE_18\n" +
      "  WHERE KEY1 = :ParentID;\n" +
      "\n" +
      `  INSERT INTO ${setAttributeTableName}(KEY1, KEY2, TOTAL)\n` +
      "  VALUES(:ParentID, :P$4, :P$5);\n" +
      "END");


    await AConnection.executeTransaction({
      connection,
      callback: (transaction) => connection.execute(transaction, sql, params)
    });
  });
  //
  it("Update: not tree ", async () => {
    const {sql, params} = new Update(EntityUpdate.inspectorToObject(erModel, {

      entity: "MAIN_ENTITY",
      fields: [
        {
          attribute: "TEST_STRING",
          value: "sdsd"
        }
      ],
      pkValues: [36]

    }));
    expect(sql).toEqual("EXECUTE BLOCK(P$1 BLOB SUB_TYPE TEXT = :P$1, ParentID INTEGER = :ParentID)\n" +
      "AS\n" +
      "DECLARE Key1Value INTEGER;\n" +
      "BEGIN\n" +
      "  UPDATE MAIN_ENTITY SET\n" +
      "  TEST_STRING = :P$1\n" +
      "  WHERE ID = :ParentID;\n" +
      "END");
    await AConnection.executeTransaction({
      connection,
      callback: (transaction) => connection.execute(transaction, sql, params)
    });
  });
});

