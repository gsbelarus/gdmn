import { IRusPhraseTemplate, RusCase, IRusSentenceTemplate } from "..";

export const phraseTemplates: { [id: string]: IRusPhraseTemplate } = {
  'VERB_SHOW': {
    id: 'VERB_SHOW',
    elements: [
      {
        alt: [{
          type: 'WORD',
          pos: 'VERB',
          image: 'покажи'
        }]
      }
    ]
  },

  'QUALIFIED_ENTITY_NAME': {
    id: 'QUALIFIED_ENTITY_NAME',
    examples: ['все организации'],
    elements: [
      {
        optional: true,
        alt: [{
          type: 'WORD',
          pos: 'ADJF',
          image: 'все'
        }],
      },
      {
        alt: [
          {
            type: 'WORD',
            pos: 'NOUN',
            case: RusCase.Accs,
            number: 'PLURAL',
            noUniform: true
          },
          {
            type: 'ID'
          }
        ],
      }
    ]
  },

  'FROM_PLACE_TEMPLATE': {
    id: 'FROM_PLACE_TEMPLATE',
    examples: ['из Минска', 'из Минска и Пинска'],
    elements: [
      {
        alt: [{
          type: 'WORD',
          pos: 'PREP',
          image: 'из'
        }],
      },
      {
        alt: [{
          type: 'WORD',
          pos: 'NOUN',
          case: RusCase.Gent,
          number: 'SINGULAR',
        }],
      }
    ]
  }
};

export const sentenceTemplates: IRusSentenceTemplate[] = [
  {
    id: 'VPShowByPlace',
    label: 'Глагольное предложение',
    examples: ['Покажи все организации и банки из Минска и Пинска'],
    phrases: [
      {
        alt: [{
          id: 'verb',
          template: phraseTemplates.VERB_SHOW
        }]
      },
      {
        alt: [{
          id: 'entity',
          template: phraseTemplates.QUALIFIED_ENTITY_NAME
        }]
      },
      {
        alt: [{
          id: 'fromPlace',
          template: phraseTemplates.FROM_PLACE_TEMPLATE,
        }],
        optional: true
      },
    ]
  }
];