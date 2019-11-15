import {
  DefinitionValue,
  SearchValue,
  idEntityValue,
  hasMeaning,
  morphAnalyzer,
  Noun,
  NounLexeme,
  PrepositionType,
  RusAdjectiveCategory,
  RusAdjectiveLexeme,
  RusANP,
  RusCase,
  RusHmNouns,
  RusImperativeVP,
  RusNoun,
  RusPhrase,
  RusPP,
  RusPrepositionLexeme,
  RusPTimeP,
  RusVerb,
  SemCategory,
  SemContext,
  RusTMS,
  RusPSP,
  RusPSPRW,
  RusImperativeNP,
  RusVDO,
  RusPV,
  RusIS,
  RusAdverb,
  RusPreposition,
  RusParticle,
  RusOMS,
  IRusSentence
} from "gdmn-nlp";
import {DateValue} from "gdmn-nlp/dist/definitions/syntax/value";
import {
  Entity,
  EntityAttribute,
  EntityLink,
  EntityLinkField,
  EntityQuery,
  EntityQueryOptions,
  ERModel,
  IEntityQueryWhere,
  IEntityQueryWhereValue,
  ScalarAttribute,
  IEntityQueryAlias,
  Attribute,
  IEntityQueryWhereValueNumber,
  prepareDefaultEntityLinkFields
} from "gdmn-orm";
import {Action, ICommand} from "./command";

export class ERTranslatorRU2 {

  readonly erModel: ERModel;
  readonly neMap: Map<NounLexeme, Entity[]>;

  constructor(erModel: ERModel) {
    this.erModel = erModel;
    this.neMap = new Map<NounLexeme, Entity[]>();

    Object.entries(this.erModel.entities).forEach(([, e]) =>
      e.lName.ru && e.lName.ru.name.split(",").forEach(n =>
        morphAnalyzer(n.trim()).forEach(w => {
          if (w instanceof Noun) {
            const entities = this.neMap.get(w.lexeme);
            if (!entities) {
              this.neMap.set(w.lexeme, [e]);
            } else {
              if (!entities.find(f => f === e)) {
                entities.push(e);
              }
            }
          }
        })
      )
    );
  }

  public process(sentences: IRusSentence[]): ICommand[] {
    if (sentences[0].templateId === 'VPShowByPlace') {
      return this.processImperativeVP(sentences);
    } else {
      throw new Error(`Unsupported phrase type`);
    }
  }

  public processImperativeVP(sentences: IRusSentence[]): ICommand[] {
    const sentence = sentences[0];

    /**
     * Глагольное повелительное предложение должно
     * включать фразу с идентификатором 'verb'.
     * Первое слово в этой фразе -- глагол.
     * Далее, по его значению, мы определяем, что
     * просит нас сделать пользователь, показать или удалить.
     */
    let action: Action;

    const verbPhrase = sentence.phrases.find( p => p.phraseId === 'verb' );
    const verb = verbPhrase && verbPhrase.words[0];

    // if (verb instanceof RusVerb) {
    //   if (hasMeaning(SemContext.QueryDB, 'показать', verb)) {
    //     action = 'QUERY';
    //   }
    //   else if (hasMeaning(SemContext.QueryDB, 'удалить', verb)) {
    //     action = 'DELETE';
    //   }
    //   throw new Error(`Unknown verb ${verb.word}`);
    // }

    action = 'QUERY';

    const entityPhrase = sentence.phrases.find( p => p.phraseId === 'entity' );

    const entities = entityPhrase && (entityPhrase.words[1] instanceof RusNoun
      ? this.neMap.get((entityPhrase.words[1] as RusNoun).lexeme)
      : typeof entityPhrase.words[1] === 'string' && this.erModel.entities[entityPhrase.words[1]]
      ? [this.erModel.entities[entityPhrase.words[1]]]
      : undefined
    );

    if (!entities) {
      throw new Error(`Can't find entity`);
    }

    return entities.map(entity => {
      const fields = prepareDefaultEntityLinkFields(entity);

      let first: number | undefined;
      let or: IEntityQueryWhere[] | undefined = undefined;
      let not: IEntityQueryWhere[] | undefined = undefined;
      let equals: IEntityQueryWhereValue[] | undefined = undefined;
      let greater: IEntityQueryWhereValue[] | undefined = undefined;
      let less: IEntityQueryWhereValue[] | undefined = undefined;
      let contains: IEntityQueryWhereValue[] | undefined = undefined;
      let isNull: IEntityQueryAlias<ScalarAttribute>[] | undefined= undefined;

      // if (np.noun instanceof RusANP) {
      //   const adjective = (np.noun as RusANP).adjf;
      //   if (adjective instanceof DefinitionValue) {
      //     first = adjective.quantity;
      //   } else if ((adjective.lexeme as RusAdjectiveLexeme).category === RusAdjectiveCategory.Rel) {
      //     const nounLexeme = (adjective.lexeme as RusAdjectiveLexeme).getNounLexeme();
      //     if (nounLexeme && nounLexeme.semCategories.find(sc => sc === SemCategory.Place)) {
      //       const attr = entity.attributesBySemCategory(SemCategory.ObjectLocation)[0];
      //       const words = nounLexeme.getWordForm({c: RusCase.Nomn, singular: true}).word;
      //       if (attr instanceof EntityAttribute) {
      //         const linkEntity = attr.entities[0];
      //         const linkAlias = "alias2";
      //         if (
      //           !fields
      //             .filter((field) => field.links)
      //             .some((field) =>
      //               field.links!.some((fLink) => fLink.alias === linkAlias && field.attribute === attr))
      //         ) {
      //           fields.push(new EntityLinkField(attr, [new EntityLink(linkEntity, linkAlias, [])]));
      //         }

      //         if(equals === undefined) {
      //           equals = [];
      //         }

      //         equals.push({
      //           alias: "alias2",
      //           attribute: linkEntity.attribute("NAME"),
      //           value: words
      //         });

      //       } else {

      //         if(equals === undefined) {
      //           equals = [];
      //         }

      //         equals.push({
      //           alias: "alias1",
      //           attribute: attr,
      //           value: words
      //         });

      //       }
      //     } else {
      //       throw new Error(`Can't find semantic category place for noun ${(objectANP as RusNoun).word}`);
      //     }
      //   }
      // }

      // if (np.items[1] instanceof RusPTimeP) {
      //   const pTimeP: RusPTimeP = np.items[1] as RusPTimeP;
      //   const attr = entity.attributesBySemCategory(SemCategory.Date)[0];
      //   if (attr instanceof EntityAttribute) {
      //     const linkEntity = attr.entities[0];
      //     const linkAlias = "alias2";
      //     if (
      //       !fields
      //         .filter((field) => field.links)
      //         .some((field) =>
      //           field.links!.some((fLink) => fLink.alias === linkAlias && field.attribute === attr))
      //     ) {
      //       fields.push(new EntityLinkField(attr, [new EntityLink(linkEntity, linkAlias, [])]));
      //     }

      //     const orEquals: IEntityQueryWhereValue[] = [];
      //     orEquals.push({
      //       alias: "alias2",
      //       attribute: linkEntity.attribute("Date"),
      //       value: (pTimeP.items[1] as DateValue).image
      //     });
      //     if(or === undefined) {
      //       or = [];
      //     }
      //     or.push({equals: orEquals});

      //   } else {
      //     if(equals === undefined) {
      //       equals = [];
      //     }

      //     equals.push({
      //       alias: "alias1",
      //       attribute: attr,
      //       value: (pTimeP.items[1] as DateValue).image
      //     });
      //   }
      // }

      // const hsm = (np.pp instanceof RusPP) && ((np.pp as RusPP).items[1] instanceof RusHmNouns) ? (np.pp as RusPP).items[1] as RusHmNouns : undefined;

      // if (np.pp instanceof RusPP) {
      //   const preposition = (np.pp as RusPP).prep;
      //   if ((preposition.lexeme as RusPrepositionLexeme).prepositionType === PrepositionType.Place) {
      //     const nounLexeme = (np.pp as RusPP).noun.lexeme;
      //     if (nounLexeme && nounLexeme.semCategories.find(sc => sc === SemCategory.Place)) {
      //       const attr = entity.attributesBySemCategory(SemCategory.ObjectLocation)[0];
      //       if (hsm instanceof RusHmNouns) {
      //         hsm.items.map(item => {
      //           if (item instanceof RusNoun) {
      //             const words = item.lexeme.getWordForm({c: RusCase.Nomn, singular: true}).word;
      //             if (attr instanceof EntityAttribute) {
      //               const linkEntity = attr.entities[0];
      //               const linkAlias = "alias2";
      //               if (
      //                 !fields
      //                   .filter((field) => field.links)
      //                   .some((field) =>
      //                     field.links!.some((fLink) => fLink.alias === linkAlias && field.attribute === attr))
      //               ) {
      //                 fields.push(new EntityLinkField(attr, [new EntityLink(linkEntity, linkAlias, [])]));
      //               }

      //               const orEquals: IEntityQueryWhereValue[] = [];
      //               orEquals.push({
      //                 alias: "alias2",
      //                 attribute: linkEntity.attribute("NAME"),
      //                 value: words
      //               });
      //               if(or === undefined) {
      //                 or = [];
      //               }
      //               or.push({equals: orEquals});

      //             } else {
      //               if(equals === undefined) {
      //                 equals = [];
      //               }

      //               equals.push({
      //                 alias: "alias1",
      //                 attribute: attr,
      //                 value: words
      //               });
      //             }
      //           }
      //         });
      //       } else {
      //         const words = nounLexeme.getWordForm({c: RusCase.Nomn, singular: true}).word;
      //         if(equals === undefined) {
      //           equals = [];
      //         }
      //         if (attr instanceof EntityAttribute) {
      //           const linkEntity = attr.entities[0];
      //           const linkAlias = "alias2";
      //           if (
      //             !fields
      //               .filter((field) => field.links)
      //               .some((field) =>
      //                 field.links!.some((fLink) => fLink.alias === linkAlias && field.attribute === attr))
      //           ) {
      //             fields.push(new EntityLinkField(attr, [new EntityLink(linkEntity, linkAlias, [])]));
      //           }

      //           equals.push({
      //             alias: "alias2",
      //             attribute: linkEntity.attribute("NAME"),
      //             value: words
      //           });

      //         } else {
      //           equals.push({
      //             alias: "alias1",
      //             attribute: attr,
      //             value: words
      //           });
      //         }
      //       }
      //     }
      //   }
      // }

      // let numberAlias = 3;
      // phrases.map((phrase) => {
      //   /**
      //    * Составление запроса из фразы с несколькими предложениями.
      //    * Поример: Покажи все организации из Минска. Name содержит ООО. Отсутствует phone.
      //    */
      //   if(phrase instanceof RusTMS || phrase instanceof RusOMS) {

      //     /**
      //      * Выделение поля
      //      */
      //     const subject: RusNoun | idEntityValue = (() => {
      //       if (phrase instanceof RusPSP) {
      //         return (phrase as RusPSP).subject;
      //       } else if (phrase instanceof RusPSPRW) {
      //         return (phrase as RusPSPRW).subject;
      //       } else if (phrase instanceof RusIS) {
      //         const noun = (phrase as RusIS).directObject;
      //         return noun instanceof idEntityValue ? noun : noun.lexeme.getWordForm({c: RusCase.Nomn, singular: true});
      //       } else {
      //         return (phrase as RusImperativeNP).imperativeNoun;
      //       }
      //     })();

      //     let isNot = false;

      //     /**
      //      * Выделение сказуемого
      //     */
      //     const predicate: RusVerb | RusAdverb | RusParticle | RusPreposition = (() => {
      //       if (phrase instanceof RusPSP) {
      //         if( (((phrase as RusPSP).predicate as RusVDO).predicate instanceof RusPV)) {
      //           const pv = (((phrase as RusPSP).predicate as RusVDO).predicate as RusPV);
      //           isNot = pv.particle && pv.particle.word === 'не' ? true : false;
      //           return pv.verb;
      //         } else {
      //           return ((phrase as RusPSP).predicate as RusVDO).predicate instanceof RusAdverb ? ((phrase as RusPSP).predicate as RusVDO).predicate as RusAdverb : ((phrase as RusPSP).predicate as RusVDO).predicate as RusVerb;
      //         }
      //       } else if (phrase instanceof RusPSPRW) {
      //         return ((phrase as RusPSPRW).predicate as RusPV).verb;
      //       } else if (phrase instanceof RusIS) {
      //         return (phrase as RusIS).predicate as RusParticle;
      //       } else {
      //         return ((phrase as RusImperativeNP).pp as RusPTimeP).prep;
      //       }
      //     })();

      //     /**
      //     * Выделение значения поля
      //     */
      //     const directObject: SearchValue | DateValue | undefined = (() => {
      //       if (phrase instanceof RusPSP) {
      //         return ((phrase as RusPSP).predicate as RusVDO).directObject;
      //       } else if(phrase instanceof RusImperativeNP) {
      //         return ((phrase as RusImperativeNP).pp as RusPTimeP).items[1] as DateValue;
      //       }
      //     })();

      //     let attr: Attribute | undefined = undefined;
      //     let linkEntity: Entity;
      //     let linkAlias: string = '';
      //     //поиск поля на английском языке
      //     if(subject instanceof idEntityValue) {
      //       attr = entity.attribute(subject.getText().toLocaleUpperCase());
      //       if (attr instanceof EntityAttribute) {
      //         linkEntity = attr.entities[0];
      //         linkAlias = `alias${numberAlias}`;
      //         numberAlias++;
      //         if (
      //           !fields
      //             .filter((field) => field.links)
      //             .some((field) =>
      //               field.links!.some((fLink) => fLink.alias === linkAlias && field.attribute === attr))
      //         ) {
      //           fields.push(new EntityLinkField(attr, [new EntityLink(linkEntity, linkAlias, [])]));
      //         }
      //       }
      //     } else if(subject instanceof RusNoun) {
      //       //поиск руссифицированного поля
      //       const [, fieldAttr] =
      //       Object.entries(entity.attributes).find(
      //         ([, i]) => i!.lName!.ru!.name.toLowerCase() === (subject.word === 'название' ? 'наименование' : subject.word).toLowerCase()
      //       )!;
      //       attr = fieldAttr;
      //       if (attr instanceof EntityAttribute) {
      //         linkEntity = attr.entities[0];
      //         linkAlias = `alias${numberAlias}`;
      //         numberAlias++;
      //         if (
      //           !fields
      //             .filter((field) => field.links)
      //             .some((field) =>
      //               field.links!.some((fLink) => fLink.alias === linkAlias && field.attribute === attr))
      //         ) {
      //           fields.push(new EntityLinkField(attr, [new EntityLink(linkEntity, linkAlias, [])]));
      //         }
      //       }
      //     }

      //     //Проверка выполняемого условия
      //     if(attr !== undefined) {
      //       if(predicate instanceof RusVerb || predicate instanceof RusParticle) {
      //         if(directObject) {
      //           if(predicate.lexeme.stem === 'включа' || predicate.lexeme.stem === 'содерж') {
      //             const value: IEntityQueryWhereValue[] = [{
      //                 alias: linkAlias ? linkAlias : 'alias1',
      //                 attribute: attr,
      //                 value: directObject.image
      //               }];
      //             if(isNot) {
      //               if(not === undefined) {
      //                 not = [];
      //               }
      //               not.push({contains: value})
      //             } else {
      //               if(contains === undefined) {
      //                 contains = [];
      //               }
      //               contains.push(...value);
      //             }
      //           }
      //         }
      //         if(predicate.lexeme.stem === 'отсутствова'
      //           || (predicate instanceof RusParticle && ( (predicate as RusParticle).word === 'нет' || (predicate as RusParticle).word === 'нету') )
      //         ) {
      //           if(isNull === undefined) {
      //             isNull = [];
      //           }
      //           isNull.push({
      //             alias: linkAlias ? linkAlias : 'alias1',
      //             attribute: attr
      //           })
      //         }
      //         if(predicate.lexeme.stem === 'присутствова' || predicate.lexeme.stem1 === 'есть') {
      //           const value: IEntityQueryAlias<ScalarAttribute> = {
      //             alias: linkAlias ? linkAlias : 'alias1',
      //             attribute: attr
      //           }
      //           if(not === undefined) {
      //             not = [];
      //           }
      //           not.push({isNull: [value]})
      //         }
      //       } else if(predicate instanceof RusAdverb && directObject) {
      //         if(predicate.word === 'больше') {
      //           const value: IEntityQueryWhereValueNumber[] = [{
      //             alias: linkAlias ? linkAlias : 'alias1',
      //             attribute: attr,
      //             value: Number(directObject.image)
      //           }];
      //           if(isNot) {
      //             if(not === undefined) {
      //               not = [];
      //             }
      //             not.push({greater: value})
      //           } else {
      //             if(greater === undefined) {
      //               greater = [];
      //             }
      //             greater.push(...value);
      //           }
      //         }
      //         if(predicate.word === 'меньше') {
      //           const value: IEntityQueryWhereValueNumber[] = [{
      //             alias: linkAlias ? linkAlias : 'alias1',
      //             attribute: attr,
      //             value: Number(directObject.image)
      //           }];
      //           if(isNot) {
      //             if(not === undefined) {
      //               not = [];
      //             }
      //             not.push({less: value})
      //           } else {
      //             if(less === undefined) {
      //               less = [];
      //             }
      //             less.push(...value);
      //           }
      //         }
      //         if(predicate.word === 'равно') {
      //           const value: IEntityQueryWhereValue[] = [{
      //             alias: linkAlias ? linkAlias : 'alias1',
      //             attribute: attr,
      //             value: directObject.image
      //           }];
      //           if(isNot) {
      //             if(not === undefined) {
      //               not = [];
      //             }
      //             not.push({equals: value})
      //           } else {
      //             if(equals === undefined) {
      //               equals = [];
      //             }
      //             equals.push(...value);
      //           }
      //         }
      //       } else if(predicate instanceof RusPreposition && directObject) {
      //         //оператор больше/меньше для данных типа дата
      //         if(predicate.word === 'до') {
      //           if(less === undefined) {
      //             less = [];
      //           }
      //           less.push({
      //             alias: linkAlias ? linkAlias : 'alias1',
      //             attribute: attr,
      //             value: Number(directObject.image)
      //           });
      //         }
      //         if(predicate.word === 'после') {
      //           if(greater === undefined) {
      //             greater = [];
      //           }
      //           greater.push({
      //             alias: linkAlias ? linkAlias : 'alias1',
      //             attribute: attr,
      //             value: Number(directObject.image)
      //           });
      //         }
      //       }
      //     }
      //   }
      // })

      const options = new EntityQueryOptions(first, undefined, [{or, not, isNull, equals, contains, greater, less}]);

      const entityLink = new EntityLink(entity, "alias1", fields);
      return {
        action,
        payload: new EntityQuery(entityLink, options)
      };
    });
  }
}

/**
 * С помощью данных этого объекта мы сообщаем агенту
 * как построить запрос к данным Entity. Как определить,
 * что за Entity нам надо и какие условия должны быть
 * применены.
 */

//export interface IMapSentence2EQ {
  /**
   * Список идентификаторов шаблонов предложений.
   */
//  templatesIds: string[];
//};