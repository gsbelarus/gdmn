import config from "config";
import {EventEmitter} from "events";
import {IConnection, ITransaction} from "gdmn-orm";
import {Logger} from "log4js";
import ms from "ms";
import StrictEventEmitter from "strict-event-emitter-types";
import {v1 as uuidV1} from "uuid";
import {DBStatus} from "../../db/ADatabase";
import {Task, TaskStatus} from "./task/Task";
import {TaskManager} from "./task/TaskManager";

export interface IOptions {
  readonly id: string;
  readonly userKey: number;
  readonly connection: IConnection;
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

  private static DEFAULT_TIMEOUT = ms(config.get("server.session.timeout") as string);

  public readonly emitter: StrictEventEmitter<EventEmitter, ISessionEvents> = new EventEmitter();
  protected readonly _logger: Logger | Console;

  private readonly _options: IOptions;
  private readonly _transactions = new Map<string, ITransaction>();
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

  get connection(): IConnection {
    return this._options.connection;
  }

  get status(): SessionStatus {
    return this._status;
  }

  get active(): boolean {
    return this._options.connection.connected;
  }

  get taskManager(): TaskManager {
    return this._taskManager;
  }

  public setCloseTimer(timeout: number = Session.DEFAULT_TIMEOUT): void {
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

  public addTransaction(transaction: ITransaction): string {
    const uid = uuidV1().toUpperCase();
    this._transactions.set(uid, transaction);
    return uid;
  }

  public getTransaction(uid: string): ITransaction | undefined {
    return uid !== undefined ? this._transactions.get(uid) : undefined;
  }

  public removeTransaction(uid: string): boolean {
    return this._transactions.delete(uid);
  }

  public close(): void {
    this._updateStatus(SessionStatus.CLOSED);

    this.clearCloseTimer();
    this._internalClose();
  }

  public async forceClose(): Promise<void> {
    this._updateStatus(SessionStatus.FORCE_CLOSING);

    this.clearCloseTimer();
    this._taskManager.find(...Task.PROCESS_STATUSES)
      .filter((task) => task.options.session === this)
      .forEach((task) => task.interrupt());
    this._taskManager.clear();
    for (const [key, transaction] of this._transactions) {
      if (!transaction.finished) {
        await transaction.rollback();
        this._logger.info("id#%s transaction (id#%s) was rolled back", this.id, key);
      }
      this._transactions.delete(key);
    }
    await this._options.connection.disconnect();
    this.emitter.removeAllListeners();

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
