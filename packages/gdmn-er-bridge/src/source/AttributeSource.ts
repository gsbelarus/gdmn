import {Attribute, Entity, IAttributeSource} from "gdmn-orm";
import {DataSource} from "./DataSource";
import {Transaction} from "./Transaction";

export class AttributeSource implements IAttributeSource {

  private readonly _dataSource: DataSource;

  constructor(dataSource: DataSource) {
    this._dataSource = dataSource;
  }

  public async init(obj: Attribute): Promise<Attribute> {
    return obj;
  }

  public async create<T extends Attribute>(parent: Entity, obj: T, transaction?: Transaction): Promise<T> {
    return await this._dataSource.withTransaction(transaction, async (trans) => {
      const builder = await trans.getBuilder();
      return (await builder.entityBuilder.addAttribute(parent, obj)) as T;
    });
  }

  public async delete(parent: Entity, obj: Attribute, transaction?: Transaction): Promise<void> {
    return await this._dataSource.withTransaction(transaction, async (trans) => {
      const builder = await trans.getBuilder();
      await builder.entityBuilder.removeAttribute(parent, obj);
    });
  }
}
