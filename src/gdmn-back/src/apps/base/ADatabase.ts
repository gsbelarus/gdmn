import {EventEmitter} from "events";
import {
  AConnection,
  AConnectionPool,
  ADriver,
  ICommonConnectionPoolOptions,
  IConnectionOptions,
  TExecutor
} from "gdmn-db";
import {Semaphore} from "gdmn-internals";
import log4js, {Logger} from "log4js";
import {performance} from "perf_hooks";
import StrictEventEmitter from "strict-event-emitter-types";

export interface IDBDetail<ConnectionOptions extends IConnectionOptions = IConnectionOptions> {
  alias: string;
  driver: ADriver;
  connectionOptions: ConnectionOptions;
  poolOptions: ICommonConnectionPoolOptions;
}

export interface IDBEvents {
  change: (db: ADatabase) => void;
}

export enum DBStatus {
  CREATING,
  DELETING,
  CONNECTING,
  DISCONNECTING,
  CONNECTED,
  IDLE
}

export abstract class ADatabase {

  public static readonly STATUSES = [
    DBStatus.CREATING,
    DBStatus.DELETING,
    DBStatus.CONNECTING,
    DBStatus.DISCONNECTING,
    DBStatus.CONNECTED,
    DBStatus.IDLE
  ];

  public static readonly PROCESS_STATUSES = [
    DBStatus.CREATING,
    DBStatus.DELETING,
    DBStatus.CONNECTING,
    DBStatus.DISCONNECTING
  ];

  public readonly emitter: StrictEventEmitter<EventEmitter, IDBEvents> = new EventEmitter();
  public readonly dbDetail: IDBDetail;
  public readonly connectionPool: AConnectionPool<ICommonConnectionPoolOptions>;

  protected readonly _logger: Logger = log4js.getLogger("database");
  protected readonly _lock = new Semaphore();

  private _status: DBStatus = DBStatus.IDLE;
  private _time = performance.now();

  protected constructor(dbDetail: IDBDetail) {
    this.dbDetail = dbDetail;
    this.connectionPool = dbDetail.driver.newCommonConnectionPool();
    this._updateStatus(this._status);
  }

  get status(): DBStatus {
    return this._status;
  }

  public async createOrConnect(): Promise<void> {
    const testConnection = this.dbDetail.driver.newConnection();
    try {
      await testConnection.connect(this.dbDetail.connectionOptions);
      await this.connect();
    } catch (error) {
      // TODO tmp
      if (error.message.includes("Error while trying to open file")) {
        // || error.message.includes("No such file or directory") // linux || darwin
        // || error.message.includes("The system cannot find the file specified")) { // windows
        await this.create();
      } else {
        throw error;
      }
    } finally {
      if (testConnection.connected) {
        await testConnection.disconnect();
      }
    }
  }

  public async create(): Promise<void> {
    await this._lock.acquire();

    if (this._status === DBStatus.CONNECTED) {
      this._logger.error("Database already created");
      throw new Error("Database already created");
    }

    this._updateStatus(DBStatus.CREATING);

    const {driver, connectionOptions, poolOptions}: IDBDetail = this.dbDetail;
    try {
      const connection = driver.newConnection();
      await connection.createDatabase(connectionOptions);
      await connection.disconnect();
      await this.connectionPool.create(connectionOptions, poolOptions);
      await this._onCreate();

      this._updateStatus(DBStatus.CONNECTED);

    } catch (error) {
      if (this.connectionPool.created) {
        await this.connectionPool.destroy();
      }
      this._updateStatus(DBStatus.IDLE);
      throw error;
    } finally {
      this._lock.release();
    }
  }

  public async delete(): Promise<void> {
    await this._lock.acquire();

    if (this._status === DBStatus.CONNECTED) {
      this._logger.info("Database is connected");
      await this.disconnect();
    }
    this._updateStatus(DBStatus.DELETING);

    const {driver, connectionOptions}: IDBDetail = this.dbDetail;
    try {
      await this._onDelete();
      const connection = driver.newConnection();
      await connection.connect(connectionOptions);
      await connection.dropDatabase();

    } finally {
      this._updateStatus(DBStatus.IDLE);
      this._lock.release();
    }
  }

  public async connect(): Promise<void> {
    await this._lock.acquire();

    if (this._status === DBStatus.CONNECTED) {
      this._logger.error("Database already connected");
      throw new Error("Database already connected");
    }
    this._updateStatus(DBStatus.CONNECTING);

    const {connectionOptions, poolOptions}: IDBDetail = this.dbDetail;
    try {
      await this.connectionPool.create(connectionOptions, poolOptions);
      await this._onConnect();

      this._updateStatus(DBStatus.CONNECTED);

    } catch (error) {
      if (this.connectionPool.created) {
        await this.connectionPool.destroy();
      }
      this._updateStatus(DBStatus.IDLE);
      throw error;
    } finally {
      this._lock.release();
    }
  }

  public async disconnect(): Promise<void> {
    await this._lock.acquire();

    if (this._status !== DBStatus.CONNECTED) {
      this._logger.error("Database is not connected");
      throw new Error("Database is not connected");
    }
    this._updateStatus(DBStatus.DISCONNECTING);

    try {
      await this._onDisconnect();
      await this.connectionPool.destroy();

    } finally {
      if (this.connectionPool.created) {
        await this.connectionPool.destroy();
      }
      this._updateStatus(DBStatus.IDLE);
      await this._lock.release();
    }
  }

  public async executeConnection<R>(callback: TExecutor<AConnection, R>): Promise<R> {
    await this.waitUnlock();

    return await this._executeConnection(callback);
  }

  public async waitUnlock(): Promise<void> {
    if (!this._lock.permits) {
      await this._lock.acquire();
      this._lock.release();
    }
  }

  protected async _executeConnection<R>(callback: TExecutor<AConnection, R>): Promise<R> {
    return await AConnectionPool.executeConnection({
      connectionPool: this.connectionPool,
      callback
    });
  }

  protected async _onCreate(): Promise<void> {
    // empty
  }

  protected async _onDelete(): Promise<void> {
    // empty
  }

  protected async _onConnect(): Promise<void> {
    // empty
  }

  protected async _onDisconnect(): Promise<void> {
    // empty
  }

  private _updateStatus(status: DBStatus): void {
    const {alias, connectionOptions}: IDBDetail = this.dbDetail;
    const {server, path} = connectionOptions;

    if (this._status === status && this._status !== DBStatus.IDLE) {
      if (server) {
        this._logger.info("alias#%s (%s:%s/%s) already has this status; Status: %s; new Status: %s'", alias,
          server.host, server.port, path, DBStatus[this._status], DBStatus[status]);
      } else {
        this._logger.info("alias#%s (%s) already has this status; Status: %s; new Status: %s'", alias, path,
          DBStatus[this._status], DBStatus[status]);
      }
      throw new Error("Database already has this status");
    }

    const now = performance.now();
    const elapsedTime = Math.floor(now - this._time);
    this._time = now;

    this._status = status;
    if (server) {
      this._logger.info("alias#%s (%s:%s/%s) is changed; Status: %s; Time: %s ms", alias, server.host, server.port,
        path, DBStatus[this._status], elapsedTime);
    } else {
      this._logger.info("alias#%s (%s) is changed; Status: %s; Time: %s ms", alias, path, DBStatus[this._status],
        elapsedTime);
    }
    this.emitter.emit("change", this);
  }
}
