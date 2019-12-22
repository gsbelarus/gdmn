import {
  morphAnalyzer,
  Noun,
  NounLexeme,
  RusCase,
  RusNoun,
  SemCategory,
  IRusSentence,
  nlpIDToken,
  IRusSentencePhrase,
  text2Tokens,
  tokens2sentenceTokens,
  nlpTokenize,
  sentenceTemplates,
  nlpParse
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
  prepareDefaultEntityLinkFields,
  Attribute
} from "gdmn-orm";
import {ICommand} from "./command";
import { getLName } from "gdmn-internals";

export class ERTranslatorRU2 {

  readonly erModel: ERModel;
  readonly neMap: Map<NounLexeme, Entity[]>;

  private _command?: ICommand;

  constructor(erModel: ERModel) {
    this.erModel = erModel;
    this.neMap = new Map<NounLexeme, Entity[]>();

    // TODO: this code executes too long
    // move it out of constructor
    // we should change logic that neMap initially is
    // empty and filled upon successful search for
    // given noun
    Object.values(this.erModel.entities).forEach( e =>
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

  get command() {
    return this._command;
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

  private _findAttr(entity: Entity, noun: RusNoun) {
    for (const attr of Object.values(entity.attributes)) {
      for (const name of getLName(attr.lName, ['ru']).split(',')) {
        const tempWords = morphAnalyzer(name.trim());
        if (tempWords.length && tempWords[0].lexeme === noun.lexeme) {
          return attr;
        }
      }
    }
  }

  private _getImage(phrase: IRusSentencePhrase | undefined, idx: number, stripQuotes = false) {
    if (!phrase) {
      return 'phrase undefined';
    }

    const wt = phrase.wordOrToken[idx];

    const res = wt.type === 'EMPTY'
      ? 'EMPTY'
      : wt.token.image;

    return stripQuotes && res.substring(0, 1) === '"' && res.substring(res.length - 1) === '"'
      ? res.substring(1, res.length - 1)
      : res;
  }

  /**
   * Извлекает и возвращает существительное из фразы.
   * Если, по указанному индексу нет слова или это слово
   * не существительное -- генерирует исключение.
   * @param phrase Фраза, из которой извлекается существительное.
   * @param idx Индекс словоместа в фразе. Начинается с 0.
   */
  private _getNoun(phrase: IRusSentencePhrase | undefined, idx: number) {
    if (phrase) {
      const wt = phrase.wordOrToken[idx];

      if (wt.type === 'WORD' && wt.word instanceof RusNoun) {
        return wt.word;
      }
    }

    throw new Error(`Unknown phrase structure`);
  }

  public clear() {
    this._command = undefined;
  }

  public process(sentence: IRusSentence): ICommand {
    switch (sentence.templateId) {
      case 'VPShowByPlace':
        this._command = this.processVPShowByPlace(sentence);
        break;

      case 'VPSortBy':
        this._command = this._command && this.processVPSortBy(sentence, this._command);
        break;

      case 'VPContains':
        this._command = this._command && this.processVPContains(sentence, this._command);
        break;
    }

    if (!this._command) {
      throw new Error(`Unsupported phrase type`);
    }

    return this._command;
  }

  public processText(text: string, processUniform = true): ICommand {
    // весь текст разбиваем на токены
    const tokens = text2Tokens(text);

    // разбиваем на предложения используя точку как разделитель
    // убираем пустые предложения
    const sentences = tokens2sentenceTokens(tokens).filter( s => s.length );

    for (const sentence of sentences) {
      // разбиваем на варианты, если некоторое слово может быть
      // разными частями речи. преобразуем однородные части
      // речи и превращаем числительные в значения
      const variants = nlpTokenize(sentence, processUniform);

      // TODO: пока обрабатываем только первый вариант
      const parsed = nlpParse(variants[0], sentenceTemplates);

      // TODO: обрабатываем только первый нашедшийся
      // вариант разбора предложения
      this.process(parsed[0]);
    }

    if (!this._command) {
      throw new Error(`Unsupported phrase type`);
    }

    return this._command;
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
  public processVPShowByPlace(sentence: IRusSentence): ICommand {
    const rootAlias = 'root';
    const getPhrase = this._getPhrase(sentence);

    const entityPhrase = getPhrase('entity');
    const entities = this._findEntity(entityPhrase, 1);

    if (!entities) {
      throw new Error(`Can't find entity ${this._getImage(entityPhrase, 1)}`);
    }

    if (entities.length > 1) {
      throw new Error(`More than one entity in a query isn't supported.`);
    }

    const entity = entities[0];
    const fields = prepareDefaultEntityLinkFields(entity);
    let contains: IEntityQueryWhereValue[] | undefined = undefined;

    const fromPlacePhrase = getPhrase('fromPlace');
    if (fromPlacePhrase) {
      const geoAttr = entity.attributesBySemCategory(SemCategory.ObjectLocation)[0];
      const value = this._getNoun(fromPlacePhrase, 1).lexeme.getWordForm({c: RusCase.Nomn, singular: true}).word;

      if (!contains) {
        contains = [];
      }

      if (geoAttr instanceof EntityAttribute) {
        const foundLinkField = fields.find( f => f.attribute === geoAttr );

        if (foundLinkField && foundLinkField.links) {
          contains.push({
            alias: foundLinkField.links[0].alias,
            attribute: foundLinkField.links[0].entity.presentAttribute(),
            value
          });
        } else {
          const linkEntity = geoAttr.entities[0];
          const linkAlias = "alias2";

          fields.push(new EntityLinkField(geoAttr, [new EntityLink(linkEntity, linkAlias, [])]));

          contains.push({
            alias: linkAlias,
            attribute: linkEntity.presentAttribute(),
            value
          });
        }
      } else {
        contains.push({
          alias: rootAlias,
          attribute: geoAttr,
          value
        });
      }
    }

    const options = new EntityQueryOptions(undefined, undefined, [{contains}]);
    const entityLink = new EntityLink(entity, rootAlias, fields);

    return {
      action: 'QUERY',
      payload: new EntityQuery(entityLink, options)
    };
  }

  /**
   *
   * |verb       |byField           |
   *  Отсортируй  по названию
   *
   * В шаблоне предложения зашито, что оно начинается с глагола
   * "отсортируй". Нет необходимости анализировать это отдельно.
   *
   * Фраза byField вторым словом содержит или существительное,
   * локализованное название по которому мы ищем атрибут сущности
   * в erModel или имя атрибута в модели.
   */
  public processVPSortBy(sentence: IRusSentence, command: ICommand): ICommand {
    if (!command.payload.options) {
      throw new Error('Invalid command');
    }

    const entity = command.payload.link.entity;
    const getPhrase = this._getPhrase(sentence);

    const byFieldPhrase = getPhrase('byField');
    const noun = this._getNoun(byFieldPhrase, 1);
    const foundAttr = this._findAttr(entity, noun);

    if (foundAttr) {
      command.payload.options.addOrder({
        alias: command.payload.link.alias,
        attribute: foundAttr,
        type: 'ASC'
      });
    }

    return command;
  }

  /**
   * |subject   |predicate |value           |
   *  Название   содержит   "строка"
   */
  public processVPContains(sentence: IRusSentence, command: ICommand): ICommand {
    if (!command.payload.options) {
      throw new Error('Invalid command');
    }

    const entity = command.payload.link.entity;
    const getPhrase = this._getPhrase(sentence);

    const subjectPhrase = getPhrase('subject');
    const noun = this._getNoun(subjectPhrase, 0);
    const foundAttr = this._findAttr(entity, noun);

    if (foundAttr) {
      command.payload.options.addWhereCondition({
        contains: [{
          alias: command.payload.link.alias,
          attribute: foundAttr,
          value: this._getImage(getPhrase('value'), 0, true)
        }]
      });
    }

    return command;
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