import {semCategories2Str, SemCategory} from "gdmn-nlp";
import {IEntityAdapter, relationName2Adapter} from "../rdbadapter";
import {IEntity} from "../serialize";
import {IAttributeSource, IBaseSemOptions, IEntitySource, ILName, ITransaction} from "../types";
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

  private _source?: IEntitySource;

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

  public async initDataSource(source?: IEntitySource): Promise<void> {
    this._source = source;
    let attributeSource: IAttributeSource | undefined;
    if (this._source) {
      await this._source.init(this);
      attributeSource = this._source.getAttributeSource();
    }
    for (const attribute of Object.values(this.ownAttributes)) {
      await attribute.initDataSource(attributeSource);
    }
  }

  public attributesBySemCategory(cat: SemCategory): Attribute[] {
    return Object.values(this._attributes).filter((attr) => attr.semCategories.some((c) => c === cat));
  }

  public attribute(name: string): Attribute | never {
    const attribute = this.attributes[name];
    if (!attribute) {
      throw new Error(`Unknown attribute ${name} of entity ${this.name}`);
    }
    return attribute;
  }

  public ownAttribute(name: string): Attribute | never {
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

  public add<T extends Attribute>(attribute: T): T | never {
    if (this.hasOwnAttribute(attribute.name)) {
      throw new Error(`Attribute ${attribute.name} of entity ${this.name} already exists`);
    }

    if (!this._pk.length) {
      this._pk.push(attribute);
    }

    return this._attributes[attribute.name] = attribute;
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

  public addUnique(value: Attribute[]): void {
    value.forEach((attr) => this.ownAttribute(attr.name));  // check exists own attribute

    this._unique.push(value);
  }

  public removeUnique(value: Attribute[]): void {
    value.forEach((attr) => this.ownAttribute(attr.name));  // check exists own attribute
    this._unique.splice(this._unique.indexOf(value), 1);
  }

  public async addAttrUnique(attrs: Attribute[], transaction?: ITransaction): Promise<void> {
    this._checkTransaction(transaction);

    attrs.forEach((attr) => this.ownAttribute(attr.name));  // check exists own attribute

    if (this._source) {
      await this._source.addUnique(this, attrs, transaction);
    }
    this.addUnique(attrs);
  }

  public async removeAttrUnique(attrs: Attribute[], transaction?: ITransaction): Promise<void> {
    this._checkTransaction(transaction);

    attrs.forEach((attr) => this.ownAttribute(attr.name));  // check exists own attribute

    if (this._source) {
      await this._source.removeUnique(this, attrs, transaction);
    }
    this.removeUnique(attrs);
  }

  public async create<T extends Attribute>(attribute: T, transaction?: ITransaction): Promise<T>;
  public async create(source: any, transaction?: ITransaction): Promise<any> {
    this._checkTransaction(transaction);

    if (source instanceof Attribute) {
      const attribute = this.add(source);
      if (this._source) {
        const attributeSource = this._source.getAttributeSource();
        await attribute.initDataSource(attributeSource);
        if (attributeSource) {
          return await attributeSource.create(this, attribute, transaction);
        }
      }
      return attribute;
    } else {
      throw new Error("Unknown arg type");
    }
  }

  public async delete(attribute: Attribute, transaction: ITransaction): Promise<void>;
  public async delete(source: any, transaction: ITransaction): Promise<any> {
    this._checkTransaction(transaction);

    if (source instanceof Attribute) {
      const attribute = source;
      if (this._source) {
        const attributeSource = this._source.getAttributeSource();
        if (attributeSource) {
          await attributeSource.delete(this, attribute, transaction);
        }
        await attribute.initDataSource(undefined);
      }
      this.remove(attribute);
    } else {
      throw new Error("Unknown arg type");
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

  private _checkTransaction(transaction?: ITransaction): void | never {
    if (transaction && transaction.finished) {
      throw new Error("Transaction is finished");
    }
  }
}
