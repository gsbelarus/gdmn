import config from "config";
import {EventEmitter} from "events";
import {IConnection, ITransaction} from "gdmn-orm";
import {Logger} from "log4js";
import StrictEventEmitter from "strict-event-emitter-types";
import {v1 as uuidV1} from "uuid";
import {TaskStatus} from "./task/Task";
import {TaskManager} from "./task/TaskManager";

export interface IOptions {
  readonly id: string;
  readonly userKey: number;
  readonly connection: IConnection;
  readonly logger?: Logger;
}

export interface ISessionEvents {
  close: (session: Session) => void;
  forceClose: (session: Session) => void;
  forceClosed: (session: Session) => void;
}

export class Session {

  private static DEFAULT_TIMEOUT: number = config.get("server.session.timeout");

  public readonly emitter: StrictEventEmitter<EventEmitter, ISessionEvents> = new EventEmitter();
  protected readonly _logger: Logger | Console;

  private readonly _options: IOptions;
  private readonly _transactions = new Map<string, ITransaction>();
  private readonly _taskManager = new TaskManager();

  private _closed: boolean = false;
  private _forceClosed: boolean = false;
  private _timer?: NodeJS.Timer;

  constructor(options: IOptions) {
    this._options = options;
    this._logger = options.logger || console;
    this._logger.info("id#%s is opened", this.id);
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

  get closed(): boolean {
    return this._closed || this._forceClosed;
  }

  get active(): boolean {
    return this._options.connection.connected && !this._forceClosed;
  }

  get taskManager(): TaskManager {
    return this._taskManager;
  }

  public setCloseTimeout(timeout: number = Session.DEFAULT_TIMEOUT): void {
    this.clearCloseTimeout();
    this._logger.info("id#%s is lost and will be closed after %s minutes", this.id, timeout / (60 * 1000));
    this._timer = setTimeout(() => this.close(), timeout);
  }

  public clearCloseTimeout(): void {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = undefined;
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
    if (this._closed || this._forceClosed) {
      this._logger.error("id#%s already closed", this.id);
      throw new Error(`Session (id#${this.id}) already closed`);
    }
    this.clearCloseTimeout();
    this._closed = true;
    this.emitter.emit("close", this);

    this._internalClose();
    this._logger.info("id#%s is closed", this.id);
  }

  public async forceClose(): Promise<void> {
    if (this._forceClosed) {
      this._logger.error("id#%s already force closed", this.id);
      throw new Error(`Session (id#${this.id}) already force closed`);
    }
    this.clearCloseTimeout();
    this._forceClosed = true;
    this.emitter.emit("forceClose", this);
    this._logger.info("id#%s force close", this.id);

    this._taskManager.find(TaskStatus.IDLE, TaskStatus.RUNNING, TaskStatus.PAUSED)
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
    this.emitter.emit("forceClosed", this);
    this._logger.info("id#%s is force closed", this.id);
  }

  private _internalClose(): void {
    if (this._closed) {
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
}
