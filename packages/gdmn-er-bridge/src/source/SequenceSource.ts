import {ERModel, ISequenceSource, Sequence} from "gdmn-orm";
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

  public async create<T extends Sequence>(_: ERModel, obj: T, transaction?: Transaction): Promise<T> {
    return await this._dataSource.withTransaction(transaction, async (trans) => {
      const builder = await trans.getBuilder();
      return (await builder.addSequence(obj)) as T;
    });
  }

  public async delete(_: ERModel, obj: Sequence, transaction?: Transaction): Promise<void> {
    return await this._dataSource.withTransaction(transaction, async (trans) => {
      const builder = await trans.getBuilder();
      await builder.removeSequence(obj);
    });

  }
}
