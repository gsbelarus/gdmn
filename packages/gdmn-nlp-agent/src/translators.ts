import { SemCategory } from "gdmn-nlp";
import { XPhrase2Command, IXPhrase2CommandEQ, IXPhrase2CommandNew, IXPhrase2CommandEQOrder } from "./types";

const vpShow2Command: IXPhrase2CommandNew = {
  phraseTemplateId: 'vpShow',
  context: 'NEW',
  actionSelector: [{
    path: 'H',
    testValue: 'покажи',
    action: 'QUERY'
  }],
  entityQuery: {
    entity: {
      path: 'C/npAllObjects/H'
    }
  }
};

const vpShowByPlace2Command: IXPhrase2CommandNew = {
  ...vpShow2Command,
  phraseTemplateId: 'vpShowByPlace',
  entityQuery: {
    entity: {
      path: 'C/npAllObjectsFromPlace/H'
    }
  }
};

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

const ppFromPlace2Command: IXPhrase2CommandEQ = {
  phraseTemplateId: 'ppFromPlace',
  context: 'EQ',
  entityQuery: {
    where: [
      {
        contains: {
          attrBySem: SemCategory.ObjectLocation,
          value: 'C/nounGent/H'
        }
      }
    ]
  }
};

const vpSortBy2Command: IXPhrase2CommandEQ = {
  phraseTemplateId: 'vpSortBy',
  context: 'EQ',
  entityQuery: {
    order: {
      clear: true
    }
  }
};

const ppBy2Command: IXPhrase2CommandEQOrder = {
  phraseTemplateId: 'ppBy',
  context: 'EQ/ORDER',
  entityQuery: {
    order: {
      attrPath: 'C/nounDatv/H'
    }
  }
};

const ppSortOrder2Command: IXPhrase2CommandEQOrder = {
  phraseTemplateId: 'ppSortOrder',
  context: 'EQ/ORDER',
  entityQuery: {
    order: {
      orderValue: 'C/nounSortOrder/H'
    }
  }
};

const npContains2Command: IXPhrase2CommandEQ = {
  phraseTemplateId: 'npContains',
  context: 'EQ',
  entityQuery: {
    where: [
      {
        contains: {
          attrPath: 'H',
          value: 'C/vpContains/C/quotedLiteral/H'
        }
      }
    ]
  }
};

interface IXTranslators {
  [phraseTemplateId: string]: XPhrase2Command;
};

export const xTranslators: IXTranslators = {
  vpShow: vpShow2Command,
  vpShowByPlace: vpShowByPlace2Command,
  ppFromPlace: ppFromPlace2Command,
  vpSortBy: vpSortBy2Command,
  ppBy: ppBy2Command,
  ppSortOrder: ppSortOrder2Command,
  npContains: npContains2Command
};