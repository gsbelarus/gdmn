import childProcess, {ChildProcess} from "child_process";
import {Factory} from "gdmn-db";
import process from "process";
import {IDBDetail} from "../ADatabase";
import {AppCommandProvider} from "../AppCommandProvider";
import {Application} from "../Application";
import {ICmd, Task} from "../task/Task";

export interface AppWorkerRequest {
  userKey: number;
  command: ICmd<any, any>;
}

export interface AppWorkerResponse<R> {
  command: ICmd<any, any>;
  result: R;
}

export class ApplicationProcess {

  private static _ENV_IS_APP_PROCESS = "IS_APP_PROCESS";

  public static isMainProcess = !(ApplicationProcess._ENV_IS_APP_PROCESS in process.env);
  public static isProcess = (ApplicationProcess._ENV_IS_APP_PROCESS in process.env);

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
        [ApplicationProcess._ENV_IS_APP_PROCESS]: "1"
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

      const callback = (data: AppWorkerResponse<R>) => {
        if (!this._process) {
          throw new Error("Process worker need created");
        }

        if (data && data.command.id === cmd.id) {
          this._process.removeListener("error", reject);
          this._process.removeListener("message", callback);
          resolve(data.result);
        }
      };

      this._process.addListener("error", reject);
      this._process.addListener("message", callback);

      const request: AppWorkerRequest = {
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

  async function messageCallback(data: AppWorkerRequest): Promise<void> {
    await creating;
    const session = await application.sessionManager.open(data.userKey);
    try {
      const response = await new Promise((resolve) => {
        const task = new AppCommandProvider(application).receive(session, data.command);

        const callback = () => {
          if (Task.DONE_STATUSES.includes(task.status)) {
            const response: AppWorkerResponse<any> = {
              command: data.command,
              result: task.result
            };
            task.emitter.removeListener("change", callback);
            resolve(response);
          }
        };
        task.emitter.addListener("change", callback);
        task.execute();
      });
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
