import {LName} from "gdmn-internals";
import {semCategories2Str, SemCategory} from "gdmn-nlp";
import {IEntityAdapter} from "../rdbadapter";
import {IEntity} from "../serialize";
import {IBaseSemOptions} from "../types";
import {Attribute} from "./Attribute";
import { StringAttribute } from "./scalar/StringAttribute";
import { ScalarAttribute } from "./scalar/ScalarAttribute";
import { BlobAttribute } from "./scalar/BlobAttribute";

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
  public readonly lName: LName;
  public readonly isAbstract: boolean;
  public readonly semCategories: SemCategory[];
  public adapter?: IEntityAdapter;

  private readonly _pk: Attribute[] = [];
  private readonly _attributes: IAttributes = {};
  private readonly _unique: Attribute[][] = [];

  constructor(options: IEntityOptions) {
    this.parent = options.parent || undefined;
    this.name = options.name;
    this.lName = options.lName;
    this.isAbstract = options.isAbstract || false;
    this.semCategories = options.semCategories || [];
    this.adapter = options.adapter;
  }

  get pk(): Attribute[] {
    if (this.parent) {
      return [...this.parent.pk];
    }
    return this._pk;
  }

  get unique(): Attribute[][] {
    if (this.parent) {
      return [...this.parent.unique, ...this.ownUnique];
    } else {
      return this.ownUnique;
    }
  }

  get baseParent(): Entity {
    if (this.parent) {
      return this.parent.baseParent;
    }
    return this;
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

  get isIntervalTree(): boolean {
    return this.isTree
      && Object.values(this.attributes).some((attr) => attr.name === "RB")
      && Object.values(this.attributes).some((attr) => attr.name === "LB");
  }

  public attributesBySemCategory(cat: SemCategory): Attribute[] {
    return Object.values(this.attributes).filter((attr) => attr.semCategories.some((c) => c === cat));
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

  /**
   * Возвращает атрибут с названием объекта.
   */
  public presentAttribute(): Attribute {
    const attr = this._attributes['NAME']
      || this._attributes['USR$NAME']
      || this._attributes['ALIAS']
      || Object.values(this._attributes).find( attr => attr instanceof StringAttribute )
      || this._pk[0];

    if (attr instanceof ScalarAttribute && !(attr instanceof BlobAttribute)) {
      return attr;
    }

    throw new Error('Can\'t find presentational attribute');
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

  public hasUnique(attributes: Attribute[]): boolean {
    return this._unique.includes(attributes);
  }

  public hasOwnUnique(attributes: Attribute[]): boolean {
    return this.ownUnique.includes(attributes);
  }

  public has(attribute: Attribute): boolean {
    return this.hasAttribute(attribute.name);
  }

  public hasOwn(attribute: Attribute): boolean {
    return this.hasOwnAttribute(attribute.name);
  }

  public addUnique(attributes: Attribute[]): void {
    attributes.forEach((attr) => this.ownAttribute(attr.name));  // check exists own attribute
    this._unique.push(attributes);
  }

  public removeUnique(attributes: Attribute[]): void {
    attributes.forEach((attr) => this.ownAttribute(attr.name));  // check exists own attribute
    this._unique.splice(this._unique.indexOf(attributes), 1);
  }

  public add<T extends Attribute>(attribute: T): T {
    if (this.hasOwnAttribute(attribute.name)) {
      throw new Error(`Attribute ${attribute.name} of entity ${this.name} already exists`);
    }

    if (!this.pk.length) {
      this._pk.push(attribute);
    }
    return this._attributes[attribute.name] = attribute;
  }

  public addMultiple<T extends Attribute>(attributes: T[]): void {
    attributes.forEach((attribute) => this.add(attribute));
  }

  public remove(attribute: Attribute): void {
    if (!this.hasOwnAttribute(attribute.name)) {
      throw new Error(`Attribute ${attribute.name} of entity ${this.name} not found`);
    }

    if (this._pk.length) {
      this._pk.splice(this._pk.indexOf(attribute), 1);
    }
    delete this._attributes[attribute.name];
  }

  public serialize(withAdapter?: boolean): IEntity {
    return {
      parent: this.parent ? this.parent.name : undefined,
      name: this.name,
      lName: this.lName,
      isAbstract: this.isAbstract,
      semCategories: semCategories2Str(this.semCategories),
      unique: this.ownUnique.map((values) => values.map((attr) => attr.name)),
      attributes: Object.values(this.ownAttributes).map((attr) => attr.serialize(withAdapter)),
      adapter: withAdapter ? this.adapter : undefined
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
