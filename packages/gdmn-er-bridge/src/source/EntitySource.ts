import {
  Attribute,
  Entity,
  EntityAttribute,
  ERModel,
  IAttributeSource,
  IEntitySource,
  SequenceAttribute
} from "gdmn-orm";
import {Builder} from "../ddl/builder/Builder";
import {Constants} from "../ddl/Constants";
import {AttributeSource} from "./AttributeSource";
import {DataSource} from "./DataSource";
import {Transaction} from "./Transaction";

export class EntitySource implements IEntitySource {

  private readonly _dataSource: DataSource;

  constructor(dataSource: DataSource) {
    this._dataSource = dataSource;
  }

  public async init(obj: Entity): Promise<Entity> {
    if (obj.parent && !obj.hasOwnAttribute(Constants.DEFAULT_INHERITED_KEY_NAME)) {
      obj.add(new EntityAttribute({
        name: Constants.DEFAULT_INHERITED_KEY_NAME,
        required: true,
        lName: {ru: {name: "Родитель"}},
        entities: [obj.parent]
      }));

    } else if (!obj.hasOwnAttribute(Constants.DEFAULT_ID_NAME)) {
      obj.add(new SequenceAttribute({
        name: Constants.DEFAULT_ID_NAME,
        lName: {ru: {name: "Идентификатор"}},
        sequence: this._dataSource.globalSequence,
        adapter: {
          relation: Builder._getOwnRelationName(obj),
          field: Constants.DEFAULT_ID_NAME
        }
      }));
    }
    return obj;
  }

  public async create<T extends Entity>(_: ERModel, obj: T, transaction?: Transaction): Promise<T> {
    return await this._dataSource.withTransaction(transaction, async (trans) => {
      const builder = await trans.getBuilder();
      return (await builder.addEntity(obj)) as T;
    });
  }

  public async delete(_: ERModel, obj: Entity, transaction?: Transaction): Promise<void> {
    return await this._dataSource.withTransaction(transaction, async (trans) => {
      const builder = await trans.getBuilder();
      await builder.removeEntity(obj);
    });
  }

  public async addUnique(entity: Entity, attrs: Attribute[], transaction?: Transaction): Promise<void> {
    return await this._dataSource.withTransaction(transaction, async (trans) => {
      const builder = await trans.getBuilder();
      return await builder.entityBuilder.addUnique(entity, attrs);
    });
  }

  public async removeUnique(): Promise<void> {
    throw new Error("Unsupported yet");
  }

  public getAttributeSource(): IAttributeSource {
    return new AttributeSource(this._dataSource);
  }
}
