import { IXPhraseTemplate } from "./types";
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

const ppFromPlace: IXPhraseTemplate = {
  id: 'PPFromPlace',
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

const npAllObjectsFromPlace: IXPhraseTemplate = {
  id: 'NPAllObjectsFromPlace',
  label: 'Фраза с существительным вида "Все организации из Минска"',
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
  complements: [{
    template: ppFromPlace,
    optional: true
  }]
};

const vpShowByPlace: IXPhraseTemplate = {
  id: 'VPShowByPlace',
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

export const xTemplates = {
  vpShowByPlace
};