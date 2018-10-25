import { RusDeclensionAdjectiveZ, RusAdjectiveCategory, RusAdjectiveMorphSigns,
  RusGender, RusCase, RusCaseNames, RusGenderNames, RusAdjectiveCategoryNames,
  ShortCaseNames, ShortGenderNames, ShortAdjectiveCategoryNames } from './types';
import { AdjectiveLexeme, Adjective } from './morphology';
import { RusDeclensionAdjectiveZEndings } from './rusAdjectiveEndings';
import { rusAdjectives } from './rusAdjectivesData';
import { RusNounLexeme, RusNounLexemes } from './rusNoun';

export class RusAdjectiveLexeme extends AdjectiveLexeme {
  public readonly category: RusAdjectiveCategory;
  public readonly declensionZ: RusDeclensionAdjectiveZ;

  constructor (stem: string, stem1: string, stem2: string,
    category: RusAdjectiveCategory, declensionZ: RusDeclensionAdjectiveZ)
  {
    super(stem, stem1, stem2);
    this.category = category;
    this.declensionZ = declensionZ;
  }

  public hasShortForm(): boolean {
    if (this.category !== RusAdjectiveCategory.Qual
      || this.declensionZ === '4a'
      || this.declensionZ === '6a'
      || this.declensionZ.slice(-2) === 'ся')
    {
      return false;
    } else {
      return true;
    }
  }

  public getWordForm(morphSigns: RusAdjectiveMorphSigns): RusAdjective {
    const declZEnding = RusDeclensionAdjectiveZEndings.find( (e) => e.declensionZ === this.declensionZ );

    if (!declZEnding) { throw 'Unknown declensionZ ending'; }

    if (morphSigns.short) {
      if (!this.hasShortForm()) { throw 'No short form'; }

      let shortEnding = '';

      if (!morphSigns.singular) {
        if (this.declensionZ === '3a'
          || this.declensionZ === '3*a'
          || this.declensionZ === '3a/c'
          || this.declensionZ === '3a/c"^'
          || this.declensionZ === '3*a\''
          || this.declensionZ === '3*a/c'
          || this.declensionZ === '3*a/c\''
          || this.declensionZ === '4a'
          || this.declensionZ === '2a/c')
        {
          shortEnding = 'и';
        } else {
          shortEnding = 'ы';
        }
      } else {
        if (morphSigns.gender === RusGender.Femn) {
          if (this.declensionZ === '2a/c') {
            shortEnding = 'я';
          } else {
            shortEnding = 'а';
          }
        }
        else if (morphSigns.gender === RusGender.Neut) {
          if (this.declensionZ === '4a' || this.declensionZ === '5a' || this.declensionZ === '2a/c') {
            shortEnding = 'е';
          } else {
            shortEnding = 'о';
          }
        }
      }
      if (shortEnding) {
        return new RusAdjective(this.stem + shortEnding, this, morphSigns);
      } else {
        return new RusAdjective(this.stem1 ? this.stem1 : this.stem, this, morphSigns);
      }
    } else {
      const ending = declZEnding.endings.find( e => e.c === morphSigns.c
        && e.gender === morphSigns.gender
        && e.singular === morphSigns.singular
        && e.animate === morphSigns.animate );

      if (!ending) {
        throw 'Adjective ending not found ' + JSON.stringify(morphSigns);
      }

      if (this.stem1 && this.declensionZ === '2*b') {
        if (morphSigns.gender === RusGender.Masc
          && (morphSigns.c === RusCase.Nomn
            || (morphSigns.c === RusCase.Accs && !morphSigns.animate)))
        {
          return new RusAdjective(this.stem + ending.ending, this, morphSigns);
        } else {
          return new RusAdjective(this.stem1 + ending.ending, this, morphSigns);
        }
      } else {
        return new RusAdjective(this.stem + ending.ending, this, morphSigns);
      }
    }
  }

  public getWordForms(): RusAdjective[] {
    const wordForms: RusAdjective[] = [];

    for (let c = RusCase.Nomn; c <= RusCase.Loct; c++) {
      if (c === RusCase.Accs) {
        wordForms.push(this.getWordForm({ c, singular: true, gender: RusGender.Masc, animate: true }));
        wordForms.push(this.getWordForm({ c, singular: true, gender: RusGender.Masc, animate: false }));
        wordForms.push(this.getWordForm({ c, singular: true, gender: RusGender.Femn }));
        wordForms.push(this.getWordForm({ c, singular: true, gender: RusGender.Neut }));
        wordForms.push(this.getWordForm({ c, singular: false, animate: true }));
        wordForms.push(this.getWordForm({ c, singular: false, animate: false }));
      } else {
        wordForms.push(this.getWordForm({ c, singular: true, gender: RusGender.Masc }));
        wordForms.push(this.getWordForm({ c, singular: true, gender: RusGender.Femn }));
        wordForms.push(this.getWordForm({ c, singular: true, gender: RusGender.Neut }));
        wordForms.push(this.getWordForm({ c, singular: false }));
      }
    }

    if (this.hasShortForm()) {
      wordForms.push(this.getWordForm({ singular: true, gender: RusGender.Masc, short: true }));
      wordForms.push(this.getWordForm({ singular: true, gender: RusGender.Femn, short: true }));
      wordForms.push(this.getWordForm({ singular: true, gender: RusGender.Neut, short: true }));
      wordForms.push(this.getWordForm({ singular: false, short: true }));
    }

    return wordForms;
  }

  public getNounLexeme(): RusNounLexeme | undefined {
    if (this.category !== RusAdjectiveCategory.Rel) {
      throw new Error(`Only elative adjectives are made from nouns`);
    }

    return RusNounLexemes.find( l => l.stem === this.stem );
  }
}

export const RusAdjectiveLexemes: RusAdjectiveLexeme[] = rusAdjectives.map(
  (v) => new RusAdjectiveLexeme(v.stem, v.stem1, v.stem2, v.category, v.declensionZ)
);

export class RusAdjective extends Adjective<RusAdjectiveLexeme> {
  public readonly singular: boolean;
  public readonly gender: RusGender | undefined;
  public readonly grammCase: RusCase | undefined;
  public readonly animate: boolean | undefined;
  public readonly short: boolean | undefined;

  constructor (word: string, lexeme: RusAdjectiveLexeme, morphSigns: RusAdjectiveMorphSigns) {
    super(word, lexeme);
    this.singular = morphSigns.singular;
    this.gender = morphSigns.gender;
    this.grammCase = morphSigns.c;
    this.animate = morphSigns.animate;
    this.short = morphSigns.short;
  }

  getDisplayText (): string {
    const lexeme = this.lexeme;
    const stem = this.word.startsWith(lexeme.stem) ? lexeme.stem :
      (this.word.startsWith(lexeme.stem1) ? lexeme.stem1 :
      (this.word.startsWith(lexeme.stem2) ? lexeme.stem2 : ''));
    const divided = stem + (this.word === stem ? '' : '-' + this.word.slice(stem.length - this.word.length));
    const num = this.singular ? 'ед.ч.' : 'мн.ч.';
    const cs = typeof this.grammCase !== 'undefined' ? RusCaseNames[this.grammCase] : '';
    const anim = typeof this.animate === 'undefined' ? '' : (this.animate ? 'од; ' : 'неод; ');
    const gender = typeof this.gender === 'undefined' ? '' : RusGenderNames[this.gender] + ' род; ';
    const short = this.short ? 'кратк; ' : '';
    return this.word + '; ' + (divided !== this.word ? divided + '; ' : '') +
      RusAdjectiveCategoryNames[lexeme.category] + ' прил; ' + anim + short +
      gender +
      ' скл. ' + lexeme.declensionZ + '; ' +
      num + '; ' + cs;
  }

  static getSignature(
    short: boolean | undefined,
    category: RusAdjectiveCategory,
    gender: RusGender | undefined,
    singular: boolean,
    grammCase: RusCase | undefined): string
  {
    const sh = short ? 'ADJS' : 'ADJF';
    const ct = ShortAdjectiveCategoryNames[category];
    const gd = typeof gender === 'undefined' ? '' : ShortGenderNames[gender];
    const num = singular ? 'Sing' : 'Plur';
    const cs = typeof grammCase !== 'undefined' ? ShortCaseNames[grammCase] : '';
    return sh + ct + gd + num + cs;
  }

  getSignature (): string {
    const lexeme = this.lexeme;
    return RusAdjective.getSignature(this.short, lexeme.category, this.gender, this.singular, this.grammCase);
  }
}