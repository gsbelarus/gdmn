import {EventEmitter} from "events";
import {ERModel} from "gdmn-orm";
import {Logger} from "log4js";
import StrictEventEmitter from "strict-event-emitter-types";
import {v1 as uuidV1} from "uuid";
import {Session, SessionStatus} from "./Session";
import {Level, TaskStatus} from "./task/Task";

export interface ISessionManagerEvents {
  change: (session: Session) => void;
}

export class SessionManager {

  public readonly emitter: StrictEventEmitter<EventEmitter, ISessionManagerEvents> = new EventEmitter();

  private readonly _erModel: ERModel;
  private readonly _logger?: Logger;
  private readonly _sessions: Session[] = [];

  constructor(erModel: ERModel, logger?: Logger) {
    this._erModel = erModel;
    this._logger = logger;
  }

  public includes(session: Session): boolean {
    return this._sessions.includes(session);
  }

  public size(): number {
    return this._sessions.length;
  }

  public async open(userKey: number): Promise<Session> {
    const uid = uuidV1().toUpperCase();
    const session = new Session({
      id: uid,
      userKey,
      connection: await this._erModel.createConnection(),
      logger: this._logger
    });
    session.emitter.on("change", (s) => {
      this.emitter.emit("change", s);

      switch (s.status) {
        case SessionStatus.OPENED:
          break;
        case SessionStatus.CLOSED:
          this._sessions.splice(this._sessions.indexOf(s), 1);
          break;
        case SessionStatus.FORCE_CLOSING:
          this._sessions.splice(this._sessions.indexOf(s), 1);
          break;
        case SessionStatus.FORCE_CLOSED:
          break;
        default:
          throw new Error("Unknown session status");
      }
    });
    this._sessions.push(session);
    // TODO
    // this.emitter.emit("change", session);

    this.syncTasks();
    return session;
  }

  public find(userKey: number): Session[];
  public find(session: string, userKey: number): Session | undefined;
  public find(param1: string | number, param2?: number): Session[] | Session | undefined {
    switch (typeof param1) {
      case "string":
        return this._sessions.find((session) => session.id === param1 && session.userKey === param2);
      case "number":
        return this._sessions.filter((session) => session.userKey === param1);
      default:
        throw new Error("Invalid arguments");
    }
  }

  public syncTasks(): void {
    this._sessions.forEach((session) => {
      session.taskManager
        .find(TaskStatus.IDLE, TaskStatus.RUNNING, TaskStatus.PAUSED)
        .forEach((task) => {
          switch (task.options.level) {
            case Level.APPLICATION: {
              this._sessions.forEach((s) => {
                if (!s.taskManager.has(task)) {
                  s.taskManager.add(task);
                  if (this._logger) {
                    this._logger.info("id#%s was be sync (task id#%s)", s.id, task.id);
                  }
                }
              });
              break;
            }
            case Level.USER: {
              const userSessions = this.find(task.options.session.userKey);
              userSessions.forEach((s) => {
                if (!s.taskManager.has(task)) {
                  s.taskManager.add(task);
                  if (this._logger) {
                    this._logger.info("id#%s was be sync (task id#%s)", s.id, task.id);
                  }
                }
              });
              return task;
            }
            case Level.SESSION:
            default:
              break;
          }
        });
    });
  }

  public async forceCloseAll(): Promise<void> {
    const promise = this._sessions.map((session) => session.forceClose());
    await Promise.all(promise);
  }
}
