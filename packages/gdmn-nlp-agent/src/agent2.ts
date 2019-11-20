import {
  morphAnalyzer,
  Noun,
  NounLexeme,
  RusCase,
  RusNoun,
  SemCategory,
  IRusSentence,
  nlpIDToken,
  IRusSentencePhrase
} from "gdmn-nlp";
import {
  Entity,
  EntityAttribute,
  EntityLink,
  EntityLinkField,
  EntityQuery,
  EntityQueryOptions,
  ERModel,
  IEntityQueryWhereValue,
  prepareDefaultEntityLinkFields
} from "gdmn-orm";
import {ICommand} from "./command";

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

  private _getPhrase(sentence: IRusSentence) {
    return (phraseId: string) => sentence.phrases.find( p => p.phraseId === phraseId );
  }

  private _findEntity(phrase: IRusSentencePhrase | undefined, idx: number) {
    if (!phrase) {
      return undefined;
    }

    const wt = phrase.wordOrToken[idx];

    return (wt.type === 'WORD' && wt.word instanceof RusNoun
      ? this.neMap.get((wt.word as RusNoun).lexeme)
      : wt.type === 'TOKEN' && wt.token.tokenType === nlpIDToken && this.erModel.entities[wt.token.image]
      ? [this.erModel.entities[wt.token.image]]
      : undefined
    );
  }

  private _getImage(phrase: IRusSentencePhrase | undefined, idx: number) {
    if (!phrase) {
      return 'phrase undefined';
    }

    const wt = phrase.wordOrToken[idx];

    return wt.type === 'EMPTY'
      ? 'EMPTY'
      : wt.token.image;
  }

  private _getNoun(phrase: IRusSentencePhrase | undefined, idx: number) {
    if (phrase) {
      const wt = phrase.wordOrToken[idx];

      if (wt.type === 'WORD' && wt.word instanceof RusNoun) {
        return wt.word;
      }
    }

    throw new Error(`Unknown phrase structure`);
  }

  public process(sentences: IRusSentence[]): ICommand[] {
    if (sentences[0].templateId === 'VPShowByPlace') {
      return this.processImperativeVPShowByPlace(sentences);
    } else {
      throw new Error(`Unsupported phrase type`);
    }
  }

  /**
   *
   * |verb   |entity           |fromPlace           |
   *  Покажи [все] организации [из Минска [и Пинска]]
   *
   * В шаблоне предложения зашито, что оно начинается с глагола
   * "покажи". Нет необходимости анализировать это отдельно.
   *
   * Фраза entity вторым словом содержит или существительное,
   * по которому мы ищем сущность в erModel или название
   * класса сущности. Первое слово не обязательно и может
   * отсутствовать.
   *
   * Пример: "[все] организации"
   */
  public processImperativeVPShowByPlace(sentences: IRusSentence[]): ICommand[] {
    const sentence = sentences[0];
    const getPhrase = this._getPhrase(sentence);

    const entityPhrase = getPhrase('entity');
    const entities = this._findEntity(entityPhrase, 1);

    if (!entities) {
      throw new Error(`Can't find entity ${this._getImage(entityPhrase, 1)}`);
    }

    if (entities.length !== 1) {
      throw new Error(`More than one entity in a query isn't supported.`);
    }

    const fromPlacePhrase = getPhrase('fromPlace');

    return entities.map(entity => {
      const fields = prepareDefaultEntityLinkFields(entity);
      let equals: IEntityQueryWhereValue[] | undefined = undefined;

      if (fromPlacePhrase) {
        const attr = entity.attributesBySemCategory(SemCategory.ObjectLocation)[0];
        const value = this._getNoun(fromPlacePhrase, 1).lexeme.getWordForm({c: RusCase.Nomn, singular: true}).word;

        if (!equals) {
          equals = [];
        }

        if (attr instanceof EntityAttribute) {
          const linkEntity = attr.entities[0];
          const linkAlias = "alias2";

          if (
            !fields
              .filter( field => field.links )
              .some( field => field.links!.some( fLink => fLink.alias === linkAlias && field.attribute === attr) )
          ) {
            fields.push(new EntityLinkField(attr, [new EntityLink(linkEntity, linkAlias, [])]));
          }

          equals.push({
            alias: linkAlias,
            attribute: linkEntity.presentAttribute(),
            value
          });
        } else {
          equals.push({
            alias: "alias1",
            attribute: attr,
            value
          });
        }
      }

      const options = new EntityQueryOptions(undefined, undefined, [{equals}]);

      const entityLink = new EntityLink(entity, "alias1", fields);
      return {
        action: 'QUERY',
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