import config from "config";
import jwt from "jsonwebtoken";
import {Logger} from "log4js";
import {StompClientCommandListener, StompError, StompHeaders, StompServerSessionLayer} from "stomp-protocol";
import {v1 as uuidV1} from "uuid";
import {
  AppAction,
  Application,
  BeginTransCmd,
  CommitTransCmd,
  GetSchemaCmd,
  PingCmd,
  RollbackTransCmd
} from "../apps/base/Application";
import {Session, SessionStatus} from "../apps/base/Session";
import {Task, TaskStatus} from "../apps/base/task/Task";
import {ITaskManagerEvents} from "../apps/base/task/TaskManager";
import {CreateAppCmd, DeleteAppCmd, GetAppsCmd, IUser, MainAction, MainApplication} from "../apps/MainApplication";
import {Constants} from "../Constants";
import {DBStatus} from "../db/ADatabase";
import {StompErrorCode, StompServerError} from "./StompServerError";

type Actions = AppAction | MainAction;

export type Ack = "auto" | "client" | "client-individual";

export interface ISubscription {
  id: string;
  destination: string;
  ack: Ack;
}

export class StompSession implements StompClientCommandListener {

  public static readonly JWT_SECRET: string = config.get("server.jwt.secret");
  public static readonly JWT_ACCESS_TOKEN_TIMEOUT: string = config.get("server.jwt.token.access.timeout");
  public static readonly JWT_REFRESH_TOKEN_TIMEOUT: string = config.get("server.jwt.token.refresh.timeout");

  public static readonly DESTINATION_TASK = "/task";
  public static readonly DESTINATION_TASK_STATUS = `${StompSession.DESTINATION_TASK}/status`;
  public static readonly DESTINATION_TASK_PROGRESS = `${StompSession.DESTINATION_TASK}/progress`;

  private readonly _stomp: StompServerSessionLayer;
  private readonly _subscriptions: ISubscription[] = [];
  private readonly _onEndTask: ITaskManagerEvents["change"];
  private readonly _onChangeTask: ITaskManagerEvents["change"];
  private readonly _onProgressTask: ITaskManagerEvents["progress"];

  private _session?: Session;
  private _application?: Application;
  private _mainApplication?: MainApplication;
  private _logger?: Logger;

  constructor(session: StompServerSessionLayer) {
    this._stomp = session;
    this._onEndTask = (task) => {
      const subscription = this._subscriptions
        .find((sub) => sub.destination === StompSession.DESTINATION_TASK);

      if (subscription && Task.DONE_STATUSES.includes(task.status)) {
        const headers = this._getMessageHeaders(subscription, task, task.id);

        this._stomp.message(headers, JSON.stringify({
          status: task.status,
          payload: task.options.command.payload,
          result: task.result ? task.result : undefined,
          error: task.error ? {
            message: task.error.message
          } : undefined
        })).catch(this.logger.warn);

        if (subscription.ack === "auto") {
          this.session.taskManager.remove(task);
        }
      }
    };
    this._onChangeTask = (task) => {
      const subscription = this._subscriptions
        .find((sub) => sub.destination === StompSession.DESTINATION_TASK_STATUS);

      if (subscription) {
        const headers = this._getMessageHeaders(subscription, task, uuidV1().toUpperCase());

        this._stomp.message(headers, JSON.stringify({
          status: task.status,
          payload: task.options.command.payload
        })).catch(this.logger.warn);
      }
    };
    this._onProgressTask = (task) => {
      const subscription = this._subscriptions
        .find((sub) => sub.destination === StompSession.DESTINATION_TASK_PROGRESS);

      if (subscription) {
        const headers = this._getMessageHeaders(subscription, task, uuidV1().toUpperCase());

        this._stomp.message(headers, JSON.stringify({
          payload: task.options.command.payload,
          progress: {
            value: task.progress.value,
            description: task.progress.description
          }
        })).catch(this.logger.warn);
      }
    };
  }

  get logger(): Logger {
    if (!this._logger) {
      throw new Error("Logger is not found");
    }
    return this._logger;
  }

  set logger(value: Logger) {
    this._logger = value;
  }

  get application(): Application {
    if (!this._application) {
      throw new Error("Application is not found");
    }
    return this._application;
  }

  set application(value: Application) {
    this._application = value;
  }

  get mainApplication(): MainApplication {
    if (!this._mainApplication) {
      throw new Error("MainApplication is not found");
    }
    return this._mainApplication;
  }

  set mainApplication(value: MainApplication) {
    this._mainApplication = value;
  }

  get session(): Session {
    try {
      if (!this._session) {
        throw new Error("Session is not found");
      }

      this.application.checkSession(this._session);
    } catch (error) {
      throw new StompServerError(StompErrorCode.UNAUTHORIZED, error.message);
    }
    return this._session;
  }

  get stomp(): StompServerSessionLayer {
    return this._stomp;
  }

  get subscriptions(): ISubscription[] {
    return this._subscriptions;
  }

  public onProtocolError(error: StompError): void {
    this.logger.warn("Protocol Error: %s", error);
    // this.session.close();
  }

  public onEnd(): void {
    this.logger.info("Release resources");
    if (this._session) {
      this._subscriptions.splice(0, this._subscriptions.length);
      this._session.taskManager.emitter.removeListener("progress", this._onProgressTask);
      this._session.taskManager.emitter.removeListener("change", this._onChangeTask);
      this._session.taskManager.emitter.removeListener("change", this._onEndTask);
      if (this._session.status === SessionStatus.OPENED) {
        this._session.setCloseTimer();
      }
      this._session = undefined;
    }
  }

  public connect(headers: StompHeaders): void {
    this._try(async () => {
      const {
        session,
        login,
        passcode,
        authorization,
        "create-user": isCreateUser,
        "delete-user": isDeleteUser
      } = headers;
      let {"app-uid": appUid} = headers;

      let result: {
        userKey: number,
        newTokens?: {
          "access-token": string;
          "refresh-token": string;
        };
      };
      if (login && passcode) {
        let user;
        if (isCreateUser === "1") {
          if (await this.mainApplication.findUser({login})) {
            throw new StompServerError(StompErrorCode.INVALID, "User already exists");
          }
          user = await this.mainApplication.addUser({
            login,
            password: passcode,
            admin: false
          });
        } else {
          user = await this.mainApplication.checkUserPassword(login, passcode);
          if (!user) {
            throw new StompServerError(StompErrorCode.INVALID, "Incorrect login or password");
          }
        }
        result = {
          userKey: user.id,
          newTokens: {
            "access-token": this._createAccessJwtToken(user),
            "refresh-token": this._createRefreshJwtToken(user)
          }
        };

      } else if (authorization) {
        const payload = this._getPayloadFromJwtToken(authorization);
        const user = await this.mainApplication.findUser({id: payload.id});
        if (!user) {
          throw new StompServerError(StompErrorCode.UNAUTHORIZED, "User is not found");
        }

        if (isDeleteUser === "1") {
          const connectedApplications = await this.mainApplication.getConnectedApplications();
          const sessions = [
            ...this.mainApplication.sessionManager.find(user.id),
            ...connectedApplications.reduce((s, application) => {
              return [...s, ...application.sessionManager.find(user.id)];
            }, [] as Session[])
          ];
          sessions.forEach((s) => s.close());
          await this.mainApplication.deleteUser(user.id);
          throw new StompServerError(StompErrorCode.UNAUTHORIZED, "User is not found");
        }

        result = {userKey: user.id};
        if (payload.isRefresh) {
          result.newTokens = {
            "access-token": this._createAccessJwtToken(user),
            "refresh-token": this._createRefreshJwtToken(user)
          };
        }

      } else {
        throw new StompServerError(StompErrorCode.UNAUTHORIZED, "Incorrect headers");
      }

      // TODO tmp - remove
      const appsInfo = await this.mainApplication.getUserApplicationsInfo(result.userKey);
      if (appsInfo.length) {
        appUid = appsInfo[0].uid;
      }

      if (appUid) {
        // auth on main and get application
        const mainSession = await this.mainApplication.sessionManager.open(result.userKey);
        try {
          this._application = await this.mainApplication.getApplication(mainSession, appUid);
        } finally {
          await mainSession.forceClose();
        }
      } else {
        // use main as application
        this._application = this.mainApplication;
      }

      await this._application.waitProcess();
      if (this._application.status !== DBStatus.CONNECTED) {
        await this._application.connect();
      }

      // create session for application
      if (session) {
        this._session = await this.application.sessionManager.find(session, result.userKey);
      } else {
        this._session = await this.application.sessionManager.open(result.userKey);
      }
      this.session.clearCloseTimer();

      this._sendConnected(result.newTokens || {});
    }, headers);
  }

  public disconnect(headers: StompHeaders): void {
    this._try(() => {
      this.session.close();

      this._sendReceipt(headers);
    }, headers);
  }

  public subscribe(headers: StompHeaders): void {
    this._try(() => {
      if (this._subscriptions.some((sub) => sub.id === headers.id)) {
        throw new StompServerError(StompErrorCode.NOT_UNIQUE, "Subscriptions with same id exists");
      }
      if (this._subscriptions.some((sub) => sub.destination === headers.destination)) {
        throw new StompServerError(StompErrorCode.NOT_UNIQUE, "Subscriptions with same destination exists");
      }
      switch (headers.destination) {
        case StompSession.DESTINATION_TASK: {
          this.session.taskManager.emitter.addListener("change", this._onEndTask);
          this._subscriptions.push({
            id: headers.id,
            destination: headers.destination,
            ack: headers.ack as Ack || "auto"
          });
          this._sendReceipt(headers);

          // notify about tasks
          this.session.taskManager.find(...Task.DONE_STATUSES).forEach((task) => this._onEndTask(task));
          break;
        }
        case StompSession.DESTINATION_TASK_STATUS: {
          this.session.taskManager.emitter.addListener("change", this._onChangeTask);
          this._subscriptions.push({
            id: headers.id,
            destination: headers.destination,
            ack: headers.ack as Ack || "auto"
          });
          this._sendReceipt(headers);

          // notify about tasks
          this.session.taskManager.find(...Task.PROCESS_STATUSES).forEach((task) => this._onChangeTask(task));
          break;
        }
        case StompSession.DESTINATION_TASK_PROGRESS: {
          this.session.taskManager.emitter.addListener("progress", this._onProgressTask);
          this._subscriptions.push({
            id: headers.id,
            destination: headers.destination,
            ack: headers.ack as Ack || "auto"
          });
          this._sendReceipt(headers);

          this.session.taskManager.find(TaskStatus.RUNNING).forEach((task) => this._onProgressTask(task));
          break;
        }
        default:
          throw new StompServerError(StompErrorCode.UNSUPPORTED, `Unsupported destination '${headers.destination}'`);
      }
    }, headers);
  }

  public unsubscribe(headers: StompHeaders): void {
    this._try(() => {
      const subscription = this._subscriptions.find((sub) => sub.id === headers.id);
      if (!subscription) {
        throw new StompServerError(StompErrorCode.NOT_FOUND, "Subscription is not found");
      }
      switch (subscription.destination) {
        case StompSession.DESTINATION_TASK: {
          this.session.taskManager.emitter.removeListener("change", this._onEndTask);
          this._subscriptions.splice(this._subscriptions.indexOf(subscription), 1);
          this._sendReceipt(headers);
          break;
        }
        case StompSession.DESTINATION_TASK_STATUS: {
          this.session.taskManager.emitter.removeListener("change", this._onChangeTask);
          this._subscriptions.splice(this._subscriptions.indexOf(subscription), 1);
          this._sendReceipt(headers);
          break;
        }
        case StompSession.DESTINATION_TASK_PROGRESS: {
          this.session.taskManager.emitter.removeListener("progress", this._onProgressTask);
          this._subscriptions.splice(this._subscriptions.indexOf(subscription), 1);
          this._sendReceipt(headers);
          break;
        }
        default:
          throw new StompServerError(StompErrorCode.UNSUPPORTED, `Unsupported destination '${headers.destination}'`);
      }
    }, headers);
  }

  public send(headers: StompHeaders, body: string = ""): void {
    this._try(() => {
      const {destination} = headers;

      switch (destination) {
        case StompSession.DESTINATION_TASK:
          this._checkContentType(headers);

          const id: string | undefined = headers.receipt;
          // protection against re-sending messages (https://github.com/gsbelarus/gdmn/issues/23)
          if (id) {
            const selfTasks = this.session.taskManager.find(this.session);
            const task = selfTasks.find((t) => t.options.command.id === id);
            if (task) {
              this.logger.info("Duplicate received; Ignore it");
              return this._sendReceipt(headers, {"task-id": task.id});
            }
          }
          const action = headers.action as Actions;
          const bodyObj = JSON.parse(body || "{}");

          // TODO remove task-id from receipt; use command.id
          switch (action) {
            // ------------------------------For MainApplication
            case "DELETE_APP": {
              if (this.mainApplication !== this.application) {
                throw new StompServerError(StompErrorCode.UNSUPPORTED, "Unsupported action");
              }
              if (!bodyObj.payload || !bodyObj.payload.uid) {
                throw new StompServerError(StompErrorCode.INVALID, "Payload must contains 'uid'");
              }
              const command: DeleteAppCmd = {id, action, ...bodyObj};
              const task = this.mainApplication.pushDeleteAppCmd(this.session, command);
              this._sendReceipt(headers, {"task-id": task.id});

              task.execute().catch(this.logger.error);
              break;
            }
            case "CREATE_APP": {
              if (this.mainApplication !== this.application) {
                throw new StompServerError(StompErrorCode.UNSUPPORTED, "Unsupported action");
              }
              if (!bodyObj.payload || !bodyObj.payload.alias || !bodyObj.payload.external) {
                throw new StompServerError(StompErrorCode.INVALID, "Payload must contains 'alias' and 'external'");
              }
              const command: CreateAppCmd = {id, action, ...bodyObj};
              const task = this.mainApplication.pushCreateAppCmd(this.session, command);
              this._sendReceipt(headers, {"task-id": task.id});

              task.execute().catch(this.logger.error);
              break;
            }
            case "GET_APPS": {
              if (this.mainApplication !== this.application) {
                throw new StompServerError(StompErrorCode.UNSUPPORTED, "Unsupported action");
              }
              const command: GetAppsCmd = {id, action, payload: undefined};
              const task = this.mainApplication.pushGetAppsCmd(this.session, command);
              this._sendReceipt(headers, {"task-id": task.id});

              task.execute().catch(this.logger.error);
              break;
            }
            // ------------------------------For all applications
            case "BEGIN_TRANSACTION": {
              const command: BeginTransCmd = {id, action, ...bodyObj};
              const task = this.application.pushBeginTransCmd(this.session, command);
              this._sendReceipt(headers, {"task-id": task.id});

              task.execute().catch(this.logger.error);
              break;
            }
            case "COMMIT_TRANSACTION": {
              const command: CommitTransCmd = {id, action, ...bodyObj};
              const task = this.application.pushCommitTransCmd(this.session, command);
              this._sendReceipt(headers, {"task-id": task.id});

              task.execute().catch(this.logger.error);
              break;
            }
            case "ROLLBACK_TRANSACTION": {
              const command: RollbackTransCmd = {id, action, ...bodyObj};
              const task = this.application.pushRollbackTransCmd(this.session, command);
              this._sendReceipt(headers, {"task-id": task.id});

              task.execute().catch(this.logger.error);
              break;
            }
            case "PING": {
              const command: PingCmd = {id, action, ...bodyObj};
              const task = this.application.pushPingCmd(this.session, command);
              this._sendReceipt(headers, {"task-id": task.id});

              task.execute().catch(this.logger.error);
              break;
            }
            case "GET_SCHEMA": {
              const command: GetSchemaCmd = {id, action, payload: undefined};
              const task = this.application.pushGetSchemaCmd(this.session, command);
              this._sendReceipt(headers, {"task-id": task.id});

              task.execute().catch(this.logger.error);
              break;
            }
            // case "QUERY": {
            //   const command: QueryCmd = {id, action, ...bodyObj};
            //   const task = this.application.pushQueryCmd(this.session, command);
            //   this._sendReceipt(headers, {"task-id": task.id});
            //
            //   task.execute().catch(this.logger.error);
            //   break;
            // }
            default:
              throw new StompServerError(StompErrorCode.UNSUPPORTED, "Unsupported action");
          }
          break;
        default:
          throw new StompServerError(StompErrorCode.UNSUPPORTED, `Unsupported destination '${destination}'`);
      }
    }, headers);
  }

  public ack(headers: StompHeaders): void {
    this._try(() => {
      const task = this.session.taskManager.find(headers.id);
      if (task) {
        this.session.taskManager.remove(task);
      }
    }, headers);
  }

  public nack(headers: StompHeaders): void {
    this._try(() => {
      throw new StompServerError(StompErrorCode.UNSUPPORTED, "Unsupported yet");
    }, headers);
  }

  public begin(headers: StompHeaders): void {
    this._try(() => {
      throw new StompServerError(StompErrorCode.UNSUPPORTED, "Unsupported yet");
    }, headers);
  }

  public commit(headers: StompHeaders): void {
    this._try(() => {
      throw new StompServerError(StompErrorCode.UNSUPPORTED, "Unsupported yet");
    }, headers);
  }

  public abort(headers: StompHeaders): void {
    this._try(() => {
      throw new StompServerError(StompErrorCode.UNSUPPORTED, "Unsupported yet");
    }, headers);
  }

  protected _getMessageHeaders(subscription: ISubscription, task: Task<any, any>, messageKey: string): StompHeaders {
    const headers: StompHeaders = {
      "content-type": "application/json;charset=utf-8",
      "destination": subscription.destination,
      "action": task.options.command.action,
      "subscription": subscription.id,
      "message-id": messageKey,
      "task-id": task.id
    };
    if (subscription.ack !== "auto") {
      headers.ack = messageKey;
    }
    return headers;
  }

  protected _sendConnected(headers: StompHeaders): void {
    this._stomp.connected({
      server: `${Constants.NAME}/${Constants.VERSION}`,
      session: this.session.id,
      ...headers
    }).catch(this.logger.warn);
  }

  protected _sendError(error: StompServerError, requestHeaders?: StompHeaders): void {
    const errorHeaders: StompHeaders = {code: `${error.code}`, message: error.message};
    if (requestHeaders && requestHeaders.receipt) {
      errorHeaders["receipt-id"] = requestHeaders.receipt;
    }
    this._stomp.error(errorHeaders).catch(this.logger.warn);
  }

  protected _sendReceipt(requestHeaders: StompHeaders, headers: StompHeaders = {}): void {
    const receiptHeaders: StompHeaders = headers;
    if (requestHeaders.receipt) {
      receiptHeaders["receipt-id"] = requestHeaders.receipt;
      this._stomp.receipt(receiptHeaders).catch(this.logger.warn);
    }
  }

  protected _try(callback: () => Promise<void> | void, requestHeaders: StompHeaders): void {
    try {
      const result = callback();
      if (result instanceof Promise) {
        result.catch((error) => this._catch(error, requestHeaders));
      }
    } catch (error) {
      this._catch(error, requestHeaders);
    }
  }

  private _catch(error: Error, requestHeaders: StompHeaders): void {
    if (error instanceof StompServerError) {
      this._sendError(error, requestHeaders);
    } else {
      this._sendError(new StompServerError(StompErrorCode.INTERNAL, error.message), requestHeaders);
    }
  }

  private _createAccessJwtToken(user: IUser): string {
    return jwt.sign({
      id: user.id
    }, StompSession.JWT_SECRET, {
      expiresIn: StompSession.JWT_ACCESS_TOKEN_TIMEOUT
    });
  }

  private _createRefreshJwtToken(user: IUser): string {
    return jwt.sign({
      id: user.id,
      isRefresh: true
    }, StompSession.JWT_SECRET, {
      expiresIn: StompSession.JWT_REFRESH_TOKEN_TIMEOUT
    });
  }

  private _getPayloadFromJwtToken(token: string): any {
    try {
      const verified = jwt.verify(token, StompSession.JWT_SECRET);
      if (verified) {
        const payload = jwt.decode(token);
        if (!payload) {
          throw new StompServerError(StompErrorCode.UNAUTHORIZED, "No payload");
        }

        return payload;
      }
    } catch (error) {
      if (error.message === "invalid token") {
        throw new StompServerError(StompErrorCode.UNAUTHORIZED, "Invalid token");
      }
      throw error;
    }

    throw new StompServerError(StompErrorCode.UNAUTHORIZED, "Token not valid");
  }

  private _checkContentType(headers?: StompHeaders): void | never {
    const contentType = headers!["content-type"];
    if (contentType !== "application/json;charset=utf-8") {
      throw new StompServerError(StompErrorCode.UNSUPPORTED,
        `Unsupported content-type '${contentType}'; supported - 'application/json;charset=utf-8'`);
    }
  }
}
