import {EventEmitter} from "events";
import {AConnectionPool, ICommonConnectionPoolOptions} from "gdmn-db";
import {Logger} from "log4js";
import StrictEventEmitter from "strict-event-emitter-types";
import {v1 as uuidV1} from "uuid";
import {Level, TaskStatus} from "../task/Task";
import {Session, SessionStatus} from "./Session";

export interface ISessionManagerEvents {
  change: (session: Session) => void;
}

export class SessionManager {

  public readonly emitter: StrictEventEmitter<EventEmitter, ISessionManagerEvents> = new EventEmitter();

  private readonly _logger?: Logger;
  private readonly _connectionPool: AConnectionPool<ICommonConnectionPoolOptions>;
  private readonly _sessions: Session[] = [];

  constructor(connectionPool: AConnectionPool<ICommonConnectionPoolOptions>, logger?: Logger) {
    this._connectionPool = connectionPool;
    this._logger = logger;
  }

  public includes(session: Session): boolean {
    return this._sessions.includes(session);
  }

  public size(): number {
    return this._sessions.length;
  }

  get sessions(): Session[] {
    return this._sessions;
  }

  public async open(userKey: number): Promise<Session> {
    const uid = uuidV1().toUpperCase();
    const session = new Session({
      id: uid,
      userKey,
      connectionPool: this._connectionPool,
      logger: this._logger
    });

    const callback = (s: Session) => {
      this.emitter.emit("change", s);

      switch (s.status) {
        case SessionStatus.OPENED:
          break;
        case SessionStatus.CLOSED:
        case SessionStatus.FORCE_CLOSING:
          const index = this._sessions.indexOf(s);
          if (index >= 0) {
            this._sessions.splice(index, 1);
          }
          break;
        case SessionStatus.FORCE_CLOSED:
          s.emitter.removeListener("change", callback);
          break;
        default:
          throw new Error("Unknown session status");
      }
    };
    session.emitter.on("change", callback);

    this._sessions.push(session);
    this.emitter.emit("change", session);

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
