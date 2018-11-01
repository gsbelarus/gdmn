import {Attribute, Entity, IAttributeSource} from "gdmn-orm";
import {EntityBuilder} from "../ddl/builder/EntityBuilder";
import {Connection} from "./Connection";
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

  public async create<T extends Attribute>(parent: Entity, obj: T, connection: Connection, transaction?: Transaction): Promise<T> {
    return await this._dataSource.withTransaction(connection, transaction, async (trans) => {
      const builder = new EntityBuilder(trans.ddlHelper);
      return (await builder.addAttribute(parent, obj)) as T;
    });
  }

  public async delete(parent: Entity, obj: Attribute, connection: Connection, transaction?: Transaction): Promise<void> {
    return await this._dataSource.withTransaction(connection, transaction, async (trans) => {
      const builder = new EntityBuilder(trans.ddlHelper);
      await builder.removeAttribute(parent, obj);
    });
  }
}
