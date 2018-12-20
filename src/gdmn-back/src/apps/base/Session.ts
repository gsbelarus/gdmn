import {EventEmitter} from "events";
import {AConnection, ITransactionOptions, TExecutor} from "gdmn-db";
import {ERBridge} from "gdmn-er-bridge";
import {Logger} from "log4js";
import StrictEventEmitter from "strict-event-emitter-types";
import {v1 as uuidV1} from "uuid";
import {Constants} from "../../Constants";
import {DBStatus} from "../../db/ADatabase";
import {Task, TaskStatus} from "./task/Task";
import {TaskManager} from "./task/TaskManager";

export interface IOptions {
  readonly id: string;
  readonly userKey: number;
  readonly connection: AConnection;
  readonly logger?: Logger;
}

export interface ISessionEvents {
  change: (session: Session) => void;
}

export enum SessionStatus {
  OPENED,
  CLOSED,
  FORCE_CLOSING,
  FORCE_CLOSED
}

export class Session {

  public static readonly DONE_SESSION_STATUSES = [
    SessionStatus.CLOSED,
    SessionStatus.FORCE_CLOSING,
    SessionStatus.FORCE_CLOSED
  ];

  public readonly emitter: StrictEventEmitter<EventEmitter, ISessionEvents> = new EventEmitter();
  protected readonly _logger: Logger | Console;

  private readonly _options: IOptions;
  private readonly _bridges = new Map<string, ERBridge>();
  private readonly _taskManager = new TaskManager();

  private _status: SessionStatus = SessionStatus.OPENED;
  private _closeTimer?: NodeJS.Timer;

  constructor(options: IOptions) {
    this._options = options;
    this._logger = options.logger || console;
    this._updateStatus(this._status);
  }

  get id(): string {
    return this._options.id;
  }

  get userKey(): number {
    return this._options.userKey;
  }

  get connection(): AConnection {
    return this._options.connection;
  }

  get status(): SessionStatus {
    return this._status;
  }

  get taskManager(): TaskManager {
    return this._taskManager;
  }

  public static async executeERBridge<Result>(uid: string | undefined,
                                              session: Session,
                                              callback: TExecutor<ERBridge, Result>): Promise<Result> {
    if (uid === undefined) {
      return await AConnection.executeTransaction({
        connection: session.connection,
        callback: (transaction) => ERBridge.executeSelf({
          connection: session.connection,
          transaction,
          callback: (erBridge) => callback(erBridge)
        })
      });
    } else {
      const erBridge = session.getBridge(uid);
      if (!erBridge) {
        throw new Error("ERBridge is not found");
      }
      return await callback(erBridge);
    }
  }

  public setCloseTimer(timeout: number = Constants.SERVER.SESSION.TIMEOUT): void {
    this.clearCloseTimer();
    this._logger.info("id#%s is lost and will be closed after %s minutes", this.id, timeout / (60 * 1000));
    this._closeTimer = setTimeout(() => this.close(), timeout);
  }

  public clearCloseTimer(): void {
    if (this._closeTimer) {
      clearTimeout(this._closeTimer);
      this._closeTimer = undefined;
    }
  }

  public async startBridge(options?: ITransactionOptions): Promise<string> {
    const uid = uuidV1().toUpperCase();
    const transaction = await this._options.connection.startTransaction(options);
    const erBridge = new ERBridge(this._options.connection, transaction);
    this._bridges.set(uid, erBridge);
    return uid;
  }

  public async commitBridge(uid: string): Promise<void> {
    const bridge = this._bridges.get(uid);
    if (!bridge) {
      throw new Error("Bridge is not found");
    }
    this._bridges.delete(uid);
    if (!bridge.disposed) {
      await bridge.dispose();
    }
    if (!bridge.transaction.finished) {
      await bridge.transaction.commit();
    }
  }

  public async rollbackBridge(uid: string): Promise<void> {
    const bridge = this._bridges.get(uid);
    if (!bridge) {
      throw new Error("Bridge is not found");
    }
    this._bridges.delete(uid);
    if (!bridge.disposed) {
      await bridge.dispose();
    }
    if (!bridge.transaction.finished) {
      await bridge.transaction.rollback();
    }
  }

  public getBridge(uid: string): ERBridge | undefined {
    return this._bridges.get(uid);
  }

  public close(): void {
    this.clearCloseTimer();
    this._internalClose();

    this._updateStatus(SessionStatus.CLOSED);
  }

  public async forceClose(): Promise<void> {
    this._updateStatus(SessionStatus.FORCE_CLOSING);

    this.clearCloseTimer();
    this._taskManager.find(...Task.PROCESS_STATUSES)
      .filter((task) => task.options.session === this)
      .forEach((task) => task.interrupt());
    this._taskManager.clear();
    for (const key of this._bridges.keys()) {
      await this.rollbackBridge(key);
    }
    await this._options.connection.disconnect();

    this._updateStatus(SessionStatus.FORCE_CLOSED);
  }

  private _internalClose(): void {
    if (this._status === SessionStatus.OPENED) {
      const runningTasks = this._taskManager.find(TaskStatus.RUNNING)
        .filter((task) => task.options.session === this);
      if (runningTasks.length) {
        this._logger.info("id#%s is waiting for task completion", this.id);
        this._taskManager.emitter.once("change", () => this._internalClose());
      } else {
        this.forceClose().catch(this._logger.error);
      }
    }
  }

  private _updateStatus(status: SessionStatus): void {
    if (this._status === status && this._status !== SessionStatus.OPENED) {
      this._logger.error("id#%s already has this status; Status: %s; new Status: %s", this._options.id,
        DBStatus[this._status], DBStatus[status]);
      throw new Error("Session already has this status");
    }
    this._status = status;
    this._logger.info("id#%s is changed; Status: %s", this._options.id, SessionStatus[this._status]);
    this.emitter.emit("change", this);
  }
}
