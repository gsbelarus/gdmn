import { Action } from "./command";

export type ERTranslatorErrorCode = 'INVALID_PHRASE_STRUCTURE'
  | 'UNKNOWN_PHRASE'
  | 'UNKNOWN_ENTITY'
  | 'UNKNOWN_ATTR'
  | 'UNKNOWN_ACTION'
  | 'UNSUPPORTED_COMMAND_TYPE'
  | 'NO_CONTEXT';

export class ERTranslatorError extends Error {
  constructor(readonly code: ERTranslatorErrorCode, ...params: any[]) {
    super(...params)

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ERTranslatorError)
    }

    this.name = 'ERTranslatorError'

    if (!this.message) {
      this.message = code;
    }
  }
};

/*

  Путь к слову фразы задается строкой, элементы которой разделены
  слэшами "/". Строка не должна начинаться со слэша.
  Элементами могут быть:

  1. H -- указывет на head. Следующий элемент либо числовой индекс
     слова (начиная с нуля), либо id шаблона фразы, если под head
     скрывается фраза. Последний индекс 0 может быть опущен.
     Т.е. пути 'H' и 'H/0' идентичны.
  2. С -- комплемент. Следующий элемент -- id шаблона фразы.
  3. A -- адьюнкт. Следующий элемент -- id шаблона фразы.

*/

export interface IXPhrase2CommandBase {
  phraseTemplateId: string;
  newContext: true | false;
};

export interface IXPhrase2CommandNewContext extends IXPhrase2CommandBase {
  newContext: true;
  actionSelector: {
    path?: string;
    testValue?: string;
    action: Action;
  }[],
  entityQuery: {
    entity: {
      path?: string;
      entityClass?: string;
    },
    order?: {
      attrPath: string;
    }
  }
};

export interface IXPhrase2CommandExistingContext extends IXPhrase2CommandBase {
  newContext: false;
  entityQuery: {
    order?: {
      attrPath: string;
    }
  }
};

export type XPhrase2Command = IXPhrase2CommandNewContext | IXPhrase2CommandExistingContext;
