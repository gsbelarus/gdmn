import {
  text2Tokens,
  tokens2sentenceTokens,
  nlpTokenize,
  xParse,
  xTemplates,
  IXPhrase,
  XWordOrToken,
  isIXWord,
  IXWord,
  IXToken,
  RusNoun,
  nlpIDToken,
  morphAnalyzer,
  isIXToken,
  nlpQuotedLiteral,
  phraseFind} from "gdmn-nlp";
import {ERModel, Entity, prepareDefaultEntityLinkFields, EntityQueryOptions, EntityLink, EntityQuery} from "gdmn-orm";
import {ICommand, Action} from "./command";
import { xTranslators } from "./translators";
import { ERTranslatorError } from "./types";
import { getLName } from "gdmn-internals";
import { command2Text } from "./command2text";

interface IERTranslatorRU3Params {
  erModel: ERModel;
  command?: ICommand;
  text?: string[];
  processUniform?: boolean;
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
    return new ERTranslatorRU3({ ...this._params, command: undefined, text: undefined });
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

  public process(phrase: IXPhrase, image?: string) {
    const translator = xTranslators[phrase.phraseTemplateId];

    if (translator) {
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

        if (translator.entityQuery.entity.entityClass) {
          entity = this.erModel.entities[translator.entityQuery.entity.entityClass];
        }
        else if (translator.entityQuery.entity.path) {
          const entityPhrase = phraseFind(phrase, translator.entityQuery.entity.path);

          if (isIXWord(entityPhrase) || isIXToken(entityPhrase)) {
            entity = this._findEntity(entityPhrase);
          }
        }

        if (!entity) {
          throw new ERTranslatorError('UNKNOWN_ENTITY', `Can't find entity.`);
        }

        const rootAlias = 'root';
        const fields = prepareDefaultEntityLinkFields(entity);
        const options = new EntityQueryOptions(undefined, undefined, undefined);
        const entityLink = new EntityLink(entity, rootAlias, fields);

        return new ERTranslatorRU3({
          erModel: this.erModel,
          command: {
            action,
            payload: new EntityQuery(entityLink, options)
          },
          text: image ? [image] : undefined
        });
      } else {
        this._checkContext();

        const entity = this.command.payload.link.entity;

        if (translator.entityQuery.order) {
          const byFieldPhrase = phraseFind(phrase, translator.entityQuery.order.attrPath);

          if (isIXWord(byFieldPhrase) || isIXToken(byFieldPhrase)) {
            const foundAttr = this._findAttr(entity, byFieldPhrase);

            if (foundAttr) {
              const eq = this.command.payload.duplicate(this.erModel);

              eq.options!.addOrder({
                alias: eq.link.alias,
                attribute: foundAttr,
                type: 'ASC'
              }, true);

              const command = {...this.command, payload: eq};

              return new ERTranslatorRU3({
                erModel: this.erModel,
                command,
                text: [command2Text(command)]
              });
            }

            throw new ERTranslatorError('UNKNOWN_ATTR');
          }
        }

        throw new ERTranslatorError('UNKNOWN_PHRASE');
      }
    } else {
      throw new ERTranslatorError('UNKNOWN_PHRASE', `Unsupported phrase template id: ${phrase.phraseTemplateId}`);
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
        if (parsed.type === 'SUCCESS') {
          res = res.process(parsed.phrase, sentence.reduce( (p, t) => p += t.image, '' ));
          break;
        }
      }
    }

    return res;
  }
};
