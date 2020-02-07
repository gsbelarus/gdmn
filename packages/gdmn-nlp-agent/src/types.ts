import { Action } from "./command";
import { SemCategory } from "gdmn-nlp";

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

interface IXOrder {
  clear?: boolean;
  attrPath?: string;
  orderValue?: string;
};

interface IXAttrValue {
  attrBySem: SemCategory;
  value: string;
};

interface IXWhere {
  contains?: IXAttrValue;
};

interface IXEntity {
  path?: string;
  entityClass?: string;
};

type Context = 'NEW' | 'EQ' | 'EQ/ORDER';

export interface IXPhrase2CommandBase {
  phraseTemplateId: string;
  context: Context;
};

export interface IXPhrase2CommandNew extends IXPhrase2CommandBase {
  context: 'NEW';
  actionSelector: {
    path?: string;
    testValue?: string;
    action: Action;
  }[],
  entityQuery: {
    entity: IXEntity,
    order?: IXOrder,
    where?: IXWhere[]
  }
};

export interface IXPhrase2CommandEQ extends IXPhrase2CommandBase {
  context: 'EQ';
  entityQuery: {
    entity?: IXEntity,
    order?: IXOrder,
    where?: IXWhere[]
  }
};

export interface IXPhrase2CommandEQOrder extends IXPhrase2CommandBase {
  context: 'EQ/ORDER';
  entityQuery: {
    order?: IXOrder
  }
};

export type XPhrase2Command = IXPhrase2CommandNew | IXPhrase2CommandEQ | IXPhrase2CommandEQOrder;

export interface IXTranslatorForward {
  sortOrder?: 'ASC' | 'DESC';
};
