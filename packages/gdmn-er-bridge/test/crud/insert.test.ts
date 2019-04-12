import {existsSync, unlinkSync} from "fs";
import {AConnection, Factory, IConnectionOptions} from "gdmn-db";
import {
  DetailAttribute,
  Entity,
  EntityAttribute,
  EntityInsert,
  ERModel,
  IntegerAttribute,
  ParentAttribute,
  SetAttribute,
  StringAttribute
} from "gdmn-orm";
import {resolve} from "path";
import {ERBridge} from "../../src";
import {Insert} from "../../src/crud/insert/Insert";
import {DDLHelper} from "../../src/ddl/DDLHelper";

const dbOptions: IConnectionOptions = {
  username: "SYSDBA",
  password: "masterkey",
  path: resolve("./GDMN_ER_BRIDGE_INSERT.FDB"),
  readTransaction: true
};

jest.setTimeout(60 * 1000);

describe("Insert", () => {

  const erModel = new ERModel();
  const connection = Factory.FBDriver.newConnection();
  let linkKey = 0;
  let setAttributeTableName = "";
  let ParentKey = 0;

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

            const setAttribute = await eBuilder.createAttribute(ChildEntity, setAttr);
            const setAttr1 = setAttribute as SetAttribute;
            setAttributeTableName = setAttr1.adapter!.crossRelation;

            await eBuilder.createAttribute(ChildEntity, new DetailAttribute({
              name: "DETAIL_ENTITY",
              lName: {},
              entities: [DetailEntity]
            }));
          }
        });
      }
    });
    const sql = "EXECUTE BLOCK\n" +
      "RETURNS (ID int, ParentID int)\n" +
      "AS\n" +
      "BEGIN\n" +
      " INSERT INTO\n" +
      " MAIN_ENTITY\n" +
      "   DEFAULT VALUES\n" +
      "   RETURNING ID INTO :ParentID;\n" +
      " INSERT INTO\n" +
      " CHILD_ENTITY\n" +
      "   (INHERITEDKEY)\n" +
      "   VALUES (:ParentID)\n" +
      "   RETURNING INHERITEDKEY INTO :ID;\n" +
      "SUSPEND;\n" +
      "END";

    const result = await AConnection.executeTransaction({
      connection,
      callback: (transaction) => connection.executeReturning(transaction, sql)
    });
    linkKey = result.getNumber("ID");
    ParentKey = result.getNumber("PARENTID");
  });

  afterAll(async () => {
    await connection.dropDatabase();
  });

  it("insert: Two string ", async () => {
    const {sql, params} = new Insert(EntityInsert.inspectorToObject(erModel, {
      entity: "CHILD_ENTITY",
      fields: [
        {
          attribute: "TEST_STRING1",
          value: "asas"
        },
        {
          attribute: "TEST_STRING2",
          value: "g,j"
        }
      ]
    }));

    expect(sql).toEqual("EXECUTE BLOCK(P$1 BLOB SUB_TYPE TEXT = :P$1, P$2 BLOB SUB_TYPE TEXT = :P$2)\n" +
      "RETURNS (ID int, ParentID int)\n" +
      "AS\n" +
      "BEGIN\n" +
      "  INSERT INTO MAIN_ENTITY\n" +
      "  DEFAULT VALUES\n" +
      "  RETURNING ID INTO :ParentID;\n" +
      "\n" +
      "  INSERT INTO CHILD_ENTITY(TEST_STRING1, TEST_STRING2, INHERITEDKEY)\n" +
      "  VALUES(:P$1, :P$2, :ParentID)\n" +
      "  RETURNING INHERITEDKEY INTO :ID;\n" +
      "SUSPEND;\n" +
      "END");

    await AConnection.executeTransaction({
      connection,
      callback: (transaction) => connection.execute(transaction, sql, params)
    });
  });

  it("insert: INHERITANCE ", async () => {
    const {sql, params} = new Insert(EntityInsert.inspectorToObject(erModel, {
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
      ]
    }));

    expect(sql).toEqual("EXECUTE BLOCK(P$1 BLOB SUB_TYPE TEXT = :P$1, P$2 BLOB SUB_TYPE TEXT = :P$2)\n" +
      "RETURNS (ID int, ParentID int)\n" +
      "AS\n" +
      "BEGIN\n" +
      "  INSERT INTO MAIN_ENTITY(TEST_STRING)\n" +
      "  VALUES(:P$1)\n" +
      "  RETURNING ID INTO :ParentID;\n" +
      "\n" +
      "  INSERT INTO CHILD_ENTITY(TEST_STRING1, INHERITEDKEY)\n" +
      "  VALUES(:P$2, :ParentID)\n" +
      "  RETURNING INHERITEDKEY INTO :ID;\n" +
      "SUSPEND;\n" +
      "END");

    await AConnection.executeTransaction({
      connection,
      callback: (transaction) => connection.execute(transaction, sql, params)
    });
  });

  it("insert: LINK ", async () => {
    const {sql, params} = new Insert(EntityInsert.inspectorToObject(erModel, {
      entity: "CHILD_ENTITY",
      fields: [
        {
          attribute: "LINK",
          value: ParentKey
        },
        {
          attribute: "TEST_STRING2",
          value: "g,j"
        }
      ]
    }));

    expect(sql).toEqual("EXECUTE BLOCK(P$1 INTEGER = :P$1, P$2 BLOB SUB_TYPE TEXT = :P$2)\n" +
      "RETURNS (ID int, ParentID int)\n" +
      "AS\n" +
      "BEGIN\n" +
      "  INSERT INTO MAIN_ENTITY\n" +
      "  DEFAULT VALUES\n" +
      "  RETURNING ID INTO :ParentID;\n" +
      "\n" +
      "  INSERT INTO CHILD_ENTITY(LINK, TEST_STRING2, INHERITEDKEY)\n" +
      "  VALUES(:P$1, :P$2, :ParentID)\n" +
      "  RETURNING INHERITEDKEY INTO :ID;\n" +
      "SUSPEND;\n" +
      "END");

    await AConnection.executeTransaction({
      connection,
      callback: (transaction) => connection.execute(transaction, sql, params)
    });
  });

  it("insert: DetailAttribute ", async () => {
    expect(() => {
      new Insert(EntityInsert.inspectorToObject(erModel, {
        entity: "CHILD_ENTITY",
        fields: [
          {
            attribute: "TEST_STRING1",
            value: "g,j"
          },
          {
            attribute: "DETAIL_ENTITY",
            value: linkKey
          }
        ]
      }));
    }).toThrowError(new Error("Attribute Detail not support yet"));
  });

  it("insert: SET_LINK ", async () => {
    const {sql, params} = new Insert(EntityInsert.inspectorToObject(erModel, {
      entity: "CHILD_ENTITY",
      fields: [
        {
          attribute: "SET_LINK",
          value: [
            {
              pkValues: [ParentKey],
              setAttributes: [{attribute: "TOTAL", value: "111"}]
            }
          ]
        }
      ]
    }));

    expect(sql).toEqual("EXECUTE BLOCK(P$1 INTEGER = :P$1, P$2 BLOB SUB_TYPE TEXT = :P$2)\n" +
      "RETURNS (ID int, ParentID int)\n" +
      "AS\n" +
      "BEGIN\n" +
      "  INSERT INTO MAIN_ENTITY\n" +
      "  DEFAULT VALUES\n" +
      "  RETURNING ID INTO :ParentID;\n" +
      "\n" +
      "  INSERT INTO CHILD_ENTITY(INHERITEDKEY)\n" +
      "  VALUES(:ParentID)\n" +
      "  RETURNING INHERITEDKEY INTO :ID;\n" +
      "\n" +
      `  INSERT INTO ${setAttributeTableName}(KEY1, KEY2, TOTAL)\n` +
      "  VALUES(:ID, :P$1, :P$2);\n" +
      "SUSPEND;\n" +
      "END");
    await AConnection.executeTransaction({
      connection,
      callback: (transaction) => connection.execute(transaction, sql, params)
    });
  });

  it("insert: string ", async () => {
    const {sql, params} = new Insert(EntityInsert.inspectorToObject(erModel, {
      entity: "MAIN_ENTITY",
      fields: [
        {
          attribute: "TEST_STRING",
          value: "ffff"
        }
      ]
    }));

    expect(sql).toEqual("EXECUTE BLOCK(P$1 BLOB SUB_TYPE TEXT = :P$1)\n" +
      "RETURNS (ID int, ParentID int)\n" +
      "AS\n" +
      "BEGIN\n" +
      "  INSERT INTO MAIN_ENTITY(TEST_STRING)\n" +
      "  VALUES(:P$1)\n" +
      "  RETURNING ID INTO :ID;\n" +
      "SUSPEND;\n" +
      "END");

    await AConnection.executeTransaction({
      connection,
      callback: (transaction) => connection.execute(transaction, sql, params)
    });
  });

  it("insert: PARENT ", async () => {
    const {sql, params} = new Insert(EntityInsert.inspectorToObject(erModel, {
      entity: "CHILD_ENTITY",
      fields: [
        {
          attribute: "TEST_STRING1",
          value: "dfdfd"
        },
        {
          attribute: "PARENT",
          value: linkKey
        }
      ]
    }));

    expect(sql).toEqual("EXECUTE BLOCK(P$1 BLOB SUB_TYPE TEXT = :P$1, P$2 INTEGER = :P$2)\n" +
      "RETURNS (ID int, ParentID int)\n" +
      "AS\n" +
      "BEGIN\n" +
      "  INSERT INTO MAIN_ENTITY\n" +
      "  DEFAULT VALUES\n" +
      "  RETURNING ID INTO :ParentID;\n" +
      "\n" +
      "  INSERT INTO CHILD_ENTITY(TEST_STRING1, PARENT, INHERITEDKEY)\n" +
      "  VALUES(:P$1, :P$2, :ParentID)\n" +
      "  RETURNING INHERITEDKEY INTO :ID;\n" +
      "SUSPEND;\n" +
      "END");

    await AConnection.executeTransaction({
      connection,
      callback: (transaction) => connection.execute(transaction, sql, params)
    });
  });

  it("insert: full ", async () => {
    const {sql, params} = new Insert(EntityInsert.inspectorToObject(erModel, {
      entity: "CHILD_ENTITY",
      fields: [
        {
          attribute: "TEST_STRING1",
          value: "dfdfd"
        },
        {
          attribute: "PARENT",
          value: linkKey
        },
        {
          attribute: "LINK",
          value: ParentKey
        },
        {
          attribute: "SET_LINK",
          value: [
            {
              pkValues: [ParentKey],
              setAttributes: [{attribute: "TOTAL", value: "111"}]
            }
          ]
        }
      ]
    }));

    expect(sql).toEqual("EXECUTE BLOCK(P$1 BLOB SUB_TYPE TEXT = :P$1," +
      " P$2 INTEGER = :P$2, P$3 INTEGER = :P$3, P$4 INTEGER = :P$4, P$5 BLOB SUB_TYPE TEXT = :P$5)\n" +
      "RETURNS (ID int, ParentID int)\n" +
      "AS\n" +
      "BEGIN\n" +
      "  INSERT INTO MAIN_ENTITY\n" +
      "  DEFAULT VALUES\n" +
      "  RETURNING ID INTO :ParentID;\n" +
      "\n" +
      "  INSERT INTO CHILD_ENTITY(TEST_STRING1, PARENT, LINK, INHERITEDKEY)\n" +
      "  VALUES(:P$1, :P$2, :P$3, :ParentID)\n" +
      "  RETURNING INHERITEDKEY INTO :ID;\n" +
      "\n" +
      `  INSERT INTO ${setAttributeTableName}(KEY1, KEY2, TOTAL)\n` +
      "  VALUES(:ID, :P$4, :P$5);\n" +
      "SUSPEND;\n" +
      "END");

    await AConnection.executeTransaction({
      connection,
      callback: (transaction) => connection.execute(transaction, sql, params)
    });
  });
  it("insert: selector ", async () => {
    const SELECTOR_ENTITY = erModel.add(new Entity({
      name: "SELECTOR_ENTITY",
      lName: {},
      adapter: {relation: [{relationName: "SELECTOR_ENTITY", selector: {field: "CONTACTTYPE", value: 5}}]}
    }));

    SELECTOR_ENTITY.add(new IntegerAttribute({
      name: "ID", lName: {}, adapter: {relation: "SELECTOR_ENTITY", field: "ID"}
    }));

    SELECTOR_ENTITY.add(new IntegerAttribute({
      name: "TEST_STRING", lName: {}, adapter: {relation: "SELECTOR_ENTITY", field: "TEST_STRING"}
    }));

    SELECTOR_ENTITY.add(new IntegerAttribute({
      name: "CONTACTTYPE", lName: {}, adapter: {relation: "SELECTOR_ENTITY", field: "CONTACTTYPE"}
    }));

    await AConnection.executeTransaction({
      connection,
      callback: (transaction) => DDLHelper.executeSelf({
        connection,
        transaction,
        callback: async (ddlHelper) => {

          await ddlHelper.addTable("SELECTOR_ENTITY", [
            {name: "ID", domain: "DINTKEY"},
            {name: "TEST_STRING", domain: "DSMALLINT"},
            {name: "CONTACTTYPE", domain: "DSMALLINT"}
          ]);
        }
      })
    });

    const {sql, params} = new Insert(EntityInsert.inspectorToObject(erModel, {
      entity: "SELECTOR_ENTITY",
      fields: [
        {
          attribute: "ID",
          value: 1
        }
      ]
    }));

    expect(sql).toEqual("EXECUTE BLOCK(P$1 INTEGER = :P$1, P$2 INTEGER = :P$2)\n" +
      "RETURNS (ID int, ParentID int)\n" +
      "AS\n" +
      "BEGIN\n" +
      "  INSERT INTO SELECTOR_ENTITY(ID, CONTACTTYPE)\n" +
      "  VALUES(:P$1, :P$2)\n" +
      "  RETURNING ID INTO :ID;\n" +
      "SUSPEND;\n" +
      "END");

    await AConnection.executeTransaction({
      connection,
      callback: (transaction) => connection.execute(transaction, sql, params)
    });
  });

  it("insert: SET_LINK error ", async () => {
    expect(() => { new Insert(EntityInsert.inspectorToObject(erModel, {
      entity: "CHILD_ENTITY",
      fields: [
        {
          attribute: "SET_LINK",
          value: ParentKey
        }
      ]
    }));

    }).toThrowError(new Error("Value should be a primitive with SetAttribute"));
  });
});
