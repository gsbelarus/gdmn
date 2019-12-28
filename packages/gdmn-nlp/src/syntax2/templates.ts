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

  'VERB_SORT': {
    id: 'VERB_SORT',
    elements: [
      {
        alt: [
          {
            type: 'WORD',
            pos: 'VERB',
            image: 'отсортируй'
          },
          {
            type: 'WORD',
            pos: 'VERB',
            image: 'сортируй'
          },
        ]
      }
    ]
  },

  'CONTAINS_VALUE': {
    id: 'CONTAINS_VALUE',
    examples: ['содержит "ООО"'],
    elements: [
      {
        alt: [{
          type: 'WORD',
          pos: 'VERB',
          image: 'содержит'
        }]
      },
      {
        alt: [{
          type: 'QUOTED_LITERAL'
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
  },

  'BY_FIELD_TEMPLATE': {
    id: 'BY_FIELD_TEMPLATE',
    examples: ['по названию'],
    elements: [
      {
        alt: [{
          type: 'WORD',
          pos: 'PREP',
          image: 'по'
        }],
      },
      {
        alt: [
          {
            type: 'WORD',
            pos: 'NOUN',
            case: RusCase.Datv,
            number: 'SINGULAR',
          },
          {
            type: 'ID'
          }
        ],
      }
    ]
  },

  'SORT_ORDER_TEMPLATE': {
    id: 'SORT_ORDER_TEMPLATE',
    examples: ['по возрастанию', 'по убыванию'],
    elements: [
      {
        alt: [{
          type: 'WORD',
          pos: 'PREP',
          image: 'по'
        }],
      },
      {
        alt: [
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
          {
            type: 'WORD',
            pos: 'NOUN',
            image: 'алфавиту'
          },
        ],
      }
    ]
  },

  'NOUN_SUBJECT_SING': {
    id: 'NOUN_SUBJECT_SING',
    examples: ['название'],
    elements: [
      {
        alt: [{
          type: 'WORD',
          pos: 'NOUN',
          case: RusCase.Nomn,
          number: 'SINGULAR',
        }],
      }
    ]
  },

  'ATTR_ID_SUBJECT': {
    id: 'ATTR_ID_SUBJECT',
    examples: ['атрибут NAME'],
    elements: [
      {
        alt: [{
          type: 'WORD',
          pos: 'NOUN',
          image: 'атрибут'
        }],
      },
      {
        alt: [{
          type: 'ID'
        }],
      }
    ]
  },

  'ATTR_ID_OBJECT': {
    id: 'ATTR_ID_OBJECT',
    examples: ['атрибута PLACEKEY'],
    elements: [
      {
        alt: [{
          type: 'WORD',
          pos: 'NOUN',
          image: 'атрибута'
        }],
      },
      {
        alt: [{
          type: 'ID'
        }],
      }
    ]
  },

  'QUOTED_LITERAL': {
    id: 'QUOTED_LITERAL',
    examples: ['"некоторый текст"'],
    elements: [
      {
        alt: [{
          type: 'QUOTED_LITERAL'
        }],
      }
    ]
  }
};

export const sentenceTemplates: IRusSentenceTemplate[] = [
  {
    id: 'VPShowByPlace',
    label: 'Глагольное предложение #1',
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
  },
  {
    id: 'VPSortBy',
    label: 'Глагольное предложение #2',
    examples: ['Отсортируй по названию', 'Сортируй по названию'],
    phrases: [
      {
        alt: [{
          id: 'verb',
          template: phraseTemplates.VERB_SORT
        }]
      },
      {
        alt: [{
          id: 'byField',
          template: phraseTemplates.BY_FIELD_TEMPLATE,
        }]
      },
      {
        alt: [{
          id: 'sortOrder',
          template: phraseTemplates.SORT_ORDER_TEMPLATE,
        }],
        optional: true
      },
    ]
  },
  {
    id: 'VPContains',
    label: 'Глагольное предложение #3',
    examples: ['Название содержит "некоторое_значение"'],
    phrases: [
      {
        alt: [{
          id: 'subject',
          template: phraseTemplates.NOUN_SUBJECT_SING
        }]
      },
      {
        alt: [{
          id: 'predicate',
          template: phraseTemplates.CONTAINS_VALUE,
        }]
      }
    ]
  },
  {
    id: 'VPAttrContains',
    label: 'Глагольное предложение #4',
    examples: ['Атрибут NAME атрибута PLACEKEY содержит "некоторое_значение"'],
    phrases: [
      {
        alt: [{
          id: 'subject',
          template: phraseTemplates.ATTR_ID_SUBJECT
        }]
      },
      {
        alt: [{
          id: 'object',
          template: phraseTemplates.ATTR_ID_OBJECT,
        }],
        optional: true
      },
      {
        alt: [{
          id: 'value',
          template: phraseTemplates.CONTAINS_VALUE,
        }]
      }
    ]
  }
];