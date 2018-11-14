import {EventEmitter} from "events";
import StrictEventEmitter from "strict-event-emitter-types";
import {Session} from "../Session";
import {ICmd, ITaskEvents, Task, TaskStatus} from "./Task";

export interface ITaskManagerEvents extends ITaskEvents<any, any> {
  add: (task: Task<any, any>) => void;
  remove: (task: Task<any, any>) => void;
}

export class TaskManager {

  public readonly emitter: StrictEventEmitter<EventEmitter, ITaskManagerEvents> = new EventEmitter();

  private readonly _tasks = new Set<Task<any, any>>();

  private readonly _onChangeTask: ITaskEvents<any, any>["change"];
  private readonly _onProgressTask: ITaskEvents<any, any>["progress"];

  constructor() {
    this._onChangeTask = (task: Task<any, any>) => this.emitter.emit("change", task);
    this._onProgressTask = (task: Task<any, any>) => this.emitter.emit("progress", task);
  }

  public has(task: Task<any, any>): boolean {
    return this._tasks.has(task);
  }

  public add<Cmd extends ICmd<any>, Result>(task: Task<Cmd, Result>): Task<Cmd, Result> {
    if (this._tasks.has(task)) {
      this.remove(task);
    }
    this._tasks.add(task);
    this.emitter.emit("add", task);
    task.emitter.addListener("change", this._onChangeTask);
    task.emitter.addListener("progress", this._onProgressTask);
    return task;
  }

  public remove(task: Task<any, any>): void {
    if (!this._tasks.has(task)) {
      throw new Error("Task not found");
    }
    task.emitter.removeListener("progress", this._onProgressTask);
    task.emitter.removeListener("change", this._onChangeTask);
    this.emitter.emit("remove", task);
    this._tasks.delete(task);
  }

  public find<Cmd extends ICmd<any>, Result>(uid: string): Task<Cmd, Result> | undefined;
  public find<Cmd extends ICmd<any>, Result>(session: Session): Array<Task<Cmd, Result>>;
  public find<Cmd extends ICmd<any>, Result>(...status: TaskStatus[]): Array<Task<Cmd, Result>>;
  public find(...source: any[]): any {
    if (source[0] instanceof Session) {
      const filter = [];
      for (const task of this._tasks) {
        if (source[0] === task.options.session) {
          filter.push(task);
        }
      }
      return filter;
    } else if (typeof source[0] === "string") {
      for (const task of this._tasks) {
        if (task.id === source[0]) {
          return task;
        }
      }
      return undefined;
    } else {
      const filter = [];
      for (const task of this._tasks) {
        if (source.includes(task.status)) {
          filter.push(task);
        }
      }
      return filter;
    }
  }

  public size(): number {
    return this._tasks.size;
  }

  public getAll(): Set<Task<any, any>> {
    return this._tasks;
  }

  public clear(): void {
    this._tasks.forEach((task) => this.remove(task));
  }
}
