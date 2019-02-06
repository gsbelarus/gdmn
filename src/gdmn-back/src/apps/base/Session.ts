import {EventEmitter} from "events";
import {Semaphore} from "gdmn-internals";
import {Logger} from "log4js";
import StrictEventEmitter from "strict-event-emitter-types";
import {Constants} from "../../Constants";
import {DBStatus} from "./ADatabase";
import {Task, TaskStatus} from "./task/Task";
import {TaskManager} from "./task/TaskManager";

export interface IOptions {
  readonly id: string;
  readonly userKey: number;
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
  private readonly _taskManager = new TaskManager();

  private _connectionsLock = new Semaphore(Constants.SERVER.SESSION.MAX_CONNECTIONS);
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

  get status(): SessionStatus {
    return this._status;
  }

  get taskManager(): TaskManager {
    return this._taskManager;
  }

  public async lockConnection(): Promise<void> {
    await this._connectionsLock.acquire();
  }

  public unlockConnection(): void {
    this._connectionsLock.release();
  }

  public connectionsExists(): boolean {
    return this._connectionsLock.permits !== 0;
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

  public close(): void {
    this.clearCloseTimer();
    this._internalClose();

    this._updateStatus(SessionStatus.CLOSED);
  }

  public async forceClose(): Promise<void> {
    this._updateStatus(SessionStatus.FORCE_CLOSING);

    this.clearCloseTimer();
    const waitPromises = this._taskManager.find(...Task.PROCESS_STATUSES)
      .filter((task) => task.options.session === this)
      .map((task) => {
        task.interrupt();
        return task.waitExecution();
      });
    await Promise.all(waitPromises);
    this._taskManager.clear();

    this._updateStatus(SessionStatus.FORCE_CLOSED);
  }

  private _internalClose(): void {
    if (this._status === SessionStatus.OPENED) {
      const runningTasks = this._taskManager.find(TaskStatus.RUNNING)
        .filter((task) => task.options.session === this);
      if (runningTasks.length) {
        this._logger.info("id#%s is waiting for task completion", this.id);
        const waitPromises = runningTasks.map((task) => task.waitExecution());
        Promise.all(waitPromises).then(() => this._internalClose()).catch(this._logger.error);
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
