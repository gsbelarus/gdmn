import { RusAspect, Transitivity, RusConjugationZ, RusTense, RusGender,
  RusPersons, RusMood, Involvement, RusVerbMorphSigns, RusConjugationZEnding,
  ShortGenderNames, ShortTenseNames, ShortMoodNames } from './types';
import { VerbLexeme, Verb } from './morphology';
import { rusVerbs } from './rusVerbsData';
import { RusConjugationZEndings } from './rusVerbEndings';
import { isRusConsonant } from './utility';

export class RusVerbLexeme extends VerbLexeme {
  public readonly aspect: RusAspect;
  public readonly transitivity: Transitivity;
  public readonly conjZ: RusConjugationZ;
  // мы можем и не найти спряжение, если слова-образца нет в открытом корпусе
  public readonly conjZEnding: RusConjugationZEnding | undefined;

  constructor (stem: string, stem1: string, stem2: string,
    aspect: RusAspect, transitivity: Transitivity, conjZ: RusConjugationZ)
  {
    super(stem, stem1, stem2);
    this.aspect = aspect;
    this.transitivity = transitivity;
    this.conjZ = conjZ;
    this.conjZEnding = RusConjugationZEndings.find(
      (c) => c.conjZ === this.conjZ && c.aspect === this.aspect && c.transitivity === this.transitivity
    );
  }

  public hasImprMood(): boolean {
    if (!this.conjZEnding) {
      throw 'Conjugation \'' + this.conjZ + '\' not found';
    }

    return (typeof this.conjZEnding.endings.find( e => e.mood === RusMood.Impr ) !== 'undefined');
  }

  public getWordForm(morphSigns: RusVerbMorphSigns): RusVerb {
    if (morphSigns.infn) {
      if (!this.conjZEnding) {
        throw 'Conjugation \'' + this.conjZ + '\' not found';
      }

      let wrd: string;

      if (this.conjZ.indexOf('-ся') !== -1) {
        wrd = this.stem + this.conjZEnding.suffix + 'ся';
      } else {
        wrd = this.stem + this.conjZEnding.suffix;
      }

      return new RusVerb(wrd, this, { infn: true });
    }

    if (this.conjZEnding) {

      const ending = this.conjZEnding.endings.find(
        e => e.tense === morphSigns.tense
          && e.person === morphSigns.person
          && e.gender === morphSigns.gender
          && e.singular === morphSigns.singular
          && e.mood === morphSigns.mood
          && e.involvement === morphSigns.involvement );

      if (ending) {
        if (this.conjZ === '^b/b(9)' || this.conjZ === '^b/b(9)СВ') { // идти
          if (morphSigns.tense === RusTense.Past) {
            return new RusVerb(this.stem1 + ending.ending, this, morphSigns);
          }
          return new RusVerb(this.stem + ending.ending, this, morphSigns);
        }

        if (this.stem2) {
          if (morphSigns.mood === RusMood.Indc
            &&
            morphSigns.tense === RusTense.Futr
            &&
            this.conjZ === '14cСВ' // снять
          ) {
            if (ending.ending && ending.ending !== 'undefined') {
              return new RusVerb(this.stem2 + ending.ending, this, morphSigns);
            }
          }

          if (morphSigns.tense === RusTense.Past && this.conjZ === '14c(1)СВ') { // принять
            if (ending.ending && ending.ending !== 'undefined') {
              return new RusVerb(this.stem2 + ending.ending, this, morphSigns);
            }
          }

          if (morphSigns.mood === RusMood.Impr && this.conjZ !== '4c-тСВ' && this.conjZ !== '14c(1)СВ') {
            if (ending.ending && ending.ending !== 'undefined') {
              return new RusVerb(this.stem2 + ending.ending, this, morphSigns);
            }

            if (morphSigns.singular) {
              return new RusVerb(this.stem2, this, morphSigns);
            } else {
              return new RusVerb(this.stem2 + 'те', this, morphSigns);
            }
          }
        }

        if (this.stem1
          && ending.ending
          &&
          (
            this.conjZ === '14b/cСВ'  // донять
            ||
            !(isRusConsonant(ending.ending, 'first') && isRusConsonant(this.stem1, 'last'))  // они тянут
          )
          &&
          (
            (
              this.conjZ !== '4a-т'        // тратить
              &&
              this.conjZ !== '4a-тСВ'      // выразить
              &&
              this.conjZ !== '4a-тX'       // шкодить
              &&
              this.conjZ !== '4a((3))-тСВ' // выкрасить
              &&
              this.conjZ !== '4b-т'        // щадить
              &&
              this.conjZ !== '4c-т-ся'     // катиться
              &&
              this.conjZ !== '4c-тСВ'      // засветить
              &&
              this.conjZ !== '5a-д-ся'     // видеться
              &&
              this.conjZ !== '5a-т'        // видеть
              &&
              this.conjZ !== '5b-т'        // пыхтеть
              &&
              this.conjZ !== '5b-т-ся'     // глядеться
              &&
              this.conjZ !== '5b-т-сяСВ'   // вглядеться
              &&
              this.conjZ !== '5b-тСВ'      // просвистеть
              &&
              this.conjZ !== '5b/c'        // спать
              &&
              this.conjZ !== '5c-т'        // вертеть
              &&
              this.conjZ !== '6a^'         // сыпать
              &&
              (
                this.conjZ !== '5b-ж'      // бежать
                ||
                (
                  this.conjZ === '5b-ж'
                  &&
                  (
                    morphSigns.mood === RusMood.Impr
                    ||
                    (morphSigns.person === 3 && !morphSigns.singular)
                  )
                )
              )
              &&
              (
                this.conjZ !== '12a'  // рыть
                ||
                (
                  this.conjZ === '12a'
                  &&
                  morphSigns.tense !== RusTense.Past
                )
              )
              &&
              (
                this.conjZ !== '11*b/c"-сяСВ'
                ||
                (
                  this.conjZ === '11*b/c"-сяСВ'  // спиться
                  &&
                  morphSigns.mood !== RusMood.Impr
                )
              )
            )
            ||
            (
              morphSigns.person === 1
              &&
              morphSigns.singular
            )
          )
          &&
          (
            morphSigns.tense === RusTense.Pres
            ||
            morphSigns.tense === RusTense.Futr
            ||
            morphSigns.tense === undefined
          )
        ) {
          return new RusVerb(this.stem1 + ending.ending, this, morphSigns);
        }

        return new RusVerb(this.stem + ending.ending, this, morphSigns);
      }
    }

    throw 'Conjugation \'' + this.conjZ + '\' ending not found';
  }

  public getWordForms(): RusVerb[] {
    const wordForms: RusVerb[] = [];

    wordForms.push(this.getWordForm({ infn: true }));
    wordForms.push(this.getWordForm({ tense: RusTense.Past, singular: true, gender: RusGender.Masc, mood: RusMood.Indc }));
    wordForms.push(this.getWordForm({ tense: RusTense.Past, singular: true, gender: RusGender.Femn, mood: RusMood.Indc }));
    if (this.hasImprMood()) { wordForms.push(this.getWordForm({ singular: true, mood: RusMood.Impr, involvement: Involvement.Excl })); }
    wordForms.push(this.getWordForm({ tense: RusTense.Past, singular: true, gender: RusGender.Neut, mood: RusMood.Indc }));
    wordForms.push(this.getWordForm({ tense: RusTense.Past, singular: false, mood: RusMood.Indc }));
    if (this.hasImprMood()) { wordForms.push(this.getWordForm({ singular: false, mood: RusMood.Impr, involvement: Involvement.Excl })); }

    if (this.aspect === RusAspect.Perf) {
      wordForms.push(this.getWordForm({ tense: RusTense.Futr, singular: true, person: 1, mood: RusMood.Indc }));
      wordForms.push(this.getWordForm({ tense: RusTense.Futr, singular: true, person: 2, mood: RusMood.Indc }));
      wordForms.push(this.getWordForm({ tense: RusTense.Futr, singular: true, person: 3, mood: RusMood.Indc }));
      wordForms.push(this.getWordForm({ tense: RusTense.Futr, singular: false, person: 1, mood: RusMood.Indc }));
      wordForms.push(this.getWordForm({ tense: RusTense.Futr, singular: false, person: 2, mood: RusMood.Indc }));
      wordForms.push(this.getWordForm({ tense: RusTense.Futr, singular: false, person: 3, mood: RusMood.Indc }));
    } else {
      wordForms.push(this.getWordForm({ tense: RusTense.Pres, singular: true, person: 1, mood: RusMood.Indc }));
      wordForms.push(this.getWordForm({ tense: RusTense.Pres, singular: true, person: 2, mood: RusMood.Indc }));
      wordForms.push(this.getWordForm({ tense: RusTense.Pres, singular: true, person: 3, mood: RusMood.Indc }));
      wordForms.push(this.getWordForm({ tense: RusTense.Pres, singular: false, person: 1, mood: RusMood.Indc }));
      wordForms.push(this.getWordForm({ tense: RusTense.Pres, singular: false, person: 2, mood: RusMood.Indc }));
      wordForms.push(this.getWordForm({ tense: RusTense.Pres, singular: false, person: 3, mood: RusMood.Indc }));
    }

    return wordForms;
  }
}

export const RusVerbLexemes: RusVerbLexeme[] = rusVerbs.map(
  (v) => new RusVerbLexeme(v.stem, v.stem1, v.stem2, v.aspect, v.transitivity, v.conjZ)
);

export class RusVerb extends Verb<RusVerbLexeme> {
  public readonly infn: boolean;
  public readonly tense: RusTense | undefined;
  public readonly singular: boolean | undefined;
  public readonly gender: RusGender | undefined;
  public readonly person: RusPersons | undefined;
  public readonly mood: RusMood | undefined;
  public readonly involvement: Involvement | undefined;

  constructor (word: string, lexeme: RusVerbLexeme, morphSigns: RusVerbMorphSigns) {
    super(word, lexeme);
    this.infn = morphSigns.infn ? true : false;
    this.tense = morphSigns.tense;
    this.singular = morphSigns.singular;
    this.gender = morphSigns.gender;
    this.person = morphSigns.person;
    this.mood = morphSigns.mood;
    this.involvement = morphSigns.involvement;
  }

  getDisplayText (): string {
    const lexeme = this.lexeme;
    const stem = this.word.startsWith(lexeme.stem) ? lexeme.stem :
      (this.word.startsWith(lexeme.stem1) ? lexeme.stem1 :
      (this.word.startsWith(lexeme.stem2) ? lexeme.stem2 : ''));
    const divided = stem + (this.word === stem ? '' : '-' + this.word.slice(stem.length - this.word.length));
    const tran = lexeme.transitivity === Transitivity.Tran ? 'перех' : 'неперех';
    const aspect = lexeme.aspect === RusAspect.Perf ? 'сов' : 'несов';
    const basic = (divided !== this.word ? divided + '; ' : '') + 'гл; ' + tran + '; ' +
      aspect + '; спр: ' + lexeme.conjZ + '; ';

    if (this.infn) {
      return basic + 'инфн';
    } else {
      const num = this.singular ? 'ед.ч.; ' : 'мн.ч.; ';

      let tense = '';
      switch (this.tense) {
        case RusTense.Past:
          tense = 'прош. вр.; ';
          break;
        case RusTense.Pres:
          tense = 'наст. вр.; ';
          break;
        case RusTense.Futr:
          tense = 'будущ. вр.; ';
          break;
        default:
      }

      let gender = '';
      switch (this.gender) {
        case RusGender.Masc:
          gender = 'м.р.; ';
          break;
        case RusGender.Femn:
          gender = 'ж.р.; ';
          break;
        case RusGender.Neut:
          gender = 'н.р.; ';
          break;
        default:
      }

      let person = '';
      switch (this.person) {
        case 1:
          person = '1-е л.; ';
          break;
        case 2:
          person = '2-е л.; ';
          break;
        case 3:
          person = '3-е л.; ';
          break;
        default:
      }

      let mood = '';
      switch (this.mood) {
        case RusMood.Impr:
          mood = 'повелит.';
          break;
        default:
      }

      return basic + tense + num + gender + person + mood;
    }
  }

  getSignature (): string {
    const lexeme = this.lexeme;
    const tran = lexeme.transitivity === Transitivity.Tran ? 'Tran' : 'Intr';
    const aspect = lexeme.aspect === RusAspect.Perf ? 'Perf' : 'Impf';

    if (this.infn) {
      return 'INFN' + tran + aspect;
    } else {
      const num = this.singular ? 'Sing' : 'Plur';
      const tense = typeof this.tense === 'undefined' ? '' : ShortTenseNames[this.tense];
      const gender = typeof this.gender === 'undefined' ? '' : ShortGenderNames[this.gender];
      const person = typeof this.person === 'undefined' ? '' : this.person + 'per';
      const mood = typeof this.mood === 'undefined' ? '' : ShortMoodNames[this.mood];
      return 'VERB' + tran + aspect + tense + num + gender + person + mood;
    }
  }
}