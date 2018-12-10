import {IERModel} from "../serialize";
import {Entity} from "./Entity";
import {Sequence} from "./Sequence";

export interface IEntities {
  [name: string]: Entity;
}

export interface ISequencies {
  [name: string]: Sequence;
}

export class ERModel {

  private _entities: IEntities = {};
  private _sequencies: ISequencies = {};

  get sequencies(): ISequencies {
    return this._sequencies;
  }

  get entities(): IEntities {
    return this._entities;
  }

  public entity(name: string): Entity {
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

  public add(sequence: Sequence): Sequence;
  public add(entity: Entity): Entity;
  public add(source: Sequence | Entity): Sequence | Entity {
    if (source instanceof Sequence) {
      const sequence = source;
      if (this.has(sequence)) {
        throw new Error(`Sequence ${sequence.name} already exists`);
      }
      return this._sequencies[sequence.name] = sequence;

    } else if (source instanceof Entity) {
      const entity = source;
      if (this.has(entity)) {
        throw new Error(`Entity ${entity.name} already exists`);
      }
      return this._entities[entity.name] = entity;

    } else {
      throw new Error("Unknown arg of type");
    }
  }

  public remove(sequence: Sequence): void;
  public remove(entity: Entity): void;
  public remove(source: Sequence | Entity): void {
    if (source instanceof Sequence) {
      const sequence = source;
      if (!this.has(sequence)) {
        throw new Error(`Sequence ${sequence.name} not found`);
      }
      delete this._sequencies[sequence.name];

    } else if (source instanceof Entity) {
      const entity = source;
      if (!this.has(entity)) {
        throw new Error(`Entity ${entity.name} not found`);
      }
      delete this._entities[entity.name];

    } else {
      throw new Error("Unknown arg of type");
    }
  }

  public has(sequence: Sequence): boolean;
  public has(entity: Entity): boolean;
  public has(source: Sequence | Entity): boolean {
    if (source instanceof Sequence) {
      return this.hasSequence(source.name);

    } else if (source instanceof Entity) {
      return this.hasEntity(source.name);

    } else {
      throw new Error("Unknown arg of type");
    }
  }

  public serialize(withAdapter?: boolean): IERModel {
    return {entities: Object.values(this._entities).map((e) => e.serialize())};
  }

  public inspect(): string[] {
    return Object.values(this._entities).reduce((p, e) => {
      return [...e.inspect(), ...p];
    }, [] as string[]);
  }
}
