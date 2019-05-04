/*
  Description of tags found in open corpora dictionary
  could be find here:
  http://pymorphy2.readthedocs.io/en/latest/_modules/pymorphy2/tagset.html
*/
export type PartOfSpeech    = 'VERB';
export type RusPersons      = 1 | 2 | 3;
export enum RusGender       {Masc = 0, Femn, Neut}
export const RusGenderNames = ['мужской', 'женский', 'средний'];
export const ShortGenderNames = ['Masc', 'Femn', 'Neut'];
export type RusDeclension   = 1 | 2 | 3;
export enum RusCase         {Nomn = 0, Gent, Datv, Accs, Ablt, Loct}
export const RusCaseNames   = ['им.п.', 'род.п.', 'дат.п.', 'вин.п.', 'тв.п.', 'предл.п.'];
export const ShortCaseNames   = ['Nomn', 'Gent', 'Datv', 'Accs', 'Ablt', 'Loct'];
export type RusDeclensionZ  =
  '1a'       |'2a'       |'3a'       |'4a'       |'5a'       |'6a'       |'7a'       |'1b'       |
  '2b'       |'3b'       |'4b'       |'5b'       |'6b'       |'7b'       |'1c'       |'3c'       |
  '4c'       |'6c'       |'1d^'      |'3d'       |'1e'       |'2e'       |'3e'       |'4e'       |
  '2f'       |'1*a'      |'1*b'      |'1*e'      |'2*a'      |'2*b'      |'2*e'      |'3*a'      |
  '3*b'      |'5*a'      |'5*b'      |'6*a'      |'6*b'      |'1°a'      |'1°c(1)'   |'3°a'      |
  '3°b'      |'1a(2)'    |'1c(1)'    |'1c(2)'    |'1c(1)(2)' |'3c(1)'    |'1e(2)'    |'3b(2)'    |
  '5a(2)'    |'3*a(2)'   |'3*b(2)'   |'3*d(2)'   |'1d'       |'2d'       |'4d'       |'6d'       |
  '1d\''     |'3d\''     |'4d\''     |'1f'       |'3f'       |'4f'       |'1f\''     |'3f\''     |
  '8a'       |'8e'       |'8a-ш'     |'8e-ш'     |'8f"'      |'1*d'      |'1*f'      |'2*a-ня'   |
  '2*d'      |'3*d'      |'3*f'      |'3*f\''    |'8*b\''    |'8*b\'ш'   |'7b(2)'    |'7b^'      |
  '2c'       |'5d'       |'3e^'      |'1*c^'     |'5*c'      |'5*d'      |'5*f'      |'6*d'      |
  '8°a'      |'8°c'      |'3a(1)'    |'3d(1)'    |'4f(1)'    |'3*a(1)'   |'3c(2)'    |'3*c(2)'   |
  '5*a(2)'   |'6*a(2)'   |'6*d(2)'   |'3a(1)(2)' |'3*a(1)(2)'|'3*b(1)(2)';
export type RusDeclensionZEnding = {
  animate: boolean,
  gender: RusGender,
  declensionZ: RusDeclensionZ,
  singular: string[],
  plural: string[]
};
export interface IRusNoun {
  readonly stem: string;
  readonly stem1: string;
  readonly stem2: string;
  readonly animate: boolean;
  readonly gender: RusGender;
  readonly declension: RusDeclension;
  readonly declensionZ: RusDeclensionZ;
}
export interface RusNounMorphSigns {
  c: RusCase;
  singular: boolean;
}
export enum RusAspect       {Perf = 0, Impf}
export enum Transitivity    {Tran = 0, Intr}
/**
 * Наклонение глагола.
 */
export enum RusMood         {
  Indc = 0, // Indicative   -- изъявительное "я пишу"
  Cond,     // Conditional  -- условное "писал бы"
  Impr      // Imperative   -- повелительное "пиши!"
}
export const ShortMoodNames = ['Indc', 'Cond', 'Impr'];
export enum RusTense        {Past = 0, Pres, Futr}
export const ShortTenseNames = ['Past', 'Pres', 'Futr'];
export enum Involvement     {Incl = 0, Excl}
export type RusConjugationZ =
  '1a'            |'1aСВ'          |'1a-ся'         |'1a-сяСВ'       |'2a'            |'2b'            |
  '3a(2)СВ'       |'3a-гСВ'        |'3b'            |'3bСВ'          |'3b-еСВ'        |'3b-сяСВ'       |
  '3c'            |'3cСВ'          |'3c-ся'         |'3°a'           |'3°aСВ'         |'3°a((5)(6))-г' |
  '4a'            |'4a-б'          |'4a-б-с'        |'4a-б-сСВ'      |'4a-л'          |'4a-лСВ'        |
  '4a-л-ся'       |'4a-cc'         |'4a-с-л-сяСВ'   |'4a-т'          |'4a-тСВ'        |'4a-тX'         |
  '4a-ш'          |'4a-ш-с'        |'4a((3))-тСВ'   |'4a((3))-ш'     |'4a((3))-шСВ'   |'4b'            |
  '4b-ш'          |'4b-б'          |'4b-т'          |'4b-сяСВ'       |'4c'            |'4c(4)'         |
  '4c(4)-б'       |'4c-ш'          |'4c-ш-сяСВ'     |'4c-б'          |'4c-бСВ'        |'4c-т'          |
  '4c-т-ся'       |'4c-тСВ'        |'4c-сяСВ'       |'5a-д-ся'       |'5a-т'          |'5a-ш'          |
  '5b'            |'5b-ш'          |'5b-ш-ся'       |'5b-ж'          |'5b-т'          |'5b-т-ся'       |
  '5b-тСВ'        |'5b-т-сяСВ'     |'5b-ся'         |'5b/c'          |'5b/c"-ся'      |'5c'            |
  '5c-е'          |'5c-т'          |'5c/c'          |'6a'            |'6a-н'          |'6a-б'          |
  '6a^'           |'6a-т'          |'6a-т-иСВ'      |'6b'            |'6b-ся'         |'6b-ш'          |
  '6b^'           |'6°b'           |'6c'            |'6cСВ'          |'6c-сяСВ'       |'6cX'           |
  '7a(9)-дСВ'     |'9aСВ'          |'9b'            |'9bСВ'          |'9b-ся'         |'9*bСВ'         |
  '10c'           |'10c-ся'        |'11b'           |'11bСВ'         |'11*b/c"-сяСВ'  |'12a'           |
  '12a-ы'         |'12b'           |'12bСВ'         |'12b/c'         |'13b'           |'13b-ся'        |
  '14b'           |'14b-ся'        |'14bСВ'         |'14b-сяСВ'      |'14*bСВ'        |'14*b-сяСВ'     |
  '14b/cСВ'       |'14cСВ'         |'14c(1)СВ'      |'14c/c"-сяСВ'   |'15aСВ'         |'15a-сяСВ'      |
  '16b/c'         |'^a-бытьСВ'     |'^a-ех'         |'^a-ехСВ'       |'^b'            |'^b/b(9)'       |
  '^b/b(9)СВ'     |'^b/cСВ';
export interface RusVerbInterface {
  readonly stem: string;
  readonly stem1: string;
  readonly stem2: string;
  readonly aspect: RusAspect;
  readonly transitivity: Transitivity;
  readonly conjZ: RusConjugationZ;
}
export type RusVerbEnding = {
  ending: string,
  tense?: RusTense;
  singular: boolean;
  gender?: RusGender;
  person?: RusPersons;
  mood: RusMood;
  involvement?: Involvement;
};
export type RusConjugationZEnding = {
  conjZ: RusConjugationZ,
  aspect: RusAspect;
  transitivity: Transitivity;
  suffix: 'нуть' | 'сть' | 'сти' | 'дти' | 'ать' | 'ить' | 'уть' | 'еть' | 'ыть' | 'ять' | 'оть' | 'ть' | 'чь' | 'ти',
  endings: RusVerbEnding[]
};
export interface RusVerbMorphSigns {
  infn?: boolean;
  tense?: RusTense;
  singular?: boolean;
  person?: RusPersons;
  gender?: RusGender;
  mood?: RusMood;
  involvement?: Involvement;
}
export type RusDeclensionAdjectiveZ =
  '1a'        |'1a/c\''    |'1a\''      |'2a'        |'3a'        |'4a'        |
  '4a-ся'     |'5a'        |'6a'        |'1b'        |'1b/c'      |'3b'        |
  '4b'        |'1*a'       |'1*a\''     |'1a/b'      |'1a/с'      |'1*a/c'     |
  '1*b'       |'2*a'       |'2*b'       |'2a/c'      |'3a/c'      |'3*a'       |
  '3a/c"^'    |'3*a\''     |'3*a/c'     |'3*a/c\'';
export enum RusAdjectiveCategory {Qual = 0, Poss, Rel, Pron}
export const RusAdjectiveCategoryNames   = ['кач.', 'притяж.', 'относ.', 'местоимен.'];
export const ShortAdjectiveCategoryNames = ['Qual', 'Poss', 'Relv', 'APro'];
export interface RusAdjectiveInterface {
  readonly stem: string;
  readonly stem1: string;
  readonly stem2: string;
  readonly category: RusAdjectiveCategory;
  readonly declensionZ: RusDeclensionAdjectiveZ;
}
export type RusAdjectiveEnding = {
  ending: string,
  c: RusCase;
  singular: boolean;
  gender?: RusGender;
  animate?: boolean;
};
export type RusDeclensionAdjectiveZEnding = {
  declensionZ: RusDeclensionAdjectiveZ,
  endings: RusAdjectiveEnding[]
};
export interface RusAdjectiveMorphSigns {
  c?: RusCase;
  singular: boolean;
  gender?: RusGender;
  animate?: boolean;
  short?: boolean;
}
export enum ParticleType {Pointing = 0, Specifying, Amplifying, ExcretoryRestrictive, ModalWilled, Affirmative, Negative,
  Interrogative, Comparative, Emotive, Shaping}
export const RusParticleTypeNames = ['указательная', 'уточняющая', 'усилительная', 'выделительно-ограничительная',
  'модально-волевоая', 'утвердительная', 'отрицательная', 'вопросительная', 'сравнительная', 'эмоциональная', 'формообразующая'];
export const ShortParticleTypeNames = ['Poin', 'Spec', 'Ampl', 'ExRe', 'ModW', 'Affr', 'Negt', 'Intr', 'Comp', 'Emot', 'Shap'];
export enum PrepositionType {Place = 0, Object, Time, Reason, Goal, Comparative}
export const RusPrepositionTypeNames = ['пространственный', 'объектный', 'временной', 'причинный', 'целевой', 'сравнительный'];
export const ShortPrepositionTypeNames = ['Plce', 'Objt', 'Time', 'Rson', 'Goal', 'Comp'];
export enum PronounType {Personal = 0, Reflexive, Possesive, Demonstrative, Interrogative, Relative, Definitive, Negative, Vague}
export const RusPronounTypeNames = ['личное', 'возвратное', 'притяжательное', 'указательное', 'вопросительное', 'относительное',
  'определительное', 'отрицательное', 'неопределенное'];
export const ShortPronounTypeNames = ['Pers', 'Refl', 'Poss', 'Demn', 'Intr', 'Relv',
  'Defn', 'Negt', 'Vgue'];
export type RusPronounData = {
  pronounType: PronounType,
  person?: RusPersons,
  singular?: boolean,
  gender?: RusGender,
  noNomn?: boolean,
  words: string[]
};

export enum AdverbType {
  ModeOfAction = 0,
  Measure,
  Place,
  Time,
  Cause,
  Goal
};

export const RusAdverbTypeNames = [
  'образа действий',
  'меры и степени',
  'места',
  'времени',
  'причины',
  'цели'
];

export const ShortAdverbTypeNames = [
  'Mode',
  'Meas',
  'Plce',
  'Time',
  'Cause',
  'Goal'
];

export enum NumeralType {
  Cardinal = 0,
  Ordinal
};

export const RusNumeralTypeNames = [
  'количественное',
  'порядковое'
];

export const ShortNumeralTypeNames = [
  'Crdn',
  'Ordn'
];

export enum NumeralStructure {
  Simple = 0,
  Complex,
  Composite
};

export const RusNumeralStructureNames = [
  'простое',
  'сложное',
  'составное'
];

export const ShortNumeralStructureNames = [
  'Simpl',
  'Compl',
  'Comps'
];

export enum NumeralRank {
  ProperQuantitative = 0,
  Collective,
  Fractional
};

export const RusNumeralRankNames = [
  'собственно количественное',
  'собирательное',
  'дробное'
];

export const ShortNumeralRankNames = [
  'PrQu',
  'Coll',
  'Frac'
];

export type RusDeclensionNumeral  =
'pqs1'         |'pqs2'            |'pqs3'            |'pqs4'            |'pqs5-7,9-20,30'  |'pqs8'
|'pqs40'        |'pqs90,100'    |'pqc50,60,70,80'  |'pqc50,60,70,80';

export type RusDeclensionNumeralEnding = {
  declension: RusDeclensionNumeral,
  endings: RusNumeralEnding[]
};

export interface RusNumeralMorphSigns {
  c: RusCase;
  singular?: boolean;
  gender?: RusGender;
  animate?: boolean;
}

export interface RusNumeralInterface {
  readonly stem: string;
  readonly stem1: string;
  readonly stem2: string;
  readonly type: NumeralType;
  readonly structure: NumeralStructure;
  readonly gender?: RusGender; 
  readonly value: number;
  readonly declension?: RusDeclensionNumeral;
  readonly rank?: NumeralRank;
}

export type RusNumeralEnding = {
  ending: string,
  c: RusCase;
  singular?: boolean;
  gender?: RusGender;
  animate?: boolean;
};
