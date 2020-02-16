import { IXPhraseTemplate, IXInheritedPhraseTemplate } from "./types";
import { RusCase } from "..";

// Покажи все организации из Минска и Пинска

const specifierAll: IXPhraseTemplate = {
  id: 'specifierAll',
  head: {
    template: [{
      type: 'WORD',
      pos: 'ADJF',
      image: 'все'
    }],
    noUniform: true
  }
};

const nounNomn: IXPhraseTemplate = {
  id: 'nounNomn',
  head: {
    template: [
      {
        type: 'WORD',
        pos: 'NOUN',
        case: RusCase.Nomn,
        number: 'SINGULAR'
      },
      {
        type: 'ID'
      }
    ]
  }
};

const nounGent: IXPhraseTemplate = {
  id: 'nounGent',
  head: {
    template: [{
      type: 'WORD',
      pos: 'NOUN',
      case: RusCase.Gent,
      number: 'SINGULAR'
    }]
  }
};

const nounDatv: IXPhraseTemplate = {
  id: 'nounDatv',
  head: {
    template: [
      {
        type: 'WORD',
        pos: 'NOUN',
        case: RusCase.Datv,
        number: 'SINGULAR'
      },
      {
        type: 'ID'
      },
      {
        type: 'QUOTED_LITERAL'
      }
    ]
  }
};

const quotedLiteral: IXPhraseTemplate = {
  id: 'quotedLiteral',
  head: {
    template: [
      {
        type: 'QUOTED_LITERAL'
      }
    ]
  }
};

/**
 * Из Минска.
 */
const ppFromPlace: IXPhraseTemplate = {
  id: 'ppFromPlace',
  head: {
    template: [{
      type: 'WORD',
      pos: 'PREP',
      image: 'из'
    }]
  },
  complements:[{
    template: nounGent
  }]
};

/**
 * по названию, адресу
 */
const ppBy: IXPhraseTemplate = {
  id: 'ppBy',
  head: {
    template: [{
      type: 'WORD',
      pos: 'PREP',
      image: 'по'
    }]
  },
  complements:[
    {
      template: nounDatv,
    },
  ]
};

const nounSortOrder: IXPhraseTemplate = {
  id: 'nounSortOrder',
  head: {
    template: [
      {
        type: 'WORD',
        pos: 'NOUN',
        image: 'возрастанию'
      },
      {
        type: 'WORD',
        pos: 'NOUN',
        image: 'убыванию'
      },
    ]
  }
};

/**
 * по возрастанию, по убыванию
 */
const ppSortOrder: IXPhraseTemplate = {
  id: 'ppSortOrder',
  head: {
    template: [{
      type: 'WORD',
      pos: 'PREP',
      image: 'по'
    }]
  },
  complements:[
    {
      template: nounSortOrder
    }
  ]
};

const npAllObjects: IXPhraseTemplate = {
  id: 'npAllObjects',
  label: 'Фраза с существительным вида "Все организации"',
  examples: ['все организации', 'организации', 'все TgdcCompany'],
  specifier: {
    template: specifierAll,
    optional: true
  },
  head: {
    template: [
      {
        type: 'WORD',
        pos: 'NOUN',
        number: 'PLURAL',
        case: RusCase.Accs,
      },
      {
        type: 'ID'
      }
    ],
    noUniform: true
  },
};

const npAllObjectsFromPlace: IXInheritedPhraseTemplate = {
  parent: npAllObjects,
  id: 'npAllObjectsFromPlace',
  label: 'Фраза с существительным вида "Все организации из Минска"',
  examples: ['все организации из минска', 'организации из минска и пинска', 'все TgdcCompany из минска'],
  complements: [{
    template: ppFromPlace
  }]
};

const vpContains: IXPhraseTemplate = {
  id: 'vpContains',
  label: 'Глагольная фраза вида "Содержит "....." "',
  examples: ['Содержит "ООО"'],
  head: {
    template: [{
      type: 'WORD',
      pos: 'VERB',
      image: 'содержит',
    }],
    noUniform: true
  },
  complements: [{
    template: quotedLiteral,
    singular: true,
    noUniform: true
  }]
};

const npContains: IXPhraseTemplate = {
  id: 'npContains',
  label: 'Фраза вида "Название содержит "....." "',
  examples: [
    'Название содержит "ООО"',
    'NAME содержит "ООО"',
  ],
  head: {
    template: [
      {
        type: 'WORD',
        pos: 'NOUN',
        case: RusCase.Nomn,
        number: 'SINGULAR'
      },
      {
        type: 'ID'
      }
    ],
    noUniform: true
  },
  complements: [{
    template: vpContains,
    singular: true,
    noUniform: true
  }]
};

const npGentAttr: IXPhraseTemplate = {
  id: 'npGentAttr',
  label: 'Фраза вида "атрибута PLACEKEY"',
  examples: [
    'атрибута PLACEKEY',
  ],
  head: {
    template: [
      {
        type: 'WORD',
        pos: 'NOUN',
        image: 'атрибута'
      }
    ],
    noUniform: true
  },
  complements: [{
    template: nounNomn,
    singular: true,
    noUniform: true
  }]
};

const npOfAttr: IXPhraseTemplate = {
  id: 'npOfAttr',
  label: 'Фраза вида "Название атрибута PLACEKEY"',
  examples: [
    'Название атрибута PLACEKEY',
    'NAME атрибута PLACEKEY',
  ],
  head: {
    template: [
      {
        type: 'WORD',
        pos: 'NOUN',
        case: RusCase.Nomn,
        number: 'SINGULAR'
      },
      {
        type: 'ID'
      }
    ],
    noUniform: true
  },
  complements: [{
    template: npGentAttr,
    singular: true,
    noUniform: true
  }]
};

const npOfAttrContains: IXPhraseTemplate = {
  id: 'npOfAttrContains',
  label: 'Фраза вида "Название атрибута PLACEKEY содержит "....." "',
  head: {
    template: [
      npOfAttr
    ],
    noUniform: true
  },
  complements: [{
    template: vpContains,
    singular: true,
    noUniform: true
  }]
};

const vpShowByPlace: IXPhraseTemplate = {
  id: 'vpShowByPlace',
  label: 'Глагольная фраза вида "Покажи все организации из Минска"',
  examples: ['Покажи все организации из Минска и Пинска'],
  head: {
    template: [{
      type: 'WORD',
      pos: 'VERB',
      image: 'покажи',
    }],
    noUniform: true
  },
  complements: [{
    template: npAllObjectsFromPlace
  }]
};

const vpShow: IXPhraseTemplate = {
  id: 'vpShow',
  label: 'Глагольная фраза вида "Покажи все организации"',
  examples: ['Покажи все организации'],
  head: {
    template: [{
      type: 'WORD',
      pos: 'VERB',
      image: 'покажи',
    }],
    noUniform: true
  },
  complements: [{
    template: npAllObjects
  }]
};

const vpSortBy: IXPhraseTemplate = {
  id: 'vpSortBy',
  label: 'Глагольная фраза вида "Отсортируй по названию"',
  examples: ['Отсортируй по названию'],
  head: {
    template: [
      {
        type: 'WORD',
        pos: 'VERB',
        image: 'сортируй',
      },
      {
        type: 'WORD',
        pos: 'VERB',
        image: 'отсортируй',
      }
    ],
    noUniform: true
  },
  complements: [
    // более частные комплементы, должны идти
    // перед более общими
    {
      template: ppSortOrder,
      optional: true,
      comma: true
    },
    {
      template: ppBy,
      optional: false,
      comma: true
    },
  ]
};

export const xTemplates = {
  vpShow,
  vpShowByPlace,
  vpSortBy,
  ppSortOrder,
  vpContains,
  npContains,
  npOfAttrContains
};