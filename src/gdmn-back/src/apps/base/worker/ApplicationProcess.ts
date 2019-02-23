import childProcess, {ChildProcess} from "child_process";
import {Factory} from "gdmn-db";
import process from "process";
import {IDBDetail} from "../ADatabase";
import {AppCommandProvider} from "../AppCommandProvider";
import {Application} from "../Application";
import {ICmd, Task, TaskStatus} from "../task/Task";

export interface IAppWorkerRequest {
  userKey: number;
  command: ICmd<any, any>;
}

export interface IAppWorkerResponse<R> {
  command: ICmd<any, any>;
  status: TaskStatus;
  result?: R;
  error?: Error;
}

const ENV_IS_APP_PROCESS = "IS_APP_PROCESS";

export class ApplicationProcess {

  public static isMainProcess = !(ENV_IS_APP_PROCESS in process.env);
  public static isProcess = (ENV_IS_APP_PROCESS in process.env);

  private _process?: ChildProcess;

  get created(): boolean {
    return Boolean(this._process);
  }

  public create(dbDetail: IDBDetail): void {
    if (this._process) {
      throw new Error("Process worker already created");
    }

    const argDBDetail = JSON.stringify({
      ...dbDetail,
      driver: dbDetail.driver.name
    });
    this._process = childProcess.fork(__filename, ["child", argDBDetail], {
      silent: false,
      env: {
        [ENV_IS_APP_PROCESS]: "1"
      }
    });
  }

  public destroy(): void {
    if (!this._process) {
      throw new Error("Process worker need created");
    }

    this._process.kill("SIGINT");
    this._process = undefined;
  }

  public async executeCmd<R>(userKey: number, cmd: ICmd<any, any>): Promise<R> {
    return new Promise((resolve, reject) => {
      if (!this._process) {
        throw new Error("Process worker need created");
      }

      const callback = (data: IAppWorkerResponse<R>) => {
        if (!this._process) {
          throw new Error("Process worker need created");
        }

        if (data && data.command.id === cmd.id) {
          if (Task.DONE_STATUSES.includes(data.status)) {
            switch (data.status) {
              case TaskStatus.SUCCESS:
                return resolve(data.result);
              case TaskStatus.FAILED:
                return reject(data.error);
              case TaskStatus.INTERRUPTED:
                return reject(new Error("Unsupported app process task status"));
            }
          }
        }
      };

      this._process.addListener("message", callback);

      const request: IAppWorkerRequest = {
        userKey,
        command: cmd
      };
      this._process.send(request);
    });
  }
}

if (ApplicationProcess.isProcess) {
  const args = process.argv.slice(2, process.argv.length);
  const dbDetail = JSON.parse(args[1]);
  dbDetail.driver = Factory.getDriver(dbDetail.driver);

  const application = new Application(dbDetail);
  const creating = application.connect();

  process.on("SIGINT", exit);
  process.on("SIGTERM", exit);

  process.addListener("message", messageCallback);

  async function messageCallback(data: IAppWorkerRequest): Promise<void> {
    await creating;
    const session = await application.sessionManager.open(data.userKey);
    try {
      const task = new AppCommandProvider(application).receive(session, data.command);
      task.execute();
      await task.waitDoneStatus();
      const response: IAppWorkerResponse<any> = {
        command: data.command,
        status: task.status,
        result: task.result,
        error: task.error
      };

      process.send!(response);
    } finally {
      await session.forceClose();
    }
  }

  async function exit(): Promise<void> {
    try {
      await creating;

      await application.disconnect();
      process.removeListener("message", messageCallback);
    } catch (error) {
      switch (error.message) {
        case "connection shutdown":
          // ignore
          break;
      }
    } finally {
      process.exit();
    }
  }
}
