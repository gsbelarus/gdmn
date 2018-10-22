import {AccessMode, AConnection, DBStructure, Factory} from "gdmn-db";
import {EntityQuery, ERModel, IDataSource, IQueryResponse, ISequenceSource, Sequence} from "gdmn-orm";
import {SelectBuilder} from "../crud/query/SelectBuilder";
import {Constants} from "../ddl/Constants";
import {DBSchemaUpdater} from "../ddl/updates/DBSchemaUpdater";
import {EntitySource} from "./EntitySource";
import {SequenceSource} from "./SequenceSource";
import {Transaction} from "./Transaction";

export class DataSource implements IDataSource {

  private readonly _connection: AConnection;
  private _dbStructure: DBStructure | undefined;
  private _globalSequence: Sequence | undefined;

  constructor(connection: AConnection) {
    this._connection = connection;
  }

  get globalSequence(): Sequence {
    if (!this._globalSequence) {
      throw new Error("globalSequence is not found");
    }
    return this._globalSequence;
  }

  public async init(obj: ERModel): Promise<ERModel> {
    await new DBSchemaUpdater(this._connection).run();

    // TODO tmp
    this._dbStructure = await AConnection.executeTransaction({
      connection: this._connection,
      options: {accessMode: AccessMode.READ_ONLY},
      callback: (transaction) => Factory.FBDriver.readDBStructure(this._connection, transaction)
    });

    if (!Object.values(obj.sequencies).some((seq) => seq.name == Constants.GLOBAL_GENERATOR)) {
      obj.addSequence(new Sequence({name: Constants.GLOBAL_GENERATOR}));
    }
    this._globalSequence = obj.sequence(Constants.GLOBAL_GENERATOR);
    return obj;
  }

  public async startTransaction(): Promise<Transaction> {
    const dbTransaction = await this._connection.startTransaction();
    return new Transaction(this._connection, dbTransaction);
  }

  public async query(query: EntityQuery, transaction?: Transaction): Promise<IQueryResponse> {
    return await this.withTransaction(transaction, async (trans) => {
      const {sql, params, fieldAliases} = new SelectBuilder(this._dbStructure!, query).build();

      const data = await AConnection.executeQueryResultSet({
        connection: this._connection,
        transaction: trans.dbTransaction,
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

  public async withTransaction<R>(transaction: Transaction | undefined,
                                  callback: (transaction: Transaction) => Promise<R>): Promise<R> {
    if (transaction) {
      return await callback(transaction);
    } else {
      const trans = await this.startTransaction();
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
