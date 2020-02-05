import { XPhrase2Command, IXPhrase2CommandNewContext, IXPhrase2CommandExistingContext } from "./types";

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
const vpShow2Command: IXPhrase2CommandNewContext = {
  phraseTemplateId: 'vpShow',
  newContext: true,
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

const vpSortBy2Command: IXPhrase2CommandExistingContext = {
  phraseTemplateId: 'vpSortBy',
  newContext: false,
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
  vpSortBy: vpSortBy2Command
};