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
    id: string;
    template: IRusPhraseTemplate;
    optional?: boolean;
  }[]
};

export interface IRusPhraseTemplate {
  id: string;
  label?: string;
  examples?: string[];
  words: {
    optional?: boolean;
    wordForms: RusPhraseWordTemplate[];
  }[];
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

export type RusPhraseWordTemplate = IRusPhraseNounTemplate
  | IRusPhraseVerbTemplate
  | IRusPhraseAdjectiveTemplate
  | IRusPhrasePrepositionTemplate;

export interface IRusSentence {
  templateId: string;
  phrases: {
    phraseId: string;
    words: AnyWord[];
  }[];
};