import {existsSync, unlinkSync} from "fs";
import {AConnection, Factory, IConnectionOptions} from "gdmn-db";
import {resolve} from "path";
import {Constants} from "../src/ddl/Constants";
import {DDLHelper, Sorting} from "../src/ddl/DDLHelper";
import {DBSchemaUpdater} from "../src/ddl/updates/DBSchemaUpdater";

export const dbOptions: IConnectionOptions = {
  username: "SYSDBA",
  password: "masterkey",
  path: resolve("./TEST.FDB")
};

jest.setTimeout(120000);

describe("DDLHelper", () => {

  const connection = Factory.FBDriver.newConnection();

  beforeAll(async () => {
    if (existsSync(dbOptions.path)) {
      unlinkSync(dbOptions.path);
    }
    await connection.createDatabase(dbOptions);
    await new DBSchemaUpdater(connection).run();
  });

  afterAll(async () => {
    await connection.dropDatabase();
  });

  it("createTable", async () => {
    await AConnection.executeTransaction({
      connection,
      callback: async (transaction) => {
        const ddlHelper = new DDLHelper(connection, transaction);
        const cachedStatements = ddlHelper.cachedStatements;

        await ddlHelper.addSequence("TEST_GENERATOR");
        expect(await cachedStatements.isSequenceExists("TEST_GENERATOR")).toBeTruthy();

        await ddlHelper.addDomain("TEST_DOMAIN", {type: "VARCHAR(200)"});
        expect(await cachedStatements.isDomainExists("TEST_DOMAIN")).toBeTruthy();

        await ddlHelper.addTable("TEST_TABLE", [
          {name: "ID", domain: "DINTKEY"},
          {name: "FIELDNAME", domain: "DFIELDNAME", notNull: true}
        ]);
        expect(await cachedStatements.isTableExists("TEST_TABLE")).toBeTruthy();

        await ddlHelper.addPrimaryKey("TEST_TABLE_PRIMARY_KEY", "TEST_TABLE", ["ID"]);
        expect(await cachedStatements.isConstraintExists("TEST_TABLE_PRIMARY_KEY")).toBeTruthy();

        await ddlHelper.addColumns("TEST_TABLE", [
          {name: "ATTRNAME", domain: "DFIELDNAME"}
        ]);
        expect(await cachedStatements.isColumnExists("TEST_TABLE", "ATTRNAME")).toBeTruthy();

        await ddlHelper.addColumns("TEST_TABLE", [
          {name: "ATTR", domain: "DFIELDNAME"}
        ]);

        await ddlHelper.addTableCheck("TEST_TABLE_CHECK", "TEST_TABLE", "ID > 0");
        expect((await cachedStatements.isTableExists("TEST_TABLE")
          || await cachedStatements.isConstraintExists("TEST_TABLE_CHECK"))).toBeTruthy();

        await ddlHelper.addAutoIncrementTrigger("TEST_TABLE_TRIGGER", "TEST_TABLE", "ID", Constants.GLOBAL_GENERATOR)
        expect(await cachedStatements.isTriggerExists("TEST_TABLE_TRIGGER")).toBeTruthy();

        await ddlHelper.createIndex("TEST_TABLE_INDEX", "TEST_TABLE", "ASC", ["FIELDNAME"]);
        expect(await cachedStatements.isIndexExists("TEST_TABLE_INDEX")).toBeTruthy();

        await ddlHelper.addTable("TEST_TABLE_2", [
          {name: "ID", domain: "DINTKEY"},
          {name: "FIELDNAME", domain: "DFIELDNAME", notNull: true},
          {name: "RELATIONS", domain: "DINTKEY"}
        ]);
        await ddlHelper.addPrimaryKey("TEST_2_PRIMARY_KEY", "TEST_TABLE_2", ["ID"]);

        await ddlHelper.addForeignKey("TEST_TABLE_2_TABLE_FOREIGN_KEY",
          {tableName: "TEST_TABLE_2", fieldName: "RELATIONS"},
          {tableName: "TEST_TABLE", fieldName: "ID"}
        );
        expect(await cachedStatements.isConstraintExists("TEST_TABLE_2_TABLE_FOREIGN_KEY")).toBeTruthy();
      }
    });

    await AConnection.executeTransaction({
      connection,
      callback: async (transaction) => {
        const ddlHelper = new DDLHelper(connection, transaction, false);
        const cachedStatements = ddlHelper.cachedStatements;

        await ddlHelper.dropSequence("TEST_GENERATOR");
        expect(await cachedStatements.isSequenceExists("TEST_GENERATOR")).toBeFalsy();

        await ddlHelper.dropColumns("TEST_TABLE", ["ATTRNAME"]);
        expect(await cachedStatements.isColumnExists("TEST_TABLE", "ATTRNAME")).toBeFalsy();

        await ddlHelper.dropConstraint("TEST_TABLE_2_TABLE_FOREIGN_KEY", "TEST_TABLE_2");
        expect(await cachedStatements.isConstraintExists("TEST_TABLE_2_TABLE_FOREIGN_KEY")).toBeFalsy();

        await ddlHelper.dropConstraint("TEST_TABLE_PRIMARY_KEY", "TEST_TABLE");
        await ddlHelper.dropConstraint("TEST_TABLE_CHECK", "TEST_TABLE");

        await ddlHelper.dropAutoIncrementTrigger("TEST_TABLE_TRIGGER");
        expect(await cachedStatements.isTriggerExists("TEST_TABLE_TRIGGER")).toBeFalsy();

        await ddlHelper.dropIndex("TEST_TABLE_INDEX");
        expect(await cachedStatements.isIndexExists("TEST_TABLE_INDEX")).toBeFalsy();

        await ddlHelper.dropDomain("TEST_DOMAIN");
        expect(await cachedStatements.isDomainExists("TEST_DOMAIN")).toBeFalsy();

        await ddlHelper.dropTable("TEST_TABLE");
        expect(await cachedStatements.isTableExists("TEST_TABLE")).toBeFalsy();
      }
    });

  });
});
