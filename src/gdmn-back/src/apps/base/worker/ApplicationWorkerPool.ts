import {IBaseExecuteOptions, ICommonConnectionPoolOptions} from "gdmn-db";
import {createPool, Pool} from "generic-pool";
import {IDBDetail} from "../ADatabase";
import {ApplicationWorker} from "./ApplicationWorker";

export interface IExecuteAcquireWorkerOptions<R> extends IBaseExecuteOptions<ApplicationWorker, R> {
  pool: ApplicationWorkerPool;
}

export class ApplicationWorkerPool {

  private _workerPool?: Pool<ApplicationWorker>;

  get created(): boolean {
    return Boolean(this._workerPool);
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
    if (this._workerPool) {
      throw new Error("Process worker pool already created");
    }

    this._workerPool = createPool({
      create: async () => {
        if (!this._workerPool) {
          throw new Error("This error should never been happen");
        }

        const proxy = new ApplicationWorker();
        proxy.create(dbDetail);
        return proxy;
      },
      destroy: async (proxy) => {
        proxy.destroy();
        return undefined;
      },
      validate: async (proxy) => proxy.created
    }, {...options, autostart: false, testOnBorrow: true});
    this._workerPool.addListener("factoryCreateError", console.error);
    this._workerPool.addListener("factoryDestroyError", console.error);

    this._workerPool.start();
  }

  public async destroy(): Promise<void> {
    if (!this._workerPool) {
      throw new Error("Process worker pool need created");
    }

    // destroy all borrowed workers
    const workers = Array.from((this._workerPool as any)._allObjects).map((item: any) => item.obj);
    const createdWorkers = workers.filter((worker: ApplicationWorker) => this._workerPool!.isBorrowedResource(worker));
    if (createdWorkers.length) {
      console.warn("Not all workers killed, they will be killed");
      const promises = createdWorkers.map((worker: ApplicationWorker) => this._workerPool!.release(worker));
      await Promise.all(promises);
    }

    await this._workerPool.drain();

    // workaround; Wait until quantity minimum workers is established
    await Promise.all(Array.from((this._workerPool as any)._factoryCreateOperations)
      .map((promise: any) => promise.then(null, null)));

    await this._workerPool.clear();
    this._workerPool.removeListener("factoryCreateError", console.error);
    this._workerPool.removeListener("factoryDestroyError", console.error);
    this._workerPool = undefined;
  }

  public async acquire(): Promise<ApplicationWorker> {
    if (!this._workerPool) {
      throw new Error("Process worker pool need created");
    }

    return await this._workerPool.acquire();
  }

  public async release(worker: ApplicationWorker): Promise<void> {
    if (!this._workerPool) {
      throw new Error("Process worker pool need created");
    }

    await this._workerPool.release(worker);
  }
}
