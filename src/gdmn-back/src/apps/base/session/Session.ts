import {EventEmitter} from "events";
import {AConnection, AConnectionPool, ICommonConnectionPoolOptions, TExecutor} from "gdmn-db";
import {ACursor} from "gdmn-er-bridge";
import {Logger} from "log4js";
import StrictEventEmitter from "strict-event-emitter-types";
import {Constants} from "../../../Constants";
import {ICmd, Task, TaskStatus} from "../task/Task";
import {TaskManager} from "../task/TaskManager";
import {AppAction} from "../Application";
import {v1String} from "uuid/interfaces";

export interface IOptions {
  readonly id: string;
  readonly userKey: number;
  readonly connectionPool: AConnectionPool<ICommonConnectionPoolOptions>;
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

// export const enum TTaskStatus {
//   RUNNING = 1,
//   PAUSED = 2,
//   INTERRUPTED = 3,
//   FAILED = 4,
//   SUCCESS = 5
// }

export interface ISessionInfo {
  database: string;
  id: string;
  user: number;
  transactions?: number;
  sql?: string;
  usesConnections?: number[];
  tasks?: ITask[];
}

export interface ITask {
  id: string;
  status: TaskStatus;
  command?: ICmd<AppAction, any>;
}

interface IUsesConnections {
  waitConnection: Promise<AConnection>;
  uses: number;
}

export class Session {

  get id(): string {
    return this._options.id;
  }

  get userKey(): number {
    return this._options.userKey;
  }

  get taskManager(): TaskManager {
    return this._taskManager;
  }

  get options(): IOptions {
    return this._options;
  }

  get usesConnections(): IUsesConnections[] {
    return this._usesConnections;
  }

  get status(): SessionStatus {
    return this._status;
  }

  get cursorsPromises(): Map<string, Promise<ACursor>> {
    return this._cursorsPromises;
  }

  public static readonly DONE_SESSION_STATUSES = [
    SessionStatus.CLOSED,
    SessionStatus.FORCE_CLOSING,
    SessionStatus.FORCE_CLOSED
  ];

  public readonly emitter: StrictEventEmitter<EventEmitter, ISessionEvents> = new EventEmitter();
  protected readonly _logger: Logger | Console;

  private readonly _options: IOptions;
  private readonly _taskManager = new TaskManager();
  private readonly _usesConnections: IUsesConnections[] = [];
  private readonly _cursorsPromises = new Map<string, Promise<ACursor>>();
  private _closeTimer?: NodeJS.Timer;
  private _status: SessionStatus = SessionStatus.OPENED;

  constructor(options: IOptions) {
    this._options = options;
    this._logger = options.logger || console;
    this._updateStatus(this._status);
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

  public async executeConnection<R>(callback: TExecutor<AConnection, R>): Promise<R> {
    let usesConnection: IUsesConnections;
    if (this._usesConnections.length < Constants.SERVER.SESSION.MAX_CONNECTIONS) {
      usesConnection = {waitConnection: this._options.connectionPool.get(), uses: 0};
      this._usesConnections.push(usesConnection);
      this._logger.info("id#%s acquire connection; Total count acquired connection: %s", this.id,
        this._usesConnections.length);

    } else {
      const minUses = Math.min(...this._usesConnections.map(({uses}) => uses));
      const minUsesConnection = this._usesConnections.find(({uses}) => uses === minUses);
      if (!minUsesConnection) {
        throw new Error("minUsesConnection is undefined");
      }
      usesConnection = minUsesConnection;
    }

    return await this._executeConnection(usesConnection, callback);
  }

  public async forceClose(): Promise<void> {
    this._updateStatus(SessionStatus.FORCE_CLOSING);

    this.clearCloseTimer();
    const waitPromises = this._taskManager.find(this)
      .map((task) => {
        if (!Task.DONE_STATUSES.includes(task.status)) {
          task.interrupt();
        }
        return task.waitExecution();
      });
    await Promise.all(waitPromises);

    if (this._cursorsPromises.size) {
      this._logger.warn("id#%s has opened cursors, they will be closed", this.id);
      for (const waitCursor of this._cursorsPromises.values()) {
        const cursor = await waitCursor;
        if (cursor.closed) {
          await cursor.close();
        }
      }
      this._cursorsPromises.clear();
    }

    this._taskManager.clear();

    this._updateStatus(SessionStatus.FORCE_CLOSED);
  }

  private async _executeConnection<R>(usesConnection: IUsesConnections,
                                      callback: TExecutor<AConnection, R>): Promise<R> {
    usesConnection.uses++;

    let connection: AConnection | undefined;
    try {
      connection = await usesConnection.waitConnection;
      return await callback(connection);

    } finally {
      usesConnection.uses--;

      if (!usesConnection.uses) {
        const index = this._usesConnections.indexOf(usesConnection);
        if (index >= 0) {
          this._usesConnections.splice(index, 1);
        }
        this._logger.info("id#%s release connection; Total count acquired connection: %s", this.id,
          this._usesConnections.length);

        if (connection && connection.connected) {
          await connection.disconnect();
        }
      }
    }
  }

  private _internalClose(): void {
    if (this._status === SessionStatus.OPENED) {
      const limitedRunningTasks = this._taskManager.find(TaskStatus.RUNNING)
        .filter((task) => !task.options.unlimited)
        .filter((task) => task.options.session === this);
      if (limitedRunningTasks.length) {
        this._logger.info("id#%s is waiting for task completion", this.id);
        const waitPromises = limitedRunningTasks.map((task) => task.waitExecution());
        Promise.all(waitPromises).then(() => this._internalClose()).catch(this._logger.error);
      } else {
        this.forceClose().catch(this._logger.error);
      }
    }
  }

  private _updateStatus(status: SessionStatus): void {
    if (this._status === status && this._status !== SessionStatus.OPENED) {
      this._logger.error("id#%s already has this status; Status: %s; new Status: %s", this._options.id,
        SessionStatus[this._status], SessionStatus[status]);
      throw new Error("Session already has this status");
    }
    this._status = status;
    this._logger.info("id#%s is changed; Status: %s", this._options.id, SessionStatus[this._status]);
    this.emitter.emit("change", this);
  }
}
