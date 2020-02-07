import {
  text2Tokens,
  tokens2sentenceTokens,
  nlpTokenize,
  xParse,
  xTemplates,
  IXPhrase,
  isIXWord,
  IXWord,
  IXToken,
  RusNoun,
  nlpIDToken,
  morphAnalyzer,
  isIXToken,
  isIXPhrase,
  nlpQuotedLiteral,
  phraseFind,
  RusCase,
  XWordOrToken,
  RusConjunction} from "gdmn-nlp";
import {ERModel, Entity, prepareDefaultEntityLinkFields, EntityQueryOptions, EntityLink, EntityQuery, EntityAttribute, EntityLinkField, IEntityQueryWhere} from "gdmn-orm";
import {ICommand, Action} from "./command";
import { xTranslators } from "./translators";
import { ERTranslatorError, XPhrase2Command, IXTranslatorForward } from "./types";
import { getLName } from "gdmn-internals";
import { command2Text } from "./command2text";

interface IERTranslatorRU3Params {
  erModel: ERModel;
  command?: ICommand;
  text?: string[];
  processUniform?: boolean;
  forward?: IXTranslatorForward;
};

export class ERTranslatorRU3 {

  private _params: IERTranslatorRU3Params;

  constructor(params: IERTranslatorRU3Params) {
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

  public clear() {
    return new ERTranslatorRU3({ ...this._params, command: undefined, text: undefined, forward: undefined });
  }

  private _checkContext() {
    if (!this._params.command?.payload.options || !this._params.text) {
      console.log(this._params.command?.payload);
      console.log(this._params.text);
      throw new ERTranslatorError('NO_CONTEXT');
    }
  }

  private _findEntity(wt: IXWord | IXToken) {
    return wt.type === 'WORD' && wt.word instanceof RusNoun
      ? this._findEntity2(wt.word)
      : wt.type === 'TOKEN' && wt.token.tokenType === nlpIDToken
      ? this.erModel.entities[wt.token.image]
      : wt.type === 'TOKEN' && wt.token.tokenType === nlpQuotedLiteral
      ? this.erModel.entities[wt.token.image.slice(2, wt.token.image.length - 1)]
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

  private _findAttr(entity: Entity, wt: IXWord | IXToken) {
    return wt.type === 'WORD' && wt.word instanceof RusNoun
      ? this._findAttr2(entity, wt.word)
      : wt.type === 'TOKEN' && wt.token.tokenType === nlpIDToken
      ? entity.attributes[wt.token.image.toUpperCase()]
      : wt.type === 'TOKEN' && wt.token.tokenType === nlpQuotedLiteral
      ? entity.attributes[wt.token.image.slice(1, wt.token.image.length - 1).toUpperCase()]
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

  private static processComplements(erTranslator: ERTranslatorRU3, phrase: IXPhrase) {
    if (phrase.complements) {
      for (const complement of phrase.complements) {
        const translator = xTranslators[complement.phraseTemplateId];
        if (translator && translator.context !== 'NEW') {
          erTranslator = erTranslator.process(complement, translator);
        }
      }
    }

    return erTranslator;
  };

  private static getNoun(phrase: IXPhrase, path: string) {
    const valuePhrase = phraseFind(phrase, path);

    if (isIXWord(valuePhrase) && valuePhrase.word instanceof RusNoun) {
      return valuePhrase.word;
    }

    throw new Error(`No noun found at the location ${path} in phrase ${phrase.phraseTemplateId}`);
  }

  public process(phrase: IXPhrase, translator: XPhrase2Command, image?: string) {
    if (translator.context === 'NEW') {
      let action: Action | undefined = undefined;

      for (const selector of translator.actionSelector) {
        if (selector.path) {
          const v = phraseFind(phrase, selector.path);
          if (isIXWord(v)) {
            if (v.word.word === selector.testValue) {
              action = selector.action;
              break;
            }
          }
        } else {
          action = selector.action;
          break;
        }
      }

      if (!action) {
        throw new ERTranslatorError('UNKNOWN_ACTION');
      }

      let entity: Entity | undefined = undefined;
      let upPhrase: IXPhrase | undefined = undefined;

      if (translator.entityQuery.entity.entityClass) {
        entity = this.erModel.entities[translator.entityQuery.entity.entityClass];
      }
      else if (translator.entityQuery.entity.path) {
        const entityPhrase = phraseFind(phrase, translator.entityQuery.entity.path);

        if (isIXWord(entityPhrase) || isIXToken(entityPhrase)) {
          entity = this._findEntity(entityPhrase);

          const path = translator.entityQuery.entity.path.split('/');

          if (path[path.length - 1] === 'H') {
            path.length = path.length - 1;
            const temp = phraseFind(phrase, path.join('/'));
            if (isIXPhrase(temp)) {
              upPhrase = temp;
            }
          }
        }
      }

      if (!entity) {
        throw new ERTranslatorError('UNKNOWN_ENTITY', `Can't find entity.`);
      }

      const rootAlias = 'root';
      const fields = prepareDefaultEntityLinkFields(entity);
      const options = new EntityQueryOptions(undefined, undefined, undefined);
      const entityLink = new EntityLink(entity, rootAlias, fields);
      const res = new ERTranslatorRU3({
        erModel: this.erModel,
        command: {
          action,
          payload: new EntityQuery(entityLink, options)
        },
        text: image ? [image] : undefined,
        forward: this._params.forward
      });

      if (upPhrase) {
        return ERTranslatorRU3.processComplements(res, upPhrase);
      }

      return res;
    } else {
      this._checkContext();

      const eq = this.command.payload.duplicate(this.erModel);
      const entity = eq.link.entity;

      if (translator.context === 'EQ' && translator.entityQuery.where?.length) {
        if (translator.entityQuery.where[0].contains) {
          const attr = entity.attributesBySemCategory(translator.entityQuery.where[0].contains.attrBySem)[0];
          const fields = eq.link.fields;

          const getCondition = (v: XWordOrToken): IEntityQueryWhere => {
            let value: string;

            if (isIXWord(v)) {
              const noun = v.word as RusNoun;
              value = noun.lexeme.getWordForm({c: RusCase.Nomn, singular: true}).word;
            } else {
              value = v.token.image;
            }

            if (attr instanceof EntityAttribute) {
              const foundLinkField = fields.find( f => f.attribute === attr );

              if (foundLinkField && foundLinkField.links) {
                return {
                  contains: [{
                    alias: foundLinkField.links[0].alias,
                    attribute: foundLinkField.links[0].entity.presentAttribute(),
                    value
                  }]
                };
              } else {
                const linkEntity = attr.entities[0];
                const linkAlias = "alias2";

                fields.push(new EntityLinkField(attr, [new EntityLink(linkEntity, linkAlias, [])]));

                return {
                  contains: [{
                    alias: linkAlias,
                    attribute: linkEntity.presentAttribute(),
                    value
                  }]
                };
              }
            } else {
              return {
                contains: [{
                  alias: eq.link.alias,
                  attribute: attr,
                  value
                }]
              };
            }
          }

          const value = phraseFind(phrase, translator.entityQuery.where[0].contains.value);

          if ((isIXWord(value) && value.word instanceof RusNoun) || isIXToken(value)) {
            const conditions: IEntityQueryWhere[] = [];
            conditions.push(getCondition(value));

            if (value.uniform) {
              for (const u of value.uniform) {
                if ((isIXWord(u) && u.word instanceof RusNoun) || (isIXToken(u) && u.token.image !== ',')) {
                  conditions.push(getCondition(u));
                }
              }
            }

            if (conditions.length === 1) {
              eq.options!.addWhereCondition(conditions[0]);
            } else {
              eq.options!.addWhereCondition({ or: conditions });
            }
          }
        }
      }

      if (translator.entityQuery.order) {
        if (translator.entityQuery.order.clear) {
          eq.options!.order = undefined;
        }

        if (translator.entityQuery.order.attrPath) {
          const byFieldPhrase = phraseFind(phrase, translator.entityQuery.order.attrPath);

          if (isIXWord(byFieldPhrase) || isIXToken(byFieldPhrase)) {
            const addOrdr = (p: IXWord | IXToken) => {
              const foundAttr = this._findAttr(entity, p);

              if (foundAttr) {
                eq.options!.addOrder({
                  alias: eq.link.alias,
                  attribute: foundAttr,
                  type: this._params?.forward?.sortOrder ?? 'ASC'
                });
              } else {
                throw new ERTranslatorError('UNKNOWN_ATTR');
              }
            }

            addOrdr(byFieldPhrase);

            if (byFieldPhrase.uniform) {
              for (const u of byFieldPhrase.uniform) {
                if ((isIXWord(u) && !(u.word instanceof RusConjunction)) || (isIXToken(u) && u.token.image !== ',')) {
                  addOrdr(u);
                }
              }
            }
          }
        }
        else if (translator.entityQuery.order.orderValue) {
          const orderValuePhrase = phraseFind(phrase, translator.entityQuery.order.orderValue);

          if (isIXWord(orderValuePhrase)) {
            const sortOrder = orderValuePhrase.word.lexeme.stem === 'возрастан' ? 'ASC' : 'DESC';

            if (!eq.options!.order) {
              this._params.forward = { ...this._params.forward, sortOrder };
            } else {
              const l = eq.options!.order.length;
              if (phrase.prevSibling?.phraseTemplateId === 'ppBy' && l) {
                const ordr = eq.options!.order[l - 1];
                eq.options!.order = [...eq.options!.order.slice(0, l - 1), { ...ordr, type: orderValuePhrase.word.lexeme.stem === 'возрастан' ? 'ASC' : 'DESC' }];
              } else {
                eq.options!.order = eq.options!.order.map( ordr => ({ ...ordr, type: orderValuePhrase.word.lexeme.stem === 'возрастан' ? 'ASC' : 'DESC' }) );
              }
            }
          }
        }
      }

      const command = {...this.command, payload: eq};

      return ERTranslatorRU3.processComplements(
        new ERTranslatorRU3({
          erModel: this.erModel,
          command,
          text: [command2Text(command)],
          forward: this._params.forward
        }),
        phrase);
    }
  }

  public processText(text: string) {
    // весь текст разбиваем на токены
    const tokens = text2Tokens(text);

    // разбиваем на предложения используя точку как разделитель
    // убираем пустые предложения
    const sentences = tokens2sentenceTokens(tokens).filter( s => s.length );

    let res: ERTranslatorRU3 = this;

    for (const sentence of sentences) {
      // разбиваем на варианты, если некоторое слово может быть
      // разными частями речи. преобразуем однородные части
      // речи и превращаем числительные в значения
      const variants = nlpTokenize(sentence, this._params.processUniform);

      for (const template of Object.values(xTemplates)) {
        // TODO: пока обрабатываем только первый вариант
        const parsed = xParse(variants[0], template);

        // TODO: обрабатываем только первый нашедшийся
        // вариант разбора предложения
        if (parsed.type === 'SUCCESS' && !parsed.restTokens.length) {
          const translator = xTranslators[parsed.phrase.phraseTemplateId];

          if (!translator) {
            throw new ERTranslatorError('UNKNOWN_PHRASE', `Unsupported phrase template id: ${parsed.phrase.phraseTemplateId}`);
          }

          res = res.process(parsed.phrase, translator, sentence.reduce( (p, t) => p += t.image, '' ));
          break;
        }
      }
    }

    return res;
  }
};
