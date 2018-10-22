import {AConnection, ATransaction, DBStructure, FieldType, Relation, RelationField} from "gdmn-db";
import {SemCategory} from "gdmn-nlp";
import {
  adjustName,
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
  ICrossRelations,
  IEntityAdapter,
  IEntitySelector,
  ILName,
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
  relationNames2Adapter,
  sameAdapter,
  ScalarAttribute,
  Sequence,
  SequenceAttribute,
  SetAttribute,
  StringAttribute,
  systemFields,
  TimeAttribute,
  TimeStampAttribute
} from "gdmn-orm";
import {IParentAttributeAdapter} from "gdmn-orm/src/rdbadapter";
import {Builder} from "../builder/Builder";
import {Constants} from "../Constants";
import {IATRelationField, load} from "./atData";
import {loadDocument} from "./document";
import {gdDomains} from "./gddomains";
import {gedeminTables} from "./gdTables";
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

export async function erexport_old(dbs: DBStructure, connection: AConnection, transaction: ATransaction, erModel: ERModel): Promise<ERModel> {

  const {atFields, atRelations} = await load(connection, transaction);

  const crossRelationsAdapters: ICrossRelations = {
    "GD_CONTACTLIST": {
      owner: "GD_CONTACT",
      selector: {
        field: "CONTACTTYPE",
        value: 1
      }

    }
  };

  const abstractBaseRelations: { [name: string]: boolean } = {
    "GD_CONTACT": true
  };

  /**
   * Если имя генератора совпадает с именем объекта в БД, то адаптер можем не указывать.
   */

  const GDGUnique = erModel.addSequence(new Sequence({name: Constants.GLOBAL_GENERATOR}));
  erModel.addSequence(new Sequence({name: "Offset", sequence: "GD_G_OFFSET"}));

  function findEntities(relationName: string, selectors: IEntitySelector[] = []): Entity[] {
    const found = Object.entries(erModel.entities).reduce((p, e) => {
      if (e[1].adapter) {
        e[1].adapter.relation.forEach(r => {
          if (r.relationName === relationName && !r.weak) {
            if (r.selector && selectors.length) {
              if (selectors.find(s => s.field === r.selector!.field && s.value === r.selector!.value)) {
                p.push(e[1]);
              }
            } else {
              p.push(e[1]);
            }
          }
        });
      }

      return p;
    }, [] as Entity[]);

    while (found.length) {
      const descendant = found.findIndex(d => !!found.find(a => a !== d && d.hasAncestor(a)));
      if (descendant === -1) break;
      found.splice(descendant, 1);
    }

    return found;
  }

  function createEntity(parent: Entity | undefined, adapter: IEntityAdapter,
                        abstract?: boolean, entityName?: string, lName?: ILName, semCategories: SemCategory[] = [], attributes?: Attribute[]): Entity {
    if (!abstract) {
      const found = Object.values(erModel.entities).find(
        (entity) => !entity.isAbstract && sameAdapter(adapter, entity.adapter)
      );

      if (found) {
        return found;
      }
    }

    const relation = adapter.relation.filter(r => !r.weak).reverse()[0];

    if (!relation || !relation.relationName) {
      throw new Error("Invalid entity adapter");
    }

    const atRelation = atRelations[relation.relationName];
    // for custom entity names
    const name = adjustName(entityName || atRelation.entityName || relation.relationName);
    const fake = relationName2Adapter(name);

    const entity = new Entity({
      parent,
      name,
      lName: lName ? lName : (atRelation ? atRelation.lName : {}),
      isAbstract: !!abstract,
      semCategories,
      adapter: JSON.stringify(adapter) !== JSON.stringify(fake) ? adapter : undefined
    });

    if (!parent) {
      entity.add(
        new SequenceAttribute({
          name: Constants.DEFAULT_ID_NAME,
          lName: {ru: {name: "Идентификатор"}},
          sequence: GDGUnique
        })
      );
    } else {
      entity.add(
        new SequenceAttribute({
          name: Constants.DEFAULT_ID_NAME,
          lName: {ru: {name: "Идентификатор"}},
          sequence: GDGUnique,
          adapter: {
            relation: Builder._getOwnRelationName(entity),
            field: Constants.DEFAULT_INHERITED_KEY_NAME
          }
        })
      );
    }

    if (attributes) {
      attributes.forEach(attr => entity.add(attr));
    }

    return erModel.add(entity);
  }

  Object.keys(atRelations).forEach((item) => createEntity(undefined, relationName2Adapter(item)));

  /**
   * Простейший случай таблицы. Никаких ссылок.
   */

  if (dbs.findRelation((rel) => rel.name === "WG_HOLIDAY")) {
    createEntity(undefined, relationName2Adapter("WG_HOLIDAY"));
  }

  /**
   * Административно-территориальная единица.
   * Тут исключительно для иллюстрации типа данных Перечисление.
   */

  if (dbs.findRelation((rel) => rel.name === "GD_PLACE")) {
    createEntity(undefined, relationName2Adapter("GD_PLACE"), false, undefined, undefined, [SemCategory.Place],
      [
        new EnumAttribute({
          name: "PLACETYPE",
          lName: {ru: {name: "Тип"}},
          required: true,
          values: [{value: "Область"}, {value: "Район"}],
          defaultValue: "Область"
        })
      ]);
  }

  /**
   * Папка из справочника контактов.
   * Основывается на таблице GD_CONTACT, но использует только несколько полей из нее.
   * Записи имеют признак CONTACTTYPE = 0.
   * Имеет древовидную структуру.
   */
  if (dbs.findRelation((rel) => rel.name === "GD_CONTACT")) {
    const Folder = createEntity(undefined,
      {
        relation: [{
          relationName: "GD_CONTACT",
          selector: {
            field: "CONTACTTYPE",
            value: 0
          },
          fields: [
            Constants.DEFAULT_PARENT_KEY_NAME,
            "NAME"
          ]
        }]
      },
      false,
      "Folder", {ru: {name: "Папка"}}
    );
    Folder.add(
      new ParentAttribute({
        name: Constants.DEFAULT_PARENT_KEY_NAME,
        lName: {ru: {name: "Входит в папку"}},
        entities: [Folder]
      })
    );

    /**
     * Компания хранится в трех таблицах.
     * Две обязательные GD_CONTACT - GD_COMPANY. В адаптере они указываются
     * в массиве relation и соединяются в запросе оператором JOIN.
     * Первой указывается главная таблица. Остальные таблицы называются
     * дополнительными. Первичный ключ дополнительной таблицы
     * должен одновременно являться внешним ключем на главную.
     * Третья -- GD_COMPANYCODE -- необязательная. Подключается через LEFT JOIN.
     * Для атрибутов из главной таблицы можно не указывать адаптер, если их имя
     * совпадает с именем поля.
     * Флаг refresh означает, что после вставки/изменения записи ее надо перечитать.
     */
    const Company = createEntity(undefined,
      {
        relation: [
          {
            relationName: "GD_CONTACT",
            selector: {
              field: "CONTACTTYPE",
              value: 3
            }
          },
          {
            relationName: "GD_COMPANY"
          },
          {
            relationName: "GD_COMPANYCODE",
            weak: true
          }
        ],
        refresh: true
      },
      false,
      "Company", {ru: {name: "Организация"}},
      [SemCategory.Company],
      [
        new ParentAttribute({
          name: Constants.DEFAULT_PARENT_KEY_NAME,
          lName: {ru: {name: "Входит в папку"}},
          entities: [Folder]
        }),
        new StringAttribute({
          name: "NAME",
          lName: {ru: {name: "Краткое наименование"}},
          required: true,
          maxLength: 60,
          autoTrim: true
        })
      ]
    );

    createEntity(Company,
      {
        relation: [
          {
            relationName: "GD_CONTACT",
            selector: {
              field: "CONTACTTYPE",
              value: 3
            }
          },
          {
            relationName: "GD_COMPANY"
          },
          {
            relationName: "GD_COMPANYCODE",
            weak: true
          },
          {
            relationName: "GD_OURCOMPANY"
          }
        ],
        refresh: true
      },
      false,
      "OurCompany", {ru: {name: "Рабочая организация"}}
    );

    /**
     * Банк является частным случаем компании (наследуется от компании).
     * Все атрибуты компании являются и атрибутами банка и не нуждаются
     * в повторном определении, за тем исключением, если мы хотим что-то
     * поменять в параметрах атрибута.
     */
    createEntity(Company,
      {
        relation: [
          {
            relationName: "GD_CONTACT",
            selector: {
              field: "CONTACTTYPE",
              value: 5
            }
          },
          {
            relationName: "GD_COMPANY"
          },
          {
            relationName: "GD_COMPANYCODE",
            weak: true
          },
          {
            relationName: "GD_BANK"
          }
        ],
        refresh: true
      },
      false,
      "Bank", {ru: {name: "Банк"}}
    );

    /**
     * Подразделение организации может входить (через поле Parent) в
     * организацию (компания, банк) или в другое подразделение.
     */
    const Department = createEntity(undefined,
      {
        relation: [{
          relationName: "GD_CONTACT",
          selector: {
            field: "CONTACTTYPE",
            value: 4
          }
        }]
      },
      false,
      "Department", {ru: {name: "Подразделение"}}
    );
    Department.add(
      new ParentAttribute({
        name: Constants.DEFAULT_PARENT_KEY_NAME,
        lName: {ru: {name: "Входит в организацию (подразделение)"}},
        entities: [Company, Department]
      })
    );
    Department.add(
      new StringAttribute({
        name: "NAME", lName: {ru: {name: "Наименование"}}, required: true,
        maxLength: 60, autoTrim: true
      })
    );

    /**
     * Физическое лицо хранится в двух таблицах GD_CONTACT - GD_PEOPLE.
     */
    const Person = createEntity(undefined,
      {
        relation: [
          {
            relationName: "GD_CONTACT",
            selector: {
              field: "CONTACTTYPE",
              value: 2
            }
          },
          {
            relationName: "GD_PEOPLE"
          }
        ],
        refresh: true
      },
      false,
      "Person", {ru: {name: "Физическое лицо"}}
    );
    Person.add(
      new ParentAttribute({
        name: Constants.DEFAULT_PARENT_KEY_NAME,
        lName: {ru: {name: "Входит в папку"}},
        entities: [Folder]
      })
    );
    Person.add(
      new StringAttribute({
        name: "NAME", lName: {ru: {name: "ФИО"}}, required: true,
        maxLength: 60, autoTrim: true
      })
    );

    /**
     * Сотрудник, частный случай физического лица.
     * Добавляется таблица GD_EMPLOYEE.
     */
    const Employee = createEntity(Person,
      {
        relation: [
          {
            relationName: "GD_CONTACT",
            selector: {
              field: "CONTACTTYPE",
              value: 2
            }
          },
          {
            relationName: "GD_PEOPLE"
          },
          {
            relationName: "GD_EMPLOYEE"
          }
        ]
      },
      false,
      "Employee", {ru: {name: "Сотрудник предприятия"}}
    );
    Employee.add(
      new ParentAttribute({
        name: Constants.DEFAULT_PARENT_KEY_NAME,
        lName: {ru: {name: "Организация или подразделение"}},
        entities: [Company, Department]
      })
    );

    /**
     * Группа контактов.
     * CONTACTLIST -- множество, которое хранится в кросс-таблице.
     */
    const Group = createEntity(undefined,
      {
        relation:
          [{
            relationName: "GD_CONTACT",
            selector: {
              field: "CONTACTTYPE",
              value: 1
            },
            fields: [
              Constants.DEFAULT_PARENT_KEY_NAME,
              "NAME"
            ]
          }]
      },
      false,
      "Group", {ru: {name: "Группа"}}
    );
    Group.add(
      new ParentAttribute({
        name: Constants.DEFAULT_PARENT_KEY_NAME,
        lName: {ru: {name: "Входит в папку"}},
        entities: [Folder]
      })
    );
    Group.add(
      new SetAttribute({
          name: "CONTACTLIST", lName: {ru: {name: "Контакты"}}, entities: [Company, Person],
          adapter: {
            crossRelation: "GD_CONTACTLIST"
          }
        }
      )
    );

    const companyAccount = createEntity(undefined, relationName2Adapter("GD_COMPANYACCOUNT"));

    Company.add(
      new DetailAttribute({
          name: "GD_COMPANYACCOUNT", lName: {ru: {name: "Банковские счета"}}, entities: [companyAccount],
          adapter: {
            masterLinks: [
              {
                detailRelation: "GD_COMPANYACCOUNT",
                link2masterField: "COMPANYKEY"
              }
            ]
          }
        }
      )
    );

    gedeminTables.forEach((t) => {
      if (dbs.findRelation((rel) => rel.name === t)) {
        createEntity(undefined, relationName2Adapter(t));
      }
    });
  }

  if (dbs.findRelation((rel) => rel.name === "INV_CARD")) {
    createEntity(undefined, relationName2Adapter("INV_CARD"));
  }

  if (dbs.findRelation((rel) => rel.name === "GD_DOCUMENT")) {
    const TgdcDocument = createEntity(undefined, relationName2Adapter("GD_DOCUMENT"), true, "TgdcDocument");
    const TgdcDocumentAdapter = relationName2Adapter("GD_DOCUMENT");
    const documentABC: { [name: string]: Entity } = {
      "TgdcDocumentType": TgdcDocument,
      "TgdcUserDocumentType": createEntity(TgdcDocument, TgdcDocumentAdapter, true, "TgdcUserDocument", {ru: {name: "Пользовательские документы"}}),
      "TgdcInvDocumentType": createEntity(TgdcDocument, TgdcDocumentAdapter, true, "TgdcInvDocument", {ru: {name: "Складские документы"}}),
      "TgdcInvPriceListType": createEntity(TgdcDocument, TgdcDocumentAdapter, true, "TgdcInvPriceList", {ru: {name: "Прайс-листы"}})
    };

    const documentClasses: { [ruid: string]: { header: Entity, line?: Entity } } = {};

    function createDocument(id: number, ruid: string, parent_ruid: string, name: string,
                            className: string, hr: string, lr: string) {
      const setHR = hr ? hr
        : id === 800300 ? "BN_BANKSTATEMENT"
          : id === 800350 ? "BN_BANKCATALOGUE"
            : "";

      const setLR = lr ? lr
        : id === 800300 ? "BN_BANKSTATEMENTLINE"
          : id === 800350 ? "BN_BANKCATALOGUELINE"
            : "";

      const parent = documentClasses[parent_ruid] && documentClasses[parent_ruid].header ? documentClasses[parent_ruid].header
        : documentABC[className] ? documentABC[className]
          : TgdcDocument;

      if (!parent) {
        throw new Error(`Unknown doc type ${parent_ruid} of ${className}`);
      }

      const headerAdapter = appendAdapter(parent.adapter, setHR);
      headerAdapter.relation[0].selector = {field: "DOCUMENTTYPEKEY", value: id};
      const header = createEntity(parent, headerAdapter, false, `DOC_${ruid}_${setHR}`, {ru: {name}});

      documentClasses[ruid] = {header};

      if (setLR) {
        const lineParent = documentClasses[parent_ruid] && documentClasses[parent_ruid].line ? documentClasses[parent_ruid].line
          : documentABC[className] ? documentABC[className]
            : TgdcDocument;

        if (!lineParent) {
          throw new Error(`Unknown doc type ${parent_ruid} of ${className}`);
        }

        const lineAdapter = appendAdapter(lineParent.adapter, setLR);
        lineAdapter.relation[0].selector = {field: "DOCUMENTTYPEKEY", value: id};
        const line = createEntity(lineParent, lineAdapter,
          false, `LINE_${ruid}_${setLR}`, {ru: {name: `Позиция: ${name}`}});
        line.add(
          new ParentAttribute({
            name: Constants.DEFAULT_PARENT_KEY_NAME,
            lName: {ru: {name: "Шапка документа"}},
            entities: [header]
          })
        );
        documentClasses[ruid] = {...documentClasses[ruid], line};
        const masterLinks = [
          {
            detailRelation: "GD_DOCUMENT",
            link2masterField: Constants.DEFAULT_PARENT_KEY_NAME
          }
        ];
        if (dbs.relations[setLR] && dbs.relations[setLR].relationFields[Constants.DEFAULT_MASTER_KEY_NAME]) {
          masterLinks.push({
            detailRelation: setLR,
            link2masterField: Constants.DEFAULT_MASTER_KEY_NAME
          });
        }
        header.add(
          new DetailAttribute({name: line.name, lName: line.lName, entities: [line], adapter: {masterLinks}})
        );
      }
    }

    await loadDocument(connection, transaction, createDocument);
  }

  function recursInherited(parentRelation: Relation[], parentEntity?: Entity) {
    dbs.forEachRelation(inherited => {
      if (Object.entries(inherited.foreignKeys).find(
        ([, f]) => f.fields.join() === inherited.primaryKey!.fields.join()
          && dbs.relationByUqConstraint(f.constNameUq) === parentRelation[parentRelation.length - 1])) {
        const newParent = [...parentRelation, inherited];
        const parentAdapter = parentEntity ? parentEntity.adapter
          : relationNames2Adapter(parentRelation.map(p => p.name));
        recursInherited(newParent, createEntity(parentEntity,
          appendAdapter(parentAdapter, inherited.name), false,
          inherited.name, atRelations[inherited.name] ? atRelations[inherited.name].lName : {}));
      }
    }, true);
  }

  dbs.forEachRelation(r => {
    if (r.primaryKey!.fields.join() === Constants.DEFAULT_ID_NAME && /^USR\$.+$/.test(r.name)
      && !Object.entries(r.foreignKeys).find(fk => fk[1].fields.join() === Constants.DEFAULT_ID_NAME)) {
      if (abstractBaseRelations[r.name]) {
        recursInherited([r]);
      } else {
        recursInherited([r], createEntity(undefined, relationName2Adapter(r.name)));
      }
    }
  }, true);

  function createAttribute(r: Relation,
                           rf: RelationField,
                           atRelationField: IATRelationField | undefined,
                           attrName: string,
                           semCategories: SemCategory[],
                           adapter: IAttributeAdapter | undefined) {
    const name = adjustName(attrName);
    const atField = atFields[rf.fieldSource];
    const fieldSource = dbs.fields[rf.fieldSource];
    const required: boolean = rf.notNull || fieldSource.notNull;
    const defaultValueSource: string | null = rf.defaultSource || fieldSource.defaultSource;
    const lName = atRelationField ? atRelationField.lName : (atField ? atField.lName : {});

    const createDomainFunc = gdDomains[rf.fieldSource];

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
        return new IntegerAttribute({name, lName, required, minValue, maxValue, defaultValue, semCategories, adapter});
      }
      case FieldType.BIG_INTEGER: {
        const {minValue, maxValue} = check2IntRange(fieldSource.validationSource, {
          min: MIN_64BIT_INT,
          max: MAX_64BIT_INT
        });
        const defaultValue = default2Int(defaultValueSource);
        return new IntegerAttribute({name, lName, required, minValue, maxValue, defaultValue, semCategories, adapter});
      }
      case FieldType.INTEGER: {
        const fieldName = adapter ? adapter.field : name;
        const fk = Object.values(r.foreignKeys).find((fk) => fk.fields.includes(fieldName));

        if (fk && fk.fields.length === 1) {
          const refRelationName = dbs.relationByUqConstraint(fk.constNameUq).name;
          const cond = atField && atField.refCondition ? condition2Selectors(atField.refCondition) : undefined;
          const refEntities = findEntities(refRelationName, cond);

          if (!refEntities.length) {
            console.warn(`${r.name}.${rf.name}: no entities for table ${refRelationName}${cond ? ", condition: " + JSON.stringify(cond) : ""}`);
          }

          if (atRelationField && atRelationField.isParent) {
            let parentAttrAdapter: IParentAttributeAdapter | undefined;
            const lbField = atRelationField.lbFieldName || Constants.DEFAULT_LB_NAME;
            const rbField = atRelationField.rbFieldName || Constants.DEFAULT_RB_NAME;
            if (adapter) {
              parentAttrAdapter = {...adapter, lbField, rbField};
            } else if (atRelationField.lbFieldName || atRelationField.rbFieldName) {
              parentAttrAdapter = {
                relation: r.name,
                field: rf.name,
                lbField, rbField
              };
            }
            return new ParentAttribute({name, lName, entities: refEntities, semCategories, adapter: parentAttrAdapter});
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
            const dif = atField.numeration ? atField.numeration.split("#13#10") : [];
            const mapValues = dif.reduce((map, item) => {
              const [key, value] = item.split("=");
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
        throw new Error(`Unknown data type ${fieldSource}=${fieldSource.fieldType} for field ${r.name}.${name}`);
    }
  }

  function createAttributes(entity: Entity) {
    const relations = entity.adapter.relation.map(rn => dbs.relations[rn.relationName]);

    relations.forEach(r => {
      if (!r || !r.primaryKey) return;

      const atRelation = atRelations[r.name];

      Object.entries(r.relationFields).forEach(([fn, rf]) => {
        if (r.primaryKey!.fields.find(f => f === fn)) return;

        if (Object.values(atRelation.relationFields)
            .some((atRf) => (atRf.lbFieldName === rf.name || atRf.rbFieldName === rf.name))
          || rf.name === Constants.DEFAULT_LB_NAME || rf.name === Constants.DEFAULT_RB_NAME) {
          return;
        }

        if (entity.hasAttribute(fn)) return;

        if (!hasField(entity.adapter, r.name, fn)
          && !systemFields.find(sf => sf === fn)
          && !isUserDefined(fn)) {
          return;
        }

        if (entity.adapter.relation[0].selector && entity.adapter.relation[0].selector!.field === fn) {
          return;
        }

        const atRelationField = atRelation ? atRelation.relationFields[fn] : undefined;

        if (atRelationField && atRelationField.crossTable) return;

        let attrName = entity.hasAttribute(fn) ? `${r.name}.${fn}` : fn;
        let adapter = relations.length > 1 ? {relation: r.name, field: fn} : undefined;

        // for custom field adapters
        if (atRelationField && atRelationField.attrName !== undefined) {
          attrName = atRelationField.attrName;
          adapter = {relation: r.name, field: fn};
        }

        if (atRelationField && atRelationField.masterEntityName) {
          const masterEntity = erModel.entity(atRelationField.masterEntityName);  // TODO

          const attributeName = adjustName(attrName);
          const atField = atFields[rf.fieldSource];
          const fieldSource = dbs.fields[rf.fieldSource];
          const required: boolean = rf.notNull || fieldSource.notNull;
          const lName = atRelationField ? atRelationField.lName : (atField ? atField.lName : {});

          const detailAdapter = entity.name !== attributeName ? {
            masterLinks: [{
              detailRelation: entity.name,
              link2masterField: adapter ? adapter.field : attrName
            }]
          } : undefined;
          masterEntity.add(new DetailAttribute({
            name: attributeName, lName, required, entities: [entity],
            semCategories: atRelationField ? atRelationField.semCategories : [],
            adapter: detailAdapter
          }));
          return;
        }

        const attr = createAttribute(
          r, rf, atRelationField,
          attrName,
          atRelationField ? atRelationField.semCategories : [],
          adapter
        );

        if (attr) {
          entity.add(attr);
        }
      });

      Object.values(r.unique).forEach((uq) => {
        const attrs = uq.fields.map((field) => {
          let uqAttr = Object.values(entity.attributes).find((attr) => {
            if (ScalarAttribute.isType(attr)) {
              const attrField = attr.adapter ? attr.adapter.field : attr.name;
              if (attrField === field) {
                return true;
              }
            }
            return false; // TODO for EntityAttributes
          });
          if (!uqAttr) {
            uqAttr = entity.attribute(field);
            // throw new Error("Unique attribute not found");
          }
          return uqAttr;
        });
        entity.addUnique(attrs);
      });
    });
  }

  Object.values(erModel.entities).forEach((entity) => createAttributes(entity));

  /**
   * Looking for cross-tables and construct set attributes.
   *
   * 1. Cross tables are those whose PK consists of minimum 2 fields.
   * 2. First field of cross table PK must be a FK referencing owner table.
   * 3. Second field of cross table PK must be a FK referencing reference table.
   * 4. Owner in this context is an Entity(s) a Set attribute belongs to.
   * 5. Reference in this context is an Entity(s) a Set attribute contains objects of which type.
   */
  Object.entries(dbs.relations).forEach(([crossName, crossRelation]) => { // TODO correct ordering
    if (crossRelation.primaryKey && crossRelation.primaryKey.fields.length >= 2) {
      const fkOwner = Object.entries(crossRelation.foreignKeys).find(
        ([, f]) => f.fields.length === 1 && f.fields[0] === crossRelation.primaryKey!.fields[0]
      );

      if (!fkOwner) return;

      const fkReference = Object.entries(crossRelation.foreignKeys).find(
        ([, f]) => f.fields.length === 1 && f.fields[0] === crossRelation.primaryKey!.fields[1]
      );

      if (!fkReference) return;

      const relOwner = dbs.relationByUqConstraint(fkOwner[1].constNameUq);
      const atRelOwner = atRelations[relOwner.name];

      if (!atRelOwner) return;

      let entitiesOwner: Entity[];

      const crossRelationAdapter = crossRelationsAdapters[crossName];

      if (crossRelationAdapter) {
        entitiesOwner = findEntities(crossRelationAdapter.owner, crossRelationAdapter.selector ?
          [crossRelationAdapter.selector] : undefined);
      } else {
        entitiesOwner = findEntities(relOwner.name);
      }

      if (!entitiesOwner.length) {
        return;
      }

      const relReference = dbs.relationByUqConstraint(fkReference[1].constNameUq);

      let cond: IEntitySelector[] | undefined;
      const atSetField = Object.entries(atRelOwner.relationFields).find(
        rf => rf[1].crossTable === crossName
      );
      const atSetFieldSource = atSetField ? atFields[atSetField[1].fieldSource] : undefined;
      if (atSetFieldSource && atSetFieldSource.setTable === relReference.name && atSetFieldSource.setCondition) {
        cond = condition2Selectors(atSetFieldSource.setCondition);
      }

      const referenceEntities = findEntities(relReference.name, cond);

      if (!referenceEntities.length) {
        return;
      }

      const setField = atSetField ? relOwner.relationFields[atSetField[0]] : undefined;
      const setFieldSource = setField ? dbs.fields[setField.fieldSource] : undefined;
      const atCrossRelation = atRelations[crossName];

      entitiesOwner.forEach(e => {
        if (!Object.values(e.attributes).find((attr) =>
          (attr instanceof SetAttribute) && !!attr.adapter && attr.adapter.crossRelation === crossName)) {

          // for custom set field
          let name = atSetField && atSetField[0] || crossName;
          const setAdapter: ISetAttributeAdapter = {crossRelation: crossName};
          if (atSetField) {
            const [a, atSetRelField] = atSetField;
            name = atSetRelField && atSetRelField.attrName || name;
            if (a !== name) {
              setAdapter.presentationField = a;
            }
          }
          const setAttr = new SetAttribute({
              name,
              lName: atSetField ? atSetField[1].lName : (atCrossRelation ? atCrossRelation.lName : {en: {name: crossName}}),
              required: (!!setField && setField.notNull) || (!!setFieldSource && setFieldSource.notNull),
              entities: referenceEntities,
              presLen: (setFieldSource && setFieldSource.fieldType === FieldType.VARCHAR) ? setFieldSource.fieldLength : 0,
              semCategories: atCrossRelation.semCategories,
              adapter: setAdapter
            }
          );

          Object.entries(crossRelation.relationFields).forEach(([addName, addField]) => {
            if (!crossRelation.primaryKey!.fields.find(f => f === addName)) {
              const atCrossRelationsFields = atCrossRelation ? atCrossRelation.relationFields[addName] : undefined;

              let attrName = addName;
              let adapter = undefined;

              // for custom field adapters
              if (atCrossRelationsFields && atCrossRelationsFields.attrName !== undefined) {
                attrName = atCrossRelationsFields.attrName;
                adapter = {relation: crossRelation.name, field: addName};
              }

              setAttr.add(
                createAttribute(
                  crossRelation,
                  addField,
                  atCrossRelation ? atCrossRelation.relationFields[addName] : undefined,
                  attrName,
                  atCrossRelation.relationFields[addName].semCategories,
                  adapter
                )
              );
            }
          });

          e.add(setAttr);
        }
      });
    }
  });

  return erModel;
}
