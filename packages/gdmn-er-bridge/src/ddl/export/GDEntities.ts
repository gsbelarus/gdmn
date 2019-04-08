import {AConnection, ATransaction, DBSchema} from "gdmn-db";
import {LName} from "gdmn-internals";
import {SemCategory, str2SemCategories} from "gdmn-nlp";
import {
  adjustName,
  Entity,
  ERModel,
  ICrossRelations,
  IEntityAdapter,
  IEntitySelector,
  SequenceAttribute
} from "gdmn-orm";
import {AdapterUtils} from "../../AdapterUtils";
import {Constants} from "../Constants";
import {IATLoadResult} from "./atData";
import gdbaseRaw from "./gdbase.json";

interface IgdbaseImport {
  className: string;
  subType?: string;
  abstract?: boolean;
  displayName?: string;
  listTable?: { name: string; pk?: string };
  distinctRelation?: { name: string; pk?: string };
  restrictCondition?: string;
  semCategory?: string;
  children?: IgdbaseImport[];
}

interface IEntityInput {
  parent?: Entity;
  name: string;
  lName?: LName;
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

  private readonly _dbSchema: DBSchema;
  private readonly _erModel: ERModel;

  private _atResult: IATLoadResult | undefined;

  constructor(connection: AConnection, transaction: ATransaction, dbSchema: DBSchema, erModel: ERModel) {
    this._dbSchema = dbSchema;
    this._erModel = erModel;
  }

  public async create(atResult: IATLoadResult): Promise<void> {
    this._atResult = atResult;

    const gdbase = gdbaseRaw as IgdbaseImport;

    const convert = (parent: Entity | undefined, g: IgdbaseImport, enhancer: (e: Entity) => Entity) => {
      let adapter: IEntityAdapter | undefined;

      if (parent && parent.adapter) {
        adapter = {...parent.adapter};

        if (g.distinctRelation) {
          adapter.relation = [...adapter.relation,
            {
              relationName: g.distinctRelation.name,
              pk: AdapterUtils.getPK4Adapter(g.distinctRelation.pk ? [g.distinctRelation.pk] : [])
            }
          ];
        }

        if (g.restrictCondition) {
          adapter.relation = [...adapter.relation];
          adapter.relation[0] = {
            ...adapter.relation[0],
            selector: this._restrictCondition2selector(g.restrictCondition)
          };
        }
      } else {
        if (g.listTable) {
          adapter = {
            relation: [
              {
                relationName: g.listTable.name,
                pk: AdapterUtils.getPK4Adapter(g.listTable.pk ? [g.listTable.pk] : [])
              }
            ]
          };
        } else {
          adapter = undefined;
        }
      }

      let entity: Entity | undefined = undefined;

      if (adapter && adapter.relation[0].relationName !== "GD_BLOCK_RULE") {
        entity = enhancer(this._createEntity({
          parent,
          name: g.className,
          lName: g.displayName ? {ru: {name: g.displayName}} : undefined,
          isAbstract: !!g.abstract,
          semCategories: g.semCategory ? str2SemCategories(g.semCategory) : undefined,
          adapter
        }));
      }

      if (g.children) {
        g.children.forEach(ch => convert(entity, ch, enhancer));
      }
    };

    if (this._dbSchema.findRelation((rel) => rel.name === "GD_CONTACT")) {
      convert(undefined, gdbase, entity => {
        switch (entity.name) {
          case "TgdcCompany":
            entity.adapter!.relation.push(
              {
                relationName: "GD_COMPANYCODE",
                pk: AdapterUtils.getPK4Adapter(["COMPANYKEY"]),
                weak: true
              }
            );
            break;

          case "TgdcFolder":
          case "TgdcGroup":
            entity.adapter!.relation[0].fields = [
              Constants.DEFAULT_PARENT_KEY_NAME,
              "NAME"
            ];
            break;
        }
        return entity;
      });


      //   /**
      //    * Папка из справочника контактов.
      //    * Основывается на таблице GD_CONTACT, но использует только несколько полей из нее.
      //    * Записи имеют признак CONTACTTYPE = 0.
      //    * Имеет древовидную структуру.
      //    */
      //   const Folder = this._createEntity({
      //     name: "Folder",
      //     lName: {ru: {name: "Папка"}},
      //     adapter: {
      //       relation: [{
      //         relationName: "GD_CONTACT",
      //         pk: AdapterUtils.getPK4Adapter([Constants.DEFAULT_ID_NAME]),
      //         selector: {
      //           field: "CONTACTTYPE",
      //           value: 0
      //         },
      //         fields: [
      //           Constants.DEFAULT_PARENT_KEY_NAME,
      //           "NAME"
      //         ]
      //       }]
      //     }
      //   });
      //   Folder.add(
      //     new ParentAttribute({
      //       name: Constants.DEFAULT_PARENT_KEY_NAME,
      //       lName: {ru: {name: "Входит в папку"}},
      //       entities: [Folder]
      //     })
      //   );

      //   /**
      //    * Компания хранится в трех таблицах.
      //    * Две обязательные GD_CONTACT - GD_COMPANY. В адаптере они указываются
      //    * в массиве relation и соединяются в запросе оператором JOIN.
      //    * Первой указывается главная таблица. Остальные таблицы называются
      //    * дополнительными. Первичный ключ дополнительной таблицы
      //    * должен одновременно являться внешним ключем на главную.
      //    * Третья -- GD_COMPANYCODE -- необязательная. Подключается через LEFT JOIN.
      //    * Для атрибутов из главной таблицы можно не указывать адаптер, если их имя
      //    * совпадает с именем поля.
      //    * Флаг refresh означает, что после вставки/изменения записи ее надо перечитать.
      //    */
      //   const Company = this._createEntity({
      //     name: "Company",
      //     lName: {ru: {name: "Организация"}},
      //     semCategories: [SemCategory.Company],
      //     adapter: {
      //       relation: [
      //         {
      //           relationName: "GD_CONTACT",
      //           pk: AdapterUtils.getPK4Adapter([Constants.DEFAULT_ID_NAME]),
      //           selector: {
      //             field: "CONTACTTYPE",
      //             value: 3
      //           }
      //         },
      //         {
      //           relationName: "GD_COMPANY",
      //           pk: AdapterUtils.getPK4Adapter(["CONTACTKEY"])
      //         },
      //         {
      //           relationName: "GD_COMPANYCODE",
      //           pk: AdapterUtils.getPK4Adapter(["COMPANYKEY"]),
      //           weak: true
      //         }
      //       ]
      //     }
      //   });
      //   Company.add(new ParentAttribute({
      //     name: Constants.DEFAULT_PARENT_KEY_NAME,
      //     lName: {ru: {name: "Входит в папку"}},
      //     entities: [Folder]
      //   }));
      //   Company.add(new StringAttribute({
      //     name: "NAME",
      //     lName: {ru: {name: "Краткое наименование"}},
      //     required: true,
      //     maxLength: 60,
      //     autoTrim: true,
      //     adapter: {
      //       relation: "GD_CONTACT",
      //       field: "NAME"
      //     }
      //   }));

      //   this._createEntity({
      //     name: "OurCompany",
      //     lName: {ru: {name: "Рабочая организация"}},
      //     parent: Company,
      //     adapter: {
      //       relation: [
      //         {
      //           relationName: "GD_CONTACT",
      //           pk: AdapterUtils.getPK4Adapter([Constants.DEFAULT_ID_NAME]),
      //           selector: {
      //             field: "CONTACTTYPE",
      //             value: 3
      //           }
      //         },
      //         {
      //           relationName: "GD_COMPANY",
      //           pk: AdapterUtils.getPK4Adapter(["CONTACTKEY"])
      //         },
      //         {
      //           relationName: "GD_COMPANYCODE",
      //           pk: AdapterUtils.getPK4Adapter(["COMPANYKEY"]),
      //           weak: true
      //         },
      //         {
      //           relationName: "GD_OURCOMPANY",
      //           pk: AdapterUtils.getPK4Adapter(["COMPANYKEY"])
      //         }
      //       ],
      //       refresh: true
      //     }
      //   });

      //   /**
      //    * Банк является частным случаем компании (наследуется от компании).
      //    * Все атрибуты компании являются и атрибутами банка и не нуждаются
      //    * в повторном определении, за тем исключением, если мы хотим что-то
      //    * поменять в параметрах атрибута.
      //    */
      //   this._createEntity({
      //     name: "Bank",
      //     lName: {ru: {name: "Банк"}},
      //     parent: Company,
      //     adapter: {
      //       relation: [
      //         {
      //           relationName: "GD_CONTACT",
      //           pk: AdapterUtils.getPK4Adapter([Constants.DEFAULT_ID_NAME]),
      //           selector: {
      //             field: "CONTACTTYPE",
      //             value: 5
      //           }
      //         },
      //         {
      //           relationName: "GD_COMPANY",
      //           pk: AdapterUtils.getPK4Adapter(["CONTACTKEY"])
      //         },
      //         {
      //           relationName: "GD_COMPANYCODE",
      //           pk: AdapterUtils.getPK4Adapter(["COMPANYKEY"]),
      //           weak: true
      //         },
      //         {
      //           relationName: "GD_BANK",
      //           pk: AdapterUtils.getPK4Adapter(["BANKKEY"])
      //         }
      //       ],
      //       refresh: true
      //     }
      //   });

      //   /**
      //    * Подразделение организации может входить (через поле Parent) в
      //    * организацию (компания, банк) или в другое подразделение.
      //    */
      //   const Department = this._createEntity({
      //     name: "Department",
      //     lName: {ru: {name: "Подразделение"}},
      //     adapter: {
      //       relation: [{
      //         relationName: "GD_CONTACT",
      //         pk: AdapterUtils.getPK4Adapter([Constants.DEFAULT_ID_NAME]),
      //         selector: {
      //           field: "CONTACTTYPE",
      //           value: 4
      //         }
      //       }]
      //     }
      //   });
      //   Department.add(
      //     new ParentAttribute({
      //       name: Constants.DEFAULT_PARENT_KEY_NAME,
      //       lName: {ru: {name: "Входит в организацию (подразделение)"}},
      //       entities: [Company, Department]
      //     })
      //   );
      //   Department.add(
      //     new StringAttribute({
      //       name: "NAME", lName: {ru: {name: "Наименование"}}, required: true,
      //       maxLength: 60, autoTrim: true,
      //       adapter: {
      //         relation: "GD_CONTACT",
      //         field: "NAME"
      //       }
      //     })
      //   );

      //   /**
      //    * Физическое лицо хранится в двух таблицах GD_CONTACT - GD_PEOPLE.
      //    */
      //   const Person = this._createEntity({
      //     name: "Person",
      //     lName: {ru: {name: "Физическое лицо"}},
      //     adapter: {
      //       relation: [
      //         {
      //           relationName: "GD_CONTACT",
      //           pk: AdapterUtils.getPK4Adapter([Constants.DEFAULT_ID_NAME]),
      //           selector: {
      //             field: "CONTACTTYPE",
      //             value: 2
      //           }
      //         },
      //         {
      //           relationName: "GD_PEOPLE",
      //           pk: AdapterUtils.getPK4Adapter(["CONTACTKEY"])
      //         }
      //       ],
      //       refresh: true
      //     }
      //   });
      //   Person.add(
      //     new ParentAttribute({
      //       name: Constants.DEFAULT_PARENT_KEY_NAME,
      //       lName: {ru: {name: "Входит в папку"}},
      //       entities: [Folder]
      //     })
      //   );
      //   Person.add(
      //     new StringAttribute({
      //       name: "NAME", lName: {ru: {name: "ФИО"}}, required: true,
      //       maxLength: 60, autoTrim: true,
      //       adapter: {
      //         relation: "GD_CONTACT",
      //         field: "NAME"
      //       }
      //     })
      //   );

      //   /**
      //    * Сотрудник, частный случай физического лица.
      //    * Добавляется таблица GD_EMPLOYEE.
      //    */
      //   const Employee = this._createEntity({
      //     name: "Employee",
      //     lName: {ru: {name: "Сотрудник предприятия"}},
      //     parent: Person,
      //     adapter: {
      //       relation: [
      //         {
      //           relationName: "GD_CONTACT",
      //           pk: AdapterUtils.getPK4Adapter([Constants.DEFAULT_ID_NAME]),
      //           selector: {
      //             field: "CONTACTTYPE",
      //             value: 2
      //           }
      //         },
      //         {
      //           relationName: "GD_PEOPLE",
      //           pk: AdapterUtils.getPK4Adapter(["CONTACTKEY"])
      //         },
      //         {
      //           relationName: "GD_EMPLOYEE",
      //           pk: AdapterUtils.getPK4Adapter(["CONTACTKEY"])
      //         }
      //       ]
      //     }
      //   });
      //   Employee.add(
      //     new ParentAttribute({
      //       name: Constants.DEFAULT_PARENT_KEY_NAME,
      //       lName: {ru: {name: "Организация или подразделение"}},
      //       entities: [Company, Department]
      //     })
      //   );

      //   /**
      //    * Группа контактов.
      //    * CONTACTLIST -- множество, которое хранится в кросс-таблице.
      //    */
      //   const Group = this._createEntity({
      //     name: "Group",
      //     lName: {ru: {name: "Группа"}},
      //     adapter: {
      //       relation:
      //         [{
      //           relationName: "GD_CONTACT",
      //           pk: AdapterUtils.getPK4Adapter([Constants.DEFAULT_ID_NAME]),
      //           selector: {
      //             field: "CONTACTTYPE",
      //             value: 1
      //           },
      //           fields: [
      //             Constants.DEFAULT_PARENT_KEY_NAME,
      //             "NAME"
      //           ]
      //         }]
      //     }
      //   });
      //   Group.add(
      //     new ParentAttribute({
      //       name: Constants.DEFAULT_PARENT_KEY_NAME,
      //       lName: {ru: {name: "Входит в папку"}},
      //       entities: [Folder]
      //     })
      //   );
      //   Group.add(
      //     new SetAttribute({
      //         name: "CONTACTLIST", lName: {ru: {name: "Контакты"}}, entities: [Company, Person],
      //         adapter: {
      //           crossRelation: "GD_CONTACTLIST",
      //           crossPk: ["GROUPKEY", "CONTACTKEY"]
      //         }
      //       }
      //     )
      //   );

      //   const CompanyAccount = this._createEntity({
      //     name: "GD_COMPANYACCOUNT",
      //     adapter: relationName2Adapter("GD_COMPANYACCOUNT")
      //   });

      //   Company.add(
      //     new DetailAttribute({
      //         name: "GD_COMPANYACCOUNT", lName: {ru: {name: "Банковские счета"}}, entities: [CompanyAccount],
      //         adapter: {
      //           masterLinks: [
      //             {
      //               detailRelation: "GD_COMPANYACCOUNT",
      //               link2masterField: "COMPANYKEY"
      //             }
      //           ]
      //         }
      //       }
      //     )
      //   );


      //   this._dbSchema.forEachRelation((r) => {
      //     if (r.primaryKey!.fields.join() === Constants.DEFAULT_ID_NAME && /^USR\$.+$/.test(r.name)
      //       && !Object.entries(r.foreignKeys).find(fk => fk[1].fields.join() === Constants.DEFAULT_ID_NAME)) {
      //       if (GDEntities.ABSTRACT_BASE_RELATIONS[r.name]) {
      //         this._recursInherited([r]);
      //       } else {
      //         this._recursInherited([r], this._createEntity({adapter: relationName2Adapter(r.name)}));
      //       }
      //     }
      //   }, true);
    }
  }

  private _restrictCondition2selector(restrictCondition: string): IEntitySelector | undefined {
    // z.contacttype=5
    const rg = /z\.(.+)\s*=\s*([0-9]+)/gi;
    const groups = rg.exec(restrictCondition);
    if (groups) {
      return {
        field: groups[1].toUpperCase().trim(),
        value: parseInt(groups[2])
      };
    } else {
      // z.contacttype IN (3,5)
      const rg = /z\.(.+)\s*in\s*\(([0-9\,\s]+)\)/gi;
      const groups = rg.exec(restrictCondition);
      if (groups) {
        const arr = groups[2].split(",").map(s => parseInt(s.trim()));
        //if (arr.length === 1) {
        return {
          field: groups[1].toUpperCase().trim(),
          value: arr[0]
        };
        /*
        }
        else {
          return {
            field: groups[1].toUpperCase().trim(),
            value: arr
          }
        }
        */
      } else {
        // z.accounttype = 'F'
        const rg = /z\.(.+)\s*=\s*'(.+)'/gi;
        const groups = rg.exec(restrictCondition);
        if (groups) {
          return {
            field: groups[1].toUpperCase().trim(),
            value: groups[2]
          };
        } else {
          // z.accounttype IN ('A', 'S')
          const rg = /z\.(.+)\s*in\s*\((['\w\,\s]+)\)/gi;
          const groups = rg.exec(restrictCondition);
          if (groups) {
            const arr = groups[2].split(",").map( s => s.trim() ).map( s => s.substring(1, s.length - 1) );
            //if (arr.length === 1) {
            return {
              field: groups[1].toUpperCase().trim(),
              value: arr[0]
            };
            /*
            } else {
              return {
                field: groups[1].toUpperCase().trim(),
                value: arr
              }
            }
            */
          } else {
            console.log(`Can't process restrict condition: ${restrictCondition}`);
          }
        }
      }
    }
  }

  /*
  private _recursInherited(parentRelation: Relation[], parentEntity?: Entity): void {
    this._dbSchema.forEachRelation((inherited) => {
      if (Object.entries(inherited.foreignKeys).find(
        ([, f]) => f.fields.join() === inherited.primaryKey!.fields.join()
          && this._dbSchema.relationByUqConstraint(f.constNameUq) === parentRelation[parentRelation.length - 1])) {
        const newParent = [...parentRelation, inherited];
        const parentAdapter = parentEntity
          ? parentEntity.adapter!
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
  */

  private _createEntity(input: IEntityInput): Entity {
    if (input.isAbstract && !input.adapter) {
      return this._erModel.add(new Entity({
        parent: input.parent,
        name: input.name,
        lName: input.lName ? input.lName : {en: {name: input.name}},
        isAbstract: true,
        semCategories: input.semCategories
      }));
    }

    const distinctRelation = input.adapter && input.adapter.relation.filter(r => !r.weak).reverse()[0];

    if (!distinctRelation || !distinctRelation.relationName) {
      throw new Error(`Invalid entity adapter: ${JSON.stringify(input, undefined, 2)}`);
    }

    const atRelation = this._getATResult().atRelations[distinctRelation.relationName];
    const name = adjustName(input.name || atRelation.entityName || distinctRelation.relationName);

    const entity = new Entity({
      parent: input.parent,
      name,
      lName: input.lName ? input.lName : (atRelation ? atRelation.lName : {}),
      isAbstract: !!input.isAbstract,
      semCategories: input.semCategories,
      adapter: input.adapter
    });

    if (!input.parent) {
      entity.add(
        new SequenceAttribute({
          name: Constants.DEFAULT_ID_NAME,
          lName: {ru: {name: "Идентификатор"}},
          sequence: this._erModel.sequencies[Constants.GLOBAL_GENERATOR],
          adapter: {
            relation: entity.adapter!.relation[0].relationName,
            field: Constants.DEFAULT_ID_NAME
          }
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
