import {AConnection, ATransaction, DBStructure, Relation} from "gdmn-db";
import {SemCategory} from "gdmn-nlp";
import {
  adjustName,
  appendAdapter,
  DetailAttribute,
  Entity,
  ERModel,
  ICrossRelations,
  IEntityAdapter,
  ILName,
  ParentAttribute,
  relationName2Adapter,
  relationNames2Adapter,
  sameAdapter,
  SequenceAttribute,
  SetAttribute,
  StringAttribute
} from "gdmn-orm";
import {Constants} from "../Constants";
import {IATLoadResult} from "./atData";
import {loadDocument} from "./document";
import {gedeminTables} from "./gdTables";

interface IEntityInput {
  parent?: Entity;
  name?: string;
  lName?: ILName;
  isAbstract?: boolean;
  semCategories?: SemCategory[];
  adapter: IEntityAdapter;
}

export class GDEntities {

  public static CROSS_RELATIONS_ADAPTERS: ICrossRelations = {
    GD_CONTACTLIST: {
      owner: "GD_CONTACT",
      selector: {
        field: "CONTACTTYPE",
        value: 1
      }
    }
  };
  public static ABSTRACT_BASE_RELATIONS: { [name: string]: boolean } = {
    GD_CONTACT: true
  };

  private readonly _connection: AConnection;
  private readonly _transaction: ATransaction;
  private readonly _erModel: ERModel;
  private readonly _dbStructure: DBStructure;

  private _atResult: IATLoadResult | undefined;
  private _documentClasses: { [ruid: string]: { header: Entity, line?: Entity } } = {};
  private _documentABC: { [name: string]: Entity } = {};

  constructor(connection: AConnection, transaction: ATransaction, erModel: ERModel, dbStructure: DBStructure) {
    this._connection = connection;
    this._transaction = transaction;
    this._erModel = erModel;
    this._dbStructure = dbStructure;
  }

  public async create(atResult: IATLoadResult): Promise<void> {
    this._atResult = atResult;

    if (this._dbStructure.findRelation((rel) => rel.name === "GD_CONTACT")) {

      /**
       * Папка из справочника контактов.
       * Основывается на таблице GD_CONTACT, но использует только несколько полей из нее.
       * Записи имеют признак CONTACTTYPE = 0.
       * Имеет древовидную структуру.
       */
      const Folder = this._createEntity({
        name: "Folder",
        lName: {ru: {name: "Папка"}},
        adapter: {
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
        }
      });
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
      const Company = this._createEntity({
        name: "Company",
        lName: {ru: {name: "Организация"}},
        semCategories: [SemCategory.Company],
        adapter: {
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
          ]
        }
      });
      Company.add(new ParentAttribute({
        name: Constants.DEFAULT_PARENT_KEY_NAME,
        lName: {ru: {name: "Входит в папку"}},
        entities: [Folder]
      }));
      Company.add(new StringAttribute({
        name: "NAME",
        lName: {ru: {name: "Краткое наименование"}},
        required: true,
        maxLength: 60,
        autoTrim: true
      }));

      this._createEntity({
        name: "OurCompany",
        lName: {ru: {name: "Рабочая организация"}},
        parent: Company,
        adapter: {
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
        }
      });

      /**
       * Банк является частным случаем компании (наследуется от компании).
       * Все атрибуты компании являются и атрибутами банка и не нуждаются
       * в повторном определении, за тем исключением, если мы хотим что-то
       * поменять в параметрах атрибута.
       */
      this._createEntity({
        name: "Bank",
        lName: {ru: {name: "Банк"}},
        parent: Company,
        adapter: {
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
        }
      });

      /**
       * Подразделение организации может входить (через поле Parent) в
       * организацию (компания, банк) или в другое подразделение.
       */
      const Department = this._createEntity({
        name: "Department",
        lName: {ru: {name: "Подразделение"}},
        adapter: {
          relation: [{
            relationName: "GD_CONTACT",
            selector: {
              field: "CONTACTTYPE",
              value: 4
            }
          }]
        }
      });
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
      const Person = this._createEntity({
        name: "Person",
        lName: {ru: {name: "Физическое лицо"}},
        adapter: {
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
        }
      });
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
      const Employee = this._createEntity({
        name: "Employee",
        lName: {ru: {name: "Сотрудник предприятия"}},
        parent: Person,
        adapter: {
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
        }
      });
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
      const Group = this._createEntity({
        name: "Group",
        lName: {ru: {name: "Группа"}},
        adapter: {
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
        }
      });
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

      const CompanyAccount = this._createEntity({
        name: "GD_COMPANYACCOUNT",
        adapter: relationName2Adapter("GD_COMPANYACCOUNT")
      });

      Company.add(
        new DetailAttribute({
            name: "GD_COMPANYACCOUNT", lName: {ru: {name: "Банковские счета"}}, entities: [CompanyAccount],
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
        if (this._dbStructure.findRelation((rel) => rel.name === t)) {
          this._createEntity({
            name: t,
            adapter: relationName2Adapter(t)
          });
        }
      });

      const TgdcDocumentAdapter = relationName2Adapter("GD_DOCUMENT");
      const TgdcDocument = this._createEntity({
        name: "TgdcDocument",
        adapter: TgdcDocumentAdapter,
        isAbstract: true
      });

      this._documentABC.TgdcDocumentType = TgdcDocument;
      this._documentABC.TgdcUserDocumentType = this._createEntity({
        parent: TgdcDocument,
        isAbstract: true,
        name: "TgdcUserDocument",
        lName: {ru: {name: "Пользовательские документы"}},
        adapter: TgdcDocumentAdapter
      });
      this._documentABC.TgdcInvDocumentType = this._createEntity({
        parent: TgdcDocument,
        isAbstract: true,
        name: "TgdcInvDocument",
        lName: {ru: {name: "Складские документы"}},
        adapter: TgdcDocumentAdapter
      });
      this._documentABC.TgdcInvPriceListType = this._createEntity({
        parent: TgdcDocument,
        isAbstract: true,
        name: "TgdcInvPriceList",
        lName: {ru: {name: "Прайс-листы"}},
        adapter: TgdcDocumentAdapter
      });

      await loadDocument(this._connection, this._transaction, this._createDocument.bind(this));

      this._dbStructure.forEachRelation((r) => {
        if (r.primaryKey!.fields.join() === Constants.DEFAULT_ID_NAME && /^USR\$.+$/.test(r.name)
          && !Object.entries(r.foreignKeys).find(fk => fk[1].fields.join() === Constants.DEFAULT_ID_NAME)) {
          if (GDEntities.ABSTRACT_BASE_RELATIONS[r.name]) {
            this._recursInherited([r]);
          } else {
            this._recursInherited([r], this._createEntity({adapter: relationName2Adapter(r.name)}));
          }
        }
      }, true);
    }
  }

  private _createDocument(id: number, ruid: string, parent_ruid: string, name: string, className: string, hr: string,
                          lr: string): void {
    const setHR = hr ? hr
      : id === 800300 ? "BN_BANKSTATEMENT"
        : id === 800350 ? "BN_BANKCATALOGUE"
          : "";

    const setLR = lr ? lr
      : id === 800300 ? "BN_BANKSTATEMENTLINE"
        : id === 800350 ? "BN_BANKCATALOGUELINE"
          : "";

    const parent = this._documentClasses[parent_ruid] && this._documentClasses[parent_ruid].header ? this._documentClasses[parent_ruid].header
      : this._documentABC[className] ? this._documentABC[className]
        : this._documentABC.TgdcDocumentType;

    if (!parent) {
      throw new Error(`Unknown doc type ${parent_ruid} of ${className}`);
    }

    const headerAdapter = appendAdapter(parent.adapter, setHR);
    headerAdapter.relation[0].selector = {field: "DOCUMENTTYPEKEY", value: id};
    const header = this._createEntity({
      parent,
      adapter: headerAdapter,
      name: `DOC_${ruid}_${setHR}`,
      lName: {ru: {name}}
    });

    this._documentClasses[ruid] = {header};

    if (setLR) {
      const lineParent = this._documentClasses[parent_ruid] && this._documentClasses[parent_ruid].line ? this._documentClasses[parent_ruid].line
        : this._documentABC[className] ? this._documentABC[className]
          : this._documentABC.TgdcDocumentType;

      if (!lineParent) {
        throw new Error(`Unknown doc type ${parent_ruid} of ${className}`);
      }

      const lineAdapter = appendAdapter(lineParent.adapter, setLR);
      lineAdapter.relation[0].selector = {field: "DOCUMENTTYPEKEY", value: id};
      const line = this._createEntity({
        parent: lineParent,
        adapter: lineAdapter,
        name: `LINE_${ruid}_${setLR}`,
        lName: {ru: {name: `Позиция: ${name}`}}
      });
      line.add(
        new ParentAttribute({
          name: Constants.DEFAULT_PARENT_KEY_NAME,
          lName: {ru: {name: "Шапка документа"}},
          entities: [header]
        })
      );
      this._documentClasses[ruid] = {...this._documentClasses[ruid], line};
      const masterLinks = [
        {
          detailRelation: "GD_DOCUMENT",
          link2masterField: Constants.DEFAULT_PARENT_KEY_NAME
        }
      ];
      if (this._dbStructure.relations[setLR] && this._dbStructure.relations[setLR].relationFields[Constants.DEFAULT_MASTER_KEY_NAME]) {
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

  private _recursInherited(parentRelation: Relation[], parentEntity?: Entity): void {
    this._dbStructure.forEachRelation((inherited) => {
      if (Object.entries(inherited.foreignKeys).find(
        ([, f]) => f.fields.join() === inherited.primaryKey!.fields.join()
          && this._dbStructure.relationByUqConstraint(f.constNameUq) === parentRelation[parentRelation.length - 1])) {
        const newParent = [...parentRelation, inherited];
        const parentAdapter = parentEntity ? parentEntity.adapter
          : relationNames2Adapter(parentRelation.map(p => p.name));
        this._recursInherited(newParent, this._createEntity({
          parent: parentEntity,
          adapter: appendAdapter(parentAdapter, inherited.name),
          name:
          inherited.name,
          lName: this._getATResult().atRelations[inherited.name]
            ? this._getATResult().atRelations[inherited.name].lName
            : {}
        }));
      }
    }, true);
  }

  private _createEntity(input: IEntityInput): Entity {
    if (!input.isAbstract) {
      const found = Object.values(this._erModel.entities).find(
        (entity) => !entity.isAbstract && sameAdapter(input.adapter, entity.adapter)
      );

      if (found) {
        return found;
      }
    }

    const relation = input.adapter.relation.filter(r => !r.weak).reverse()[0];

    if (!relation || !relation.relationName) {
      throw new Error("Invalid entity adapter");
    }

    const atRelation = this._getATResult().atRelations[relation.relationName];
    const name = adjustName(input.name || atRelation.entityName || relation.relationName);
    const fake = relationName2Adapter(name);

    const entity = new Entity({
      parent: input.parent,
      name,
      lName: input.lName ? input.lName : (atRelation ? atRelation.lName : {}),
      isAbstract: !!input.isAbstract,
      semCategories: input.semCategories,
      adapter: JSON.stringify(input.adapter) !== JSON.stringify(fake) ? input.adapter : undefined
    });

    if (!input.parent) {
      entity.add(
        new SequenceAttribute({
          name: Constants.DEFAULT_ID_NAME,
          lName: {ru: {name: "Идентификатор"}},
          sequence: this._erModel.sequencies[Constants.GLOBAL_GENERATOR]
        })
      );
    }
    return this._erModel.add(entity);
  }

  private _getATResult(): IATLoadResult {
    if (!this._atResult) {
      throw new Error("atResult is undefined");
    }
    return this._atResult;
  }
}
