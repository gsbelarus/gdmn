import {existsSync, unlinkSync} from "fs";
import {AConnection, TExecutor} from "gdmn-db";
import {SemCategory} from "gdmn-nlp";
import {
  BlobAttribute,
  BooleanAttribute,
  DateAttribute,
  DetailAttribute,
  Entity,
  EntityAttribute,
  EnumAttribute,
  ERModel,
  FloatAttribute,
  IntegerAttribute,
  ITransaction,
  MAX_16BIT_INT,
  MAX_32BIT_INT,
  MIN_16BIT_INT,
  MIN_32BIT_INT,
  NumericAttribute,
  ParentAttribute,
  SetAttribute,
  StringAttribute,
  TimeAttribute,
  TimeStampAttribute
} from "gdmn-orm";
import moment from "moment";
import {
  Crud,
  IDelete,
  IDetailAttrValue,
  IEntityAttrValue,
  IInsert,
  IScalarAttrValue,
  ISetAttrValue,
  IUpdate,
  IUpdateOrInsert
} from "../src/crud/Crud";
import {Constants} from "../src/ddl/Constants";
import {ERBridge} from "../src/ERBridge";
import {DataSource} from "../src/source/DataSource";
import {importTestDBDetail} from "./testDB";

describe("ERBridge", () => {
  const {driver, options} = importTestDBDetail;
  const connection = driver.newConnection();
  const erBridge = new ERBridge(connection);

  const loadERModel = () => AConnection.executeTransaction({
    connection,
    callback: async (transaction) => {
      const dbStructure = await driver.readDBStructure(connection, transaction);
      return await erBridge.exportFromDatabase(dbStructure, transaction, new ERModel());
    }
  });

  const initERModel = async <R>(erModel: ERModel, callback: TExecutor<ITransaction, R>): Promise<R> => {
    await erModel.initDataSource(new DataSource(connection));
    const transaction = await erModel.startTransaction();
    try {
      return await callback(transaction);
    } finally {
      if (!transaction.finished) {
        await transaction.commit();
      }
      await erModel.initDataSource(undefined);
    }
  };

  beforeEach(async () => {
    if (existsSync(options.path)) {
      unlinkSync(options.path);
    }
    await connection.createDatabase(options);
  });

  afterEach(async () => {
    await connection.dropDatabase();
  });

  it("Insert", async () => {
    const erModel = new ERModel();
    await initERModel(erModel, async (transaction) => {

      const appEntity = await erModel.create(new Entity({
        name: "APPLICATION", lName: {ru: {name: "Приложение"}}
      }), transaction);

      await appEntity.create(new StringAttribute({
        name: "UID", lName: {ru: {name: "Идентификатор приложения"}}, required: true, minLength: 1, maxLength: 36
      }), transaction);

      await appEntity.addAttrUnique([appEntity.attribute("UID")], transaction);

      const backupEntity = await erModel.create(new Entity({
        name: "APPLICATION_BACKUPS", lName: {ru: {name: "Бэкап"}}
      }), transaction);
      await backupEntity.create(new StringAttribute({
        name: "UID", lName: {ru: {name: "Идентификатор бэкапа"}}, required: true, minLength: 1, maxLength: 36
      }), transaction);
      await backupEntity.addAttrUnique([backupEntity.attribute("UID")], transaction);
      await backupEntity.create(new EntityAttribute({
        name: "APP", lName: {ru: {name: " "}}, required: true, entities: [appEntity]
      }), transaction);
      await backupEntity.create(new StringAttribute({
        name: "ALIAS", lName: {ru: {name: "Название бэкапа"}}, required: true, minLength: 1, maxLength: 120
      }), transaction);

      const placeEntity = await erModel.create(new Entity({name: "PLACE", lName: {ru: {name: "Место"}}}));
      await placeEntity.create(new StringAttribute({
        name: "ADDRESS", lName: {ru: {name: "Адрес"}}, required: true, minLength: 1, maxLength: 100
      }), transaction);

      const userEntity = await erModel.create(new Entity({
        name: "APP_USER", lName: {ru: {name: "Пользователь"}}
      }), transaction);
      await userEntity.create(new StringAttribute({
        name: "LOGIN", lName: {ru: {name: "Логин"}}, required: true, minLength: 1,
        maxLength: 32
      }), transaction);
      const appSet = new SetAttribute({
        name: "APPLICATIONS", lName: {ru: {name: "Приложения"}}, entities: [appEntity],
        adapter: {crossRelation: "APP_USER_APPLICATIONS"}
      });
      appSet.add(new StringAttribute({
        name: "ALIAS", lName: {ru: {name: "Название приложения"}}, required: true, minLength: 1, maxLength: 120
      }));
      await userEntity.create(appSet, transaction);

      await userEntity.create(new EntityAttribute({
        name: "PLACE", lName: {}, entities: [placeEntity]
      }), transaction);
      await userEntity.create(new DetailAttribute({
        name: "DETAIL_PLACE", lName: {ru: {name: "Детальное место"}},
        required: false, entities: [placeEntity],
        adapter: {
          masterLinks: [{
            detailRelation: placeEntity.name,
            link2masterField: Constants.DEFAULT_MASTER_KEY_NAME
          }]
        }
      }), transaction);
    });


    const appEntity = erModel.entity("APPLICATION");

    const appUIDValue1: IScalarAttrValue = {
      attribute: appEntity.attribute("UID"),
      value: "uid1"
    };
    const app1: IInsert = {
      entity: appEntity,
      attrsValues: [appUIDValue1]
    };

    const appUIDValue2: IScalarAttrValue = {
      attribute: appEntity.attribute("UID"),
      value: "uid2"
    };
    const app2: IInsert = {
      entity: appEntity,
      attrsValues: [appUIDValue2]
    };

    const appUIDValue3: IScalarAttrValue = {
      attribute: appEntity.attribute("UID"),
      value: "uid3"
    };
    const app3: IInsert = {
      entity: appEntity,
      attrsValues: [appUIDValue3]
    };

    const appUIDValue4: IScalarAttrValue = {
      attribute: appEntity.attribute("UID"),
      value: "uid4"
    };
    const app4: IInsert = {
      entity: appEntity,
      attrsValues: [appUIDValue4]
    };

    const appUIDValue5: IScalarAttrValue = {
      attribute: appEntity.attribute("UID"),
      value: "uid5"
    };
    const app5: IInsert = {
      entity: appEntity,
      attrsValues: [appUIDValue5]
    };

    const apps = [app1, app2, app3, app4, app5];
    const appIDs = await Crud.executeInsert(connection, apps);


    const backupEntity = erModel.entity("APPLICATION_BACKUPS");

    const appIDValue1: IEntityAttrValue = {
      attribute: backupEntity.attribute("APP") as EntityAttribute,
      values: [appIDs[0]]
    };
    const backupUIDValue1: IScalarAttrValue = {
      attribute: backupEntity.attribute("UID"),
      value: "uid1"
    };
    const backupAliasValue1: IScalarAttrValue = {
      attribute: backupEntity.attribute("ALIAS"),
      value: "alias1"
    };
    const insertBackup1: IInsert = {
      entity: backupEntity,
      attrsValues: [appIDValue1, backupUIDValue1, backupAliasValue1]
    };
    const appIDValue2: IEntityAttrValue = {
      attribute: backupEntity.attribute("APP") as EntityAttribute,
      values: [appIDs[1]]
    };
    const backupUIDValue2: IScalarAttrValue = {
      attribute: backupEntity.attribute("UID"),
      value: "uid2"
    };
    const backupAliasValue2: IScalarAttrValue = {
      attribute: backupEntity.attribute("ALIAS"),
      value: "alias2"
    };
    const insertBackup2: IInsert = {
      entity: backupEntity,
      attrsValues: [appIDValue2, backupUIDValue2, backupAliasValue2]
    };
    const appIDValue3: IEntityAttrValue = {
      attribute: backupEntity.attribute("APP") as EntityAttribute,
      values: [appIDs[2]]
    };
    const backupUIDValue3: IScalarAttrValue = {
      attribute: backupEntity.attribute("UID"),
      value: "uid3"
    };
    const backupAliasValue3: IScalarAttrValue = {
      attribute: backupEntity.attribute("ALIAS"),
      value: "alias3"
    };
    const insertBackup3: IInsert = {
      entity: backupEntity,
      attrsValues: [appIDValue3, backupUIDValue3, backupAliasValue3]
    };

    const backups = [insertBackup1, insertBackup2, insertBackup3];
    const backupsIDs = await Crud.executeInsert(connection, backups);


    const placeEntity = erModel.entity("PLACE");

    const placeAddressValue1: IScalarAttrValue = {
      attribute: placeEntity.attribute("ADDRESS"),
      value: "address1"
    };
    const placeInsert1: IInsert = {
      entity: placeEntity,
      attrsValues: [placeAddressValue1]
    };

    const placeAddressValue2: IScalarAttrValue = {
      attribute: placeEntity.attribute("ADDRESS"),
      value: "address2"
    };
    const placeInsert2: IInsert = {
      entity: placeEntity,
      attrsValues: [placeAddressValue2]
    };

    const placeAddressValue3: IScalarAttrValue = {
      attribute: placeEntity.attribute("ADDRESS"),
      value: "address3"
    };
    const placeInsert3: IInsert = {
      entity: placeEntity,
      attrsValues: [placeAddressValue3]
    };

    const placeAddressValue4: IScalarAttrValue = {
      attribute: placeEntity.attribute("ADDRESS"),
      value: "address4"
    };
    const placeInsert4: IInsert = {
      entity: placeEntity,
      attrsValues: [placeAddressValue4]
    };

    const placeAddressValue5: IScalarAttrValue = {
      attribute: placeEntity.attribute("ADDRESS"),
      value: "address5"
    };
    const placeInsert5: IInsert = {
      entity: placeEntity,
      attrsValues: [placeAddressValue5]
    };

    const places = [placeInsert1, placeInsert2, placeInsert3, placeInsert4, placeInsert5];
    const placesIDs = await Crud.executeInsert(connection, places);


    const userEntity = erModel.entity("APP_USER");
    const appSetAttribute: SetAttribute = userEntity.attribute("APPLICATIONS") as SetAttribute;


    const appAliasValue1: IScalarAttrValue = {
      attribute: appSetAttribute.attribute("ALIAS"),
      value: "alias1"
    };
    const appAliasValue2: IScalarAttrValue = {
      attribute: appSetAttribute.attribute("ALIAS"),
      value: "alias2"
    };
    const appAliasValue3: IScalarAttrValue = {
      attribute: appSetAttribute.attribute("ALIAS"),
      value: "alias3"
    };
    const userAppSetAttrValue1: ISetAttrValue = {
      attribute: appSetAttribute,
      crossValues: [[appAliasValue1], [appAliasValue2], [appAliasValue3]],
      refIDs: [appIDs[0], appIDs[1], appIDs[2]]
    };

    const userLoginAttrValue1: IScalarAttrValue = {
      attribute: userEntity.attribute("LOGIN"),
      value: "login1"
    };

    const userPlaceDetailAttrValue1: IDetailAttrValue = {
      attribute: userEntity.attribute("DETAIL_PLACE") as DetailAttribute,
      pks: [[placesIDs[0]], [placesIDs[1]]]
    };

    const userInsert1: IInsert = {
      entity: userEntity,
      attrsValues: [userLoginAttrValue1, userAppSetAttrValue1, userPlaceDetailAttrValue1]
    };


    const appAliasValue4: IScalarAttrValue = {
      attribute: appSetAttribute.attribute("ALIAS"),
      value: "alias4"
    };
    const appAliasValue5: IScalarAttrValue = {
      attribute: appSetAttribute.attribute("ALIAS"),
      value: "alias5"
    };
    const userAppSetAttrValue2 = {
      attribute: appSetAttribute,
      crossValues: [[appAliasValue4], [appAliasValue5]],
      refIDs: [appIDs[3], appIDs[4]]
    };

    const userLoginAttrValue2: IScalarAttrValue = {
      attribute: userEntity.attribute("LOGIN"),
      value: "login2"
    };

    const userPlaceDetailAttrValue2: IDetailAttrValue = {
      attribute: userEntity.attribute("DETAIL_PLACE") as DetailAttribute,
      pks: [[placesIDs[2]], [placesIDs[3]], [placesIDs[4]]]
    };

    const userInsert2: IInsert = {
      entity: userEntity,
      attrsValues: [userLoginAttrValue2, userAppSetAttrValue2, userPlaceDetailAttrValue2]
    };

    const users = [userInsert1, userInsert2];
    const usersIDs = await Crud.executeInsert(connection, users);

    await AConnection.executeTransaction({
      connection,
      callback: async (transaction) => {

        const appsSQL = `SELECT * FROM ${appEntity.name} WHERE
            ID = :appID1 OR ID = :appID2 OR ID = :appID3 OR ID = :appID4 OR ID = :appID5`;

        const appsIDParams = {
          appID1: appIDs[0],
          appID2: appIDs[1],
          appID3: appIDs[2],
          appID4: appIDs[3],
          appID5: appIDs[4]
        };

        const appsResult = await connection.executeQuery(
          transaction,
          appsSQL,
          appsIDParams
        );

        await appsResult.next();
        const insertedAppUID1 = appsResult.getString("UID");
        const [expectedAppUID1] = apps[0].attrsValues as IScalarAttrValue[];
        expect(insertedAppUID1).toEqual(expectedAppUID1.value);

        await appsResult.next();
        const insertedAppUID2 = appsResult.getString("UID");
        const [expectedAppUID2] = apps[1].attrsValues as IScalarAttrValue[];
        expect(insertedAppUID2).toEqual(expectedAppUID2.value);

        await appsResult.next();
        const insertedAppUID3 = appsResult.getString("UID");
        const [expectedAppUID3] = apps[2].attrsValues as IScalarAttrValue[];
        expect(insertedAppUID3).toEqual(expectedAppUID3.value);

        await appsResult.next();
        const insertedAppUID4 = appsResult.getString("UID");
        const [expectedAppUID4] = apps[3].attrsValues as IScalarAttrValue[];
        expect(insertedAppUID4).toEqual(expectedAppUID4.value);

        await appsResult.next();
        const insertedAppUID5 = appsResult.getString("UID");
        const [expectedAppUID5] = apps[4].attrsValues as IScalarAttrValue[];
        expect(insertedAppUID5).toEqual(expectedAppUID5.value);

        await appsResult.close();

        const backupsSQL = `SELECT * FROM ${backupEntity.name} WHERE
            ID = :backupID1 OR ID = :backupID2 OR ID = :backupID3`;
        const backupsIDParams = {
          backupID1: backupsIDs[0],
          backupID2: backupsIDs[1],
          backupID3: backupsIDs[2]
        };

        const backupsResult = await connection.executeQuery(
          transaction,
          backupsSQL,
          backupsIDParams
        );

        for (const i in backupsIDs) {
          await backupsResult.next();
          const insertedAppID = backupsResult.getNumber("APP");
          const insertedUID = backupsResult.getString("UID");
          const insertedAlias = backupsResult.getString("ALIAS");
          const expectedAppID = backups[i].attrsValues[0] as IEntityAttrValue;

          const [, expectedBackupUID, expectedBackupAlias] = backups[i].attrsValues as IScalarAttrValue[];

          expect(insertedAppID).toEqual(expectedAppID.values[0]);
          expect(insertedUID).toEqual(expectedBackupUID.value);
          expect(insertedAlias).toEqual(expectedBackupAlias.value);
        }

        await backupsResult.close();

        const placesSQL = `SELECT * FROM ${placeEntity.name} WHERE
            ID = :placeID1 OR ID = :placeID2 OR ID = :placeID3 OR ID = :placeID4 OR ID = :placeID5`;
        const placesIDParams = {
          placeID1: placesIDs[0],
          placeID2: placesIDs[1],
          placeID3: placesIDs[2],
          placeID4: placesIDs[3],
          placeID5: placesIDs[4]
        };

        const placesResult = await connection.executeQuery(
          transaction,
          placesSQL,
          placesIDParams
        );

        for (const i in placesIDs) {
          await placesResult.next();
          const insertedAddress = placesResult.getString("ADDRESS");
          const masterkey = placesResult.getNumber(Constants.DEFAULT_MASTER_KEY_NAME);
          const expectedAddress = places[i].attrsValues[0] as IScalarAttrValue;
          expect(insertedAddress).toEqual(expectedAddress.value);
          if (Number(i) < 2) {
            expect(masterkey).toEqual(usersIDs[0]);
          }
          if (Number(i) >= 2) {
            expect(masterkey).toEqual(usersIDs[1]);
          }
        }

        await placesResult.close();

        const userAppSetSQL = `SELECT * FROM ${appSetAttribute.adapter!.crossRelation}`;
        const userAppSetResult = await connection.executeQuery(transaction, userAppSetSQL);

        const [expectedAppID1, expectedAppID2, expectedAppID3] = userAppSetAttrValue1.refIDs;
        const [[expectedAlias1], [expectedAlias2], [expectedAlias3]] = userAppSetAttrValue1.crossValues;

        await userAppSetResult.next();
        const userID1 = userAppSetResult.getNumber(Constants.DEFAULT_CROSS_PK_OWN_NAME);
        const appID1 = userAppSetResult.getNumber(Constants.DEFAULT_CROSS_PK_REF_NAME);
        const alias1 = userAppSetResult.getString("ALIAS");
        expect(userID1).toBe(usersIDs[0]);
        expect(appID1).toBe(expectedAppID1);
        expect(alias1).toBe(expectedAlias1.value);

        await userAppSetResult.next();
        const userID2 = userAppSetResult.getNumber(Constants.DEFAULT_CROSS_PK_OWN_NAME);
        const appID2 = userAppSetResult.getNumber(Constants.DEFAULT_CROSS_PK_REF_NAME);
        const alias2 = userAppSetResult.getString("ALIAS");
        expect(userID2).toBe(usersIDs[0]);
        expect(appID2).toBe(expectedAppID2);
        expect(alias2).toBe(expectedAlias2.value);

        await userAppSetResult.next();
        const userID3 = userAppSetResult.getNumber(Constants.DEFAULT_CROSS_PK_OWN_NAME);
        const appID3 = userAppSetResult.getNumber(Constants.DEFAULT_CROSS_PK_REF_NAME);
        const alias3 = userAppSetResult.getString("ALIAS");
        expect(userID3).toBe(usersIDs[0]);
        expect(appID3).toBe(expectedAppID3);
        expect(alias3).toBe(expectedAlias3.value);

        const [expectedAppID4, expectedAppID5] = userAppSetAttrValue2.refIDs;
        const [[expectedAlias4], [expectedAlias5]] = userAppSetAttrValue2.crossValues;

        await userAppSetResult.next();
        const userID4 = userAppSetResult.getNumber(Constants.DEFAULT_CROSS_PK_OWN_NAME);
        const appID4 = userAppSetResult.getNumber(Constants.DEFAULT_CROSS_PK_REF_NAME);
        const alias4 = userAppSetResult.getString("ALIAS");
        expect(userID4).toBe(usersIDs[1]);
        expect(appID4).toBe(expectedAppID4);
        expect(alias4).toBe(expectedAlias4.value);

        await userAppSetResult.next();
        const userID5 = userAppSetResult.getNumber(Constants.DEFAULT_CROSS_PK_OWN_NAME);
        const appID5 = userAppSetResult.getNumber(Constants.DEFAULT_CROSS_PK_REF_NAME);
        const alias5 = userAppSetResult.getString("ALIAS");
        expect(userID5).toBe(usersIDs[1]);
        expect(appID5).toBe(expectedAppID5);
        expect(alias5).toBe(expectedAlias5.value);

        await userAppSetResult.close();

        const usersSQL = `SELECT * FROM ${userEntity.name}`;
        const usersResult = await connection.executeQuery(transaction, usersSQL);

        await usersResult.next();
        const loginAttrValue1 = userInsert1.attrsValues[0] as IScalarAttrValue;
        const expectedLogin1 = loginAttrValue1.value;
        const login1 = usersResult.getString("LOGIN");
        expect(login1).toBe(expectedLogin1);

        await usersResult.next();
        const loginAttrValue2 = userInsert2.attrsValues[0] as IScalarAttrValue;
        const expectedLogin2 = loginAttrValue2.value;
        const login2 = usersResult.getString("LOGIN");
        expect(login2).toBe(expectedLogin2);

        await usersResult.close();
      }
    });

  });

  it("Update", async () => {
    const erModel = new ERModel();
    await initERModel(erModel, async (transaction) => {

      const appEntity = await erModel.create(new Entity({
        name: "APPLICATION", lName: {ru: {name: "Приложение"}}
      }), transaction);

      await appEntity.create(new StringAttribute({
        name: "UID", lName: {ru: {name: "Идентификатор приложения"}}, required: true, minLength: 1, maxLength: 36
      }), transaction);

      await appEntity.addAttrUnique([appEntity.attribute("UID")], transaction);

      const backupEntity = await erModel.create(new Entity({
        name: "APPLICATION_BACKUPS", lName: {ru: {name: "Бэкап"}}
      }), transaction);
      await backupEntity.create(new StringAttribute({
        name: "UID", lName: {ru: {name: "Идентификатор бэкапа"}}, required: true, minLength: 1, maxLength: 36
      }), transaction);
      await backupEntity.addAttrUnique([backupEntity.attribute("UID")], transaction);
      await backupEntity.create(new EntityAttribute({
        name: "APP", lName: {ru: {name: " "}}, required: true, entities: [appEntity]
      }), transaction);
      await backupEntity.create(new StringAttribute({
        name: "ALIAS", lName: {ru: {name: "Название бэкапа"}}, required: true, minLength: 1, maxLength: 120
      }), transaction);

      const placeEntity = await erModel.create(new Entity({name: "PLACE", lName: {ru: {name: "Место"}}}), transaction);
      await placeEntity.create(new StringAttribute({
        name: "ADDRESS", lName: {ru: {name: "Адрес"}}, required: true, minLength: 1, maxLength: 100
      }), transaction);

      const userEntity = await erModel.create(new Entity({
        name: "APP_USER", lName: {ru: {name: "Пользователь"}}
      }), transaction);
      await userEntity.create(new StringAttribute({
        name: "LOGIN", lName: {ru: {name: "Логин"}}, required: true, minLength: 1,
        maxLength: 32
      }), transaction);
      const appSet = new SetAttribute({
        name: "APPLICATIONS", lName: {ru: {name: "Приложения"}}, entities: [appEntity],
        adapter: {crossRelation: "APP_USER_APPLICATIONS"}
      });
      appSet.add(new StringAttribute({
        name: "ALIAS", lName: {ru: {name: "Название приложения"}}, required: true, minLength: 1, maxLength: 120
      }));
      await userEntity.create(appSet, transaction);

      await userEntity.create(new EntityAttribute({
        name: "PLACE", lName: {}, entities: [placeEntity]
      }), transaction);
      await userEntity.create(new DetailAttribute({
        name: "DETAIL_PLACE", lName: {ru: {name: "Детальное место"}},
        required: false, entities: [placeEntity],
        adapter: {
          masterLinks: [{
            detailRelation: placeEntity.name,
            link2masterField: Constants.DEFAULT_MASTER_KEY_NAME
          }]
        }
      }), transaction);
    });


    const appEntity = erModel.entity("APPLICATION");

    const appUIDValue1: IScalarAttrValue = {
      attribute: appEntity.attribute("UID"),
      value: "uid1"
    };
    const app1: IInsert = {
      entity: appEntity,
      attrsValues: [appUIDValue1]
    };

    const appUIDValue2: IScalarAttrValue = {
      attribute: appEntity.attribute("UID"),
      value: "uid2"
    };
    const app2: IInsert = {
      entity: appEntity,
      attrsValues: [appUIDValue2]
    };

    const appUIDValue3: IScalarAttrValue = {
      attribute: appEntity.attribute("UID"),
      value: "uid3"
    };
    const app3: IInsert = {
      entity: appEntity,
      attrsValues: [appUIDValue3]
    };

    const apps = [app1, app2, app3];
    const appIDs = await Crud.executeInsert(connection, apps);

    const backupEntity = erModel.entity("APPLICATION_BACKUPS");

    const appIDValue1: IEntityAttrValue = {
      attribute: backupEntity.attribute("APP") as EntityAttribute,
      values: [appIDs[0]]
    };
    const backupUIDValue1: IScalarAttrValue = {
      attribute: backupEntity.attribute("UID"),
      value: "uid1"
    };
    const backupAliasValue1: IScalarAttrValue = {
      attribute: backupEntity.attribute("ALIAS"),
      value: "alias1"
    };
    const insertBackup1: IInsert = {
      entity: backupEntity,
      attrsValues: [appIDValue1, backupUIDValue1, backupAliasValue1]
    };
    const appIDValue2: IEntityAttrValue = {
      attribute: backupEntity.attribute("APP") as EntityAttribute,
      values: [appIDs[1]]
    };
    const backupUIDValue2: IScalarAttrValue = {
      attribute: backupEntity.attribute("UID"),
      value: "uid2"
    };
    const backupAliasValue2: IScalarAttrValue = {
      attribute: backupEntity.attribute("ALIAS"),
      value: "alias2"
    };
    const insertBackup2: IInsert = {
      entity: backupEntity,
      attrsValues: [appIDValue2, backupUIDValue2, backupAliasValue2]
    };

    const backups = [insertBackup1, insertBackup2];
    const backupsIDs = await Crud.executeInsert(connection, backups);

    const updBackupUIDValue1: IScalarAttrValue = {
      attribute: backupEntity.attribute("UID"),
      value: "newuid1"
    };
    const updateBackup1: IUpdate = {
      pk: [backupsIDs[0]],
      entity: backupEntity,
      attrsValues: [updBackupUIDValue1]
    };
    const updBackupAliasValue2: IScalarAttrValue = {
      attribute: backupEntity.attribute("ALIAS"),
      value: "newalias2"
    };
    const updateBackup2: IUpdate = {
      pk: [backupsIDs[1]],
      entity: backupEntity,
      attrsValues: [updBackupAliasValue2]
    };

    const updateBackups = [updateBackup1, updateBackup2];
    await Crud.executeUpdate(connection, updateBackups);


    const placeEntity = erModel.entity("PLACE");

    const placeAddressValue1: IScalarAttrValue = {
      attribute: placeEntity.attribute("ADDRESS"),
      value: "address1"
    };
    const placeInsert1: IUpdateOrInsert = {
      entity: placeEntity,
      attrsValues: [placeAddressValue1]
    };

    const placeAddressValue2: IScalarAttrValue = {
      attribute: placeEntity.attribute("ADDRESS"),
      value: "address2"
    };
    const placeInsert2: IUpdateOrInsert = {
      entity: placeEntity,
      attrsValues: [placeAddressValue2]
    };

    const placeAddressValue3: IScalarAttrValue = {
      attribute: placeEntity.attribute("ADDRESS"),
      value: "address3"
    };
    const placeInsert3: IInsert = {
      entity: placeEntity,
      attrsValues: [placeAddressValue3]
    };

    const places = [placeInsert1, placeInsert2, placeInsert3];
    const placesIDs = await Crud.executeUpdateOrInsert(connection, places);

    const userEntity = erModel.entity("APP_USER");
    const appSetAttribute: SetAttribute = userEntity.attribute("APPLICATIONS") as SetAttribute;

    const appAliasValue1: IScalarAttrValue = {
      attribute: appSetAttribute.attribute("ALIAS"),
      value: "alias1"
    };
    // const appAliasValue2: IScalarAttrValue = {
    //   attribute: appSetAttribute.attribute("ALIAS"),
    //   value: "alias2"
    // };
    const userAppSetAttrValue: ISetAttrValue = {
      attribute: appSetAttribute,
      crossValues: [[appAliasValue1]],
      refIDs: [appIDs[0]]
    };
    const userLoginAttrValue: IScalarAttrValue = {
      attribute: userEntity.attribute("LOGIN"),
      value: "login1"
    };

    const userPlaceDetailAttrValue: IDetailAttrValue = {
      attribute: userEntity.attribute("DETAIL_PLACE") as DetailAttribute,
      pks: [[placesIDs[0]]]
    };

    const user: IUpdateOrInsert = {
      entity: userEntity,
      attrsValues: [userLoginAttrValue, userAppSetAttrValue, userPlaceDetailAttrValue]
    };

    const usersIDs = await Crud.executeInsert(connection, [user]);

    const updUserPlaceDetailAttrValue: IDetailAttrValue = {
      attribute: userEntity.attribute("DETAIL_PLACE") as DetailAttribute,
      pks: [[placesIDs[1]]]
    };

    const updUserAppSetAttrValue: ISetAttrValue = {
      attribute: appSetAttribute,
      crossValues: [[appAliasValue1]],
      currRefIDs: [appIDs[0]],
      refIDs: [appIDs[2]]
    };

    const updUser: IUpdate = {
      pk: [usersIDs[0]],
      entity: userEntity,
      attrsValues: [updUserPlaceDetailAttrValue, updUserAppSetAttrValue]
    };

    await Crud.executeUpdate(connection, [updUser]);

    await AConnection.executeTransaction({
      connection,
      callback: async (transaction) => {

        const backupsSQL = `SELECT * FROM ${backupEntity.name} WHERE
  ID = :backupID1 OR ID = :backupID2`;

        const backupsIDParams = {
          backupID1: backupsIDs[0],
          backupID2: backupsIDs[1]
        };

        const backupsResult = await connection.executeQuery(
          transaction,
          backupsSQL,
          backupsIDParams
        );

        await backupsResult.next();
        const appID1 = backupsResult.getNumber("APP");
        const updatedUID1 = backupsResult.getString("UID");
        const alias1 = backupsResult.getString("ALIAS");

        const expectedAppID1 = (backups[0].attrsValues[0] as IEntityAttrValue).values[0];
        const expectedUID1 = (updateBackups[0].attrsValues[0] as IScalarAttrValue).value;
        const expectedAlias1 = (backups[0].attrsValues[2] as IScalarAttrValue).value;
        expect(appID1).toEqual(expectedAppID1);
        expect(updatedUID1).toEqual(expectedUID1);
        expect(alias1).toEqual(expectedAlias1);

        await backupsResult.next();
        const appID2 = backupsResult.getNumber("APP");
        const uid2 = backupsResult.getString("UID");
        const updatedAlias2 = backupsResult.getString("ALIAS");

        const expectedAppID2 = (backups[1].attrsValues[0] as IEntityAttrValue).values[0];
        const expectedUID2 = (backups[1].attrsValues[1] as IScalarAttrValue).value;
        const expectedAlias2 = (updateBackups[1].attrsValues[0] as IScalarAttrValue).value;
        expect(appID2).toEqual(expectedAppID2);
        expect(uid2).toEqual(expectedUID2);
        expect(updatedAlias2).toEqual(expectedAlias2);

        await backupsResult.close();

        const userAppSetSQL = `SELECT * FROM ${appSetAttribute.adapter!.crossRelation}`;
        const userAppSetResult = await connection.executeQuery(transaction, userAppSetSQL);

        await userAppSetResult.next();
        const userID1 = userAppSetResult.getNumber(Constants.DEFAULT_CROSS_PK_OWN_NAME);
        const crossAppID1 = userAppSetResult.getNumber(Constants.DEFAULT_CROSS_PK_REF_NAME);
        const crossAlias1 = userAppSetResult.getString("ALIAS");
        expect(userID1).toBe(usersIDs[0]);
        expect(crossAppID1).toBe(appIDs[2]);
        expect(crossAlias1).toBe(appAliasValue1.value);

        await userAppSetResult.close();


        const placesSQL = `SELECT * FROM ${placeEntity.name} WHERE
  ID = :placeID1 OR ID = :placeID2`;
        const placesIDParams = {
          placeID1: placesIDs[0],
          placeID2: placesIDs[1]
        };

        const placesResult = await connection.executeQuery(
          transaction,
          placesSQL,
          placesIDParams
        );

        await placesResult.next();
        const address1 = placesResult.getString("ADDRESS");
        const expectedAddress1 = places[0].attrsValues[0] as IScalarAttrValue;
        expect(address1).toEqual(expectedAddress1.value);
        const masterKey1 = placesResult.getNumber(Constants.DEFAULT_MASTER_KEY_NAME);
        const expectedMasterKey1 = usersIDs[0];
        expect(masterKey1).toEqual(expectedMasterKey1);

        await placesResult.next();
        const address2 = placesResult.getString("ADDRESS");
        const expectedAddress2 = places[1].attrsValues[0] as IScalarAttrValue;
        expect(address2).toEqual(expectedAddress2.value);
        placesResult.getNumber(Constants.DEFAULT_MASTER_KEY_NAME);
        const expectedMasterKey2 = usersIDs[0];
        expect(masterKey1).toEqual(expectedMasterKey2);

        await placesResult.close();
      }
    });

  });

  it("UpdateOrInsert", async () => {
    const erModel = new ERModel();
    await initERModel(erModel, async (transaction) => {

      const appEntity = await erModel.create(new Entity({
        name: "APPLICATION", lName: {ru: {name: "Приложение"}}
      }), transaction);

      await appEntity.create(new StringAttribute({
        name: "UID", lName: {ru: {name: "Идентификатор приложения"}}, required: true, minLength: 1, maxLength: 36
      }), transaction);

      await appEntity.addAttrUnique([appEntity.attribute("UID")], transaction);

      const backupEntity = await erModel.create(new Entity({
        name: "APPLICATION_BACKUPS", lName: {ru: {name: "Бэкап"}}
      }), transaction);
      await backupEntity.create(new StringAttribute({
        name: "UID", lName: {ru: {name: "Идентификатор бэкапа"}}, required: true, minLength: 1, maxLength: 36
      }), transaction);
      await backupEntity.addAttrUnique([backupEntity.attribute("UID")], transaction);
      await backupEntity.create(new EntityAttribute({
        name: "APP", lName: {ru: {name: " "}}, required: true, entities: [appEntity]
      }), transaction);
      await backupEntity.create(new StringAttribute({
        name: "ALIAS", lName: {ru: {name: "Название бэкапа"}}, required: true, minLength: 1, maxLength: 120
      }), transaction);

      const placeEntity = await erModel.create(new Entity({name: "PLACE", lName: {ru: {name: "Место"}}}), transaction);
      await placeEntity.create(new StringAttribute({
        name: "ADDRESS", lName: {ru: {name: "Адрес"}}, required: true, minLength: 1, maxLength: 100
      }), transaction);

      const userEntity = await erModel.create(new Entity({
        name: "APP_USER", lName: {ru: {name: "Пользователь"}}
      }), transaction);
      await userEntity.create(new StringAttribute({
        name: "LOGIN", lName: {ru: {name: "Логин"}}, required: true, minLength: 1,
        maxLength: 32
      }), transaction);
      const appSet = new SetAttribute({
        name: "APPLICATIONS", lName: {ru: {name: "Приложения"}}, entities: [appEntity],
        adapter: {crossRelation: "APP_USER_APPLICATIONS"}
      });
      appSet.add(new StringAttribute({
        name: "ALIAS", lName: {ru: {name: "Название приложения"}}, required: true, minLength: 1, maxLength: 120
      }));
      await userEntity.create(appSet, transaction);

      await userEntity.create(new EntityAttribute({
        name: "PLACE", lName: {}, entities: [placeEntity]
      }), transaction);
      await userEntity.create(new DetailAttribute({
        name: "DETAIL_PLACE", lName: {ru: {name: "Детальное место"}},
        required: false, entities: [placeEntity],
        adapter: {
          masterLinks: [{
            detailRelation: placeEntity.name,
            link2masterField: Constants.DEFAULT_MASTER_KEY_NAME
          }]
        }
      }), transaction);
    });

    const appEntity = erModel.entity("APPLICATION");

    const appUIDValue1: IScalarAttrValue = {
      attribute: appEntity.attribute("UID"),
      value: "uid1"
    };
    const app1: IInsert = {
      entity: appEntity,
      attrsValues: [appUIDValue1]
    };

    const appUIDValue2: IScalarAttrValue = {
      attribute: appEntity.attribute("UID"),
      value: "uid2"
    };
    const app2: IInsert = {
      entity: appEntity,
      attrsValues: [appUIDValue2]
    };

    const appUIDValue3: IScalarAttrValue = {
      attribute: appEntity.attribute("UID"),
      value: "uid3"
    };
    const app3: IInsert = {
      entity: appEntity,
      attrsValues: [appUIDValue3]
    };

    const apps = [app1, app2, app3];
    const appIDs = await Crud.executeInsert(connection, apps);

    const backupEntity = erModel.entity("APPLICATION_BACKUPS");

    const appIDValue1: IEntityAttrValue = {
      attribute: backupEntity.attribute("APP") as EntityAttribute,
      values: [appIDs[0]]
    };
    const backupUIDValue1: IScalarAttrValue = {
      attribute: backupEntity.attribute("UID"),
      value: "uid1"
    };
    const backupAliasValue1: IScalarAttrValue = {
      attribute: backupEntity.attribute("ALIAS"),
      value: "alias1"
    };
    const insertBackup1: IInsert = {
      entity: backupEntity,
      attrsValues: [appIDValue1, backupUIDValue1, backupAliasValue1]
    };
    const appIDValue2: IEntityAttrValue = {
      attribute: backupEntity.attribute("APP") as EntityAttribute,
      values: [appIDs[1]]
    };
    const backupUIDValue2: IScalarAttrValue = {
      attribute: backupEntity.attribute("UID"),
      value: "uid2"
    };
    const backupAliasValue2: IScalarAttrValue = {
      attribute: backupEntity.attribute("ALIAS"),
      value: "alias2"
    };
    const insertBackup2: IInsert = {
      entity: backupEntity,
      attrsValues: [appIDValue2, backupUIDValue2, backupAliasValue2]
    };

    const backups = [insertBackup1, insertBackup2];
    const backupsIDs = await Crud.executeInsert(connection, backups);

    const updBackupUIDValue1: IScalarAttrValue = {
      attribute: backupEntity.attribute("UID"),
      value: "newuid1"
    };
    const updateOrInsertBackup1: IUpdateOrInsert = {
      pk: [backupsIDs[0]],
      entity: backupEntity,
      attrsValues: [updBackupUIDValue1]
    };
    const updBackupAliasValue2: IScalarAttrValue = {
      attribute: backupEntity.attribute("ALIAS"),
      value: "newalias2"
    };
    const updateOrInsertBackup2: IUpdateOrInsert = {
      pk: [backupsIDs[1]],
      entity: backupEntity,
      attrsValues: [updBackupAliasValue2]
    };

    const updateOrInsertBackups = [updateOrInsertBackup1, updateOrInsertBackup2];
    await Crud.executeUpdateOrInsert(connection, updateOrInsertBackups);

    const placeEntity = erModel.entity("PLACE");

    const placeAddressValue1: IScalarAttrValue = {
      attribute: placeEntity.attribute("ADDRESS"),
      value: "address1"
    };
    const placeInsert1: IUpdateOrInsert = {
      entity: placeEntity,
      attrsValues: [placeAddressValue1]
    };

    const placeAddressValue2: IScalarAttrValue = {
      attribute: placeEntity.attribute("ADDRESS"),
      value: "address2"
    };
    const placeInsert2: IUpdateOrInsert = {
      entity: placeEntity,
      attrsValues: [placeAddressValue2]
    };

    const places = [placeInsert1, placeInsert2];
    const placesIDs = await Crud.executeUpdateOrInsert(connection, places);

    const updPlaceAddressValue1: IScalarAttrValue = {
      attribute: placeEntity.attribute("ADDRESS"),
      value: "newaddress1"
    };
    const placeUpd1: IUpdateOrInsert = {
      pk: [placesIDs[0]],
      entity: placeEntity,
      attrsValues: [updPlaceAddressValue1]
    };
    const updPlaceAddressValue2: IScalarAttrValue = {
      attribute: placeEntity.attribute("ADDRESS"),
      value: "newaddress2"
    };
    const placeUpd2: IUpdateOrInsert = {
      pk: [placesIDs[1]],
      entity: placeEntity,
      attrsValues: [updPlaceAddressValue2]
    };

    const updateOrInsertPlaces = [placeUpd1, placeUpd2];
    await Crud.executeUpdateOrInsert(connection, updateOrInsertPlaces);

    const userEntity = erModel.entity("APP_USER");
    const appSetAttribute: SetAttribute = userEntity.attribute("APPLICATIONS") as SetAttribute;

    const appAliasValue1: IScalarAttrValue = {
      attribute: appSetAttribute.attribute("ALIAS"),
      value: "alias1"
    };
    const appAliasValue2: IScalarAttrValue = {
      attribute: appSetAttribute.attribute("ALIAS"),
      value: "alias2"
    };
    const userAppSetAttrValue1: ISetAttrValue = {
      attribute: appSetAttribute,
      crossValues: [[appAliasValue1], [appAliasValue2]],
      refIDs: [appIDs[0], appIDs[1]]
    };
    const userLoginAttrValue1: IScalarAttrValue = {
      attribute: userEntity.attribute("LOGIN"),
      value: "login1"
    };

    const userPlaceDetailAttrValue1: IDetailAttrValue = {
      attribute: userEntity.attribute("DETAIL_PLACE") as DetailAttribute,
      pks: [[placesIDs[0]], [placesIDs[1]]]
    };

    const user1: IUpdateOrInsert = {
      entity: userEntity,
      attrsValues: [userLoginAttrValue1, userAppSetAttrValue1, userPlaceDetailAttrValue1]
    };

    const usersIDs = await Crud.executeInsert(connection, [user1]);

    const updAppAliasValue2: IScalarAttrValue = {
      attribute: appSetAttribute.attribute("ALIAS"),
      value: "newalias2"
    };

    const updUserAppSetAttrValue1: ISetAttrValue = {
      attribute: appSetAttribute,
      crossValues: [[updAppAliasValue2]],
      refIDs: [appIDs[1]]
    };

    const updUser1: IUpdateOrInsert = {
      pk: [usersIDs[0]],
      entity: userEntity,
      attrsValues: [updUserAppSetAttrValue1]
    };
    await Crud.executeUpdateOrInsert(connection, [updUser1]);

    await AConnection.executeTransaction({
      connection,
      callback: async (transaction) => {
        const backupsSQL = `SELECT * FROM ${backupEntity.name} WHERE
    ID = :backupID1 OR ID = :backupID2`;

        const backupsIDParams = {
          backupID1: backupsIDs[0],
          backupID2: backupsIDs[1]
        };

        const backupsResult = await connection.executeQuery(
          transaction,
          backupsSQL,
          backupsIDParams
        );

        await backupsResult.next();
        const appID1 = backupsResult.getNumber("APP");
        const updatedUID1 = backupsResult.getString("UID");
        const alias1 = backupsResult.getString("ALIAS");

        const expectedAppID1 = (backups[0].attrsValues[0] as IEntityAttrValue).values[0];
        const expectedUID1 = (updateOrInsertBackups[0].attrsValues[0] as IScalarAttrValue).value;
        const expectedAlias1 = (backups[0].attrsValues[2] as IScalarAttrValue).value;
        expect(appID1).toEqual(expectedAppID1);
        expect(updatedUID1).toEqual(expectedUID1);
        expect(alias1).toEqual(expectedAlias1);

        await backupsResult.next();
        const appID2 = backupsResult.getNumber("APP");
        const uid2 = backupsResult.getString("UID");
        const updatedAlias2 = backupsResult.getString("ALIAS");

        const expectedAppID2 = (backups[1].attrsValues[0] as IEntityAttrValue).values[0];
        const expectedUID2 = (backups[1].attrsValues[1] as IScalarAttrValue).value;
        const expectedAlias2 = (updateOrInsertBackups[1].attrsValues[0] as IScalarAttrValue).value;
        expect(appID2).toEqual(expectedAppID2);
        expect(uid2).toEqual(expectedUID2);
        expect(updatedAlias2).toEqual(expectedAlias2);

        await backupsResult.close();

        const placesSQL = `SELECT * FROM ${placeEntity.name} WHERE
              ID = :placeID1 OR ID = :placeID2`;
        const placesIDParams = {
          placeID1: placesIDs[0],
          placeID2: placesIDs[1]
        };

        const placesResult = await connection.executeQuery(
          transaction,
          placesSQL,
          placesIDParams
        );

        await placesResult.next();
        const address1 = placesResult.getString("ADDRESS");
        const expectedAddress1 = placeUpd1.attrsValues[0] as IScalarAttrValue;
        expect(address1).toEqual(expectedAddress1.value);

        await placesResult.next();
        const address2 = placesResult.getString("ADDRESS");
        const expectedAddress2 = placeUpd2.attrsValues[0] as IScalarAttrValue;
        expect(address2).toEqual(expectedAddress2.value);

        await placesResult.close();

        const userAppSetSQL = `SELECT * FROM ${appSetAttribute.adapter!.crossRelation}`;
        const userAppSetResult = await connection.executeQuery(transaction, userAppSetSQL);

        await userAppSetResult.next();
        const userID1 = userAppSetResult.getNumber(Constants.DEFAULT_CROSS_PK_OWN_NAME);
        const crossAppID1 = userAppSetResult.getNumber(Constants.DEFAULT_CROSS_PK_REF_NAME);
        const crossAlias1 = userAppSetResult.getString("ALIAS");
        expect(userID1).toBe(usersIDs[0]);
        expect(crossAppID1).toBe(expectedAppID1);
        expect(crossAlias1).toBe(appAliasValue1.value);

        await userAppSetResult.next();
        const userID2 = userAppSetResult.getNumber(Constants.DEFAULT_CROSS_PK_OWN_NAME);
        userAppSetResult.getNumber(Constants.DEFAULT_CROSS_PK_REF_NAME);
        const updAlias2 = userAppSetResult.getString("ALIAS");
        expect(userID2).toBe(usersIDs[0]);
        expect(appID2).toBe(expectedAppID2);
        expect(updAlias2).toBe(updAppAliasValue2.value);

        await userAppSetResult.close();
      }
    });

  });

  it("Delete", async () => {
    const erModel = new ERModel();
    await initERModel(erModel, async (transaction) => {

      const appEntity = await erModel.create(new Entity({
        name: "APPLICATION", lName: {ru: {name: "Приложение"}}
      }), transaction);

      await appEntity.create(new StringAttribute({
        name: "UID", lName: {ru: {name: "Идентификатор приложения"}}, required: true, minLength: 1, maxLength: 36
      }), transaction);

      await appEntity.addAttrUnique([appEntity.attribute("UID")], transaction);

      const backupEntity = await erModel.create(new Entity({
        name: "APPLICATION_BACKUPS", lName: {ru: {name: "Бэкап"}}
      }), transaction);
      await backupEntity.create(new StringAttribute({
        name: "UID", lName: {ru: {name: "Идентификатор бэкапа"}}, required: true, minLength: 1, maxLength: 36
      }), transaction);
      await backupEntity.addAttrUnique([backupEntity.attribute("UID")], transaction);
      await backupEntity.create(new EntityAttribute({
        name: "APP", lName: {ru: {name: " "}}, required: true, entities: [appEntity]
      }), transaction);
      await backupEntity.create(new StringAttribute({
        name: "ALIAS", lName: {ru: {name: "Название бэкапа"}}, required: true, minLength: 1, maxLength: 120
      }), transaction);

      const placeEntity = await erModel.create(new Entity({name: "PLACE", lName: {ru: {name: "Место"}}}), transaction);
      await placeEntity.create(new StringAttribute({
        name: "ADDRESS", lName: {ru: {name: "Адрес"}}, required: true, minLength: 1, maxLength: 100
      }), transaction);

      const userEntity = await erModel.create(new Entity({
        name: "APP_USER", lName: {ru: {name: "Пользователь"}}
      }), transaction);
      await userEntity.create(new StringAttribute({
        name: "LOGIN", lName: {ru: {name: "Логин"}}, required: true, minLength: 1,
        maxLength: 32
      }), transaction);
      const appSet = new SetAttribute({
        name: "APPLICATIONS", lName: {ru: {name: "Приложения"}}, entities: [appEntity],
        adapter: {crossRelation: "APP_USER_APPLICATIONS"}
      });
      appSet.add(new StringAttribute({
        name: "ALIAS", lName: {ru: {name: "Название приложения"}}, required: true, minLength: 1, maxLength: 120
      }));
      await userEntity.create(appSet, transaction);

      await userEntity.create(new EntityAttribute({
        name: "PLACE", lName: {}, entities: [placeEntity]
      }), transaction);
      await userEntity.create(new DetailAttribute({
        name: "DETAIL_PLACE", lName: {ru: {name: "Детальное место"}},
        required: false, entities: [placeEntity],
        adapter: {
          masterLinks: [{
            detailRelation: placeEntity.name,
            link2masterField: Constants.DEFAULT_MASTER_KEY_NAME
          }]
        }
      }), transaction);
    });

    const appEntity = erModel.entity("APPLICATION");

    const appUIDValue1: IScalarAttrValue = {
      attribute: appEntity.attribute("UID"),
      value: "uid1"
    };
    const app1: IInsert = {
      entity: appEntity,
      attrsValues: [appUIDValue1]
    };

    const appUIDValue2: IScalarAttrValue = {
      attribute: appEntity.attribute("UID"),
      value: "uid2"
    };
    const app2: IInsert = {
      entity: appEntity,
      attrsValues: [appUIDValue2]
    };

    const appUIDValue3: IScalarAttrValue = {
      attribute: appEntity.attribute("UID"),
      value: "uid3"
    };
    const app3: IInsert = {
      entity: appEntity,
      attrsValues: [appUIDValue3]
    };

    const apps = [app1, app2, app3];
    const appIDs = await Crud.executeInsert(connection, apps);

    const backupEntity = erModel.entity("APPLICATION_BACKUPS");

    const appIDValue1: IEntityAttrValue = {
      attribute: backupEntity.attribute("APP") as EntityAttribute,
      values: [appIDs[0]]
    };
    const backupUIDValue1: IScalarAttrValue = {
      attribute: backupEntity.attribute("UID"),
      value: "uid1"
    };
    const backupAliasValue1: IScalarAttrValue = {
      attribute: backupEntity.attribute("ALIAS"),
      value: "alias1"
    };
    const insertBackup1: IInsert = {
      entity: backupEntity,
      attrsValues: [appIDValue1, backupUIDValue1, backupAliasValue1]
    };
    const appIDValue2: IEntityAttrValue = {
      attribute: backupEntity.attribute("APP") as EntityAttribute,
      values: [appIDs[1]]
    };
    const backupUIDValue2: IScalarAttrValue = {
      attribute: backupEntity.attribute("UID"),
      value: "uid2"
    };
    const backupAliasValue2: IScalarAttrValue = {
      attribute: backupEntity.attribute("ALIAS"),
      value: "alias2"
    };
    const insertBackup2: IInsert = {
      entity: backupEntity,
      attrsValues: [appIDValue2, backupUIDValue2, backupAliasValue2]
    };

    const backups = [insertBackup1, insertBackup2];
    const backupsIDs = await Crud.executeInsert(connection, backups);


    const placeEntity = erModel.entity("PLACE");

    const placeAddressValue1: IScalarAttrValue = {
      attribute: placeEntity.attribute("ADDRESS"),
      value: "address1"
    };
    const placeInsert1: IUpdateOrInsert = {
      entity: placeEntity,
      attrsValues: [placeAddressValue1]
    };

    const placeAddressValue2: IScalarAttrValue = {
      attribute: placeEntity.attribute("ADDRESS"),
      value: "address2"
    };
    const placeInsert2: IUpdateOrInsert = {
      entity: placeEntity,
      attrsValues: [placeAddressValue2]
    };

    const places = [placeInsert1, placeInsert2];
    const placesIDs = await Crud.executeUpdateOrInsert(connection, places);

    const userEntity = erModel.entity("APP_USER");
    const appSetAttribute: SetAttribute = userEntity.attribute("APPLICATIONS") as SetAttribute;

    const appAliasValue1: IScalarAttrValue = {
      attribute: appSetAttribute.attribute("ALIAS"),
      value: "alias1"
    };
    const appAliasValue2: IScalarAttrValue = {
      attribute: appSetAttribute.attribute("ALIAS"),
      value: "alias2"
    };
    const userAppSetAttrValue1: ISetAttrValue = {
      attribute: appSetAttribute,
      crossValues: [[appAliasValue1], [appAliasValue2]],
      refIDs: [appIDs[0], appIDs[1]]
    };
    const userLoginAttrValue1: IScalarAttrValue = {
      attribute: userEntity.attribute("LOGIN"),
      value: "login1"
    };

    const userPlaceDetailAttrValue1: IDetailAttrValue = {
      attribute: userEntity.attribute("DETAIL_PLACE") as DetailAttribute,
      pks: [[placesIDs[0]], [placesIDs[1]]]
    };

    const user1: IUpdateOrInsert = {
      entity: userEntity,
      attrsValues: [userLoginAttrValue1, userAppSetAttrValue1, userPlaceDetailAttrValue1]
    };

    const usersIDs = await Crud.executeInsert(connection, [user1]);


    const userDelete: IDelete = {
      pk: [usersIDs[0]],
      entity: userEntity
    };

    await Crud.executeDelete(connection, [userDelete]);

    const backupDelete1: IDelete = {
      pk: [backupsIDs[0]],
      entity: backupEntity
    };
    const backupDelete2: IDelete = {
      pk: [backupsIDs[1]],
      entity: backupEntity
    };
    const backupsDelete = [backupDelete1, backupDelete2];
    await Crud.executeDelete(connection, backupsDelete);

    await AConnection.executeTransaction({
      connection,
      callback: async (transaction) => {

        const backupsSQL = `SELECT * FROM ${backupEntity.name} WHERE
          ID = :backupID1 OR ID = :backupID2`;

        const backupsIDParams = {
          backupID1: backupsIDs[0],
          backupID2: backupsIDs[1]
        };

        const backupsResult = await connection.executeQuery(
          transaction,
          backupsSQL,
          backupsIDParams
        );
        expect(await backupsResult.next()).toBeFalsy();

        await backupsResult.close();

        const placesSQL = `SELECT * FROM ${placeEntity.name} WHERE
                    ID = :placeID1 OR ID = :placeID2`;
        const placesIDParams = {
          placeID1: placesIDs[0],
          placeID2: placesIDs[1]
        };

        const placesResult = await connection.executeQuery(
          transaction,
          placesSQL,
          placesIDParams
        );

        await placesResult.next();
        const address1 = placesResult.getString("ADDRESS");
        const expectedAddress1 = places[0].attrsValues[0] as IScalarAttrValue;
        expect(address1).toEqual(expectedAddress1.value);
        const masterKey1 = placesResult.getString(Constants.DEFAULT_MASTER_KEY_NAME);
        const expectedMasterKey1 = "";
        expect(masterKey1).toEqual(expectedMasterKey1);

        await placesResult.next();
        const address2 = placesResult.getString("ADDRESS");
        const expectedAddress2 = places[1].attrsValues[0] as IScalarAttrValue;
        expect(address2).toEqual(expectedAddress2.value);
        const masterKey2 = placesResult.getString(Constants.DEFAULT_MASTER_KEY_NAME);
        const expectedMasterKey2 = "";
        expect(masterKey2).toEqual(expectedMasterKey2);

        await placesResult.close();

        const userAppSetSQL = `SELECT * FROM ${appSetAttribute.adapter!.crossRelation}`;
        const userAppSetResult = await connection.executeQuery(transaction, userAppSetSQL);
        expect(await userAppSetResult.next()).toBeFalsy();

        await userAppSetResult.close();

        const userSQL = `SELECT * FROM ${userEntity.name}`;
        const userResult = await connection.executeQuery(transaction, userSQL);
        expect(await userResult.next()).toBeFalsy();

        await userResult.close();
      }
    });

  });

  it("empty entity", async () => {
    const erModel = new ERModel();
    await initERModel(erModel, async (transaction) => {
      await erModel.create(new Entity({
        name: "TEST1",
        lName: {ru: {name: "entity name", fullName: "full entity name"}},
        semCategories: [SemCategory.Company],
        adapter: {
          relation: [{relationName: "TEST_ADAPTER"}]
        }
      }), transaction);

      await erModel.create(new Entity({
        name: "TEST2",
        lName: {ru: {name: "entity name", fullName: "full entity name"}}
      }), transaction);
    });

    const loadedERModel = await loadERModel();
    const entity1 = erModel.entity("TEST1");
    const entity2 = erModel.entity("TEST2");
    const loadEntity1 = loadedERModel.entity("TEST1");
    const loadEntity2 = loadedERModel.entity("TEST2");
    expect(loadEntity1).toEqual(entity1);
    expect(loadEntity1.serialize()).toEqual(entity1.serialize());
    expect(loadEntity2).toEqual(entity2);
    expect(loadEntity2.serialize()).toEqual(entity2.serialize());
  });

  it("integer", async () => {
    const erModel = new ERModel();
    await initERModel(erModel, async (transaction) => {
      const entity = await erModel.create(new Entity({
        name: "TEST",
        lName: {ru: {name: "entity name", fullName: "full entity name"}}
      }), transaction);

      await entity.create(new IntegerAttribute({
        name: "FIELD1", lName: {ru: {name: "Поле 1", fullName: "FULLNAME"}}, required: true,
        minValue: MIN_16BIT_INT, maxValue: MAX_16BIT_INT, defaultValue: -10000,
        adapter: {relation: "TEST", field: "FIELD_ADAPTER"}
      }), transaction);
      await entity.create(new IntegerAttribute({
        name: "FIELD2", lName: {ru: {name: "Поле 2", fullName: "FULLNAME"}}, required: true,
        minValue: MIN_32BIT_INT, maxValue: MAX_32BIT_INT, defaultValue: -10000
      }), transaction);
      // await entity.create(new IntegerAttribute({
      //   name: "FIELD3", lName: {ru: {name: "Поле 3", fullName: "FULLNAME"}}, required: true,
      //   minValue: MIN_64BIT_INT, maxValue: MAX_64BIT_INT, defaultValue: -100000000000000
      // }), transaction);
      await entity.create(new IntegerAttribute({
        name: "FIELD4", lName: {ru: {name: "Поле 4", fullName: "FULLNAME"}},
        minValue: MIN_16BIT_INT, maxValue: MAX_16BIT_INT + 1, defaultValue: 0
      }), transaction);
      await entity.create(new IntegerAttribute({
        name: "FIELD5", lName: {ru: {name: "Поле 5", fullName: "FULLNAME"}},
        minValue: MIN_16BIT_INT, maxValue: MAX_16BIT_INT + 1
      }), transaction);
    });

    const loadedERModel = await loadERModel();
    const entity = erModel.entity("TEST");
    const loadEntity = loadedERModel.entity("TEST");
    expect(loadEntity).toEqual(entity);
    expect(loadEntity.serialize()).toEqual(entity.serialize());
  });

  it("numeric", async () => {
    const erModel = new ERModel();
    await initERModel(erModel, async (transaction) => {
      const entity = await erModel.create(new Entity({
        name: "TEST",
        lName: {ru: {name: "entity name", fullName: "full entity name"}}
      }), transaction);

      await entity.create(new NumericAttribute({
        name: "FIELD1", lName: {ru: {name: "Поле 1"}}, required: true,
        precision: 4, scale: 2, minValue: 40, maxValue: 1000, defaultValue: 40.36,
        adapter: {relation: "TEST", field: "FIELD_ADAPTER"}
      }), transaction);
      await entity.create(new NumericAttribute({
        name: "FIELD2", lName: {ru: {name: "Поле 2"}},
        precision: 4, scale: 2, minValue: 40, maxValue: 1000, defaultValue: 40.36
      }), transaction);
      await entity.create(new NumericAttribute({
        name: "FIELD3", lName: {ru: {name: "Поле 3"}},
        precision: 4, scale: 2, minValue: 40, maxValue: 1000
      }), transaction);
    });

    const loadedERModel = await loadERModel();
    const entity = erModel.entity("TEST");
    const loadEntity = loadedERModel.entity("TEST");
    expect(loadEntity).toEqual(entity);
    expect(loadEntity.serialize()).toEqual(entity.serialize());
  });

  it("blob", async () => {
    const erModel = new ERModel();
    await initERModel(erModel, async (transaction) => {
      const entity = await erModel.create(new Entity({
        name: "TEST",
        lName: {ru: {name: "entity name", fullName: "full entity name"}}
      }), transaction);

      await entity.create(new BlobAttribute({
        name: "FIELD1", lName: {ru: {name: "Поле 1"}}, required: true,
        adapter: {relation: "TEST", field: "FIELD_ADAPTER"}
      }), transaction);
      await entity.create(new BlobAttribute({
        name: "FIELD2", lName: {ru: {name: "Поле 2"}}
      }), transaction);
    });

    const loadedERModel = await loadERModel();
    const entity = erModel.entity("TEST");
    const loadEntity = loadedERModel.entity("TEST");
    expect(loadEntity).toEqual(entity);
    expect(loadEntity.serialize()).toEqual(entity.serialize());
  });

  it("boolean", async () => {
    const erModel = new ERModel();
    await initERModel(erModel, async (transaction) => {
      const entity = await erModel.create(new Entity({
        name: "TEST",
        lName: {ru: {name: "entity name", fullName: "full entity name"}}
      }), transaction);

      await entity.create(new BooleanAttribute({
        name: "FIELD1", lName: {ru: {name: "Поле 1"}}, required: true,
        defaultValue: true, adapter: {relation: "TEST", field: "FIELD_ADAPTER"}
      }), transaction);
      await entity.create(new BooleanAttribute({
        name: "FIELD2", lName: {ru: {name: "Поле 2"}}
      }), transaction);
    });

    const loadedERModel = await loadERModel();
    const entity = erModel.entity("TEST");
    const loadEntity = loadedERModel.entity("TEST");
    expect(loadEntity).toEqual(entity);
    expect(loadEntity.serialize()).toEqual(entity.serialize());
  });

  it("string", async () => {
    const erModel = new ERModel();
    await initERModel(erModel, async (transaction) => {
      const entity = await erModel.create(new Entity({
        name: "TEST",
        lName: {ru: {name: "entity name", fullName: "full entity name"}}
      }), transaction);

      await entity.create(new StringAttribute({
        name: "FIELD1", lName: {ru: {name: "Поле 1"}}, required: true,
        minLength: 5, maxLength: 30, defaultValue: "test default", autoTrim: true,
        adapter: {relation: "TEST", field: "FIELD_ADAPTER"}
      }), transaction);
      await entity.create(new StringAttribute({
        name: "FIELD2", lName: {ru: {name: "Поле 2"}},
        minLength: 1, maxLength: 160, defaultValue: "test default", autoTrim: true
      }), transaction);
      await entity.create(new StringAttribute({
        name: "FIELD3", lName: {ru: {name: "Поле 3"}},
        minLength: 1, maxLength: 160, autoTrim: true
      }), transaction);
      await entity.create(new StringAttribute({
        name: "FIELD4", lName: {ru: {name: "Поле 3"}},
        minLength: 1, autoTrim: true
      }), transaction);
    });

    const loadedERModel = await loadERModel();
    const entity = erModel.entity("TEST");
    const loadEntity = loadedERModel.entity("TEST");
    expect(loadEntity).toEqual(entity);
    expect(loadEntity.serialize()).toEqual(entity.serialize());
  });

  it("date", async () => {
    const erModel = new ERModel();
    await initERModel(erModel, async (transaction) => {
      const entity = await erModel.create(new Entity({
        name: "TEST",
        lName: {ru: {name: "entity name", fullName: "full entity name"}}
      }), transaction);

      await entity.create(new DateAttribute({
        name: "FIELD1", lName: {ru: {name: "Поле 1"}}, required: true,
        minValue: moment.utc().year(1999).month(10).date(3).startOf("date").local().toDate(),
        maxValue: moment.utc().year(2099).startOf("year").local().toDate(),
        defaultValue: moment.utc().startOf("date").local().toDate(),
        adapter: {relation: "TEST", field: "FIELD_ADAPTER"}
      }), transaction);
      await entity.create(new DateAttribute({
        name: "FIELD2", lName: {ru: {name: "Поле 2"}},
        minValue: moment.utc(Constants.MIN_TIMESTAMP).startOf("date").local().toDate(),
        maxValue: moment.utc(Constants.MAX_TIMESTAMP).startOf("date").local().toDate(),
        defaultValue: "CURRENT_DATE"
      }), transaction);
      await entity.create(new DateAttribute({
        name: "FIELD3", lName: {ru: {name: "Поле 3"}},
        minValue: moment.utc(Constants.MIN_TIMESTAMP).startOf("date").local().toDate(),
        maxValue: moment.utc(Constants.MAX_TIMESTAMP).startOf("date").local().toDate()
      }), transaction);
    });

    const loadedERModel = await loadERModel();
    const entity = erModel.entity("TEST");
    const loadEntity = loadedERModel.entity("TEST");
    expect(loadEntity).toEqual(entity);
    expect(loadEntity.serialize()).toEqual(entity.serialize());
  });

  it("time", async () => {
    const erModel = new ERModel();
    await initERModel(erModel, async (transaction) => {
      const entity = await erModel.create(new Entity({
        name: "TEST",
        lName: {ru: {name: "entity name", fullName: "full entity name"}}
      }), transaction);

      await entity.create(new TimeAttribute({
        name: "FIELD1", lName: {ru: {name: "Поле 1"}}, required: true,
        minValue: moment.utc().year(Constants.MIN_TIMESTAMP.getUTCFullYear()).month(Constants.MIN_TIMESTAMP.getUTCMonth())
          .date(Constants.MIN_TIMESTAMP.getDate()).startOf("date").local().toDate(),
        maxValue: moment.utc().year(Constants.MIN_TIMESTAMP.getUTCFullYear()).month(Constants.MIN_TIMESTAMP.getUTCMonth())
          .date(Constants.MIN_TIMESTAMP.getDate()).endOf("date").local().toDate(),
        defaultValue: moment.utc().year(Constants.MIN_TIMESTAMP.getUTCFullYear()).month(Constants.MIN_TIMESTAMP.getUTCMonth())
          .date(Constants.MIN_TIMESTAMP.getDate()).local().toDate(),
        adapter: {relation: "TEST", field: "FIELD_ADAPTER"}
      }), transaction);
      await entity.create(new TimeAttribute({
        name: "FIELD2", lName: {ru: {name: "Поле 2"}},
        minValue: moment.utc(Constants.MIN_TIMESTAMP, Constants.TIME_TEMPLATE).local().toDate(),
        maxValue: moment.utc(Constants.MAX_TIMESTAMP, Constants.TIME_TEMPLATE)
          .year(Constants.MIN_TIMESTAMP.getUTCFullYear()).month(Constants.MIN_TIMESTAMP.getUTCMonth())
          .date(Constants.MIN_TIMESTAMP.getDate()).local().toDate(),
        defaultValue: "CURRENT_TIME"
      }), transaction);
      await entity.create(new TimeAttribute({
        name: "FIELD3", lName: {ru: {name: "Поле 3"}},
        minValue: moment.utc(Constants.MIN_TIMESTAMP, Constants.TIME_TEMPLATE).local().toDate(),
        maxValue: moment.utc(Constants.MAX_TIMESTAMP, Constants.TIME_TEMPLATE)
          .year(Constants.MIN_TIMESTAMP.getUTCFullYear()).month(Constants.MIN_TIMESTAMP.getUTCMonth())
          .date(Constants.MIN_TIMESTAMP.getDate()).local().toDate()
      }), transaction);
    });

    const loadedERModel = await loadERModel();
    const entity = erModel.entity("TEST");
    const loadEntity = loadedERModel.entity("TEST");
    expect(loadEntity).toEqual(entity);
    expect(loadEntity.serialize()).toEqual(entity.serialize());
  });

  it("timestamp", async () => {
    const erModel = new ERModel();
    await initERModel(erModel, async (transaction) => {
      const entity = await erModel.create(new Entity({
        name: "TEST",
        lName: {ru: {name: "entity name", fullName: "full entity name"}}
      }), transaction);

      await entity.create(new TimeStampAttribute({
        name: "FIELD1", lName: {ru: {name: "Поле 1"}}, required: true,
        minValue: moment.utc().year(1999).month(10).startOf("month").local().toDate(),
        maxValue: moment.utc().year(2099).month(1).date(1).endOf("date").local().toDate(),
        defaultValue: moment.utc().local().toDate(),
        adapter: {relation: "TEST", field: "FIELD_ADAPTER"}
      }), transaction);
      await entity.create(new TimeStampAttribute({
        name: "FIELD2", lName: {ru: {name: "Поле 2"}},
        minValue: moment.utc(Constants.MIN_TIMESTAMP).local().toDate(),
        maxValue: moment.utc(Constants.MAX_TIMESTAMP).local().toDate(),
        defaultValue: "CURRENT_TIMESTAMP"
      }), transaction);
      await entity.create(new TimeStampAttribute({
        name: "FIELD3", lName: {ru: {name: "Поле 3"}},
        minValue: moment.utc(Constants.MIN_TIMESTAMP).local().toDate(),
        maxValue: moment.utc(Constants.MAX_TIMESTAMP).local().toDate()
      }), transaction);
    });

    const loadedERModel = await loadERModel();
    const entity = erModel.entity("TEST");
    const loadEntity = loadedERModel.entity("TEST");
    expect(loadEntity).toEqual(entity);
    expect(loadEntity.serialize()).toEqual(entity.serialize());
  });

  it("float", async () => {
    const erModel = new ERModel();
    await initERModel(erModel, async (transaction) => {
      const entity = await erModel.create(new Entity({
        name: "TEST",
        lName: {ru: {name: "entity name", fullName: "full entity name"}}
      }), transaction);

      await entity.create(new FloatAttribute({
        name: "FIELD1", lName: {ru: {name: "Поле 1"}}, required: true,
        minValue: -123, maxValue: 123123123123123123123123, defaultValue: 40,
        adapter: {relation: "TEST", field: "FIELD_ADAPTER"}
      }), transaction);
      // await entity.create(new FloatAttribute({
      //   name: "FIELD2", lName: {ru: {name: "Поле 2"}},
      //   minValue: Number.MIN_VALUE, maxValue: Number.MAX_VALUE, defaultValue: 40
      // }), transaction);
      await entity.create(new FloatAttribute({
        name: "FIELD3", lName: {ru: {name: "Поле 3"}}, required: true,
        minValue: -123, maxValue: 123123123123123123123123
      }), transaction);
    });

    const loadedERModel = await loadERModel();
    const entity = erModel.entity("TEST");
    const loadEntity = loadedERModel.entity("TEST");
    expect(loadEntity).toEqual(entity);
    expect(loadEntity.serialize()).toEqual(entity.serialize());
  });

  it("enum", async () => {
    const erModel = new ERModel();
    await initERModel(erModel, async (transaction) => {
      const entity = await erModel.create(new Entity({
        name: "TEST",
        lName: {ru: {name: "entity name", fullName: "full entity name"}}
      }), transaction);

      await entity.create(new EnumAttribute({
        name: "FIELD1", lName: {ru: {name: "Поле 1"}}, required: true,
        values: [
          {
            value: "Z",
            lName: {ru: {name: "Перечисление Z"}}
          },
          {
            value: "X",
            lName: {ru: {name: "Перечисление X"}}
          },
          {
            value: "Y",
            lName: {ru: {name: "Перечисление Y"}}
          }
        ], defaultValue: "Z",
        adapter: {relation: "TEST", field: "FIELD_ADAPTER"}
      }), transaction);
      await entity.create(new EnumAttribute({
        name: "FIELD2", lName: {ru: {name: "Поле 2"}},
        values: [{value: "Z"}, {value: "X"}, {value: "Y"}], defaultValue: "Z"
      }), transaction);
      await entity.create(new EnumAttribute({
        name: "FIELD3", lName: {ru: {name: "Поле 3"}},
        values: [{value: "Z"}, {value: "X"}, {value: "Y"}]
      }), transaction);
    });

    const loadedERModel = await loadERModel();
    const entity = erModel.entity("TEST");
    const loadEntity = loadedERModel.entity("TEST");
    expect(loadEntity).toEqual(entity);
    expect(loadEntity.serialize()).toEqual(entity.serialize());
  });

  it("link to entity", async () => {
    const erModel = new ERModel();
    await initERModel(erModel, async (transaction) => {
      const entity1 = await erModel.create(new Entity({
        name: "TEST1",
        lName: {ru: {name: "entity name", fullName: "full entity name"}}
      }), transaction);
      const entity2 = await erModel.create(new Entity({
        name: "TEST2",
        lName: {ru: {name: "entity name", fullName: "full entity name"}}
      }), transaction);

      await entity1.create(new EntityAttribute({
        name: "LINK1", lName: {ru: {name: "Ссылка "}}, required: true, entities: [entity2]
      }), transaction);
      await entity2.create(new EntityAttribute({
        name: "LINK", lName: {ru: {name: "Ссылка"}}, entities: [entity1]
      }), transaction);
    });

    const loadedERModel = await loadERModel();
    const entity1 = erModel.entity("TEST1");
    const entity2 = erModel.entity("TEST2");
    const loadEntity1 = loadedERModel.entity("TEST1");
    const loadEntity2 = loadedERModel.entity("TEST2");
    expect(loadEntity1).toEqual(entity1);
    expect(loadEntity2).toEqual(entity2);
    expect(loadEntity1.serialize()).toEqual(entity1.serialize());
    expect(loadEntity2.serialize()).toEqual(entity2.serialize());
  });

  it("parent link to entity", async () => {
    const erModel = new ERModel();
    await initERModel(erModel, async (transaction) => {
      const entity = await erModel.create(new Entity({
        name: "TEST",
        lName: {ru: {name: "entity name", fullName: "full entity name"}}
      }), transaction);

      await entity.create(new ParentAttribute({
        name: "PARENT", lName: {ru: {name: "Дерево"}}, entities: [entity]
      }), transaction);
    });

    const loadedERModel = await loadERModel();
    const entity = erModel.entity("TEST");
    const loadEntity = loadedERModel.entity("TEST");
    expect(loadEntity).toEqual(entity);
    //expect(loadEntity.serialize()).toEqual(entity.serialize());
  });

  it("detail entity", async () => {
    const erModel = new ERModel();
    await initERModel(erModel, async (transaction) => {
      const entity2 = await erModel.create(new Entity({
        name: "TEST2",
        lName: {ru: {name: "entity name", fullName: "full entity name"}}
      }), transaction);
      const entity1 = await erModel.create(new Entity({
        name: "TEST1",
        lName: {ru: {name: "entity name", fullName: "full entity name"}}
      }), transaction);
      const entity3 = await erModel.create(new Entity({
        name: "TEST3",
        lName: {ru: {name: "entity name", fullName: "full entity name"}}
      }), transaction);


      await entity1.create(new DetailAttribute({
        name: "DETAILLINK", lName: {ru: {name: "Позиции 1"}}, required: true, entities: [entity2],
        adapter: {
          masterLinks: [{
            detailRelation: "TEST2",
            link2masterField: "MASTER_KEY"
          }]
        }
      }), transaction);
      await entity1.create(new DetailAttribute({
        name: "TEST3", lName: {ru: {name: "Позиции 2"}}, required: true, entities: [entity3]
      }), transaction);
    });

    const loadedERModel = await loadERModel();
    const entity1 = erModel.entity("TEST1");
    const entity2 = erModel.entity("TEST2");
    const entity3 = erModel.entity("TEST3");
    const loadEntity1 = loadedERModel.entity("TEST1");
    const loadEntity2 = loadedERModel.entity("TEST2");
    const loadEntity3 = loadedERModel.entity("TEST3");
    expect(loadEntity1).toEqual(entity1);
    expect(loadEntity2).toEqual(entity2);
    expect(loadEntity3).toEqual(entity3);
    expect(loadEntity1.serialize()).toEqual(entity1.serialize());
    expect(loadEntity2.serialize()).toEqual(entity2.serialize());
    expect(loadEntity3.serialize()).toEqual(entity3.serialize());
  });

  it("set link to entity", async () => {
    const erModel = new ERModel();
    await initERModel(erModel, async (transaction) => {
      const entity1 = await erModel.create(new Entity({
        name: "TEST1",
        lName: {ru: {name: "entity name", fullName: "full entity name"}}
      }), transaction);
      const entity2 = await erModel.create(new Entity({
        name: "TEST2",
        lName: {ru: {name: "entity name", fullName: "full entity name"}}
      }), transaction);


      await entity1.create(new SetAttribute({
        name: "SET1", lName: {ru: {name: "Ссылка1"}}, required: true, entities: [entity2], presLen: 120,
        adapter: {crossRelation: "CROSS_TABLE_ADAPTER1", presentationField: "SET_FIELD_ADAPTER"}
      }), transaction);
      const setAttr = new SetAttribute({
        name: "SET2", lName: {ru: {name: "Ссылка2"}}, required: true, entities: [entity2], presLen: 120,
        adapter: {crossRelation: "CROSS_TABLE_ADAPTER2"}
      });
      setAttr.add(new IntegerAttribute({
        name: "FIELD1", lName: {ru: {name: "Поле 1", fullName: "FULLNAME"}}, required: true,
        minValue: MIN_16BIT_INT, maxValue: MAX_16BIT_INT, defaultValue: -100,
        adapter: {relation: "CROSS_TABLE_ADAPTER2", field: "FIELD_ADAPTER1"}
      }));
      setAttr.add(new IntegerAttribute({
        name: "FIELD2", lName: {ru: {name: "Поле 2", fullName: "FULLNAME"}}, required: true,
        minValue: MIN_32BIT_INT, maxValue: MAX_32BIT_INT, defaultValue: -1000
      }));
      await entity1.create(setAttr, transaction);

      await entity1.create(new SetAttribute({
        name: "SET3", lName: {ru: {name: "Ссылка3"}}, required: true, entities: [entity2],
        adapter: {crossRelation: "TABLE_7"} // generated
      }), transaction);
    });

    const loadedERModel = await loadERModel();
    const entity1 = erModel.entity("TEST1");
    const entity2 = erModel.entity("TEST2");
    const loadEntity1 = loadedERModel.entity("TEST1");
    const loadEntity2 = loadedERModel.entity("TEST2");
    expect(loadEntity1).toEqual(entity1);
    expect(loadEntity2).toEqual(entity2);
    expect(loadEntity1.serialize()).toEqual(entity1.serialize());
    expect(loadEntity2.serialize()).toEqual(entity2.serialize());
  });

  it("entity with unique fields", async () => {
    const erModel = new ERModel();
    await initERModel(erModel, async (transaction) => {
      const entity = await erModel.create(new Entity({
        name: "TEST",
        lName: {ru: {name: "entity name", fullName: "full entity name"}}
      }), transaction);

      await entity.create(new StringAttribute({
        name: "FIELD1", lName: {ru: {name: "Поле 1"}}, required: true,
        minLength: 5, maxLength: 30, defaultValue: "test default", autoTrim: true,
        adapter: {relation: "TEST", field: "FIELD_ADAPTER1"}
      }), transaction);
      await entity.create(new IntegerAttribute({
        name: "FIELD2", lName: {ru: {name: "Поле 2", fullName: "FULLNAME"}}, required: true,
        minValue: MIN_16BIT_INT, maxValue: MAX_16BIT_INT, defaultValue: -100,
        adapter: {relation: "TEST", field: "FIELD_ADAPTER2"}
      }), transaction);
      await entity.create(new FloatAttribute({
        name: "FIELD3", lName: {ru: {name: "Поле 3"}}, required: true,
        minValue: -123, maxValue: 123123123123123123123123, defaultValue: 40,
        adapter: {relation: "TEST", field: "FIELD_ADAPTER3"}
      }), transaction);

      await entity.addAttrUnique([entity.attribute("FIELD1"), entity.attribute("FIELD2")], transaction);
      await entity.addAttrUnique([entity.attribute("FIELD2"), entity.attribute("FIELD3")], transaction);
    });

    const loadedERModel = await loadERModel();
    const entity = erModel.entity("TEST");
    const loadEntity = loadedERModel.entity("TEST");
    expect(loadEntity).toEqual(entity);
    expect(loadEntity.serialize()).toEqual(entity.serialize());
  });

  it("inheritance", async () => {
    const erModel = new ERModel();
    await initERModel(erModel, async (transaction) => {
      const entity1 = await erModel.create(new Entity({
        name: "TEST1",
        lName: {ru: {name: "entity name", fullName: "full entity name"}}
      }), transaction);
      await entity1.create(new StringAttribute({
        name: "TEST_FIELD1", lName: {ru: {name: "Поле 1"}},
        adapter: {relation: "TEST1", field: "FIELD_ADAPTER1"}
      }), transaction);

      const entity2 = await erModel.create(new Entity({
        name: "TEST2",
        parent: entity1,
        lName: {ru: {name: "entity name", fullName: "full entity name"}},
        adapter: {
          relation: [...entity1.adapter.relation, {relationName: "TEST2"}]
        }
      }), transaction);
      await entity2.create(new StringAttribute({
        name: "TEST_FIELD2", lName: {ru: {name: "Поле 2"}},
        adapter: {relation: "TEST2", field: "FIELD_ADAPTER2"}
      }), transaction);

      const entity3 = await erModel.create(new Entity({
        name: "TEST3",
        parent: entity1,
        lName: {ru: {name: "entity name", fullName: "full entity name"}},
        adapter: {
          relation: [...entity1.adapter.relation, {relationName: "TEST3"}]
        }
      }), transaction);
      await entity3.create(new StringAttribute({
        name: "TEST_FIELD3", lName: {ru: {name: "Поле 3"}}
      }), transaction);
      await entity3.create(new StringAttribute({
        name: "TEST_FIELD1",
        lName: {ru: {name: "Переопределенное Поле 1"}},
        required: true
      }), transaction);
    });

    const loadedERModel = await loadERModel();
    const entity1 = erModel.entity("TEST1");
    const entity2 = erModel.entity("TEST2");
    const entity3 = erModel.entity("TEST3");
    const loadEntity1 = loadedERModel.entity("TEST1");
    const loadEntity2 = loadedERModel.entity("TEST2");
    const loadEntity3 = loadedERModel.entity("TEST3");
    expect(loadEntity1).toEqual(entity1);
    expect(loadEntity1.serialize()).toEqual(entity1.serialize());
    expect(loadEntity2).toEqual(entity2);
    expect(loadEntity2.serialize()).toEqual(entity2.serialize());
    expect(loadEntity3).toEqual(entity3);
    expect(loadEntity3.serialize()).toEqual(entity3.serialize());
  });

  it("AUTH DATABASE", async () => {
    const erModel = new ERModel();
    await initERModel(erModel, async (transaction) => {
      // APP_USER
      const userEntity = await erModel.create(new Entity({
        name: "APP_USER", lName: {ru: {name: "Пользователь"}}
      }), transaction);
      await userEntity.create(new StringAttribute({
        name: "LOGIN", lName: {ru: {name: "Логин"}}, required: true, minLength: 1, maxLength: 32
      }), transaction);
      await userEntity.create(new BlobAttribute({
        name: "PASSWORD_HASH", lName: {ru: {name: "Хешированный пароль"}}, required: true
      }), transaction);
      await userEntity.create(new BlobAttribute({
        name: "SALT", lName: {ru: {name: "Примесь"}}, required: true
      }), transaction);
      await userEntity.create(new BooleanAttribute({
        name: "IS_ADMIN", lName: {ru: {name: "Флаг администратора"}}
      }), transaction);

      // APPLICATION
      const appEntity = await erModel.create(new Entity({
        name: "APPLICATION", lName: {ru: {name: "Приложение"}}
      }), transaction);
      const appUid = new StringAttribute({
        name: "UID", lName: {ru: {name: "Идентификатор приложения"}}, required: true, minLength: 1, maxLength: 36
      });
      await appEntity.create(appUid, transaction);
      await appEntity.addAttrUnique([appUid], transaction);
      await appEntity.create(new TimeStampAttribute({
        name: "CREATIONDATE", lName: {ru: {name: "Дата создания"}}, required: true,
        minValue: Constants.MIN_TIMESTAMP, maxValue: Constants.MAX_TIMESTAMP, defaultValue: "CURRENT_TIMESTAMP"
      }), transaction);
      const appSet = new SetAttribute({
        name: "APPLICATIONS", lName: {ru: {name: "Приложения"}}, entities: [appEntity],
        adapter: {crossRelation: "APP_USER_APPLICATIONS"}
      });
      appSet.add(new StringAttribute({
        name: "ALIAS", lName: {ru: {name: "Название приложения"}}, required: true, minLength: 1, maxLength: 120
      }));

      await userEntity.create(appSet, transaction);

      // APPLICATION_BACKUPS
      const backupEntity = await erModel.create(new Entity({
        name: "APPLICATION_BACKUPS", lName: {ru: {name: "Резервная копия"}}
      }), transaction);
      const backupUid = new StringAttribute({
        name: "UID", lName: {ru: {name: "Идентификатор бэкапа"}}, required: true, minLength: 1, maxLength: 36
      });
      await backupEntity.create(backupUid, transaction);
      await backupEntity.addAttrUnique([backupUid], transaction);

      await backupEntity.create(new EntityAttribute({
        name: "APP", lName: {ru: {name: "Приложение"}}, required: true, entities: [appEntity]
      }), transaction);
      await backupEntity.create(new TimeStampAttribute({
        name: "CREATIONDATE", lName: {ru: {name: "Дата создания"}}, required: true,
        minValue: Constants.MIN_TIMESTAMP, maxValue: Constants.MAX_TIMESTAMP, defaultValue: "CURRENT_TIMESTAMP"
      }), transaction);
      await backupEntity.create(new StringAttribute({
        name: "ALIAS", lName: {ru: {name: "Название бэкапа"}}, required: true, minLength: 1, maxLength: 120
      }), transaction);
    });

    const loadedERModel = await loadERModel();
    const userEntity = erModel.entity("APP_USER");
    const appEntity = erModel.entity("APPLICATION");
    const loadUserEntity = loadedERModel.entity("APP_USER");
    const loadAppEntity = loadedERModel.entity("APPLICATION");
    expect(loadUserEntity).toEqual(userEntity);
    expect(loadUserEntity.serialize()).toEqual(userEntity.serialize());
    expect(loadAppEntity).toEqual(appEntity);
    expect(loadAppEntity.serialize()).toEqual(appEntity.serialize());
  });
});
