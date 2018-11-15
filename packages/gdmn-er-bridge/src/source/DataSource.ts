import {AccessMode, AConnection, AConnectionPool, DBStructure, Factory, ICommonConnectionPoolOptions} from "gdmn-db";
import {EntityQuery, ERModel, IConnection, IDataSource, IQueryResponse, ISequenceSource, Sequence} from "gdmn-orm";
import {Select} from "../crud/query/Select";
import {Constants} from "../ddl/Constants";
import {ERExport} from "../ddl/export/ERExport";
import {DBSchemaUpdater} from "../ddl/updates/DBSchemaUpdater";
import {Connection} from "./Connection";
import {EntitySource} from "./EntitySource";
import {SequenceSource} from "./SequenceSource";
import {Transaction} from "./Transaction";

export class DataSource implements IDataSource {

  public readonly connectionPool: AConnectionPool<ICommonConnectionPoolOptions>;

  public dbStructure: DBStructure | undefined;

  private _globalSequence: Sequence | undefined;

  constructor(connectionPool: AConnectionPool<ICommonConnectionPoolOptions>) {
    this.connectionPool = connectionPool;
  }

  get globalSequence(): Sequence {
    if (!this._globalSequence) {
      throw new Error("globalSequence is not found");
    }
    return this._globalSequence;
  }

  public async init(obj: ERModel): Promise<ERModel> {
    return await AConnectionPool.executeConnection({
      connectionPool: this.connectionPool,
      callback: async (connection) => {
        await new DBSchemaUpdater(connection).run();

        obj = await AConnection.executeTransaction({
          connection: connection,
          options: {accessMode: AccessMode.READ_ONLY},
          callback: async (transaction) => {
            this.dbStructure = await Factory.FBDriver.readDBStructure(connection, transaction);
            return await new ERExport(connection, transaction, this.dbStructure, obj).execute();
          }
        });

        this._globalSequence = obj.sequence(Constants.GLOBAL_GENERATOR);
        return obj;
      }
    });
  }

  public async connect(): Promise<IConnection> {
    const connection = await this.connectionPool.get();
    return new Connection(connection);
  }

  public async startTransaction(connection: Connection): Promise<Transaction> {
    const dbTransaction = await connection.connection.startTransaction();
    return new Transaction(connection, dbTransaction);
  }

  public async query(query: EntityQuery, connection: Connection, transaction?: Transaction): Promise<IQueryResponse> {
    return await this.withTransaction(connection, transaction, async (trans) => {
      const {sql, params, fieldAliases} = new Select(this.dbStructure!, query);

      const data = await AConnection.executeQueryResultSet({
        connection: connection.connection,
        transaction: trans.transaction,
        sql,
        params,
        callback: async (resultSet) => {
          const result = [];
          while (await resultSet.next()) {
            const row: { [key: string]: any } = {};
            for (let i = 0; i < resultSet.metadata.columnCount; i++) {
              // TODO binary blob support
              row[resultSet.metadata.getColumnLabel(i)] = await resultSet.getAny(i);
            }
            result.push(row);
          }
          return result;
        }
      });

      const aliases = [];
      for (const [key, value] of fieldAliases) {
        const link = query.link.deepFindLinkByField(key);
        if (!link) {
          throw new Error("Field not found");
        }
        aliases.push({
          alias: link.alias,
          attribute: key.attribute.name,
          values: value
        });
      }

      return {
        data,
        aliases,
        info: {
          select: sql,
          params
        }
      };
    });
  }

  public getEntitySource(): EntitySource {
    if (!this._globalSequence) {
      throw new Error("globalSequence is undefined");
    }
    return new EntitySource(this);
  }

  public getSequenceSource(): ISequenceSource {
    return new SequenceSource(this);
  }

  public async withTransaction<R>(connection: Connection,
                                  transaction: Transaction | undefined,
                                  callback: (transaction: Transaction) => Promise<R>): Promise<R> {
    if (transaction) {
      return await callback(transaction);
    } else {
      const trans = await this.startTransaction(connection);
      try {
        const result = await callback(trans);
        await trans.commit();
        return result;

      } catch (error) {
        await trans.rollback();
        throw error;
      }
    }
  }
}
