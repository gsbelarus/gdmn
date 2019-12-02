import {AConnection, ATransaction, DBSchema, FieldType, Relation, RelationField} from "gdmn-db";
import {
  appendAdapter,
  Attribute,
  BlobAttribute,
  BooleanAttribute,
  condition2Selectors,
  DateAttribute,
  DetailAttribute,
  Entity,
  EntityAttribute,
  EnumAttribute,
  ERModel,
  FloatAttribute,
  hasField,
  IAttributeAdapter,
  IEntityAdapter,
  IEntitySelector,
  IntegerAttribute,
  ISetAttributeAdapter,
  isUserDefined,
  MAX_16BIT_INT,
  MAX_32BIT_INT,
  MAX_64BIT_INT,
  MIN_16BIT_INT,
  MIN_32BIT_INT,
  MIN_64BIT_INT,
  NumericAttribute,
  ParentAttribute,
  relationName2Adapter,
  sameSelector,
  Sequence,
  SequenceAttribute,
  SetAttribute,
  StringAttribute,
  systemFields,
  TimeAttribute,
  TimeStampAttribute
} from "gdmn-orm";
import {AdapterUtils} from "../../AdapterUtils";
import {Constants} from "../Constants";
import {IATLoadResult, IATRelation, load} from "./atData";
import {loadDocument, LoadDocumentFunc} from "./document";
import {gdDomains} from "./gddomains";
import {GDEntities} from "./GDEntities";
import {
  check2DateRange,
  check2Enum,
  check2IntRange,
  check2NumberRange,
  check2StrMin,
  check2TimeRange,
  check2TimestampRange,
  default2Boolean,
  default2Date,
  default2Float,
  default2Int,
  default2String,
  default2Time,
  default2Timestamp,
  IRange,
  isCheckForBoolean
} from "./util";

export class ERExport {

  private readonly _connection: AConnection;
  private readonly _transaction: ATransaction;
  private readonly _dbSchema: DBSchema;
  private readonly _erModel: ERModel;
  private readonly _gdEntities: GDEntities;
  private _atResult: IATLoadResult | undefined;

  constructor(connection: AConnection, transaction: ATransaction, dbSchema: DBSchema, erModel: ERModel) {
    this._connection = connection;
    this._transaction = transaction;
    this._dbSchema = dbSchema;
    this._erModel = erModel;
    this._gdEntities = new GDEntities(this._connection, transaction, dbSchema, erModel);
  }

  public async execute(): Promise<ERModel> {
    this._atResult = await load(this._connection, this._transaction);

    this._erModel.add(new Sequence({name: Constants.GLOBAL_GENERATOR}));

    if (this._dbSchema.relations["GD_DOCUMENT"]) {
      await this._gdEntities.create(this._getATResult());
      this._createEntities(true);
      await this._createDocuments();
    } else {
      this._createEntities(false);
    }

    Object.values(this._erModel.entities).sort((a, b) => a.adapter!.relation.length - b.adapter!.relation.length)
      .forEach(entity => this._createAttributes(entity));
    this._createDetailAttributes();
    this._createSetAttributes();

    return this._erModel;
  }

  private _getATResult(): IATLoadResult {
    if (!this._atResult) {
      throw new Error("atResult is undefined");
    }
    return this._atResult;
  }

  private _addEntity(entity: Entity) {
    if (!this._erModel.entities[entity.name]) {
      this._erModel.add(entity);
    } else {
      console.log(`Entity ${entity.name} already exists`);
    }
  }

  private _createDocuments() {

    const TgdcUserDocument = this._erModel.entities["TgdcUserDocument"];

    if (!TgdcUserDocument) {
      // это не бд гедымина
      return Promise.resolve();
    }

    const createDocEntity = (classPrefix: string, namePrefix: string, ruid: string, parent_ruid: string, name: string, r: string, docTypeID?: number) => {
      const parentClassName = `${classPrefix}${parent_ruid}`;
      const className = `${classPrefix}${ruid}`;
      const atRelation = this._getATResult().atRelations[r];
      const semCategories = atRelation ? atRelation.semCategories : undefined;
      const parent = this._erModel.entities[parentClassName];

      let adapter: IEntityAdapter | undefined;

      const pk = AdapterUtils.getPK4Adapter(["DOCUMENTKEY"]);
      if (parent && parent.adapter) {
        adapter = appendAdapter(parent.adapter, r, pk);
      } else {
        adapter = (r ? relationName2Adapter(r, pk) : undefined);
      }

      if (adapter && docTypeID) {
        adapter.relation[0].selector = {
          field: "DOCUMENTTYPEKEY",
          value: docTypeID
        };
      }

      const entity = new Entity({
        parent,
        name: className,
        lName: {ru: {name: `${namePrefix} ${name}`}},
        semCategories,
        adapter
      });

      this._addEntity(entity);
    };

    const loadDocumentFunc: LoadDocumentFunc = (id: number, ruid: string, parent_ruid: string, name: string, className: string, hr: string, lr: string) => {
      switch (className) {
        case "TgdcUserDocumentType": {
          createDocEntity("TgdcUserDocument", "Документ", ruid, parent_ruid, name, hr, id);
          if (lr) {
            createDocEntity("TgdcUserDocumentLine", "Позиция", ruid, parent_ruid, name, lr, id);
          }
          return;
        }
        case "TgdcInvDocumentType": {
          createDocEntity("TgdcInvDocument", "Документ", ruid, parent_ruid, name, hr, id);
          if (lr) {
            createDocEntity("TgdcInvDocumentLine", "Позиция", ruid, parent_ruid, name, lr, id);
          }
          return;
        }
        case "TgdcInvPriceListType": {
          createDocEntity("TgdcInvPriceList", "Документ", ruid, parent_ruid, name, hr, id);
          if (lr) {
            createDocEntity("TgdcInvPriceListLine", "Позиция", ruid, parent_ruid, name, lr, id);
          }
          return;
        }
        case "TgdcDocumentType": {
          createDocEntity("TgdcDocument", "Документ", ruid, parent_ruid, name, hr, id);
          return;
        }
      }
    };

    return loadDocument(this._connection, this._transaction, loadDocumentFunc);
  }

  private _createEntities(onlyUSRRelations: boolean): void {
    interface IRelationLink {
      atRelationName: string;
      atRelation: IATRelation;
      relation: Relation;
    }

    const usrRelations = Object.entries(this._getATResult().atRelations).filter(([atRelationName]) => !onlyUSRRelations || atRelationName.startsWith("USR$"));

    let inheritedRelations = usrRelations.reduce((p, [atRelationName, atRelation]) => {
      const relation = this._dbSchema.relations[atRelationName];

      if (relation.primaryKey) {
        if (relation.primaryKey.fields[0] === Constants.DEFAULT_ID_NAME) {
          this._addEntity(this._createEntity(undefined, relation, atRelation));
        } else if (relation.primaryKey.fields[0] === Constants.DEFAULT_INHERITED_KEY_NAME) {
          p.push({
            atRelationName,
            atRelation,
            relation
          });
        }
      }

      return p;
    }, [] as IRelationLink[]);

    /**
     * В случае если внешний ключ ведет на таблицу, для которой нет сущности
     * в модели, код сканирования может зациклится. Мы ограничиваем число циклов.
     * Это же ограничение и будет ограничением максимального числа уровней
     * наследования.
     */
    let infiniteLoadingPreventer = 12;

    while (--infiniteLoadingPreventer && inheritedRelations.length) {
      inheritedRelations = inheritedRelations.reduce((p, r) => {
        const {relation, atRelation} = r;
        const inheritedFk = Object.values(relation.foreignKeys)
          .find((fk) => fk.fields.includes(Constants.DEFAULT_INHERITED_KEY_NAME));
        if (inheritedFk) {
          const refRelation = this._dbSchema.relationByUqConstraint(inheritedFk.constNameUq);
          const parent = this._erModel.relation2Entity[refRelation.name];
          if (parent) {
            this._addEntity(this._createEntity(parent, relation, atRelation));
          } else {
            p.push(r);
          }
        }
        return p;
      }, [] as IRelationLink[]);
    }

    if (!infiniteLoadingPreventer) {
      console.log(`There are inherited entities with unknown parent.`);
    }
  }

  private _createEntity(parent: Entity | undefined, relation: Relation, atRelation: IATRelation): Entity {
    const name = atRelation && atRelation.entityName ? atRelation.entityName : relation.name;
    const lName = atRelation ? atRelation.lName : {};
    const semCategories = atRelation ? atRelation.semCategories : undefined;
    const pk = AdapterUtils.getPK4Adapter(relation.primaryKey!.fields);
    const adapter = parent
      ? appendAdapter(parent.adapter!, relation.name, pk)
      : relationName2Adapter(relation.name, pk);

    const entity = new Entity({parent, name, lName, semCategories, adapter});
    if (parent) {
      entity.add(new EntityAttribute({
        name: Constants.DEFAULT_INHERITED_KEY_NAME,
        required: true,
        lName: {ru: {name: "Родитель"}},
        entities: [parent],
        adapter: {
          relation: AdapterUtils.getOwnRelationName(entity),
          field: Constants.DEFAULT_INHERITED_KEY_NAME
        }
      }));
    } else {
      entity.add(
        new SequenceAttribute({
          name: Constants.DEFAULT_ID_NAME,
          lName: {ru: {name: "Идентификатор"}},
          sequence: this._erModel.sequencies[Constants.GLOBAL_GENERATOR],
          adapter: {
            relation: AdapterUtils.getOwnRelationName(entity),
            field: Constants.DEFAULT_ID_NAME
          }
        })
      );
    }
    return entity;
  }

  private _createAttributes(entity: Entity): void {
    const ownRelationName = AdapterUtils.getOwnRelationName(entity);
    entity.adapter!.relation.forEach(rel => {
      const relation = this._dbSchema.relations[rel.relationName];

      if (!relation) {
        throw new Error(`Relation ${rel.relationName} not found in db schema.`);
      }

      const atRelation = this._getATResult().atRelations[relation.name];

      if (!atRelation) {
        throw new Error(`Relation ${relation.name} not found in AT_RELATIONS table. Synchronization needed.`);
      }

      Object.values(relation.relationFields).forEach(relationField => {
        if (rel.fields && !rel.fields.includes(relationField.name)) {
          return;
        }

        if (relation.primaryKey && relation.primaryKey.fields.includes(relationField.name)) {
          return;
        }

        if (!hasField(entity.adapter!, relation.name, relationField.name)
          && !systemFields.find((sf) => sf === relationField.name)
          && !isUserDefined(relationField.name)) {
          return;
        }

        if (entity.adapter!.relation[0].selector && entity.adapter!.relation[0].selector!.field === relationField.name) {
          return;
        }

        const atRelationField = atRelation.relationFields[relationField.name];

        if (atRelationField) {
          if (atRelationField.crossTable || atRelationField.masterEntityName) {
            return;
          }
        }

        const attribute = this._createAttribute(relation, relationField);

        // ignore duplicates and override parent attributes
        if ((ownRelationName === rel.relationName && !entity.hasOwnAttribute(attribute.name))
          || !entity.hasAttribute(attribute.name)) {
          entity.add(attribute);
        }
      });

      Object.values(relation.unique).forEach((uq) => {
        const attrs = uq.fields.map((field) => {
          let uqAttr = Object.values(entity.attributes).find((attr) => attr.adapter.field === field);
          if (!uqAttr) {
            uqAttr = entity.attribute(field);
          }
          return uqAttr;
        });
        entity.addUnique(attrs);
      });
    });
  }

  private _createDetailAttributes(): void {
    Object.entries(this._getATResult().atRelations).forEach(([atRelationName, atRelation]) => {
      Object.entries(atRelation.relationFields).forEach(([atRelationFieldName, atRelationField]) => {
        if (atRelationField.masterEntityName) {
          const relation = this._dbSchema.relations[atRelationName];
          const relationField = relation.relationFields[atRelationFieldName];
          const detailEntityName = atRelation && atRelation.entityName ? atRelation.entityName : relation.name;
          const detailEntity = this._erModel.entity(detailEntityName);
          const masterEntity = this._erModel.entity(atRelationField.masterEntityName);

          const name = atRelationField && atRelationField.attrName !== undefined ? atRelationField.attrName : relationField.name;
          const atField = this._getATResult().atFields[relationField.fieldSource];
          const fieldSource = this._dbSchema.fields[relationField.fieldSource];
          const required: boolean = relationField.notNull || fieldSource.notNull;
          const lName = atRelationField ? atRelationField.lName : (atField ? atField.lName : {});
          const detailAdapter = {
            masterLinks: [{
              detailRelation: detailEntity.name,
              link2masterField: relationField.name
            }]
          };

          masterEntity.add(new DetailAttribute({
            name, lName, required, entities: [detailEntity],
            semCategories: atRelationField ? atRelationField.semCategories : [],
            adapter: detailAdapter
          }));
        }
      });
    });
  }

  /**
   * Looking for cross-tables and construct set attributes.
   *
   * 1. Cross tables are those whose PK consists of minimum 2 fields.
   * 2. First field of cross table PK must be a FK referencing owner table.
   * 3. Second field of cross table PK must be a FK referencing reference table.
   * 4. Owner in this context is an Entity(s) a Set attribute belongs to.
   * 5. Reference in this context is an Entity(s) a Set attribute contains objects of which type.
   */
  private _createSetAttributes(): void {
    Object.entries(this._dbSchema.relations).forEach(([crossName, crossRelation]) => { // TODO correct ordering
      if (this._isCrossRelation(crossRelation)) {
        const fkOwner = Object
          .values(crossRelation.foreignKeys)
          .find((fk) => fk.fields.length === 1 && fk.fields[0] === crossRelation.primaryKey!.fields[0]);

        if (!fkOwner) return;

        const fkReference = Object
          .values(crossRelation.foreignKeys)
          .find((fk) => fk.fields.length === 1 && fk.fields[0] === crossRelation.primaryKey!.fields[1]);

        if (!fkReference) return;

        const relOwner = this._dbSchema.relationByUqConstraint(fkOwner.constNameUq);
        const atRelOwner = this._getATResult().atRelations[relOwner.name];

        if (!atRelOwner) return;

        let entitiesOwner: Entity[];

        const crossRelationAdapter = GDEntities.CROSS_RELATIONS_ADAPTERS[crossName];

        if (crossRelationAdapter) {
          entitiesOwner = this._findEntities(crossRelationAdapter.owner, crossRelationAdapter.selector ?
            [crossRelationAdapter.selector] : undefined);
        } else {
          entitiesOwner = this._findEntities(relOwner.name);
        }

        if (!entitiesOwner.length) {
          return;
        }

        const relReference = this._dbSchema.relationByUqConstraint(fkReference.constNameUq);

        let cond: IEntitySelector[] | undefined;
        const atSetField = Object.entries(atRelOwner.relationFields).find(
          (rf) => rf[1].crossTable === crossName
        );
        const atSetFieldSource = atSetField ? this._getATResult().atFields[atSetField[1].fieldSource] : undefined;
        if (atSetFieldSource && atSetFieldSource.setTable === relReference.name && atSetFieldSource.setCondition) {
          cond = condition2Selectors(atSetFieldSource.setCondition);
        }

        const referenceEntities = this._findEntities(relReference.name, cond);

        if (!referenceEntities.length) {
          return;
        }

        const setField = atSetField ? relOwner.relationFields[atSetField[0]] : undefined;
        const setFieldSource = setField ? this._dbSchema.fields[setField.fieldSource] : undefined;
        const atCrossRelation = this._getATResult().atRelations[crossName];

        entitiesOwner.forEach((entity) => {
          if (!Object.values(entity.attributes).find((attr) =>
            (attr instanceof SetAttribute) && attr.adapter!.crossRelation === crossName)) {

            // for custom set field
            let name = atSetField && atSetField[0] || crossName;
            const adapter: ISetAttributeAdapter = {
              crossRelation: crossName,
              crossPk: crossRelation.primaryKey!.fields
            };
            if (atSetField) {
              const [a, atSetRelField] = atSetField;
              name = atSetRelField && atSetRelField.attrName || name;
              if (a !== name) {
                adapter.presentationField = a;
              }
            }
            const setAttr = new SetAttribute({
                name,
                lName: atSetField ? atSetField[1].lName : (atCrossRelation ? atCrossRelation.lName : {en: {name: crossName}}),
                required: (!!setField && setField.notNull) || (!!setFieldSource && setFieldSource.notNull),
                entities: referenceEntities,
                presLen: (setFieldSource && setFieldSource.fieldType === FieldType.VARCHAR) ? setFieldSource.fieldLength : 0,
                isChar: (setFieldSource && setFieldSource.fieldType === FieldType.VARCHAR) ? true : false,
                semCategories: atCrossRelation.semCategories,
                adapter
              }
            );

            Object.entries(crossRelation.relationFields).forEach(([addName, addField]) => {
              if (!crossRelation.primaryKey!.fields.find(f => f === addName)) {
                setAttr.add(this._createAttribute(crossRelation, addField));
              }
            });

            entity.add(setAttr);
          }
        });
      }
    });
  }

  private _isCrossRelation(relation: Relation): boolean {
    return !!relation.primaryKey && relation.primaryKey.fields.length >= 2;
  }

  private _createAttribute(relation: Relation,
                           relationField: RelationField): Attribute {
    const atRelation = this._getATResult().atRelations[relation.name];
    const atRelationField = atRelation ? atRelation.relationFields[relationField.name] : undefined;
    const atField = this._getATResult().atFields[relationField.fieldSource];
    const fieldSource = this._dbSchema.fields[relationField.fieldSource];

    const name = atRelationField && atRelationField.attrName !== undefined ? atRelationField.attrName : relationField.name;
    const required: boolean = relationField.notNull || fieldSource.notNull;
    const defaultValueSource: string | null = relationField.defaultSource || fieldSource.defaultSource;
    const lName = atRelationField ? atRelationField.lName : (atField ? atField.lName : {});
    const semCategories = atRelationField ? atRelationField.semCategories : [];
    const adapter: IAttributeAdapter = {
      relation: relation.name,
      field: relationField.name
    };

    const createDomainFunc = gdDomains[relationField.fieldSource];

    if (createDomainFunc) {
      return createDomainFunc(name, lName, adapter);
    }

    // numeric and decimal
    if (fieldSource.fieldSubType === 1 || fieldSource.fieldSubType === 2) {
      const factor = Math.pow(10, Math.abs(fieldSource.fieldScale));
      let range: IRange<number | undefined> | undefined;
      switch (fieldSource.fieldType) {
        case FieldType.SMALL_INTEGER:
          range = check2IntRange(fieldSource.validationSource, {
            min: MIN_16BIT_INT * factor,
            max: MAX_16BIT_INT * factor
          });
          break;
        case FieldType.INTEGER:
          range = check2IntRange(fieldSource.validationSource, {
            min: MIN_32BIT_INT * factor,
            max: MAX_32BIT_INT * factor
          });
          break;
        case FieldType.BIG_INTEGER:
          range = check2IntRange(fieldSource.validationSource, {
            min: MIN_64BIT_INT * factor,
            max: MAX_64BIT_INT * factor
          });
          break;
      }
      if (range) {
        return new NumericAttribute({
          name, lName, required, semCategories, adapter,
          precision: fieldSource.fieldPrecision,
          scale: Math.abs(fieldSource.fieldScale),
          minValue: range.minValue, maxValue: range.maxValue,
          defaultValue: default2Float(defaultValueSource)
        });
      }
    }

    switch (fieldSource.fieldType) {
      case 23: {    // TODO BOOLEAN FB 3
        const defaultValue = default2Boolean(defaultValueSource);
        return new BooleanAttribute({name, lName, required, defaultValue, semCategories, adapter});
      }
      case FieldType.SMALL_INTEGER: {
        if (isCheckForBoolean(fieldSource.validationSource)) {
          const defaultValue = default2Boolean(defaultValueSource);
          return new BooleanAttribute({name, lName, required, defaultValue, semCategories, adapter});
        }
        const {minValue, maxValue} = check2IntRange(fieldSource.validationSource, {
          min: MIN_16BIT_INT,
          max: MAX_16BIT_INT
        });
        const defaultValue = default2Int(defaultValueSource);
        return new IntegerAttribute({
          name,
          lName,
          required,
          minValue,
          maxValue,
          defaultValue,
          semCategories,
          adapter
        });
      }
      case FieldType.BIG_INTEGER: {
        const {minValue, maxValue} = check2IntRange(fieldSource.validationSource, {
          min: MIN_64BIT_INT,
          max: MAX_64BIT_INT
        });
        const defaultValue = default2Int(defaultValueSource);
        return new IntegerAttribute({
          name,
          lName,
          required,
          minValue,
          maxValue,
          defaultValue,
          semCategories,
          adapter
        });
      }
      case FieldType.INTEGER: {
        const fk = Object.values(relation.foreignKeys).find((fk) => fk.fields.includes(adapter.field));

        if (fk && fk.fields.length) {
          const refRelationName = this._dbSchema.relationByUqConstraint(fk.constNameUq).name;
          const cond = atField && atField.refCondition ? condition2Selectors(atField.refCondition) : undefined;
          const refEntities = this._findEntities(refRelationName, cond);

          if (!refEntities.length) {
            console.warn(`${relation.name}.${relationField.name}: no entities for table ${refRelationName}${cond ? ", condition: " + JSON.stringify(cond) : ""}`);
          }

          if (relationField.name === Constants.DEFAULT_PARENT_KEY_NAME) {
            return new ParentAttribute({
              name,
              lName,
              entities: refEntities,
              semCategories,
              adapter: {
                relation: relation.name,
                field: relationField.name
              }
            });
          }
          return new EntityAttribute({name, lName, required, entities: refEntities, semCategories, adapter});
        } else {
          const {minValue, maxValue} = check2IntRange(fieldSource.validationSource, {
            min: MIN_32BIT_INT,
            max: MAX_32BIT_INT
          });
          const defaultValue = default2Int(defaultValueSource);
          return new IntegerAttribute({
            name, lName, required, minValue, maxValue, defaultValue, semCategories, adapter
          });
        }
      }
      case FieldType.CHAR:
      case FieldType.VARCHAR: {
        if (fieldSource.fieldLength === 1) {
          const values = check2Enum(fieldSource.validationSource);
          if (values.length) {
            const dif = atField.numeration ? atField.numeration.split("\r\n") : [];
            const mapValues = dif.reduce((map, item) => {
              const [key, value] = item.split(";");
              map[key] = value;
              return map;
            }, {} as { [field: string]: string });
            const defaultValue = default2String(defaultValueSource);

            return new EnumAttribute({
              name, lName, required,
              values: values.map((value) => ({
                value,
                lName: mapValues[value] ? {ru: {name: mapValues[value]}} : undefined
              })),
              defaultValue, semCategories, adapter
            });
          }
        }

        const minLength = check2StrMin(fieldSource.validationSource);
        const defaultValue = default2String(defaultValueSource);
        return new StringAttribute({
          name, lName, required, minLength, maxLength: fieldSource.fieldLength,
          defaultValue, autoTrim: true, semCategories, adapter
        });
      }
      case FieldType.TIMESTAMP: {
        const {minValue, maxValue} = check2TimestampRange(fieldSource.validationSource);
        const defaultValue = default2Timestamp(defaultValueSource);
        return new TimeStampAttribute({
          name, lName, required, minValue, maxValue, defaultValue, semCategories, adapter
        });
      }
      case FieldType.DATE: {
        const {minValue, maxValue} = check2DateRange(fieldSource.validationSource);
        const defaultValue = default2Date(defaultValueSource);
        return new DateAttribute({name, lName, required, minValue, maxValue, defaultValue, semCategories, adapter});
      }
      case FieldType.TIME: {
        const {minValue, maxValue} = check2TimeRange(fieldSource.validationSource);
        const defaultValue = default2Time(defaultValueSource);
        return new TimeAttribute({name, lName, required, minValue, maxValue, defaultValue, semCategories, adapter});
      }
      case FieldType.FLOAT:
      case FieldType.DOUBLE: {
        const {minValue, maxValue} = check2NumberRange(fieldSource.validationSource);
        const defaultValue = default2Float(defaultValueSource);
        return new FloatAttribute({name, lName, required, minValue, maxValue, defaultValue, semCategories, adapter});
      }
      case FieldType.BLOB: {
        if (fieldSource.fieldSubType === 1) {
          const minLength = check2StrMin(fieldSource.validationSource);
          const defaultValue = default2String(defaultValueSource);
          return new StringAttribute({
            name, lName, required, minLength: minLength,
            defaultValue, autoTrim: false, semCategories, adapter
          });
        }
        return new BlobAttribute({name, lName, required, semCategories, adapter});
      }
      default:
        throw new Error(`Unknown data type ${fieldSource.fieldType} for field ${relation.name}.${name}`);
    }
  }

  private _findEntities(relationName: string, selectors: IEntitySelector[] = []): Entity[] {
    const found = Object.values(this._erModel.entities).reduce((p, entity) => {
      if (entity.adapter) {
        const rel = entity.adapter.relation.find(r => r.relationName === relationName && !r.weak);
        if (rel) {
          if (rel.selector && selectors.length) {
            if (selectors.find(s => sameSelector(s, rel.selector))) {
              p.push(entity);
            }
          } else {
            p.push(entity);
          }
        }
      }

      return p;
    }, [] as Entity[]);

    while (found.length) {
      const descendant = found.findIndex((d) => !!found.find((a) => a !== d && d.hasAncestor(a)));
      if (descendant === -1) break;
      found.splice(descendant, 1);
    }

    return found;
  }
}
