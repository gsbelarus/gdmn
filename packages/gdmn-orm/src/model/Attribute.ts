import {semCategories2Str, SemCategory} from "gdmn-nlp";
import {IAttribute} from "../serialize";
import {AttributeTypes, IBaseSemOptions} from "../types";
import {LName} from "gdmn-internals";

const sn: { [name: string]: string } = {
  "Entity": "->",
  "String": "S",
  "Set": "<->",
  "Parent": "-^",
  "Sequence": "Seq",
  "Integer": "I",
  "Numeric": "N",
  "Float": "F",
  "Boolean": "B",
  "Date": "DT",
  "TimeStamp": "TS",
  "Time": "TM",
  "Blob": "BLOB",
  "Enum": "E"
}

export interface IAttributeOptions<Adapter> extends IBaseSemOptions<Adapter> {
  required?: boolean;
}

export abstract class Attribute<Adapter = any> {

  public abstract type: AttributeTypes;

  public readonly name: string;
  public readonly lName: LName;
  public readonly required: boolean;
  public readonly semCategories: SemCategory[];
  public adapter?: Adapter;

  protected constructor(options: IAttributeOptions<Adapter>) {
    this.name = options.name;
    this.lName = options.lName;
    this.required = options.required || false;
    this.semCategories = options.semCategories || [];
    this.adapter = options.adapter;
  }

  public serialize(withAdapter?: boolean): IAttribute {
    return {
      name: this.name,
      type: this.type,
      lName: this.lName,
      required: this.required,
      semCategories: semCategories2Str(this.semCategories),
      adapter: withAdapter ? this.adapter : undefined
    };
  }

  public inspectDataType(): string {
    const i = sn[this.type];
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
