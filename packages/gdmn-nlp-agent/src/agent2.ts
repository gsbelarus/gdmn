import {
  morphAnalyzer,
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
  prepareDefaultEntityLinkFields,
  IEntityQueryWhere} from "gdmn-orm";
import {ICommand} from "./command";
import { getLName } from "gdmn-internals";
import { ERTranslatorError } from "./types";
import { command2Text } from "./command2text";

interface IERTranslatorRUParams {
  erModel: ERModel;
  command?: ICommand;
  text?: string[];
  processUniform?: boolean;
};

export class ERTranslatorRU2 {

  private _params: IERTranslatorRUParams;

  constructor(params: IERTranslatorRUParams) {
    this._params = params;
  }

  get erModel() {
    return this._params.erModel;
  }

  get command() {
    if (!this._params.command) {
      throw new Error('Translator is empty');
    }
    return this._params.command;
  }

  get text() {
    if (!this._params.text) {
      throw new Error('Translator is empty');
    }
    return this._params.text;
  }

  get valid() {
    return !!this._params.command && !!this._params.text?.length;
  }

  public hasCommand() {
    return !!this._params.command;
  }

  /**
   * Returns a function which returns a given by name
   * phrase from the sentence.
   * @param sentence
   */
  private _getPhrase(sentence: IRusSentence) {
    return (phraseId: string) => sentence.phrases.find( p => p.phraseId === phraseId );
  }

  private _findEntity(phrase: IRusSentencePhrase | undefined, idx: number) {
    if (!phrase) {
      return undefined;
    }

    const wt = phrase.wordOrToken[idx];

    return wt.type === 'WORD' && wt.word instanceof RusNoun
      ? this._findEntity2(wt.word)
      : wt.type === 'TOKEN' && wt.token.tokenType === nlpIDToken && this.erModel.entities[wt.token.image]
      ? this.erModel.entities[wt.token.image]
      : undefined;
  }

  /**
   * Поиск сущности в модели по заданному названию.
   * @param noun
   */
  private _findEntity2(noun: RusNoun) {
    const semMeanings = noun.lexeme.semMeanings;

    for (const entity of Object.values(this.erModel.entities)) {
      // сначала ищем по заданной в модели семантической категории
      if (entity.semCategories.some( esc => semMeanings?.find( sm => sm.semCategory === esc ) )) {
        return entity;
      }

      // затем по названию
      for (const name of getLName(entity.lName, ['ru']).split(',')) {
        const tempWord = morphAnalyzer(name.trim())[0];
        if (tempWord) {
          // сначала ищем по соответствию слова
          if (tempWord.lexeme === noun.lexeme) {
            return entity;
          }

          // потом по синонимам (словам с одинаковым значением)
          if (tempWord.lexeme?.semMeanings?.some( ({ semCategory: c1 }) => semMeanings?.find( ({ semCategory: c2 }) => c1 === c2 ) )) {
            return entity;
          }
        }
      }
    }
  }

  private _findAttr(entity: Entity, phrase: IRusSentencePhrase | undefined, idx: number) {
    if (!phrase) {
      return undefined;
    }

    const wt = phrase.wordOrToken[idx];

    return wt.type === 'WORD' && wt.word instanceof RusNoun
      ? this._findAttr2(entity, wt.word)
      : wt.type === 'TOKEN' && wt.token.tokenType === nlpIDToken
      ? entity.attributes[wt.token.image.toUpperCase()]
      : undefined;
  }

  private _findAttr2(entity: Entity, noun: RusNoun) {
    const semMeanings = noun.lexeme.semMeanings;

    for (const attr of Object.values(entity.attributes)) {
      // сначала ищем по заданной в модели семантической категории
      if (attr.semCategories.some( asc => semMeanings?.find( sm => sm.semCategory === asc ) )) {
        return attr;
      }

      for (const name of getLName(attr.lName, ['ru']).split(',')) {
        const tempWord = morphAnalyzer(name.trim())[0];
        if (tempWord) {
          // сначала ищем по соответствию слова
          if (tempWord.lexeme === noun.lexeme) {
            return attr;
          }

          // потом по синонимам (словам с одинаковым значением)
          if (tempWord.lexeme?.semMeanings?.some( ({ semCategory: c1 }) => semMeanings?.find( ({ semCategory: c2 }) => c1 === c2 ) )) {
            return attr;
          }
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

    throw new ERTranslatorError('INVALID_PHRASE_STRUCTURE');
  }

  private _checkContext() {
    if (!this._params.command?.payload.options || !this._params.text) {
      console.log(this._params.command?.payload);
      console.log(this._params.text);
      throw new ERTranslatorError('NO_CONTEXT');
    }
  }

  public clear() {
    return new ERTranslatorRU2({ ...this._params, command: undefined, text: undefined });
  }

  public process(sentence: IRusSentence) {
    switch (sentence.templateId) {
      case 'VPShowByPlace':
        return this.processVPShowByPlace(sentence);

      case 'VPSortBy':
        return this.processVPSortBy(sentence);

      case 'VPContains':
        return this.processVPContains(sentence);

      default:
        throw new ERTranslatorError('UNKNOWN_PHRASE');
    }
  }

  public processText(text: string) {
    // весь текст разбиваем на токены
    const tokens = text2Tokens(text);

    // разбиваем на предложения используя точку как разделитель
    // убираем пустые предложения
    const sentences = tokens2sentenceTokens(tokens).filter( s => s.length );

    let res: ERTranslatorRU2 = this;

    for (const sentence of sentences) {
      // разбиваем на варианты, если некоторое слово может быть
      // разными частями речи. преобразуем однородные части
      // речи и превращаем числительные в значения
      const variants = nlpTokenize(sentence, this._params.processUniform);

      // TODO: пока обрабатываем только первый вариант
      const parsed = nlpParse(variants[0], sentenceTemplates);

      // TODO: обрабатываем только первый нашедшийся
      // вариант разбора предложения
      res = res.process(parsed[0]);
    }

    return res;
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
  public processVPShowByPlace(sentence: IRusSentence) {
    const rootAlias = 'root';
    const getPhrase = this._getPhrase(sentence);

    const entityPhrase = getPhrase('entity');
    const entity = this._findEntity(entityPhrase, 1);

    if (!entity) {
      throw new ERTranslatorError('UNKNOWN_ENTITY', `Can't find entity ${this._getImage(entityPhrase, 1)}`);
    }

    const fields = prepareDefaultEntityLinkFields(entity);
    let where: IEntityQueryWhere[] | undefined = undefined;

    const fromPlacePhrase = getPhrase('fromPlace');
    if (fromPlacePhrase) {
      if (!where) {
        where = [];
      }

      const geoAttr = entity.attributesBySemCategory(SemCategory.ObjectLocation)[0];

      let i = 1;
      while (i < fromPlacePhrase.wordOrToken.length) {
        const value = this._getNoun(fromPlacePhrase, i).lexeme.getWordForm({c: RusCase.Nomn, singular: true}).word;

        if (geoAttr instanceof EntityAttribute) {
          const foundLinkField = fields.find( f => f.attribute === geoAttr );

          if (foundLinkField && foundLinkField.links) {
            where.push({
              contains: [{
                alias: foundLinkField.links[0].alias,
                attribute: foundLinkField.links[0].entity.presentAttribute(),
                value
              }]
            });
          } else {
            const linkEntity = geoAttr.entities[0];
            const linkAlias = "alias2";

            fields.push(new EntityLinkField(geoAttr, [new EntityLink(linkEntity, linkAlias, [])]));

            where.push({
              contains: [{
                alias: linkAlias,
                attribute: linkEntity.presentAttribute(),
                value
              }]
            });
          }
        } else {
          where.push({
            contains: [{
              alias: rootAlias,
              attribute: geoAttr,
              value
            }]
          });
        }

        while (++i < fromPlacePhrase.wordOrToken.length
          && !((fromPlacePhrase.wordOrToken[i] as any).word instanceof RusNoun)) { }
      }
    }

    const options = new EntityQueryOptions(undefined, undefined, (where && where.length > 1) ? [{ or: where }] : where);
    const entityLink = new EntityLink(entity, rootAlias, fields);

    return new ERTranslatorRU2({
      erModel: this.erModel,
      command: {
        action: 'QUERY',
        payload: new EntityQuery(entityLink, options)
      },
      text: sentence.image ? [sentence.image] : undefined
    });
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
  public processVPSortBy(sentence: IRusSentence) {
    this._checkContext();

    const entity = this.command.payload.link.entity;
    const getPhrase = this._getPhrase(sentence);

    const byFieldPhrase = getPhrase('byField');
    const foundAttr = this._findAttr(entity, byFieldPhrase, 1);

    if (foundAttr) {
      const eq = this.command.payload.duplicate(this.erModel);

      eq.options!.addOrder({
        alias: eq.link.alias,
        attribute: foundAttr,
        type: 'ASC'
      }, true);

      const command = {...this.command, payload: eq};

      return new ERTranslatorRU2({
        erModel: this.erModel,
        command,
        text: [command2Text(command)]
      });
    }

    throw new ERTranslatorError('UNKNOWN_ATTR');
  }

  /**
   * |subject   |contains value           |
   *  Название   содержит "строка"
   */
  public processVPContains(sentence: IRusSentence) {
    this._checkContext();

    const entity = this.command.payload.link.entity;
    const getPhrase = this._getPhrase(sentence);

    const subjectPhrase = getPhrase('subject');
    const noun = this._getNoun(subjectPhrase, 0);
    const foundAttr = this._findAttr2(entity, noun);

    if (foundAttr) {
      const eq = EntityQuery.inspectorToObject(this.erModel, this.command.payload.inspect());

      eq.options!.addWhereCondition({
        contains: [{
          alias: this.command.payload.link.alias,
          attribute: foundAttr,
          value: this._getImage(getPhrase('predicate'), 1, true)
        }]
      });

      return new ERTranslatorRU2({
        erModel: this.erModel,
        command: {...this.command, payload: eq},
        text: sentence.image ? [...this.text, sentence.image] : this.text
      });
    }

    throw new ERTranslatorError('UNKNOWN_ATTR');
  }

  /**
   * |subject      |[object]          |contains value           |
   *  Атрибут NAME  атрибута PLACEKEY  содержит "строка"
   */
  public processVPAttrContains(sentence: IRusSentence) {
    this._checkContext();

    const entity = this.command.payload.link.entity;
    const getPhrase = this._getPhrase(sentence);

    const subjectPhrase = getPhrase('subject');
    const objectPhrase = getPhrase('object');

    const eq = EntityQuery.inspectorToObject(this.erModel, this.command.payload.inspect());

    if (objectPhrase) {
      const linkAttr = this._findAttr(entity, objectPhrase, 1);

      if (linkAttr instanceof EntityAttribute) {
        const foundAttr = this._findAttr(linkAttr.entities[0], subjectPhrase, 1);
        if (foundAttr) {
          eq.options!.addWhereCondition({
            contains: [{
              alias: linkAttr.name,
              attribute: foundAttr,
              value: this._getImage(getPhrase('value'), 1, true)
            }]
          });

          return new ERTranslatorRU2({
            erModel: this.erModel,
            command: {...this.command, payload: eq},
            text: sentence.image ? [...this.text, sentence.image] : this.text
          });
        }
      }
    } else {
      const foundAttr = this._findAttr(entity, subjectPhrase, 1);

      if (foundAttr) {
        eq.options!.addWhereCondition({
          contains: [{
            alias: this.command.payload.link.alias,
            attribute: foundAttr,
            value: this._getImage(getPhrase('value'), 1, true)
          }]
        });

        return new ERTranslatorRU2({
          erModel: this.erModel,
          command: {...this.command, payload: eq},
          text: sentence.image ? [...this.text, sentence.image] : this.text
        });
      }
    }

    throw new ERTranslatorError('UNKNOWN_ATTR');
  }
};
