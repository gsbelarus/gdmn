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
import { IEntity, IAttribute, IEntityAttribute, ISetAttribute, ISequenceAttribute, INumberAttribute, INumericAttribute, IBooleanAttribute, IDateAttribute, IBlobAttribute, IEnumAttribute, IStringAttribute } from "./serialize";

// TODO serialize adapter - tmp
export function deserializeEntity(serializedEntity: IEntity, erModel: ERModel, withAdapter?: boolean): Entity {

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

  let parent: Entity | undefined;

  if (serializedEntity.parent) {
    const pe = erModel.entities[serializedEntity.parent];
    if (!pe) {
      throw new Error(`Unknown entity ${serializedEntity.parent}`);
    }
    parent = pe;
  }

  const newEntity = new Entity({
    name: serializedEntity.name,
    lName: serializedEntity.lName,

    parent,
    isAbstract: serializedEntity.isAbstract,
    semCategories: str2SemCategories(serializedEntity.semCategories),
    adapter: withAdapter ? serializedEntity.adapter : undefined
  });

  serializedEntity.attributes.forEach((_attr) => newEntity.add(createAttribute(_attr)));

  const values = serializedEntity.unique.map((_values) => _values.map((_attr) => newEntity.ownAttribute(_attr)));
  values.forEach((attrs) => newEntity.addUnique(attrs));

  return newEntity;
}
