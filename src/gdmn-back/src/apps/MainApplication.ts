import config from "config";
import crypto from "crypto";
import {existsSync, mkdirSync} from "fs";
import {AConnection, ATransaction, Factory, IConnectionServer} from "gdmn-db";
import {ERBridge} from "gdmn-er-bridge";
import {
  BlobAttribute,
  BooleanAttribute,
  Entity,
  EntityAttribute,
  IntegerAttribute,
  SetAttribute,
  StringAttribute,
  TimeStampAttribute
} from "gdmn-orm";
import path from "path";
import {v1 as uuidV1} from "uuid";
import {DBStatus, IDBDetail} from "../db/ADatabase";
import {Application} from "./base/Application";
import {Session, SessionStatus} from "./base/Session";
import {ICmd, Level, Task} from "./base/task/Task";
import {GDMNApplication} from "./GDMNApplication";

export interface ICreateUser {
  login: string;
  password: string;
  admin: boolean;
}

export interface IUser {
  id: number;
  login: string;
  passwordHash: string;
  creationDate: Date;
  salt: string;
  admin: boolean;
}

export interface IOptConOptions {
  server?: IConnectionServer;
  username?: string;
  password?: string;
  path?: string;
}

export interface ICreateApplicationInfo extends IOptConOptions {
  ownerKey: number;
  external: boolean;
}

export interface IApplicationInfo extends IOptConOptions {
  id: number;
  uid: string;
  ownerKey: number;
  external: boolean;
  creationDate: Date;
}

export interface ICreateUserApplicationInfo {
  userKey: number;
  alias: string;
  appKey: number;
}

export interface IUserApplicationInfo extends IApplicationInfo {
  alias: string;
}

export type MainAction = "DELETE_APP" | "CREATE_APP" | "GET_APPS";

export type MainCmd<A extends MainAction, P = undefined> = ICmd<A, P>;

export type CreateAppCmd = MainCmd<"CREATE_APP", {
  alias: string;
  external: boolean;
  connectionOptions?: IOptConOptions;
} & { transactionKey?: string; }>;
export type DeleteAppCmd = MainCmd<"DELETE_APP", { uid: string; }>;
export type GetAppsCmd = MainCmd<"GET_APPS">;

export class MainApplication extends Application {

  public static readonly DEFAULT_SERVER?: IConnectionServer = config.has("db.server")
    ? config.get("db.server")
    : undefined;
  public static readonly DEFAULT_USER: string = config.get("db.user");
  public static readonly DEFAULT_PASSWORD: string = config.get("db.password");

  public static readonly MAIN_DIR = path.resolve(config.get("db.dir"));
  public static readonly WORK_DIR = path.resolve(MainApplication.MAIN_DIR, "work");
  public static readonly APP_EXT = ".FDB";
  public static readonly MAIN_DB = `MAIN${MainApplication.APP_EXT}`;

  private _applications: Map<string, Application> = new Map();

  constructor() {
    super(MainApplication._createDBDetail("auth_db", path.resolve(MainApplication.MAIN_DIR, MainApplication.MAIN_DB)));

    if (!existsSync(MainApplication.MAIN_DIR)) {
      mkdirSync(MainApplication.MAIN_DIR);
    }
    if (!existsSync(MainApplication.WORK_DIR)) {
      mkdirSync(MainApplication.WORK_DIR);
    }
  }

  public static getAppPath(uid: string): string {
    return path.resolve(MainApplication.WORK_DIR, MainApplication._getAppName(uid));
  }

  private static _createDBDetail(alias: string, dbPath: string, appInfo?: IUserApplicationInfo): IDBDetail {
    return {
      alias,
      driver: Factory.FBDriver,
      poolOptions: {
        max: 100,
        acquireTimeoutMillis: 60 * 1000
      },
      connectionOptions: {
        server: appInfo && appInfo.server || MainApplication.DEFAULT_SERVER,
        username: appInfo && appInfo.username || MainApplication.DEFAULT_USER,
        password: appInfo && appInfo.password || MainApplication.DEFAULT_PASSWORD,
        path: appInfo && appInfo.path || dbPath
      }
    };
  }

  private static _getAppName(uid: string): string {
    return `${uid}${MainApplication.APP_EXT}`;
  }

  private static _createPasswordHash(password: string, salt: string): string {
    return crypto.pbkdf2Sync(password, salt, 1, 128, "sha1").toString("base64");
  }

  // TODO tmp
  public pushCreateAppCmd(session: Session, command: CreateAppCmd): Task<CreateAppCmd, IUserApplicationInfo> {
    const task = new Task({
      session,
      command,
      level: Level.USER,
      logger: this.taskLogger,
      worker: async (context) => {
        await this.waitProcess();
        this.checkSession(session);

        const {alias, external, connectionOptions} = context.command.payload;
        const {userKey} = context.session;
        const connection = context.session.connection;

        const userAppInfo = await AConnection.executeTransaction({
          connection,
          callback: async (transaction) => {
            const user = await this._findUser(connection, transaction, {id: userKey});
            if (external && (!user || !user.admin)) {
              throw new Error("Permission denied");
            }
            const {id, uid} = await this._addApplicationInfo(connection, transaction, {
              ...connectionOptions,
              ownerKey: userKey,
              external
            });

            await this._addUserApplicationInfo(connection, transaction, {
              alias,
              userKey,
              appKey: id
            });

            return await this._getUserApplicationInfo(connection, transaction, userKey, uid);
          }
        });

        const application = await this.getApplication(context.session, userAppInfo.uid);
        await application.create();
        return userAppInfo;
      }
    });
    session.taskManager.add(task);
    this.sessionManager.syncTasks();
    return task;
  }

  // TODO tmp
  public pushDeleteAppCmd(session: Session, command: DeleteAppCmd): Task<DeleteAppCmd, void> {
    const task = new Task({
      session,
      command,
      level: Level.USER,
      logger: this.taskLogger,
      worker: async (context) => {
        await this.waitProcess();
        this.checkSession(session);

        const {uid} = context.command.payload;
        const {userKey} = context.session;
        const connection = context.session.connection;

        await AConnection.executeTransaction({
          connection,
          callback: async (transaction) => {
            const {ownerKey, external} = await this._getUserApplicationInfo(connection, transaction, userKey, uid);
            await this._deleteUserApplicationInfo(connection, transaction, userKey, uid);

            if (ownerKey === userKey) {
              await this._deleteApplicationInfo(connection, transaction, userKey, uid);
              if (!external) {
                const application = await this.getApplication(context.session, uid);
                await application.delete();
                this._applications.delete(uid);
              }
            }
          }
        });
      }
    });
    session.taskManager.add(task);
    this.sessionManager.syncTasks();
    return task;
  }

  // TODO tmp
  public pushGetAppsCmd(session: Session, command: GetAppsCmd): Task<GetAppsCmd, IUserApplicationInfo[]> {
    const task = new Task({
      session,
      command,
      level: Level.SESSION,
      logger: this.taskLogger,
      worker: async (context) => {
        await this.waitProcess();
        this.checkSession(session);

        const {userKey} = context.session;
        const connection = context.session.connection;

        return await AConnection.executeTransaction({
          connection,
          callback: (transaction) => this._getUserApplicationsInfo(connection, transaction, userKey)
        });
      }
    });
    session.taskManager.add(task);
    this.sessionManager.syncTasks();
    return task;
  }

  public async getConnectedApplications(): Promise<Application[]> {
    const applications: Application[] = [];
    for (const application of this._applications.values()) {
      await application.waitProcess();
      if (application.status === DBStatus.CONNECTED) {
        applications.push(application);
      }
    }
    return applications;
  }

  public async getApplication(session: Session, uid: string): Promise<Application> {
    await this.waitProcess();

    if (this.status !== DBStatus.CONNECTED) {
      throw new Error("MainApplication is not created");
    }
    let application = this._applications.get(uid);
    const connection = session.connection;
    const userAppInfo = await AConnection.executeTransaction({
      connection,
      callback: (transaction) => this._getUserApplicationInfo(connection, transaction, session.userKey, uid)
    });
    if (!application) {
      const alias = userAppInfo ? userAppInfo.alias : "Unknown";
      const dbDetail = MainApplication._createDBDetail(alias, MainApplication.getAppPath(uid), userAppInfo);
      application = new GDMNApplication(dbDetail);
      this._applications.set(uid, application);

      // TODO remake
      const callback = async (changedSession: Session) => {
        if (!application) {
          return;
        }
        if (changedSession.status === SessionStatus.FORCE_CLOSED) {
          if (!application.sessionManager.size()) {
            await application.waitProcess();
            if (application.status === DBStatus.CONNECTED) {
              try {
                await application.disconnect();
                this._applications.delete(uid);
              } catch (error) {
                this._logger.warn(error);
              }
            } else {
              this._applications.delete(uid);
            }
            application.sessionManager.emitter.removeListener("change", callback);
          }
        }
      };
      application.sessionManager.emitter.on("change", callback);
    }
    return application;
  }

  public async getUserApplicationsInfo(userKey: number): Promise<IUserApplicationInfo[]> {
    return await this.executeConnection((connection) => AConnection.executeTransaction({
      connection,
      callback: (transaction) => this._getUserApplicationsInfo(connection, transaction, userKey)
    }));
  }

  public async addUser(user: ICreateUser): Promise<IUser> {
    return await this.executeConnection((connection) => AConnection.executeTransaction({
      connection,
      callback: (transaction) => this._addUser(connection, transaction, user)
    }));
  }

  public async deleteUser(id: number): Promise<void> {
    return await this.executeConnection((connection) => AConnection.executeTransaction({
      connection,
      callback: (transaction) => this._deleteUser(connection, transaction, id)
    }));
  }

  public async checkUserPassword(login: string, password: string): Promise<IUser | undefined> {
    const user = await this.findUser({login});
    if (user) {
      const passwordHash = MainApplication._createPasswordHash(password, user.salt);
      if (user.passwordHash === passwordHash) {
        return user;
      }
    }
  }

  public async findUser(user: { id?: number, login?: string }): Promise<IUser | undefined> {
    return await this.executeConnection((connection) => AConnection.executeTransaction({
      connection,
      callback: (transaction) => this._findUser(connection, transaction, user)
    }));
  }

  protected async _getUserApplicationInfo(connection: AConnection,
                                          transaction: ATransaction,
                                          userKey: number,
                                          uid: string): Promise<IUserApplicationInfo> {
    const userAppsInfo = await this._getUserApplicationsInfo(connection, transaction, userKey);
    const appInfo = userAppsInfo.find((info) => info.uid === uid);
    if (!appInfo) {
      throw new Error("Application is not found");
    }
    return appInfo;
  }

  protected async _getUserApplicationsInfo(connection: AConnection,
                                           transaction: ATransaction,
                                           userKey?: number): Promise<IUserApplicationInfo[]> {
    return await AConnection.executeQueryResultSet({
      connection,
      transaction,
      sql: `
        SELECT
          apps.ALIAS,
          app.ID,
          app.UID,
          app.CREATIONDATE,
          app.OWNER,
          app.IS_EXTERNAL,
          app.HOST,
          app.PORT,
          app.USERNAME,
          app.PASSWORD,
          app.PATH
        FROM APP_USER_APPLICATIONS apps
          LEFT JOIN APPLICATION app ON app.ID = apps.KEY2
        ${userKey !== undefined ? `WHERE apps.KEY1 = :userKey` : ""}
      `,
      params: {userKey},
      callback: async (resultSet) => {
        const result: IUserApplicationInfo[] = [];
        while (await resultSet.next()) {
          const host = !resultSet.isNull("HOST") ? resultSet.getString("HOST") : undefined;
          const port = !resultSet.isNull("PORT") ? resultSet.getNumber("PORT") : undefined;

          result.push({
            alias: resultSet.getString("ALIAS"),
            id: resultSet.getNumber("ID"),
            uid: resultSet.getString("UID"),
            creationDate: resultSet.getDate("CREATIONDATE")!,
            ownerKey: resultSet.getNumber("OWNER"),
            external: resultSet.getBoolean("IS_EXTERNAL"),
            server: host && port ? {host, port} : undefined,
            username: !resultSet.isNull("USERNAME") ? resultSet.getString("USERNAME") : undefined,
            password: !resultSet.isNull("PASSWORD") ? resultSet.getString("PASSWORD") : undefined,
            path: !resultSet.isNull("PATH") ? resultSet.getString("PATH") : undefined
          });
        }
        return result;
      }
    });
  }

  protected async _onCreate(): Promise<void> {
    await super._onCreate();

    await this._executeConnection((connection) => AConnection.executeTransaction({
      connection,
      callback: (transaction) => ERBridge.executeSelf({
        connection,
        transaction,
        callback: async ({erBuilder, eBuilder}) => {
          // APP_USER
          const userEntity = await erBuilder.create(this.erModel, new Entity({
            name: "APP_USER", lName: {ru: {name: "Пользователь"}}
          }));
          await eBuilder.createAttribute(userEntity, new StringAttribute({
            name: "LOGIN", lName: {ru: {name: "Логин"}}, required: true, minLength: 1, maxLength: 32
          }));
          await eBuilder.createAttribute(userEntity, new BlobAttribute({
            name: "PASSWORD_HASH", lName: {ru: {name: "Хешированный пароль"}}, required: true
          }));
          await eBuilder.createAttribute(userEntity, new BlobAttribute({
            name: "SALT", lName: {ru: {name: "Примесь"}}, required: true
          }));
          await eBuilder.createAttribute(userEntity, new TimeStampAttribute({
            name: "CREATIONDATE", lName: {ru: {name: "Дата создания"}}, required: true,
            defaultValue: "CURRENT_TIMESTAMP"
          }));
          await eBuilder.createAttribute(userEntity, new BooleanAttribute({
            name: "IS_ADMIN", lName: {ru: {name: "Пользователь - администратор"}}
          }));
          await eBuilder.createAttribute(userEntity, new BooleanAttribute({
            name: "DELETED", lName: {ru: {name: "Удален"}}
          }));

          // APPLICATION
          const appEntity = await erBuilder.create(this.erModel, new Entity({
            name: "APPLICATION", lName: {ru: {name: "Приложение"}}
          }));
          await eBuilder.createAttribute(appEntity, new EntityAttribute({
            name: "OWNER", lName: {ru: {name: "Создатель"}}, required: true, entities: [userEntity]
          }));
          await eBuilder.createAttribute(appEntity, new BooleanAttribute({
            name: "IS_EXTERNAL", lName: {ru: {name: "Является внешним"}}, required: true
          }));
          await eBuilder.createAttribute(appEntity, new StringAttribute({
            name: "HOST", lName: {ru: {name: "Хост"}}, maxLength: 260
          }));
          await eBuilder.createAttribute(appEntity, new IntegerAttribute({
            name: "PORT", lName: {ru: {name: "Хост"}}
          }));
          await eBuilder.createAttribute(appEntity, new StringAttribute({
            name: "USERNAME", lName: {ru: {name: "Имя пользователя"}}, maxLength: 260
          }));
          await eBuilder.createAttribute(appEntity, new StringAttribute({
            name: "PASSWORD", lName: {ru: {name: "Пароль"}}, maxLength: 260
          }));
          await eBuilder.createAttribute(appEntity, new StringAttribute({
            name: "PATH", lName: {ru: {name: "Путь"}}, maxLength: 260
          }));
          const appUid = new StringAttribute({
            name: "UID", lName: {ru: {name: "Идентификатор приложения"}}, required: true, minLength: 1, maxLength: 36
          });
          await eBuilder.createAttribute(appEntity, appUid);
          await eBuilder.addUnique(appEntity, [appUid]);
          await eBuilder.createAttribute(appEntity, new TimeStampAttribute({
            name: "CREATIONDATE", lName: {ru: {name: "Дата создания"}}, required: true,
            defaultValue: "CURRENT_TIMESTAMP"
          }));
          const appSet = new SetAttribute({
            name: "APPLICATIONS", lName: {ru: {name: "Приложения"}}, entities: [appEntity],
            adapter: {crossRelation: "APP_USER_APPLICATIONS", crossPk: ["KEY1", "KEY2"]}
          });
          appSet.add(new StringAttribute({
            name: "ALIAS", lName: {ru: {name: "Название приложения"}}, required: true, minLength: 1, maxLength: 120
          }));

          await eBuilder.createAttribute(userEntity, appSet);
        }
      })
    }));

    await this._executeConnection((_connection) => AConnection.executeTransaction({
      connection: _connection,
      callback: async (transaction) => {
        await this._addUser(_connection, transaction, {
          login: "Administrator",
          password: "Administrator",
          admin: true
        });
      }
    }));
  }

  private async _addApplicationInfo(connection: AConnection,
                                    transaction: ATransaction,
                                    application: ICreateApplicationInfo): Promise<IApplicationInfo> {
    const uid = uuidV1().toUpperCase();
    const result = await connection.executeReturning(transaction, `
      INSERT INTO APPLICATION (UID, OWNER, IS_EXTERNAL, HOST, PORT, USERNAME, PASSWORD, PATH)
      VALUES (:uid, :owner, :external, :host, :port, :username, :password, :path)
             RETURNING ID, CREATIONDATE
    `, {
      uid,
      owner: application.ownerKey,
      external: application.external,
      host: application.server && application.server.host,
      port: application.server && application.server.port,
      username: application.username,
      password: application.password,
      path: application.path
    });
    return {
      id: result.getNumber("ID"),
      uid,
      creationDate: result.getDate("CREATIONDATE")!,
      ...application
    };
  }

  private async _addUserApplicationInfo(connection: AConnection,
                                        transaction: ATransaction,
                                        userApplication: ICreateUserApplicationInfo): Promise<void> {
    await connection.execute(transaction, `
      INSERT INTO APP_USER_APPLICATIONS (KEY1, KEY2, ALIAS)
      VALUES (:userKey, :appKey, :alias)
    `, {
      userKey: userApplication.userKey,
      appKey: userApplication.appKey,
      alias: userApplication.alias
    });
  }

  private async _deleteApplicationInfo(connection: AConnection,
                                       transaction: ATransaction,
                                       ownerKey: number,
                                       uid: string): Promise<void> {
    await connection.execute(transaction, `
      DELETE
      FROM APPLICATION
      WHERE UID = :uid
        AND OWNER = :ownerKey
    `, {
      ownerKey,
      uid
    });
  }

  private async _deleteUserApplicationInfo(connection: AConnection,
                                           transaction: ATransaction,
                                           userKey: number,
                                           uid: string): Promise<void> {
    await connection.execute(transaction, `
      DELETE
      FROM APP_USER_APPLICATIONS
      WHERE KEY1 = :userKey
        AND EXISTS(SELECT ID
                   FROM APPLICATION app
                   WHERE app.ID = KEY2
                     AND app.UID = :uid)
    `, {
      userKey,
      uid
    });
  }

  // TODO tmp - remove
  private async _addTmpDatabasesToUser(connection: AConnection,
                                       transaction: ATransaction,
                                       userKey: number): Promise<void> {
    try {
      const {default: databases} = require("../db/databases");
      for (const db of Object.values(databases)) {
        const dbDetail = db as IDBDetail;
        const appInfo = await this._addApplicationInfo(connection, transaction, {
          ...dbDetail.connectionOptions,
          ownerKey: userKey,
          external: true
        });
        await this._addUserApplicationInfo(connection, transaction, {
          alias: dbDetail.alias,
          appKey: appInfo.id,
          userKey
        });
      }
    } catch (error) {
      this._logger.warn(error);
    }
  }

  private async _addUser(connection: AConnection, transaction: ATransaction, user: ICreateUser): Promise<IUser> {
    const salt = crypto.randomBytes(128).toString("base64");
    const passwordHash = MainApplication._createPasswordHash(user.password, salt);

    const result = await connection.executeReturning(transaction, `
      INSERT INTO APP_USER (LOGIN, PASSWORD_HASH, SALT, IS_ADMIN)
      VALUES (:login, :passwordHash, :salt, :isAdmin)
             RETURNING ID, LOGIN, PASSWORD_HASH, SALT, CREATIONDATE, IS_ADMIN
    `, {
      login: user.login,
      passwordHash: Buffer.from(passwordHash),
      salt: Buffer.from(salt),
      isAdmin: user.admin
    });

    // TODO tmp - remove
    await this._addTmpDatabasesToUser(connection, transaction, result.getNumber("ID"));

    return {
      id: result.getNumber("ID"),
      login: result.getString("LOGIN"),
      passwordHash: await result.getBlob("PASSWORD_HASH").asString(),
      salt: await result.getBlob("SALT").asString(),
      creationDate: result.getDate("CREATIONDATE")!,
      admin: result.getBoolean("IS_ADMIN")
    };
  }

  private async _deleteUser(connection: AConnection, transaction: ATransaction, id: number): Promise<void> {
    await connection.execute(transaction, `
      UPDATE APP_USER
      SET DELETED = 1
      WHERE ID = :id
    `, {id});
  }

  private async _findUser(connection: AConnection,
                          transaction: ATransaction,
                          {id, login}: { id?: number, login?: string }): Promise<IUser | undefined> {
    if ((id === undefined || id === null) && !login) {
      throw new Error("Incorrect arguments");
    }
    let condition = "";
    if (id !== undefined && id != null && login) {
      condition = "usr.LOGIN = :login AND usr.ID = :id";
    } else if (login) {
      condition = "usr.LOGIN = :login";
    } else {
      condition = "usr.ID = :id";
    }
    return await AConnection.executeQueryResultSet({
      connection,
      transaction,
      sql: `
        SELECT FIRST 1 *
        FROM APP_USER usr
        WHERE DELETED != 1 AND ${condition}
      `,
      params: {id, login},
      callback: async (resultSet) => {
        if (await resultSet.next()) {
          return {
            id: resultSet.getNumber("ID"),
            login: resultSet.getString("LOGIN"),
            passwordHash: await resultSet.getBlob("PASSWORD_HASH").asString(),
            salt: await resultSet.getBlob("SALT").asString(),
            creationDate: resultSet.getDate("CREATIONDATE")!,
            admin: resultSet.getBoolean("IS_ADMIN")
          };
        }
      }
    });
  }
}
