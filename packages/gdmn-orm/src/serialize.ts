import {LName} from "gdmn-internals";
import {str2SemCategories} from "gdmn-nlp";
import {Attribute} from "./model/Attribute";
import {Entity} from "./model/Entity";
import {ERModel} from "./model/ERModel";
import {DetailAttribute} from "./model/link/DetailAttribute";
import {EntityAttribute} from "./model/link/EntityAttribute";
import {ParentAttribute} from "./model/link/ParentAttribute";
import {SetAttribute} from "./model/link/SetAttribute";
import {BlobAttribute} from "./model/scalar/BlobAttribute";
import {BooleanAttribute} from "./model/scalar/BooleanAttribute";
import {EnumAttribute} from "./model/scalar/EnumAttribute";
import {DateAttribute} from "./model/scalar/number/DateAttribute";
import {FloatAttribute} from "./model/scalar/number/FloatAttribute";
import {IntegerAttribute} from "./model/scalar/number/IntegerAttribute";
import {NumericAttribute} from "./model/scalar/number/NumericAttribute";
import {TimeAttribute} from "./model/scalar/number/TimeAttribute";
import {TimeStampAttribute} from "./model/scalar/number/TimeStampAttribute";
import {SequenceAttribute} from "./model/scalar/SequenceAttribute";
import {StringAttribute} from "./model/scalar/StringAttribute";
import {Sequence} from "./model/Sequence";
import {AttributeTypes, ContextVariables, IEnumValue} from "./types";

export interface IAttribute {
  name: string;
  type: AttributeTypes;
  lName: LName;
  required: boolean;
  semCategories: string;
  adapter?: any;
  id?: string;
}

export interface IEnumAttribute extends IAttribute {
  values: IEnumValue[];
  defaultValue: string | number | undefined;
}

export interface IBooleanAttribute extends IAttribute {
  defaultValue: boolean;
}

export interface INumberAttribute<T, DF = undefined> extends IAttribute {
  minValue?: T;
  maxValue?: T;
  defaultValue?: T | DF;
}

export interface INumericAttribute extends INumberAttribute<number> {
  precision: number;
  scale: number;
}

export interface IDateAttribute extends INumberAttribute<Date, ContextVariables> {
}

export interface ISequenceAttribute extends IAttribute {
  sequence: string;
}

export interface IStringAttribute extends IAttribute {
  minLength?: number;
  maxLength?: number;
  defaultValue?: string;
  mask?: RegExp;
  autoTrim: boolean;
}

export interface IEntityAttribute extends IAttribute {
  references: string[];
}

export interface ISetAttribute extends IEntityAttribute {
  attributes: IAttribute[];
  presLen: number;
}

export interface IEntity {
  parent?: string;
  name: string;
  lName: LName;
  isAbstract: boolean;
  semCategories: string;
  unique: string[][];
  attributes: IAttribute[];
  adapter?: any;
}

export interface ISequence {
  name: string;
  adapter?: any;
}

export interface IERModel {
  entities: IEntity[];
  sequences: ISequence[];
}

// TODO serialize adapter - tmp
export function deserializeERModel(serialized: IERModel, withAdapter?: boolean): ERModel {
  const erModel = new ERModel();

  const createSequence = (s: ISequence): Sequence => {
    if (!withAdapter) {
      s.adapter = undefined;
    }
    let result = erModel.sequencies[s.name];

    if (!result) {
      result = erModel.add(new Sequence({
        name: s.name,
        adapter: s.adapter
      }));
    }

    return result;
  };

  const createEntity = (e: IEntity): Entity => {
    if (!withAdapter) {
      e.adapter = undefined;
    }
    let result = erModel.entities[e.name];

    if (!result) {
      let parent: Entity | undefined;

      if (e.parent) {
        const pe = serialized.entities.find((p) => p.name === e.parent);

        if (!pe) {
          throw new Error(`Unknown entity ${e.parent}`);
        }

        parent = createEntity(pe);
      }
      erModel.add(
        result = new Entity({
          name: e.name,
          lName: e.lName,
          parent,
          isAbstract: e.isAbstract,
          semCategories: str2SemCategories(e.semCategories),
          adapter: e.adapter
        })
      );
    }

    return result;
  };

  const createAttribute = (_attr: IAttribute): Attribute => {
    const {name, lName, required} = _attr;
    let {adapter} = _attr;
    if (!withAdapter) {
      adapter = undefined;
    }
    const semCategories = str2SemCategories(_attr.semCategories);

    switch (_attr.type) {
      case "Detail": {
        const attr = _attr as IEntityAttribute;
        const entities = attr.references.map((e) => erModel.entities[e]);
        return new DetailAttribute({name, lName, required, entities, semCategories, adapter});
      }

      case "Parent": {
        const attr = _attr as IEntityAttribute;
        const entities = attr.references.map((e) => erModel.entities[e]);
        return new ParentAttribute({name, lName, entities, semCategories, adapter});
      }

      case "Entity": {
        const attr = _attr as IEntityAttribute;
        const entities = attr.references.map((e) => erModel.entity(e));
        return new EntityAttribute({name, lName, required, entities, semCategories, adapter});
      }

      case "String": {
        const {minLength, maxLength, defaultValue, autoTrim, mask} = _attr as IStringAttribute;
        return new StringAttribute({
          name, lName, required, minLength, maxLength, defaultValue, autoTrim, mask, semCategories, adapter
        });
      }

      case "Set": {
        const {presLen, attributes, references} = _attr as ISetAttribute;
        const entities = references.map((e) => erModel.entities[e]);
        const setAttribute = new SetAttribute({name, lName, required, presLen, entities, semCategories, adapter});
        attributes.forEach((a) => setAttribute.add(createAttribute(a)));
        return setAttribute;
      }

      case "Sequence": {
        const attr = _attr as ISequenceAttribute;
        return new SequenceAttribute({name, lName, sequence: erModel.sequence(attr.sequence), semCategories, adapter});
      }

      case "Integer": {
        const {minValue, maxValue, defaultValue} = _attr as INumberAttribute<number>;
        return new IntegerAttribute({name, lName, required, minValue, maxValue, defaultValue, semCategories, adapter});
      }

      case "Numeric": {
        const {precision, scale, minValue, maxValue, defaultValue} = _attr as INumericAttribute;
        return new NumericAttribute({
          name, lName, required, precision, scale, minValue, maxValue, defaultValue, semCategories, adapter
        });
      }

      case "Float": {
        const {minValue, maxValue, defaultValue} = _attr as INumberAttribute<number>;
        return new FloatAttribute({name, lName, required, minValue, maxValue, defaultValue, semCategories, adapter});
      }

      case "Boolean": {
        const {defaultValue} = _attr as IBooleanAttribute;
        return new BooleanAttribute({name, lName, required, defaultValue, semCategories, adapter});
      }

      case "Date": {
        const {minValue, maxValue, defaultValue} = _attr as IDateAttribute;
        return new DateAttribute({name, lName, required, minValue, maxValue, defaultValue, semCategories, adapter});
      }

      case "TimeStamp": {
        const {minValue, maxValue, defaultValue} = _attr as IDateAttribute;
        return new TimeStampAttribute({
          name, lName, required, minValue, maxValue, defaultValue, semCategories, adapter
        });
      }

      case "Time": {
        const {minValue, maxValue, defaultValue} = _attr as IDateAttribute;
        return new TimeAttribute({name, lName, required, minValue, maxValue, defaultValue, semCategories, adapter});
      }

      case "Blob": {
        return new BlobAttribute({name, lName, required, semCategories, adapter});
      }

      case "Enum": {
        const {values, defaultValue} = _attr as IEnumAttribute;
        return new EnumAttribute({name, lName, required, values, defaultValue, semCategories, adapter});
      }

      default:
        throw new Error(`Unknown attribute type ${_attr.type}`);
    }
  };

  const createAttributes = (e: IEntity): void => {
    const entity = erModel.entity(e.name);
    e.attributes.forEach((_attr) => entity.add(createAttribute(_attr)));
  };

  const createUnique = (e: IEntity): void => {
    const entity = erModel.entity(e.name);
    const values = e.unique.map((_values) => _values.map((_attr) => entity.ownAttribute(_attr)));
    values.forEach((attrs) => entity.addUnique(attrs));
  };

  serialized.sequences.forEach((s) => createSequence(s));
  serialized.entities.forEach((e) => createEntity(e));
  serialized.entities.forEach((e) => createAttributes(e));
  serialized.entities.forEach((e) => createUnique(e));

  return erModel;
}
