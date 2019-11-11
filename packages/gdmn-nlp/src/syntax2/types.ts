import { AnyWords, AnyWord } from "..";
import { PartOfSpeech, RusCase, RusMood, MorphNumber } from "../morphology/types";
import { SemCategory } from "../semantics/categories";

export interface INLPTokenType {
  name: string;
  pattern: RegExp;
};

export interface INLPToken {
  image: string;
  startOffset: number;
  tokenType: INLPTokenType;
  words?: AnyWords;
  uniformPOS?: INLPToken[];
  numerals?: INLPToken[];
  value?: number;
};

export interface IRusSentenceTemplate {
  id: string;
  label?: string;
  examples?: string[];
  phrases: IRusPhraseTemplate[];
};

export interface IRusPhraseTemplate {
  id: string;
  words: IRusPhraseWordTemplate[][];
  optional?: boolean;
};

export interface IRusPhraseWordTemplate {
  pos: PartOfSpeech;
  optional?: boolean;
  image?: string;
  categories?: SemCategory[];
  allowUniform?: boolean;
};

export interface IRusPhraseNounTemplate extends IRusPhraseWordTemplate {
  pos: 'NOUN';
  case?: RusCase;
  number?: MorphNumber;
};

export interface IRusPhraseVerbTemplate extends IRusPhraseWordTemplate {
  pos: 'VERB';
  mood?: RusMood;
};

export interface IRusPhraseAdjectiveTemplate extends IRusPhraseWordTemplate {
  pos: 'ADJF';
  case?: RusCase;
};

export interface IRusPhrasePrepositionTemplate extends IRusPhraseWordTemplate {
  pos: 'PREP';
};

const templates: IRusSentenceTemplate = {
  id: 'VPShowByPlace',
  label: 'Глагольное предложение',
  examples: ['Покажи все организации и банки из Минска и Пинска'],
  phrases: [
    {
      id: 'verb',
      words: [
        [
          {
            pos: 'VERB',
            image: 'покажи'
          } as IRusPhraseVerbTemplate
        ],
      ]
    },
    {
      id: 'obj',
      words: [
        [
          {
            pos: 'ADJF',
            optional: true,
            image: 'все'
          } as IRusPhraseAdjectiveTemplate
        ],
        [
          {
            pos: 'NOUN',
            case: RusCase.Accs,
            number: 'PLURAL'
          } as IRusPhraseNounTemplate
        ],
      ]
    },
    {
      id: 'place',
      optional: true,
      words: [
        [
          {
            pos: 'PREP',
            image: 'из'
          } as IRusPhrasePrepositionTemplate
        ],
        [
          {
            pos: 'NOUN',
            case: RusCase.Gent,
            number: 'SINGULAR',
            allowUniform: true
          } as IRusPhraseNounTemplate
        ],
      ]
    }
  ]
};