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
  phrases: {
    alt: {
      id: string;
      template: IRusPhraseTemplate;
    }[];
    optional?: boolean;
  }[]
};

export interface IRusPhraseTemplate {
  id: string;
  label?: string;
  examples?: string[];
  elements: {
    optional?: boolean;
    alt: RusPhraseElement[];
  }[];
};

export interface IRusPhraseTemplateElement {
  type: 'PHRASE' | 'WORD' | 'ID';
};

export interface IRusSubPhraseTemplate extends IRusPhraseTemplateElement {
  type: 'PHRASE';
  phrase: IRusPhraseTemplate;
};

export interface IIdentifierTemplate extends IRusPhraseTemplateElement {
  type: 'ID';
  image?: string;
};

export interface IRusWordTemplate extends IRusPhraseTemplateElement {
  type: 'WORD';
  pos: PartOfSpeech;
  image?: string;
  categories?: SemCategory[];
  noUniform?: boolean;
};

export interface IRusNounTemplate extends IRusWordTemplate {
  pos: 'NOUN';
  case?: RusCase;
  number?: MorphNumber;
};

export interface IRusVerbTemplate extends IRusWordTemplate {
  pos: 'VERB';
  mood?: RusMood;
};

export interface IRusAdjectiveTemplate extends IRusWordTemplate {
  pos: 'ADJF';
  case?: RusCase;
};

export interface IRusPrepositionTemplate extends IRusWordTemplate {
  pos: 'PREP';
};

export type RusWordTemplate = IRusNounTemplate
  | IRusVerbTemplate
  | IRusAdjectiveTemplate
  | IRusPrepositionTemplate;

export type RusPhraseElement = IIdentifierTemplate
  | IRusSubPhraseTemplate
  | RusWordTemplate;

interface IRusSentenceWordBase {
  type: 'EMPTY' | 'WORD' | 'TOKEN';
};

export interface IRusSentenceEmpty extends IRusSentenceWordBase {
  type: 'EMPTY';
};

export interface IRusSentenceWord extends IRusSentenceWordBase {
  type: 'WORD';
  word: AnyWord;
  token: INLPToken;
};

export interface IRusSentenceToken extends IRusSentenceWordBase {
  type: 'TOKEN';
  token: INLPToken;
};

export type RusSentenceWordOrToken = IRusSentenceEmpty | IRusSentenceToken | IRusSentenceWord;

export interface IRusSentencePhrase {
  phraseId: string;
  phraseTemplateId: string;
  wordOrToken: RusSentenceWordOrToken[];
};

export interface IRusSentence {
  templateId: string;
  phrases: IRusSentencePhrase[];
};