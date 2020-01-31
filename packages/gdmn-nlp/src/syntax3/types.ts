import { RusMood, MorphNumber, RusCase, PartOfSpeech, SemCategory, AnyWord, INLPToken } from "..";

export interface IXPhraseTemplateElement {
  type: 'WORD' | 'ID' | 'QUOTED_LITERAL';
};

export interface IXIdentifierTemplate extends IXPhraseTemplateElement {
  type: 'ID';
  image?: string;
};

export interface IXQuotedLiteralTemplate extends IXPhraseTemplateElement {
  type: 'QUOTED_LITERAL';
  image?: string;
};

export interface IXWordTemplate extends IXPhraseTemplateElement {
  type: 'WORD';
  pos: PartOfSpeech;
  image?: string;
  categories?: SemCategory[];
};

export interface IXRusNounTemplate extends IXWordTemplate {
  pos: 'NOUN';
  case?: RusCase;
  number?: MorphNumber;
};

export interface IXRusVerbTemplate extends IXWordTemplate {
  pos: 'VERB';
  mood?: RusMood;
};

export interface IXRusAdjectiveTemplate extends IXWordTemplate {
  pos: 'ADJF';
  case?: RusCase;
};

export interface IXRusPrepositionTemplate extends IXWordTemplate {
  pos: 'PREP';
};

export type XRusWordTemplate = IXRusNounTemplate
  | IXRusVerbTemplate
  | IXRusAdjectiveTemplate
  | IXRusPrepositionTemplate;

export type XPhraseElement = IXIdentifierTemplate
  | IXQuotedLiteralTemplate
  | IXPhraseTemplate
  | XRusWordTemplate;

export interface IXSpecifier {
  template: IXPhraseTemplate;
  optional?: boolean;
  noUniform?: boolean;
};

export type IXComplement = IXSpecifier;
export type IXAdjunct = IXSpecifier;

export interface IXHead {
  template: XPhraseElement[];
  noUniform?: boolean;
};

export interface IXPhraseTemplate {
  id: string;
  label?: string;
  examples?: string[];
  specifier?: IXSpecifier;
  head: IXHead;
  complements?: IXComplement[];
  adjunct?: IXAdjunct;
};

export function isIXPhraseTemplate(t: any): t is IXPhraseTemplate {
  return t instanceof Object && typeof t.id === 'string' && t.head instanceof Object;
};

interface IXWordBase {
  type: 'EMPTY' | 'WORD' | 'TOKEN';
};

export interface IXEmpty extends IXWordBase {
  type: 'EMPTY';
};

export interface IXWord extends IXWordBase {
  type: 'WORD';
  word: AnyWord;
};

export interface IXToken extends IXWordBase {
  type: 'TOKEN';
  token: INLPToken;
};

export type XWordOrToken = IXEmpty | IXToken | IXWord;

export interface IXPhrase {
  phraseTemplateId: string;
  specifier?: IXPhrase;
  head?: IXPhrase;
  headTokens?: XWordOrToken[];
  complements?: IXPhrase[];
  adjunct?: IXPhrase[];
};
