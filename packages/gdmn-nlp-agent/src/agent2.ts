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
  IEntityQueryWhereValue,
  prepareDefaultEntityLinkFields,
  IEntityQueryWhere} from "gdmn-orm";
import {ICommand} from "./command";
import { getLName } from "gdmn-internals";

export class ERTranslatorRU2 {

  readonly erModel: ERModel;

  private _command?: ICommand;

  constructor(erModel: ERModel) {
    this.erModel = erModel;
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
      : wt.type === 'TOKEN' && wt.token.tokenType === nlpIDToken && entity.attributes[wt.token.image]
      ? entity.attributes[wt.token.image]
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
    const entity = this._findEntity(entityPhrase, 1);

    if (!entity) {
      throw new Error(`Can't find entity ${this._getImage(entityPhrase, 1)}`);
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
    const foundAttr = this._findAttr(entity, byFieldPhrase, 1);

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
   * |subject   |contains value           |
   *  Название   содержит "строка"
   */
  public processVPContains(sentence: IRusSentence, command: ICommand): ICommand {
    if (!command.payload.options) {
      throw new Error('Invalid command');
    }

    const entity = command.payload.link.entity;
    const getPhrase = this._getPhrase(sentence);

    const subjectPhrase = getPhrase('subject');
    const noun = this._getNoun(subjectPhrase, 0);
    const foundAttr = this._findAttr2(entity, noun);

    if (foundAttr) {
      command.payload.options.addWhereCondition({
        contains: [{
          alias: command.payload.link.alias,
          attribute: foundAttr,
          value: this._getImage(getPhrase('predicate'), 1, true)
        }]
      });
    }

    return command;
  }

  /**
   * |subject      |[object]          |contains value           |
   *  Атрибут NAME  атрибута PLACEKEY  содержит "строка"
   */
  public processVPAttrContains(sentence: IRusSentence, command: ICommand): ICommand {
    if (!command.payload.options) {
      throw new Error('Invalid command');
    }

    const entity = command.payload.link.entity;
    const getPhrase = this._getPhrase(sentence);

    const subjectPhrase = getPhrase('subject');
    const objectPhrase = getPhrase('object');

    if (objectPhrase) {
      const linkAttr = this._findAttr(entity, objectPhrase, 1);

      if (linkAttr instanceof EntityAttribute) {
        const foundAttr = this._findAttr(linkAttr.entities[0], subjectPhrase, 1);
        if (foundAttr) {
          command.payload.options.addWhereCondition({
            contains: [{
              alias: linkAttr.name,
              attribute: foundAttr,
              value: this._getImage(getPhrase('value'), 1, true)
            }]
          });
        }
      }
    } else {
      const foundAttr = this._findAttr(entity, subjectPhrase, 1);

      if (foundAttr) {
        command.payload.options.addWhereCondition({
          contains: [{
            alias: command.payload.link.alias,
            attribute: foundAttr,
            value: this._getImage(getPhrase('value'), 1, true)
          }]
        });
      }
    }

    return command;
  }
};

export function command2Text(command: ICommand, erModel: ERModel): string {
  if (command.action !== 'QUERY') {
    throw new Error('Unsupported command type');
  }

  const eq = command.payload;
  const entity = eq.link.entity;
  const res = [`Покажи все ${entity.name}.`];

  // TODO: не обрабатываются цепочки условий OR, AND
  if (eq.options?.where?.length) {
    for (const { contains } of eq.options.where) {
      if (contains?.length) {
        for (const { alias, attribute, value } of contains) {
          if (alias === eq.link.alias) {
            res.push(`Атрибут ${attribute.name} содержит "${value}".`);
          } else {
            const attrLink = entity.attributes[alias];
            if (attrLink) {
              res.push(`Атрибут ${attribute.name} атрибута ${attrLink.name} содержит "${value}".`);
            }
          }
        }
      }
    }
  }

  if (eq.options?.order?.length) {
    const ordr = eq.options.order[0];
    res.push(`Отсортируй по ${ordr.attribute.name}${ordr.type === 'DESC' ? ', по убыванию.' : '.'}`);
  }

  return res.join(' ');
};