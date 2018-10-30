import {semCategories2Str, SemCategory} from "gdmn-nlp";
import {IAttribute} from "../serialize";
import {AttributeTypes, IAttributeSource, IBaseSemOptions, ILName} from "../types";

export interface IAttributeOptions<Adapter> extends IBaseSemOptions<Adapter> {
  required?: boolean;
}

export abstract class Attribute<Adapter = any> {

  public abstract type: AttributeTypes;

  public readonly name: string;
  public readonly lName: ILName;
  public readonly required: boolean;
  public readonly semCategories: SemCategory[];
  public readonly adapter?: Adapter;

  protected _source?: IAttributeSource;

  protected constructor(options: IAttributeOptions<Adapter>) {
    this.name = options.name;
    this.lName = options.lName;
    this.required = options.required || false;
    this.semCategories = options.semCategories || [];
    this.adapter = options.adapter;
  }

  public async initDataSource(source?: IAttributeSource): Promise<void> {
    this._source = source;
    if (this._source) {
      await this._source.init(this);
    }
  }

  public serialize(): IAttribute {
    return {
      name: this.name,
      type: this.type,
      lName: this.lName,
      required: this.required,
      semCategories: semCategories2Str(this.semCategories)
    };
  }

  public inspectDataType(): string {
    const sn = new Map<AttributeTypes, string>();
    sn.set("Entity", "->");
    sn.set("String", "S");
    sn.set("Set", "<->");
    sn.set("Parent", "-^");
    sn.set("Sequence", "PK");
    sn.set("Integer", "I");
    sn.set("Numeric", "N");
    sn.set("Float", "F");
    sn.set("Boolean", "B");
    sn.set("Date", "DT");
    sn.set("TimeStamp", "TS");
    sn.set("Time", "TM");
    sn.set("Blob", "BLOB");
    sn.set("Enum", "E");

    const i = sn.get(this.type);
    return i ? i : this.constructor.name;
  }

  public inspect(indent: string = "    "): string[] {
    const adapter = this.adapter ? ", " + JSON.stringify(this.adapter) : "";
    const lName = this.lName.ru ? " - " + this.lName.ru.name : "";
    const cat = this.semCategories.length ? `, categories: ${semCategories2Str(this.semCategories)}` : "";

    return [
      `${indent}${this.name}${this.required ? "*" : ""}${lName}: ${this.inspectDataType()}${cat}${adapter}`
    ];
  }
}
