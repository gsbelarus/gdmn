import { IRusPhraseTemplate, RusCase, IRusSentenceTemplate } from "..";

export const phraseTemplates: { [id: string]: IRusPhraseTemplate } = {
  'VERB_SHOW': {
    id: 'VERB_SHOW',
    words: [
      {
        wordForms: [{
          pos: 'VERB',
          image: 'покажи'
        }]
      }
    ]
  },

  'QUALIFIED_ENTITY_NAME': {
    id: 'QUALIFIED_ENTITY_NAME',
    examples: ['все организации'],
    words: [
      {
        optional: true,
        wordForms: [{
          pos: 'ADJF',
          image: 'все'
        }],
      },
      {
        wordForms: [{
          pos: 'NOUN',
          case: RusCase.Accs,
          number: 'PLURAL'
        }],
      }
    ]
  },

  'FROM_PLACE_TEMPLATE': {
    id: 'FROM_PLACE_TEMPLATE',
    examples: ['из Минска', 'из Минска и Пинска'],
    words: [
      {
        wordForms: [{
          pos: 'PREP',
          image: 'из'
        }],
      },
      {
        wordForms: [{
          pos: 'NOUN',
          case: RusCase.Gent,
          number: 'SINGULAR',
          allowUniform: true
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
        id: 'verb',
        template: phraseTemplates.VERB_SHOW
      },
      {
        id: 'object',
        template: phraseTemplates.QUALIFIED_ENTITY_NAME
      },
      {
        id: 'fromPlace',
        template: phraseTemplates.FROM_PLACE_TEMPLATE,
        optional: true
      },
    ]
  }
];