import {EntityQuery, IEntityQueryInspector, IQueryResponse} from "../query-models/EntityQuery";
import {IERModel} from "../serialize";
import {IConnection, IDataSource, IEntitySource, ISequenceSource, ITransaction} from "../types";
import {DefaultConnection} from "./DefaultConnection";
import {DefaultTransaction} from "./DefaultTransaction";
import {Entity} from "./Entity";
import {Sequence} from "./Sequence";

export interface IEntities {
  [name: string]: Entity;
}

export interface ISequencies {
  [name: string]: Sequence;
}

export class ERModel {

  private _dataSource?: IDataSource;

  private _entities: IEntities = {};
  private _sequencies: ISequencies = {};

  constructor(dataSource?: IDataSource) {
    this._dataSource = dataSource;
  }

  get dataSource(): IDataSource | undefined {
    return this._dataSource;
  }

  get sequencies(): ISequencies {
    return this._sequencies;
  }

  get entities(): IEntities {
    return this._entities;
  }

  public async init(): Promise<void> {
    let entitySource: IEntitySource | undefined;
    let sequenceSource: ISequenceSource | undefined;
    if (this._dataSource) {
      await this._dataSource.init(this);
      entitySource = this._dataSource.getEntitySource();
      sequenceSource = this._dataSource.getSequenceSource();
    }
    for (const entity of Object.values(this._entities)) {
      await entity.initDataSource(entitySource);
    }
    for (const sequence of Object.values(this._sequencies)) {
      await sequence.initDataSource(sequenceSource);
    }
  }

  public entity(name: string): Entity | never {
    const found = this._entities[name];
    if (!found) {
      throw new Error(`Unknown entity ${name}`);
    }
    return found;
  }

  public sequence(name: string): Sequence {
    const found = this._sequencies[name];
    if (!found) {
      throw new Error(`Unknown sequence ${name}`);
    }
    return found;
  }

  public hasEntity(name: string): boolean {
    return !!this._entities[name];
  }

  public hasSequence(name: string): boolean {
    return !!this._sequencies[name];
  }

  public clear(): void {
    this._entities = {};
    this._sequencies = {};
  }

  public add(entity: Entity): Entity {
    if (this.hasEntity(entity.name)) {
      throw new Error(`Entity ${entity.name} already exists`);
    }
    return this._entities[entity.name] = entity;
  }

  public remove(entity: Entity): void {
    if (!this.hasEntity(entity.name)) {
      throw new Error(`Entity ${entity.name} not found`);
    }
    delete this.entities[entity.name];
  }

  public addSequence(sequence: Sequence): Sequence | never {
    if (this.hasSequence(sequence.name)) {
      throw new Error(`Sequence ${sequence.name} already exists`);
    }
    return this._sequencies[sequence.name] = sequence;
  }

  public removeSequence(sequence: Sequence): void {
    if (!this.hasSequence(sequence.name)) {
      throw new Error(`Sequence ${sequence.name} not found`);
    }
    delete this._sequencies[sequence.name];
  }

  public has(sequence: Sequence): boolean;
  public has(entity: Entity): boolean;
  public has(source: any): boolean {
    if (source instanceof Entity) {
      return !!this._entities[source.name];

    } else if (source instanceof Sequence) {
      return !!this._sequencies[source.name];
    } else {
      throw new Error("Unknown arg type");
    }
  }

  public async create(sequence: Sequence, connection: IConnection, transaction?: ITransaction): Promise<Sequence>;
  public async create(entity: Entity, connection: IConnection, transaction?: ITransaction): Promise<Entity>;
  public async create(source: any, connection: IConnection, transaction?: ITransaction): Promise<any> {
    this._checkTransaction(transaction);

    if (source instanceof Entity) {
      const entity = this.add(source);
      if (this._dataSource) {
        const entitySource = this._dataSource.getEntitySource();
        await entity.initDataSource(entitySource);
        if (entitySource) {
          return await entitySource.create(this, entity, connection, transaction);
        }
      }
      return entity;

    } else if (source instanceof Sequence) {
      const sequence = this.addSequence(source);
      if (this._dataSource) {
        const sequenceSource = this._dataSource.getSequenceSource();
        if (sequenceSource) {
          return await sequenceSource.create(this, sequence, connection, transaction);
        }
        await sequence.initDataSource(undefined);
      }
      return source;
    } else {
      throw new Error("Unknown arg type");
    }
  }

  public async delete(sequence: Sequence, connection: IConnection, transaction?: ITransaction): Promise<void>;
  public async delete(entity: Entity, connection: IConnection, transaction?: ITransaction): Promise<void>;
  public async delete(source: any, connection: IConnection, transaction?: ITransaction): Promise<void> {
    this._checkTransaction(transaction);

    if (source instanceof Entity) {
      const entity = source;
      if (this._dataSource) {
        const entitySource = this._dataSource.getEntitySource();
        if (entitySource) {
          await entitySource.delete(this, entity, connection, transaction);
        }
        await entity.initDataSource(undefined);
      }
      this.remove(entity);

    } else if (source instanceof Sequence) {
      const sequence = source;
      if (this._dataSource) {
        const sequenceSource = this._dataSource.getSequenceSource();
        if (sequenceSource) {
          await sequenceSource.delete(this, sequence, connection, transaction);
        }
      }
      this.removeSequence(sequence);
    } else {
      throw new Error("Unknown arg type");
    }
  }

  public async query(query: IEntityQueryInspector,
                     connection: IConnection,
                     transaction?: ITransaction): Promise<IQueryResponse> {
    this._checkTransaction(transaction);

    if (!this._dataSource) {
      throw new Error("Need DataSource");
    }
    return await this._dataSource.query(EntityQuery.inspectorToObject(this, query), connection, transaction);
  }

  public async createConnection(): Promise<IConnection> {
    if (this._dataSource) {
      return await this._dataSource.connect();
    }
    return new DefaultConnection();
  }

  public async startTransaction(connection: IConnection): Promise<ITransaction> {
    if (this._dataSource) {
      return await this._dataSource.startTransaction(connection);
    }
    return new DefaultTransaction();
  }

  public async clearDataSource(): Promise<void> {
    this._dataSource = undefined;
    await this.init();
  }

  public serialize(): IERModel {
    return {entities: Object.values(this._entities).map((e) => e.serialize())};
  }

  public inspect(): string[] {
    return Object.values(this._entities).reduce((p, e) => {
      return [...e.inspect(), ...p];
    }, [] as string[]);
  }

  private _checkTransaction(transaction?: ITransaction): void | never {
    if (transaction && transaction.finished) {
      throw new Error("Transaction is finished");
    }
  }
}
