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
import {AttributeTypes, ContextVariables, IEnumValue, BlobSubTypes} from "./types";

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

export function isINumericAttribute(attr: IAttribute): attr is INumericAttribute {
  return attr.type === 'Numeric' && typeof (attr as any).precision === 'number' && typeof (attr as any).scale === 'number';
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

export interface IBlobAttribute extends IAttribute {
  subType: BlobSubTypes;
}

export interface IEntityAttribute extends IAttribute {
  references: string[];
  defaultValue?: number;
}

export function isEntityAttribute(attr: IAttribute): attr is IEntityAttribute {
  return attr.type === 'Entity' && Array.isArray((attr as any).references);
}

export interface ISetAttribute extends IEntityAttribute {
  attributes: IAttribute[];
  presLen: number;
  isChar: boolean;
}

export function isSetAttribute(attr: IAttribute): attr is ISetAttribute {
  return attr.type === 'Set' && Array.isArray((attr as any).attributes) && Array.isArray((attr as any).references);
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
  defaultValue?: number;
}

export function isIEntity(e: any): e is IEntity {
  return e instanceof Object
    && typeof e.name === 'string'
    && e.lName instanceof Object
    && typeof e.isAbstract === 'boolean'
    && typeof e.semCategories === 'string'
    && typeof e.defaultValue === 'number'
    && Array.isArray(e.attributes);
}

export interface ISequence {
  name: string;
  adapter?: any;
}

export interface IERModel {
  entities: IEntity[];
  sequences: ISequence[];
}

export const deserializeEntity = (erModel: ERModel, serializedEntity: IEntity, withAdapter: boolean): Entity => {
  let result = erModel.entities[serializedEntity.name];

  if (!result) {
    let parent: Entity | undefined;

    if (serializedEntity.parent) {
      parent = erModel.entities[serializedEntity.parent];

      if (!parent) {
        throw new Error(`Unknown entity ${serializedEntity.parent}`);
      }
    }

    result = new Entity({
      name: serializedEntity.name,
      lName: serializedEntity.lName,
      parent,
      isAbstract: serializedEntity.isAbstract,
      semCategories: str2SemCategories(serializedEntity.semCategories),
      adapter: withAdapter ? serializedEntity.adapter : undefined
    });
  }

  return result;
};

  const deserializeAttribute = (erModel: ERModel, _attr: IAttribute, withAdapter: boolean): Attribute => {
  const {name, lName, required} = _attr;
  const adapter = withAdapter ? _attr.adapter : undefined;
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
      const defaultValue = attr.defaultValue;
      const entities = attr.references.map((e) => erModel.entity(e));
      return new EntityAttribute({name, lName, required, entities, semCategories, adapter, defaultValue});
    }

    case "String": {
      const {minLength, maxLength, defaultValue, autoTrim, mask} = _attr as IStringAttribute;
      return new StringAttribute({
        name, lName, required, minLength, maxLength, defaultValue, autoTrim, mask, semCategories, adapter
      });
    }

    case "Set": {
      const {presLen, isChar, attributes, references} = _attr as ISetAttribute;
      const entities = references.map((e) => erModel.entities[e]);
      const setAttribute = new SetAttribute({name, lName, required, presLen, isChar, entities, semCategories, adapter});
      attributes.forEach((a) => setAttribute.add(deserializeAttribute(erModel, a, withAdapter)));
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
      const {subType} = _attr as IBlobAttribute;
      return new BlobAttribute({name, lName, required, subType, semCategories, adapter});
    }

    case "Enum": {
      const {values, defaultValue} = _attr as IEnumAttribute;
      return new EnumAttribute({name, lName, required, values, defaultValue, semCategories, adapter});
    }

    default:
      throw new Error(`Unknown attribute type ${_attr.type}`);
  }
};

export const deserializeAttributes = (erModel: ERModel, e: IEntity, withAdapter: boolean): void => {
  const entity = erModel.entity(e.name);
  e.attributes.forEach((_attr) => entity.add(deserializeAttribute(erModel, _attr, withAdapter)));
};

export const deserializeUnique = (erModel: ERModel, e: IEntity): void => {
  const entity = erModel.entity(e.name);
  const values = e.unique.map((_values) => _values.map((_attr) => entity.ownAttribute(_attr)));
  values.forEach((attrs) => entity.addUnique(attrs));
};

const deserializeSequence = (erModel: ERModel, s: ISequence, withAdapter: boolean): Sequence => {
  let result = erModel.sequencies[s.name];

  if (!result) {
    result = erModel.add(new Sequence({
      name: s.name,
      adapter: withAdapter ? s.adapter : undefined
    }));
  }

  return result;
};

// TODO serialize adapter - tmp
export function deserializeERModel(serialized: IERModel, withAdapter?: boolean): ERModel {
  const erModel = new ERModel();

  serialized.sequences.forEach( s => deserializeSequence(erModel, s, !!withAdapter) );
  serialized.entities.forEach( e => {

    if (e.parent) {
      // если мы десериализуем модель целиком, то может получиться
      // ситуация, когда энтити для поля пэрэнт еще нет в модели
      // тогда мы заглянем в сериализованную модель и попробуем
      // сначала найти там такую энтити и создать
      //
      // если мы десиарилизуем ТОЛЬКО одну энтити, то энтити
      // для пэрэнта проверим в модели и если ее там нет, то
      // кинем ошибку

      let parent = erModel.entities[e.parent];

      if (!parent) {
        const pe = serialized.entities.find( p => p.name === e.parent );

        if (pe) {
          parent = deserializeEntity(erModel, pe, !!withAdapter);
          erModel.add(parent);
        }
      }

      if (!parent) {
        throw new Error(`Unknown entity ${e.parent}`);
      }
    }

    erModel.add(deserializeEntity(erModel, e, !!withAdapter));
  } );
  serialized.entities.forEach( e => deserializeAttributes(erModel, e, !!withAdapter) );
  serialized.entities.forEach( e => deserializeUnique(erModel, e) );

  return erModel;
}
