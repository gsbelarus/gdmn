import {existsSync, unlinkSync} from "fs";
import {AConnection, Factory, IConnectionOptions} from "gdmn-db";
import {
  DetailAttribute,
  Entity,
  EntityAttribute,
  EntityDelete,
  ERModel,
  ParentAttribute,
  SetAttribute,
  StringAttribute
} from "gdmn-orm";
import {resolve} from "path";
import {ERBridge} from "../../src";
import {Delete} from "../../src/crud/delete/Delete";

const dbOptions: IConnectionOptions = {
  username: "SYSDBA",
  password: "masterkey",
  path: resolve("./GDMN_ER_BRIDGE_DELETE.FDB"),
  readTransaction: true
};

jest.setTimeout(60 * 1000);

describe("Delete", () => {

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

            await eBuilder.createAttribute(ChildEntity, new SetAttribute({
              name: "SET_LINK",
              lName: {},
              entities: [MainEntity]
            }));

            await eBuilder.createAttribute(ChildEntity, new DetailAttribute({
              name: "DETAIL_ENTITY",
              lName: {},
              entities: [DetailEntity]
            }));
          }
        });
      }
    });
  });

  afterAll(async () => {
    await connection.dropDatabase();
  });

  it("delete: MAIN_ENTITY", async () => {
    const {sql, params} = new Delete(EntityDelete.inspectorToObject(erModel, {
      entity: "MAIN_ENTITY",
      pkValue: [36]
    }));

    expect(sql).toEqual("DELETE\n" +
      "FROM MAIN_ENTITY\n" +
      "WHERE ID = :P$1");

    await AConnection.executeTransaction({
      connection,
      callback: (transaction) => connection.execute(transaction, sql, params)
    });
  });

  it("delete: CHILD_ENTITY", async () => {
    const {sql, params} = new Delete(EntityDelete.inspectorToObject(erModel, {
      entity: "CHILD_ENTITY",
      pkValue: [36]
    }));

    expect(sql).toEqual("DELETE\n" +
      "FROM MAIN_ENTITY\n" +
      "WHERE ID = :P$1");

    await AConnection.executeTransaction({
      connection,
      callback: (transaction) => connection.execute(transaction, sql, params)
    });
  });
});

