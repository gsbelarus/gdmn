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
  QueryCmd,
  RollbackTransCmd
} from "../apps/base/Application";
import {Session, SessionStatus} from "../apps/base/Session";
import {Task, TaskStatus} from "../apps/base/task/Task";
import {ITaskManagerEvents} from "../apps/base/task/TaskManager";
import {CreateAppCmd, DeleteAppCmd, GetAppsCmd, IUser, MainAction, MainApplication} from "../apps/MainApplication";
import {Constants} from "../Constants";
import {ErrorCode, ServerError} from "./ServerError";

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
            code: task.error.code,
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
      throw new ServerError(ErrorCode.INTERNAL, "Logger is not found");
    }
    return this._logger;
  }

  set logger(value: Logger) {
    this._logger = value;
  }

  get application(): Application {
    if (!this._application) {
      throw new ServerError(ErrorCode.INTERNAL, "Application is not found");
    }
    return this._application;
  }

  set application(value: Application) {
    this._application = value;
  }

  get mainApplication(): MainApplication {
    if (!this._mainApplication) {
      throw new ServerError(ErrorCode.INTERNAL, "MainApplication is not found");
    }
    return this._mainApplication;
  }

  set mainApplication(value: MainApplication) {
    this._mainApplication = value;
  }

  get session(): Session {
    if (!this._session) {
      throw new ServerError(ErrorCode.UNAUTHORIZED, "Session is not found");
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
      const {session, login, passcode, authorization, "app-uid": appUid, "create-user": isCreateUser} = headers;

      // authorization
      let result: {
        userKey: number,
        newTokens?: {
          "access-token": string;
          "refresh-token": string;
        };
      };
      if (login && passcode && isCreateUser === "1") {
        const user = await this.mainApplication.addUser({
          login,
          password: passcode,
          admin: false
        });
        result = {
          userKey: user.id,
          newTokens: {
            "access-token": this._createAccessJwtToken(user),
            "refresh-token": this._createRefreshJwtToken(user)
          }
        };
      } else if (login && passcode) {
        const user = await this.mainApplication.checkUserPassword(login, passcode);
        if (!user) {
          throw new ServerError(ErrorCode.INVALID, "Incorrect login or password");
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
          throw new ServerError(ErrorCode.NOT_FOUND, "No users for token");
        }
        result = {userKey: user.id};
        if (payload.isRefresh) {
          result.newTokens = {
            "access-token": this._createAccessJwtToken(user),
            "refresh-token": this._createRefreshJwtToken(user)
          };
        }
      } else {
        throw new ServerError(ErrorCode.UNAUTHORIZED, "Incorrect headers");
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

      if (!this._application.connected) {
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
    this._try(async () => {
      this.session.close();
      if (headers["delete-user"] === "1") {
        const sessions = [
          ...this.mainApplication.sessionManager.find(this.session.userKey),
          ...this.mainApplication.onlineApplications.reduce((s, application) => {
            return [...s, ...application.sessionManager.find(this.session.userKey)];
          }, [] as Session[])
        ];
        sessions.forEach((session) => session.close());
        await this.mainApplication.deleteUser(this.session.userKey);
      }
      this._sendReceipt(headers);
    }, headers);
  }

  public subscribe(headers: StompHeaders): void {
    this._try(() => {
      if (this._subscriptions.some((sub) => sub.id === headers.id)) {
        throw new ServerError(ErrorCode.NOT_UNIQUE, "Subscriptions with same id exists");
      }
      if (this._subscriptions.some((sub) => sub.destination === headers.destination)) {
        throw new ServerError(ErrorCode.NOT_UNIQUE, "Subscriptions with same destination exists");
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
          this.session.taskManager.find(...Task.STATUSES).forEach((task) => this._onChangeTask(task));
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
          throw new ServerError(ErrorCode.UNSUPPORTED, `Unsupported destination '${headers.destination}'`);
      }
    }, headers);
  }

  public unsubscribe(headers: StompHeaders): void {
    this._try(() => {
      const subscription = this._subscriptions.find((sub) => sub.id === headers.id);
      if (!subscription) {
        throw new ServerError(ErrorCode.NOT_FOUND, "Subscription is not found");
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
          throw new ServerError(ErrorCode.UNSUPPORTED, `Unsupported destination '${headers.destination}'`);
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

          switch (action) {
            // ------------------------------For MainApplication
            case "DELETE_APP": {
              if (this.mainApplication !== this.application) {
                throw new ServerError(ErrorCode.UNSUPPORTED, "Unsupported action");
              }
              if (!bodyObj.payload || !bodyObj.payload.uid) {
                throw new ServerError(ErrorCode.INVALID, "Payload must contains 'uid'");
              }
              const command: DeleteAppCmd = {id, action, ...bodyObj};
              const task = this.mainApplication.pushDeleteAppCmd(this.session, command);
              this._sendReceipt(headers, {"task-id": task.id});

              task.execute().catch(this.logger.error);
              break;
            }
            case "CREATE_APP": {
              if (this.mainApplication !== this.application) {
                throw new ServerError(ErrorCode.UNSUPPORTED, "Unsupported action");
              }
              if (!bodyObj.payload || !bodyObj.payload.alias || !bodyObj.payload.external) {
                throw new ServerError(ErrorCode.INVALID, "Payload must contains 'alias' and 'external'");
              }
              const command: CreateAppCmd = {id, action, ...bodyObj};
              const task = this.mainApplication.pushCreateAppCmd(this.session, command);
              this._sendReceipt(headers, {"task-id": task.id});

              task.execute().catch(this.logger.error);
              break;
            }
            case "GET_APPS": {
              if (this.mainApplication !== this.application) {
                throw new ServerError(ErrorCode.UNSUPPORTED, "Unsupported action");
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
            case "QUERY": {
              const command: QueryCmd = {id, action, ...bodyObj};
              const task = this.application.pushQueryCmd(this.session, command);
              this._sendReceipt(headers, {"task-id": task.id});

              task.execute().catch(this.logger.error);
              break;
            }
            default:
              throw new ServerError(ErrorCode.UNSUPPORTED, "Unsupported action");
          }
          break;
        default:
          throw new ServerError(ErrorCode.UNSUPPORTED, `Unsupported destination '${destination}'`);
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
      throw new ServerError(ErrorCode.UNSUPPORTED, "Unsupported yet");
    }, headers);
  }

  public begin(headers: StompHeaders): void {
    this._try(() => {
      throw new ServerError(ErrorCode.UNSUPPORTED, "Unsupported yet");
    }, headers);
  }

  public commit(headers: StompHeaders): void {
    this._try(() => {
      throw new ServerError(ErrorCode.UNSUPPORTED, "Unsupported yet");
    }, headers);
  }

  public abort(headers: StompHeaders): void {
    this._try(() => {
      throw new ServerError(ErrorCode.UNSUPPORTED, "Unsupported yet");
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

  protected _sendError(error: ServerError, requestHeaders?: StompHeaders): void {
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
    Promise.resolve(callback()).catch((error) => {
      if (error instanceof ServerError) {
        this._sendError(error, requestHeaders);
      } else {
        this._sendError(new ServerError(ErrorCode.INTERNAL, error.message), requestHeaders);
      }
    });
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
    const verified = jwt.verify(token, StompSession.JWT_SECRET);

    if (verified) {
      const payload = jwt.decode(token);
      if (!payload) {
        throw new Error("No payload");
      }

      return payload;
    }

    throw new Error("Token not valid");
  }

  private _checkContentType(headers?: StompHeaders): void | never {
    const contentType = headers!["content-type"];
    if (contentType !== "application/json;charset=utf-8") {
      throw new ServerError(ErrorCode.UNSUPPORTED,
        `Unsupported content-type '${contentType}'; supported - 'application/json;charset=utf-8'`);
    }
  }
}
