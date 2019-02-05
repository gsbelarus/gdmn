import {IBaseExecuteOptions, ICommonConnectionPoolOptions} from "gdmn-db";
import {createPool, Pool} from "generic-pool";
import {IDBDetail} from "../ADatabase";
import {ApplicationProcess} from "./ApplicationProcess";

export interface IExecuteAcquireWorkerOptions<R> extends IBaseExecuteOptions<ApplicationProcess, R> {
  pool: ApplicationProcessPool;
}

export class ApplicationProcessPool {

  private _processPool?: Pool<ApplicationProcess>;

  get created(): boolean {
    return Boolean(this._processPool);
  }

  public static async executeWorker<R>({pool, callback}: IExecuteAcquireWorkerOptions<R>): Promise<R> {
    const worker = await pool.acquire();
    try {
      return await callback(worker);
    } finally {
      await pool.release(worker);
    }
  }

  public async create(dbDetail: IDBDetail, options: ICommonConnectionPoolOptions): Promise<void> {
    if (this._processPool) {
      throw new Error("Process worker pool already created");
    }

    this._processPool = createPool({
      create: async () => {
        if (!this._processPool) {
          throw new Error("This error should never been happen");
        }

        const process = new ApplicationProcess();
        process.create(dbDetail);
        return process;
      },
      destroy: async (process) => {
        process.destroy();
        return undefined;
      },
      validate: async (proxy) => proxy.created
    }, {...options, autostart: false, testOnBorrow: true});
    this._processPool.addListener("factoryCreateError", console.error);
    this._processPool.addListener("factoryDestroyError", console.error);

    this._processPool.start();
  }

  public async destroy(): Promise<void> {
    if (!this._processPool) {
      throw new Error("Process worker pool need created");
    }

    // destroy all borrowed processes
    const processes = Array.from((this._processPool as any)._allObjects).map((item: any) => item.obj);
    const createdProcesses = processes.filter((process: ApplicationProcess) => this._processPool!.isBorrowedResource(process));
    if (createdProcesses.length) {
      console.warn("Not all processes destroyed, they will be destroyed");
      const promises = createdProcesses.map((process: ApplicationProcess) => this._processPool!.release(process));
      await Promise.all(promises);
    }

    await this._processPool.drain();

    // workaround; Wait until quantity minimum processes is established
    await Promise.all(Array.from((this._processPool as any)._factoryCreateOperations)
      .map((promise: any) => promise.then(null, null)));

    await this._processPool.clear();
    this._processPool.removeListener("factoryCreateError", console.error);
    this._processPool.removeListener("factoryDestroyError", console.error);
    this._processPool = undefined;
  }

  public async acquire(): Promise<ApplicationProcess> {
    if (!this._processPool) {
      throw new Error("Process worker pool need created");
    }

    return await this._processPool.acquire();
  }

  public async release(worker: ApplicationProcess): Promise<void> {
    if (!this._processPool) {
      throw new Error("Process worker pool need created");
    }

    await this._processPool.release(worker);
  }
}
