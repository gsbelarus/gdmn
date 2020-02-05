import { SemCategory } from "gdmn-nlp";
import { XPhrase2Command, IXPhrase2CommandEQ, IXPhrase2CommandNew } from "./types";

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
          value: 'C/nounGent'
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
      attrPath: 'C/ppBy/C/nounDatv/H'
    }
  }
};

interface IXTranslators {
  [phraseTemplateId: string]: XPhrase2Command;
};

export const xTranslators: IXTranslators = {
  vpShow: vpShow2Command,
  vpShowByPlace: vpShow2Command,
  ppFromPlace: ppFromPlace2Command,
  vpSortBy: vpSortBy2Command
};