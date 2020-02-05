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
  | IXInheritedPhraseTemplate
  | XRusWordTemplate;

export interface IXSpecifier {
  template: XPhraseTemplate;
  optional?: boolean;
  noUniform?: boolean;
};

export type IXComplement = IXSpecifier;
export type IXAdjunct = IXSpecifier;

export interface IXHead {
  template: XPhraseElement[];
  noUniform?: boolean;
};

export interface IXPhraseTemplateBase {
  id: string;
  label?: string;
  examples?: string[];
  specifier?: IXSpecifier;
  head?: IXHead;
  complements?: IXComplement[];
  adjunct?: IXAdjunct;
};

export interface IXPhraseTemplate extends IXPhraseTemplateBase {
  head: IXHead;
}

export interface IXInheritedPhraseTemplate extends IXPhraseTemplateBase {
  parent: XPhraseTemplate;
}

export type XPhraseTemplate = IXPhraseTemplate | IXInheritedPhraseTemplate;

export function isIXPhraseTemplate(t: any): t is IXPhraseTemplate {
  return t instanceof Object
    && typeof t.id === 'string'
    && t.head instanceof Object;
};

export function isIXInheritedPhraseTemplate(t: any): t is IXInheritedPhraseTemplate {
  return t instanceof Object
    && typeof t.id === 'string'
    && t.parent instanceof Object;
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

export function isIXWord(w: any): w is IXWord {
  return w?.type === 'WORD';
};

export function isIXToken(w: any): w is IXToken {
  return w?.type === 'TOKEN';
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

export function isIXPhrase(p: any): p is IXPhrase {
  return p?.phraseTemplateId && typeof p.phraseTemplateId === 'string';
};
