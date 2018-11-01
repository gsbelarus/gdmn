import {ERModel, ISequenceSource, Sequence} from "gdmn-orm";
import {ERModelBuilder} from "../ddl/builder/ERModelBuilder";
import {Connection} from "./Connection";
import {DataSource} from "./DataSource";
import {Transaction} from "./Transaction";

export class SequenceSource implements ISequenceSource {

  private readonly _dataSource: DataSource;

  constructor(dataSource: DataSource) {
    this._dataSource = dataSource;
  }

  public async init(obj: Sequence): Promise<Sequence> {
    return obj;
  }

  public async create<T extends Sequence>(_: ERModel,
                                          obj: T,
                                          connection: Connection,
                                          transaction?: Transaction): Promise<T> {
    return await this._dataSource.withTransaction(connection, transaction, async (trans) => {
      const builder = new ERModelBuilder(trans.ddlHelper);
      return (await builder.addSequence(obj)) as T;
    });
  }

  public async delete(_: ERModel, obj: Sequence, connection: Connection, transaction?: Transaction): Promise<void> {
    return await this._dataSource.withTransaction(connection, transaction, async (trans) => {
      const builder = new ERModelBuilder(trans.ddlHelper);
      await builder.removeSequence(obj);
    });
  }
}
