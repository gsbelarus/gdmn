import {
  AConnection,
  AConnectionPool,
  ADriver,
  ICommonConnectionPoolOptions,
  IConnectionOptions,
  TExecutor
} from "gdmn-db";
import {Logger} from "log4js";

export interface IDBDetail<ConnectionOptions extends IConnectionOptions = IConnectionOptions> {
  alias: string;
  driver: ADriver;
  connectionOptions: ConnectionOptions;
  poolOptions: ICommonConnectionPoolOptions;
}

export abstract class ADatabase {

  protected readonly _logger: Logger;

  private readonly _dbDetail: IDBDetail;
  private readonly _connectionPool: AConnectionPool<ICommonConnectionPoolOptions>;

  private _isBusy: boolean = false;

  protected constructor(dbDetail: IDBDetail, logger: Logger) {
    this._dbDetail = dbDetail;
    this._logger = logger;
    this._connectionPool = dbDetail.driver.newCommonConnectionPool();
  }

  get busy(): boolean {
    return this._isBusy;
  }

  get dbDetail(): IDBDetail {
    return this._dbDetail;
  }

  get connectionPool(): AConnectionPool<ICommonConnectionPoolOptions> {
    return this._connectionPool;
  }

  get connected(): boolean {
    return this._connectionPool.created;
  }

  public async createOrConnect(): Promise<void> {
    try {
      await this.create();
    } catch (error) {
      if (error.message.includes("File exists")) {
        this._logger.info("Already created");
        await this.connect();
      }
    }
  }

  public async create(): Promise<void> {
    this._checkBusy();

    this._isBusy = true;
    try {
      if (this._connectionPool.created) {
        this._logger.error("Database already created");
        throw new Error("Database already created");
      }
      const {driver, connectionOptions, poolOptions}: IDBDetail = this._dbDetail;
      this._logger.info("Creating '%s:%s/%s'", connectionOptions.host, connectionOptions.port, connectionOptions.path);
      const connection = driver.newConnection();
      await connection.createDatabase(connectionOptions);
      await this._connectionPool.create(connectionOptions, poolOptions);
      await this._onCreate(connection);
      await connection.disconnect();
      this._logger.info("Created '%s:%s/%s'", connectionOptions.host, connectionOptions.port, connectionOptions.path);
    } finally {
      this._isBusy = false;
    }
  }

  public async delete(): Promise<void> {
    try {
      const {driver, connectionOptions}: IDBDetail = this._dbDetail;
      this._logger.info("Deleting '%s:%s/%s'", connectionOptions.host, connectionOptions.port, connectionOptions.path);

      if (this._connectionPool.created) {
        this._logger.info("Database is connected");
        await this.disconnect();
      }
      this._isBusy = true;

      const connection = driver.newConnection();
      await connection.connect(connectionOptions);
      await this._onDelete(connection);
      await connection.dropDatabase();
      this._logger.info("Deleted '%s:%s/%s'", connectionOptions.host, connectionOptions.port, connectionOptions.path);
    } finally {
      this._isBusy = false;
    }
  }

  public async connect(): Promise<void> {
    try {
      const {connectionOptions, poolOptions}: IDBDetail = this._dbDetail;
      this._logger.info("Connecting '%s:%s/%s'", connectionOptions.host, connectionOptions.port,
        connectionOptions.path);

      this._checkBusy();
      this._isBusy = true;
      if (this._connectionPool.created) {
        this._logger.error("Database already connected");
        throw new Error("Database already connected");
      }

      await this._connectionPool.create(connectionOptions, poolOptions);
      await this._onConnect();
      this._logger.info("Connected '%s:%s/%s'", connectionOptions.host, connectionOptions.port, connectionOptions.path);
    } finally {
      this._isBusy = false;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      const {connectionOptions}: IDBDetail = this._dbDetail;
      this._logger.info("Disconnecting '%s:%s/%s'", connectionOptions.host, connectionOptions.port,
        connectionOptions.path);

      this._checkBusy();
      this._isBusy = true;
      if (!this._connectionPool.created) {
        this._logger.error("Database is not connected");
        throw new Error("Database is not connected");
      }

      await this._onDisconnect();
      await this._connectionPool.destroy();
      this._logger.info("Disconnected '%s:%s/%s'", connectionOptions.host, connectionOptions.port,
        connectionOptions.path);
    } finally {
      this._isBusy = false;
    }
  }

  public async executeConnection<R>(callback: TExecutor<AConnection, R>): Promise<R> {
    this._checkBusy();

    return await this._executeConnection(callback);
  }

  protected async _executeConnection<R>(callback: TExecutor<AConnection, R>): Promise<R> {
    return await AConnectionPool.executeConnection({
      connectionPool: this._connectionPool,
      callback
    });
  }

  protected _checkBusy(): void | never {
    if (this._isBusy) {
      this._logger.warn("Database is busy");
      throw new Error("Database is busy");
    }
  }

  protected async _onCreate(_connection: AConnection): Promise<void> {
    // empty
  }

  protected async _onDelete(_connection: AConnection): Promise<void> {
    // empty
  }

  protected async _onConnect(): Promise<void> {
    // empty
  }

  protected async _onDisconnect(): Promise<void> {
    // empty
  }
}
