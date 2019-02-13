import {EventEmitter} from "events";
import {Semaphore} from "gdmn-internals";
import {Logger} from "log4js";
import StrictEventEmitter from "strict-event-emitter-types";
import {v1 as uuidV1} from "uuid";
import {Constants} from "../../../Constants";
import {Session} from "../session/Session";
import {IProgressOptions, Progress} from "./Progress";

export enum TaskStatus {
  IDLE,
  RUNNING,
  PAUSED,

  INTERRUPTED,
  FAILED,
  SUCCESS
}

export enum Level {
  SESSION, USER, APPLICATION
}

export type StatusChecker = () => Promise<void | never>;

export interface IContext<Cmd extends ICmd<any>> {
  command: Cmd;
  session: Session;
  checkStatus: StatusChecker;
  progress: Progress;
}

export type TaskWorker<Cmd extends ICmd<any>, Result> = (context: IContext<Cmd>) => Result | Promise<Result>;

export interface ICmd<A, P = any> {
  readonly id?: string;
  readonly action: A;
  readonly payload: P;
}

export interface IOptions<Cmd extends ICmd<any>, Result> {
  readonly command: Cmd;
  readonly session: Session;
  readonly level: Level;
  readonly logger?: Logger;
  readonly progress?: IProgressOptions;
  readonly worker: TaskWorker<Cmd, Result>;
}

export interface ITaskLog {
  date: Date;
  status: TaskStatus;
}

export interface ITaskEvents<Cmd extends ICmd<any>, Result> {
  change: (task: Task<Cmd, Result>) => void;
  progress: (task: Task<Cmd, Result>) => void;
}

export class Task<Cmd extends ICmd<any>, Result> {

  public static readonly STATUSES = [
    TaskStatus.IDLE,
    TaskStatus.RUNNING,
    TaskStatus.PAUSED,
    TaskStatus.INTERRUPTED,
    TaskStatus.FAILED,
    TaskStatus.SUCCESS
  ];
  public static readonly DONE_STATUSES = [
    TaskStatus.INTERRUPTED,
    TaskStatus.FAILED,
    TaskStatus.SUCCESS
  ];
  public static readonly PROCESS_STATUSES = Task.STATUSES.filter((status) => !Task.DONE_STATUSES.includes(status));

  public readonly emitter: StrictEventEmitter<EventEmitter, ITaskEvents<Cmd, Result>> = new EventEmitter();

  protected readonly _logger: Logger | Console;

  private readonly _id: string;
  private readonly _options: IOptions<Cmd, Result>;
  private readonly _progress: Progress;
  private readonly _log: ITaskLog[] = [];

  private _processLock = new Semaphore();
  private _status: TaskStatus = TaskStatus.IDLE;
  private _result?: Result;
  private _error?: Error;
  private _timer?: NodeJS.Timer;

  constructor(options: IOptions<Cmd, Result>) {
    this._id = uuidV1().toUpperCase();
    this._options = options;
    this._logger = options.logger || console;
    this._progress = new Progress(options.progress);
    this._progress.emitter.on("change", () => {
      // this._logger.info("id#%s in progress; Value: %s; Description: %s", this._id, this._progress.value,
      //   this._progress.description);
      if (this.status === TaskStatus.RUNNING) {
        this.emitter.emit("progress", this);
      }
    });
    this._updateStatus(this._status);
  }

  get id(): string {
    return this._id;
  }

  get options(): IOptions<Cmd, Result> {
    return this._options;
  }

  get progress(): Progress {
    return this._progress;
  }

  get status(): TaskStatus {
    return this._status;
  }

  get log(): ITaskLog[] {
    return this._log;
  }

  get result(): Result | undefined {
    return this._result;
  }

  get error(): Error | undefined {
    return this._error;
  }

  public interrupt(): void {
    this._updateStatus(TaskStatus.INTERRUPTED);
  }

  public pause(): void {
    this._updateStatus(TaskStatus.PAUSED);
  }

  public resume(): void {
    this._updateStatus(TaskStatus.RUNNING);
  }

  public getDate(status: TaskStatus): Date | undefined {
    const event = this._log.find((e) => e.status === status);
    if (event) {
      return event.date;
    }
  }

  public execute(): void {
    if (this._status !== TaskStatus.IDLE) {
      this._logger.error("id#%s mast has %s status, but he has %s", this._id, TaskStatus[TaskStatus.IDLE],
        TaskStatus[this._status]);
      throw new Error(`Task mast has ${TaskStatus[TaskStatus.IDLE]} status, but he has ${TaskStatus[this._status]}`);
    }

    this._processLock.acquire()
      .then(() => this._updateStatus(TaskStatus.RUNNING))
      .then(() => this._checkStatus())
      .then(() => this._options.worker({
        command: this.options.command,
        session: this._options.session,
        checkStatus: this._checkStatus.bind(this),
        progress: this._progress
      }))
      .then((result) => {
        this._result = result;
        this._updateStatus(TaskStatus.SUCCESS);
      })
      .catch((error) => {
        this._logger.warn("id#%s throw error; %s", this._id, error);
        if (this._status !== TaskStatus.INTERRUPTED) {
          this._error = error;
          this._updateStatus(TaskStatus.FAILED);
        }
      })
      .finally(() => this._processLock.release());
  }

  public async waitExecution(): Promise<void> {
    if (!this._processLock.permits) {
      await this._processLock.acquire();
      this._processLock.release();
    }
  }

  private _updateStatus(status: TaskStatus): void {
    if (Task.DONE_STATUSES.includes(this._status)) {
      this._logger.error("id#%s was finished", this._id);
      throw new Error("Task was finished");
    }
    this._status = status;
    this._log.push({
      date: new Date(),
      status: this._status
    });
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = undefined;
    }
    if (this._status === TaskStatus.RUNNING) {
      this._timer = setTimeout(() => this.interrupt(), Constants.SERVER.TASK.TIMEOUT);
    }
    // this._logger.info("id#%s is changed; Action: %s; Status: %s", this._id, this._options.command.action,
    //   TaskStatus[this._status]);
    this.emitter.emit("change", this);
  }

  private async _checkStatus(): Promise<void | never> {
    switch (this._status) {
      case TaskStatus.PAUSED:
        await new Promise((resolve) => this.emitter.once("change", resolve));
        await this._checkStatus();
        break;
      case TaskStatus.INTERRUPTED:
        throw new Error("Task was interrupted");
      case TaskStatus.SUCCESS:
        this._logger.error("Was finished");
        throw new Error("Task was finished");
      case TaskStatus.IDLE:
        this._logger.error("Wasn't started");
        throw new Error("Task wasn't started");
      case TaskStatus.RUNNING:
      default:
        break;
    }
  }
}
