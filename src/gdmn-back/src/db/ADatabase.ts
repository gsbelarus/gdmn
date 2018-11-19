import {EventEmitter} from "events";
import {
  AConnection,
  AConnectionPool,
  ADriver,
  ICommonConnectionPoolOptions,
  IConnectionOptions,
  TExecutor
} from "gdmn-db";
import {Logger} from "log4js";
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

  protected readonly _logger: Logger;

  private _status: DBStatus = DBStatus.IDLE;

  protected constructor(dbDetail: IDBDetail, logger: Logger) {
    this.dbDetail = dbDetail;
    this.connectionPool = dbDetail.driver.newCommonConnectionPool();
    this._logger = logger;
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
      if (error.message.includes("No such file or directory")) {
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
    await this.waitProcess();

    if (this._status === DBStatus.CONNECTED) {
      this._logger.error("Database already created");
      throw new Error("Database already created");
    }

    this._status = DBStatus.CREATING;
    this.emitter.emit("change", this);

    const {driver, connectionOptions, poolOptions}: IDBDetail = this.dbDetail;
    const {host, port, path} = connectionOptions;
    this._logger.info("Creating '%s:%s/%s'", host, port, path);

    try {
      const connection = driver.newConnection();
      await connection.createDatabase(connectionOptions);
      await connection.disconnect();
      await this.connectionPool.create(connectionOptions, poolOptions);
      await this._onCreate();

      this._status = DBStatus.CONNECTED;
      this.emitter.emit("change", this);
      this._logger.info("Created '%s:%s/%s'", host, port, path);

    } catch (error) {
      if (this.connectionPool.created) {
        await this.connectionPool.destroy();
      }
      this._status = DBStatus.IDLE;
      this.emitter.emit("change", this);
      throw error;
    }
  }

  public async delete(): Promise<void> {
    await this.waitProcess();

    if (this._status === DBStatus.CONNECTED) {
      this._logger.info("Database is connected");
      await this.disconnect();
    }
    this._status = DBStatus.DELETING;
    this.emitter.emit("change", this);

    const {driver, connectionOptions}: IDBDetail = this.dbDetail;
    const {host, port, path} = connectionOptions;
    this._logger.info("Deleting '%s:%s/%s'", host, port, path);

    try {
      await this._onDelete();
      const connection = driver.newConnection();
      await connection.connect(connectionOptions);
      await connection.dropDatabase();

      this._logger.info("Deleted '%s:%s/%s'", host, port, path);
    } finally {
      this._status = DBStatus.IDLE;
      this.emitter.emit("change", this);
    }
  }

  public async connect(): Promise<void> {
    await this.waitProcess();

    if (this._status === DBStatus.CONNECTED) {
      this._logger.error("Database already connected");
      throw new Error("Database already connected");
    }
    this._status = DBStatus.CONNECTING;
    this.emitter.emit("change", this);

    const {connectionOptions, poolOptions}: IDBDetail = this.dbDetail;
    const {host, port, path} = connectionOptions;
    this._logger.info("Connecting '%s:%s/%s'", host, port, path);

    try {
      await this.connectionPool.create(connectionOptions, poolOptions);
      await this._onConnect();

      this._status = DBStatus.CONNECTED;
      this.emitter.emit("change", this);
      this._logger.info("Connected '%s:%s/%s'", connectionOptions.host, connectionOptions.port, connectionOptions.path);

    } catch (error) {
      if (this.connectionPool.created) {
        await this.connectionPool.destroy();
      }
      this._status = DBStatus.IDLE;
      this.emitter.emit("change", this);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    await this.waitProcess();

    if (this._status !== DBStatus.CONNECTED) {
      this._logger.error("Database is not connected");
      throw new Error("Database is not connected");
    }
    this._status = DBStatus.DISCONNECTING;
    this.emitter.emit("change", this);

    const {connectionOptions}: IDBDetail = this.dbDetail;
    const {host, port, path} = connectionOptions;
    this._logger.info("Disconnecting '%s:%s/%s'", host, port, path);

    try {
      await this._onDisconnect();
      await this.connectionPool.destroy();

      this._logger.info("Disconnected '%s:%s/%s'", host, port, path);

    } finally {
      if (this.connectionPool.created) {
        await this.connectionPool.destroy();
      }
      this._status = DBStatus.IDLE;
      this.emitter.emit("change", this);
    }
  }

  public async executeConnection<R>(callback: TExecutor<AConnection, R>): Promise<R> {
    await this.waitProcess();

    return await this._executeConnection(callback);
  }

  public async waitProcess(): Promise<void> {
    if (ADatabase.PROCESS_STATUSES.includes(this._status)) {
      await new Promise((resolve) => this.emitter.once("change", resolve));
      await this.waitProcess();
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
}
