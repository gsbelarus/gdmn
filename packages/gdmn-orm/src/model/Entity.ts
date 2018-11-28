import {semCategories2Str, SemCategory} from "gdmn-nlp";
import {IEntityAdapter, relationName2Adapter} from "../rdbadapter";
import {IEntity} from "../serialize";
import {IBaseSemOptions, ILName} from "../types";
import {Attribute} from "./Attribute";

export interface IAttributes {
  [name: string]: Attribute;
}

export interface IEntityOptions extends IBaseSemOptions<IEntityAdapter> {
  parent?: Entity;
  isAbstract?: boolean;
}

export class Entity {

  public readonly parent?: Entity;
  public readonly name: string;
  public readonly lName: ILName;
  public readonly isAbstract: boolean;
  public readonly semCategories: SemCategory[];

  private readonly _adapter?: IEntityAdapter;
  private readonly _pk: Attribute[] = [];
  private readonly _attributes: IAttributes = {};
  private readonly _unique: Attribute[][] = [];

  constructor(options: IEntityOptions) {
    this.parent = options.parent || undefined;
    this.name = options.name;
    this.lName = options.lName;
    this.isAbstract = options.isAbstract || false;
    this.semCategories = options.semCategories || [];
    this._adapter = options.adapter;
  }

  get pk(): Attribute[] {
    return this._pk.slice();
  }

  get adapter(): IEntityAdapter {
    if (this._adapter) {
      return this._adapter;
    } else {
      return relationName2Adapter(this.name);
    }
  }

  get unique(): Attribute[][] {
    if (this.parent) {
      return [...this.parent.unique, ...this.ownUnique];
    } else {
      return this.ownUnique;
    }
  }

  get ownUnique(): Attribute[][] {
    return [...this._unique.map((values) => values.slice())];
  }

  get attributes(): IAttributes {
    if (this.parent) {
      return {...this.parent.attributes, ...this.ownAttributes};
    } else {
      return this.ownAttributes;
    }
  }

  get ownAttributes(): IAttributes {
    return this._attributes;
  }

  get isTree(): boolean {
    return Object.values(this.attributes).some((attr) => attr.type === "Parent");
  }

  public attributesBySemCategory(cat: SemCategory): Attribute[] {
    return Object.values(this._attributes).filter((attr) => attr.semCategories.some((c) => c === cat));
  }

  public attribute(name: string): Attribute {
    const attribute = this.attributes[name];
    if (!attribute) {
      throw new Error(`Unknown attribute ${name} of entity ${this.name}`);
    }
    return attribute;
  }

  public ownAttribute(name: string): Attribute {
    const attribute = this.ownAttributes[name];
    if (!attribute) {
      throw new Error(`Unknown attribute ${name} of entity ${this.name}`);
    }
    return attribute;
  }

  public hasAttribute(name: string): boolean {
    return !!this.attributes[name];
  }

  public hasOwnAttribute(name: string): boolean {
    return !!this.ownAttributes[name];
  }

  public hasAncestor(a: Entity): boolean {
    return this.parent ? (this.parent === a ? true : this.parent.hasAncestor(a)) : false;
  }

  public has(uniqueAttributes: Attribute[]): boolean;
  public has(attribute: Attribute): boolean;
  public has(source: Attribute[] | Attribute): boolean {
    if (Array.isArray(source)) {
      return this.unique.includes(source);

    } else if (source instanceof Attribute) {
      return this.hasAttribute(source.name);

    } else {
      throw new Error("Unknown arg of type");
    }
  }

  public hasOwn(uniqueAttributes: Attribute[]): boolean;
  public hasOwn(attribute: Attribute): boolean;
  public hasOwn(source: Attribute[] | Attribute): boolean {
    if (Array.isArray(source)) {
      return this.ownUnique.includes(source);

    } else if (source instanceof Attribute) {
      return this.hasOwnAttribute(source.name);

    } else {
      throw new Error("Unknown arg of type");
    }
  }

  public add<T extends Attribute>(uniqueAttributes: T[]): void;
  public add<T extends Attribute>(attribute: T): T;
  public add<T extends Attribute>(source: T[] | T): void | T {
    if (Array.isArray(source)) {
      const uniqueAttributes = source;
      uniqueAttributes.forEach((attr) => this.ownAttribute(attr.name));  // check exists own attribute
      this._unique.push(uniqueAttributes);

    } else if (source instanceof Attribute) {
      const attribute = source;
      if (this.hasOwnAttribute(attribute.name)) {
        throw new Error(`Attribute ${attribute.name} of entity ${this.name} already exists`);
      }

      if (!this._pk.length) {
        this._pk.push(attribute);
      }
      return this._attributes[attribute.name] = attribute;

    } else {
      throw new Error("Unknown arg of type");
    }
  }

  public remove(uniqueAttributes: Attribute[]): void;
  public remove(attribute: Attribute): void;
  public remove(source: Attribute[] | Attribute): void {
    if (Array.isArray(source)) {
      const attributes = source;
      attributes.forEach((attr) => this.ownAttribute(attr.name));  // check exists own attribute
      this._unique.splice(this._unique.indexOf(attributes), 1);

    } else if (source instanceof Attribute) {
      const attribute = source;
      if (!this.hasOwnAttribute(attribute.name)) {
        throw new Error(`Attribute ${attribute.name} of entity ${this.name} not found`);
      }

      if (this._pk.length) {
        this._pk.splice(this._pk.indexOf(attribute), 1);
      }
      delete this._attributes[attribute.name];

    } else {
      throw new Error("Unknown arg of type");
    }
  }

  public serialize(): IEntity {
    return {
      parent: this.parent ? this.parent.name : undefined,
      name: this.name,
      lName: this.lName,
      isAbstract: this.isAbstract,
      semCategories: semCategories2Str(this.semCategories),
      unique: this.ownUnique.map((values) => values.map((attr) => attr.name)),
      attributes: Object.values(this.ownAttributes).map((attr) => attr.serialize())
    };
  }

  public inspect(): string[] {
    const lName = this.lName.ru ? " - " + this.lName.ru.name : "";
    const result = [
      `${this.isAbstract ? "!" : ""}${this.name}${this.parent ? "(" + this.parent.name + ")" : ""}${lName}:`,
      `  adapter: ${JSON.stringify(this.adapter)}`,
      "  IAttributes:",
      ...Object.values(this.attributes).reduce((p, attr) => {
        return [...p, ...attr.inspect()];
      }, [] as string[])
    ];
    if (this.semCategories.length) {
      result.splice(1, 0, `  categories: ${semCategories2Str(this.semCategories)}`);
    }
    return result;
  }
}
