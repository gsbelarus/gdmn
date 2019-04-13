import crypto from "crypto";
import {copyFile, existsSync, mkdirSync, readdir, readFile, unlink, writeFileSync} from "fs";
import {AConnection, ATransaction, Factory, IConnectionServer} from "gdmn-db";
import {ERBridge} from "gdmn-er-bridge";
import {
  BlobAttribute,
  BooleanAttribute,
  Entity,
  EntityAttribute,
  EntityDelete,
  EntityInsert,
  EntityQuery,
  EntityQueryUtils,
  EntityUpdate,
  IEntityQueryResponse,
  IEntityQueryResponseRow,
  IEntityQueryWhereValueInspector,
  IntegerAttribute,
  MAX_32BIT_INT,
  SetAttribute,
  StringAttribute,
  TimeStampAttribute
} from "gdmn-orm";
import path from "path";
import {v1 as uuidV1} from "uuid";
import {Constants} from "../Constants";
import {DBStatus, IDBDetail} from "./base/ADatabase";
import {Application} from "./base/Application";
import {Session, SessionStatus} from "./base/session/Session";
import {ICmd, Level, Task} from "./base/task/Task";
import {GDMNApplication} from "./GDMNApplication";

interface ITemplateApplication {
  name: string;
  description: string;
}

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

export type MainAction = "DELETE_APP" | "CREATE_APP" | "GET_APPS" | "GET_APP_TEMPLATES";

export type MainCmd<A extends MainAction, P = undefined> = ICmd<A, P>;

export type CreateAppCmd = MainCmd<"CREATE_APP", {
  alias: string;
  external: boolean;
  template?: string;
  connectionOptions?: IOptConOptions;
}>;
export type DeleteAppCmd = MainCmd<"DELETE_APP", { uid: string; }>;
export type GetAppsCmd = MainCmd<"GET_APPS">;
export type GetAppTemplatesCmd = MainCmd<"GET_APP_TEMPLATES">;

export class MainApplication extends Application {

  public static readonly WORK_DIR = path.resolve(Constants.DB.DIR, "work");
  public static readonly TEMPLATES_DIR = path.resolve(Constants.DB.DIR, "templates");
  public static readonly TEMPLATES_CONFIG_NAME = "templates.config.json";
  public static readonly APP_EXT = ".FDB";
  public static readonly MAIN_DB = `MAIN${MainApplication.APP_EXT}`;

  private _applications: Map<string, Application> = new Map();

  constructor() {
    super(MainApplication._createDBDetail("auth_db", path.resolve(Constants.DB.DIR, MainApplication.MAIN_DB)));

    if (!existsSync(Constants.DB.DIR)) {
      mkdirSync(Constants.DB.DIR);
    }
    if (!existsSync(MainApplication.WORK_DIR)) {
      mkdirSync(MainApplication.WORK_DIR);
    }
    if (!existsSync(MainApplication.TEMPLATES_DIR)) {
      mkdirSync(MainApplication.TEMPLATES_DIR);
    }
    if (!existsSync(path.resolve(Constants.DB.DIR, MainApplication.TEMPLATES_CONFIG_NAME))) {
      writeFileSync(
        path.resolve(Constants.DB.DIR, MainApplication.TEMPLATES_CONFIG_NAME),
        JSON.stringify([] as ITemplateApplication[])
      );
    }
  }

  public static getAppPath(uid: string): string {
    return path.resolve(MainApplication.WORK_DIR, MainApplication._getAppName(uid));
  }

  private static _getTemplatePath(template: string): string {
    return path.resolve(MainApplication.TEMPLATES_DIR, template);
  }

  private static async _getTemplatesConfig(): Promise<ITemplateApplication[]> {
    const templateConfig: Array<Partial<ITemplateApplication>> = await new Promise((resolve, reject) => {
      readFile(path.resolve(Constants.DB.DIR, MainApplication.TEMPLATES_CONFIG_NAME),
        (error, data) => error ? reject(error) : resolve(JSON.parse(data.toString())));
    });

    return templateConfig.map((template) => {
      const {name, description} = template;
      if (!name || !description) {
        throw new Error("Incorrect template config");
      }
      return {name, description};
    });
  }

  private static async _getTemplatesFiles(): Promise<string[]> {
    return await new Promise((resolve, reject) => {
      readdir(MainApplication.TEMPLATES_DIR, (error, files) => error ? reject(error) : resolve(files));
    });
  }

  private static async _copyTemplate(template: string, uid: string): Promise<void> {
    await new Promise((resolve, reject) => {
      copyFile(MainApplication._getTemplatePath(template), MainApplication.getAppPath(uid),
        (error) => error ? reject(error) : resolve());
    });
  }

  private static async _removeCopedTemplate(uid: string): Promise<void> {
    await new Promise((resolve, reject) => {
      unlink(MainApplication.getAppPath(uid), (error) => error ? reject(error) : resolve());
    });
  }

  private static _createDBDetail(alias: string, dbPath: string, appInfo?: IUserApplicationInfo): IDBDetail {
    return {
      alias,
      driver: Factory.getDriver(Constants.DB.DRIVER),
      poolOptions: {
        min: Constants.DB.POOL.MIN,
        max: Constants.DB.POOL.MAX,
        acquireTimeoutMillis: Constants.DB.POOL.ACQUIRE_TIMEOUT,
        idleTimeoutMillis: Constants.DB.POOL.IDLE_TIMEOUT
      },
      connectionOptions: {
        server: appInfo && appInfo.server || Constants.DB.SERVER && {
          host: Constants.DB.SERVER.HOST,
          port: Constants.DB.SERVER.PORT
        },
        username: appInfo && appInfo.username || Constants.DB.USER,
        password: appInfo && appInfo.password || Constants.DB.PASSWORD,
        path: appInfo && appInfo.path || dbPath,
        readTransaction: true
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
        await this.waitUnlock();
        this.checkSession(context.session);

        const {alias, external, template, connectionOptions} = context.command.payload;
        const {userKey} = context.session;

        return await context.session.executeConnection((connection) => AConnection.executeTransaction({
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

              const userAppInfo = await this._getUserApplicationInfo(connection, transaction, userKey, uid);
              const application = await this._getApplication(connection, transaction, context.session, uid);
              try {
                if (external) {
                  await application.connect();
                } else {
                  if (template) {
                    const templatesFiles = await MainApplication._getTemplatesFiles();
                    if (!templatesFiles.includes(template)) {
                      throw new Error("Template is not found");
                    }
                    await MainApplication._copyTemplate(template, uid);
                    try {
                      await application.connect();
                      // TODO
                      const min = 2000;
                      const dbID = Math.floor(Math.random() * (MAX_32BIT_INT - min + 1) + min);
                      console.log(dbID);
                      await application.executeConnection((con) => AConnection.executeTransaction({
                        connection: con,
                        callback: (trans) => con.execute(trans, `SET GENERATOR GD_G_DBID TO ${dbID}`) // TODO param
                      }));
                    } catch (error) {
                      await MainApplication._removeCopedTemplate(uid);
                      throw error;
                    }
                  } else {
                    await application.create();
                  }
                }
              } catch (error) {
                this._applications.delete(uid);
                throw error;
              }

              return userAppInfo;
            }
          })
        );
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
        await this.waitUnlock();
        this.checkSession(context.session);

        const {uid} = context.command.payload;
        const {userKey} = context.session;

        await context.session.executeConnection((connection) => AConnection.executeTransaction({
            connection,
            callback: async (transaction) => {
              const {ownerKey, external} = await this._getUserApplicationInfo(connection, transaction, userKey, uid);
              const application = await this._getApplication(connection, transaction, context.session, uid);

              await this._deleteUserApplicationInfo(connection, transaction, userKey, uid);

              if (ownerKey === userKey) {
                await this._deleteApplicationInfo(connection, transaction, userKey, uid);
                if (!external) {
                  await application.waitUnlock();
                  if (application.status !== DBStatus.CONNECTED) {
                    await application.connect();
                  }

                  await application.delete();
                  this._applications.delete(uid);
                }
              }
            }
          })
        );
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
        await this.waitUnlock();
        this.checkSession(context.session);

        const {userKey} = context.session;

        return await this.executeConnection((connection) => (
          this._getUserApplicationsInfo(connection, connection.readTransaction, userKey)
        ));
      }
    });
    session.taskManager.add(task);
    this.sessionManager.syncTasks();
    return task;
  }

  public pushGetAppTemplatesCmd(session: Session,
                                command: GetAppTemplatesCmd): Task<GetAppTemplatesCmd, ITemplateApplication[]> {
    const task = new Task({
      session,
      command,
      level: Level.SESSION,
      logger: this.taskLogger,
      worker: async () => {
        const templatesConfig = await MainApplication._getTemplatesConfig();
        const templatesFiles = await MainApplication._getTemplatesFiles();
        return templatesConfig.reduce((items, item) => {
          if (templatesFiles.includes(item.name)) {
            items.push({
              name: item.name,
              description: item.description
            });
          } else {
            throw new Error("Template file is not found, check templates config");
          }
          return items;
        }, [] as ITemplateApplication[]);
      }
    });
    session.taskManager.add(task);
    this.sessionManager.syncTasks();
    return task;
  }

  public async getConnectedApplications(): Promise<Application[]> {
    const applications: Application[] = [];
    for (const application of this._applications.values()) {
      await application.waitUnlock();
      if (application.status === DBStatus.CONNECTED) {
        applications.push(application);
      }
    }
    return applications;
  }

  public async getApplication(session: Session, uid: string): Promise<Application> {
    return await session.executeConnection((connection) =>
      this._getApplication(connection, connection.readTransaction, session, uid)
    );
  }

  public async getUserApplicationsInfo(userKey: number): Promise<IUserApplicationInfo[]> {
    return await this.executeConnection((connection) => (
      this._getUserApplicationsInfo(connection, connection.readTransaction, userKey)
    ));
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
    return await this.executeConnection((connection) => (
      this._findUser(connection, connection.readTransaction, user)
    ));
  }

  protected async _getApplication(connection: AConnection,
                                  transaction: ATransaction,
                                  session: Session,
                                  uid: string): Promise<Application> {
    await this.waitUnlock();

    if (this.status !== DBStatus.CONNECTED) {
      throw new Error("MainApplication is not created");
    }
    let application = this._applications.get(uid);
    const userAppInfo = await this._getUserApplicationInfo(connection, transaction, session.userKey, uid);

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
            await application.waitUnlock();
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
                                           userKey: number): Promise<IUserApplicationInfo[]> {
    const result = await this._getUserWithApplications(connection, transaction, userKey);

    return result.data.map((row) => {
      const host = EntityQueryUtils.findAttrValue<string>(row, result.aliases, "application", "HOST");
      const port = EntityQueryUtils.findAttrValue<number>(row, result.aliases, "application", "PORT");

      return {
        alias: EntityQueryUtils.findAttrValue<string>(
          row,
          result.aliases,
          "user",
          "APPLICATIONS",
          "ALIAS"),
        id: EntityQueryUtils.findAttrValue<number>(row, result.aliases, "application", "ID"),
        uid: EntityQueryUtils.findAttrValue<string>(row, result.aliases, "application", "UID"),
        creationDate: EntityQueryUtils.findAttrValue<Date>(row, result.aliases, "application", "CREATIONDATE"),
        ownerKey: EntityQueryUtils.findAttrValue<number>(row, result.aliases, "userOwner", "ID"),
        external: EntityQueryUtils.findAttrValue<boolean>(row, result.aliases, "application", "IS_EXTERNAL"),
        server: host && port ? {host, port} : undefined,
        username: EntityQueryUtils.findAttrValue<string>(row, result.aliases, "application", "USERNAME"),
        password: EntityQueryUtils.findAttrValue<string>(row, result.aliases, "application", "PASSWORD"),
        path: EntityQueryUtils.findAttrValue<string>(row, result.aliases, "application", "PATH")
      };
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
            name: "PORT", lName: {ru: {name: "Порт"}}
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

          await transaction.commitRetaining();
          await this._addUser(connection, transaction, {
            login: "Administrator",
            password: "Administrator",
            admin: true
          });
        }
      })
    }));
  }

  private async _addApplicationInfo(connection: AConnection,
                                    transaction: ATransaction,
                                    application: ICreateApplicationInfo): Promise<IApplicationInfo> {
    const uid = uuidV1().toUpperCase();
    const creationDate = new Date();
    const insertApp = EntityInsert.inspectorToObject(this.erModel, {
      entity: "APPLICATION",
      fields: [{
        attribute: "UID",
        value: uid
      }, {
        attribute: "OWNER",
        value: application.ownerKey
      }, {
        attribute: "IS_EXTERNAL",
        value: application.external
      }, {
        attribute: "HOST",
        value: application.server && application.server.host ? application.server.host : null
      }, {
        attribute: "PORT",
        value: application.server && application.server.port ? application.server.port : null
      }, {
        attribute: "USERNAME",
        value: application.username ? application.username : null
      }, {
        attribute: "PASSWORD",
        value: application.password ? application.password : null
      }, {
        attribute: "PATH",
        value: application.path ? application.path : null
      }, {
        attribute: "CREATIONDATE",
        value: creationDate
      }]
    });
    const appPKValues = await ERBridge.insert(connection, transaction, insertApp);

    return {
      id: appPKValues[0],
      uid,
      creationDate,
      ...application
    };
  }

  private async _addUserApplicationInfo(connection: AConnection,
                                        transaction: ATransaction,
                                        userApplication: ICreateUserApplicationInfo): Promise<void> {
    const result = await this._getUserWithApplications(connection, transaction, userApplication.userKey);

    const value = result.data.map((row) => ({
      pkValues: [EntityQueryUtils.findAttrValue<number>(row, result.aliases, "application", "ID")],
      setAttributes: [{
        attribute: "ALIAS",
        value: EntityQueryUtils.findAttrValue<string>(row, result.aliases, "user", "APPLICATIONS", "ALIAS")
      }]
    }));
    value.push({
      pkValues: [userApplication.appKey],
      setAttributes: [{
        attribute: "ALIAS",
        value: userApplication.alias
      }]
    });

    const userUpdate = EntityUpdate.inspectorToObject(this.erModel, {
      entity: "APP_USER",
      fields: [{
        attribute: "APPLICATIONS",
        value
      }],
      pkValues: [userApplication.userKey]
    });

    await ERBridge.update(connection, transaction, userUpdate);
  }

  private async _deleteApplicationInfo(connection: AConnection,
                                       transaction: ATransaction,
                                       ownerKey: number,
                                       uid: string): Promise<void> {
    const queryApp = EntityQuery.inspectorToObject(this.erModel, {
      link: {
        entity: "APPLICATION",
        alias: "app",
        fields: [
          {attribute: "ID"}
        ]
      },
      options: {
        where: [{
          equals: [{
            alias: "app",
            attribute: "UID",
            value: uid
          }, {
            alias: "app",
            attribute: "OWNER",
            value: ownerKey
          }]
        }]
      }
    });
    const result = await ERBridge.query(connection, transaction, queryApp);

    const deleteApps = EntityDelete.inspectorToObject(this.erModel, {
      entity: "APPLICATION",
      pkValues: EntityQueryUtils.findAttrValues(result, "app", "ID")
    });

    await ERBridge.delete(connection, transaction, deleteApps);
  }

  private async _deleteUserApplicationInfo(connection: AConnection,
                                           transaction: ATransaction,
                                           userKey: number,
                                           uid: string): Promise<void> {
    const result = await this._getUserWithApplications(connection, transaction, userKey);

    const value = result.data
      .filter((row) => (
        EntityQueryUtils.findAttrValue<string>(row, result.aliases, "application", "UID") !== uid)
      )
      .map((row) => ({
        pkValues: [EntityQueryUtils.findAttrValue<number>(row, result.aliases, "application", "ID")],
        setAttributes: [{
          attribute: "ALIAS",
          value: EntityQueryUtils.findAttrValue<string>(row, result.aliases, "user", "APPLICATIONS", "ALIAS")
        }]
      }));

    const updateUser = EntityUpdate.inspectorToObject(this.erModel, {
      entity: "APP_USER",
      fields: [{
        attribute: "APPLICATIONS",
        value
      }],
      pkValues: [userKey]
    });

    await ERBridge.update(connection, transaction, updateUser);
  }

  // TODO tmp - remove
  private async _addTmpDatabasesToUser(connection: AConnection,
                                       transaction: ATransaction,
                                       userKey: number): Promise<void> {
    try {
      const testConfig = require("../../../../../testConfig.json");
      if (!testConfig) {
        throw new Error("testConfig.json is not found");
      }
      const dbDetails: IDBDetail[] = testConfig.dbDetails.map((dbDetail: any) => ({
        alias: dbDetail.alias,
        driver: Factory.getDriver(dbDetail.driver === "FBDriver" ? "firebird" : dbDetail.driver),
        connectionOptions: {
          server: dbDetail.connectionOptions.server,
          username: dbDetail.connectionOptions.username,
          password: dbDetail.connectionOptions.password,
          path: dbDetail.connectionOptions.path
        }
      }));
      for (const dbDetail of dbDetails) {
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

    const creationDate = new Date();
    const insertUser = EntityInsert.inspectorToObject(this.erModel, {
      entity: "APP_USER",
      fields: [
        {
          attribute: "LOGIN",
          value: user.login
        }, {
          attribute: "PASSWORD_HASH",
          value: Buffer.from(passwordHash)
        }, {
          attribute: "SALT",
          value: Buffer.from(salt)
        }, {
          attribute: "IS_ADMIN",
          value: user.admin
        }, {
          attribute: "CREATIONDATE",
          value: creationDate
        }
      ]
    });
    const userPKValues = await ERBridge.insert(connection, transaction, insertUser);

    // TODO tmp - remove
    await this._addTmpDatabasesToUser(connection, transaction, userPKValues[0]);

    return {
      id: userPKValues[0],
      login: user.login,
      passwordHash,
      salt,
      creationDate,
      admin: user.admin
    };
  }

  private async _getUserWithApplications(connection: AConnection,
                                         transaction: ATransaction,
                                         userKey: number): Promise<IEntityQueryResponse> {
    const queryUser = EntityQuery.inspectorToObject(this.erModel, {
      link: {
        entity: "APP_USER",
        alias: "user",
        fields: [
          {
            attribute: "APPLICATIONS",
            setAttributes: ["ALIAS"],
            links: [{
              entity: "APPLICATION",
              alias: "application",
              fields: [
                {attribute: "ID"},
                {attribute: "UID"},
                {attribute: "CREATIONDATE"},
                {
                  attribute: "OWNER",
                  links: [{
                    entity: "APP_USER",
                    alias: "userOwner",
                    fields: [
                      {attribute: "ID"}
                    ]
                  }]
                },
                {attribute: "IS_EXTERNAL"},
                {attribute: "HOST"},
                {attribute: "PORT"},
                {attribute: "USERNAME"},
                {attribute: "PASSWORD"},
                {attribute: "PATH"}
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
                alias: "user",
                attribute: "ID",
                value: userKey
              }
            ],
            not: [{
              isNull: [{
                alias: "application",
                attribute: "ID"
              }]
            }]
          }
        ]
      }
    });

    return await ERBridge.query(connection, transaction, queryUser);
  }

  private async _deleteUser(connection: AConnection, transaction: ATransaction, id: number): Promise<void> {
    const updateUser = EntityUpdate.inspectorToObject(this.erModel, {
      entity: "APP_USER",
      fields: [{
        attribute: "DELETED",
        value: 1
      }],
      pkValues: [id]
    });

    await ERBridge.update(connection, transaction, updateUser);
  }

  private async _findUser(connection: AConnection,
                          transaction: ATransaction,
                          {id, login}: { id?: number, login?: string }): Promise<IUser | undefined> {
    if ((id === undefined || id === null) && !login) {
      throw new Error("Incorrect arguments");
    }

    const additionalEquals: IEntityQueryWhereValueInspector[] = [];
    additionalEquals.push({
      alias: "user",
      attribute: "DELETED",
      value: false
    });
    if (login) {
      additionalEquals.push({
        alias: "user",
        attribute: "LOGIN",
        value: login
      });
    }
    if (id !== undefined && id != null) {
      additionalEquals.push({
        alias: "user",
        attribute: "ID",
        value: id
      });
    }

    const queryUser = EntityQuery.inspectorToObject(this.erModel, {
      link: {
        entity: "APP_USER",
        alias: "user",
        fields: [
          {attribute: "ID"},
          {attribute: "LOGIN"},
          {attribute: "PASSWORD_HASH"},
          {attribute: "SALT"},
          {attribute: "CREATIONDATE"},
          {attribute: "IS_ADMIN"},
          {attribute: "DELETED"},
          {
            attribute: "APPLICATIONS",
            links: [{
              entity: "APPLICATION",
              alias: "application",
              fields: [
                {attribute: "ID"}
              ]
            }]
          }
        ]
      },
      options: {
        where: [{
          equals: additionalEquals
        }]
      }
    });

    const result = await ERBridge.query(connection, transaction, queryUser);

    const users = result.data.map((row: IEntityQueryResponseRow) => ({
      id: EntityQueryUtils.findAttrValue<number>(row, result.aliases, "user", "ID"),
      login: EntityQueryUtils.findAttrValue<string>(row, result.aliases, "user", "LOGIN"),
      passwordHash: EntityQueryUtils.findAttrValue<string>(row, result.aliases, "user", "PASSWORD_HASH"),
      salt: EntityQueryUtils.findAttrValue<string>(row, result.aliases, "user", "SALT"),
      creationDate: EntityQueryUtils.findAttrValue<Date>(row, result.aliases, "user", "CREATIONDATE"),
      admin: EntityQueryUtils.findAttrValue<boolean>(row, result.aliases, "user", "IS_ADMIN")
    }));

    if (users.length) {
      return users[0];
    }
  }
}
