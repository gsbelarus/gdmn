import {
  RusGender, RusDeclension, RusDeclensionZ, RusCase,
  RusCaseNames, RusGenderNames, RusNounMorphSigns, ShortCaseNames, ShortGenderNames
} from './types';
import { RusDeclensionZEndings } from './rusNounEndings';
import { NounLexeme, Noun, NounLabel } from './morphology';
import { rusNouns } from './rusNounsData';
import { ISemMeaning } from '../semantics/categories';

export class RusNounLexeme extends NounLexeme {
  public readonly animate: boolean;
  public readonly gender: RusGender;
  public readonly declension: RusDeclension;
  public readonly declensionZ: RusDeclensionZ;

  constructor (stem: string, stem1: string, stem2: string,
    semMeanings: ISemMeaning[] | undefined, label: NounLabel | undefined,
    animacy: boolean, gender: RusGender,
    declension: RusDeclension, declensionZ: RusDeclensionZ)
  {
    super(stem, stem1, stem2, semMeanings, label);
    this.animate = animacy;
    this.gender = gender;
    this.declension = declension;
    this.declensionZ = declensionZ;
  }

  public getWordForm(morphSigns: RusNounMorphSigns): RusNoun {
    const { c, singular } = morphSigns;
    const ending = RusDeclensionZEndings.find( (e) => e.declensionZ === this.declensionZ &&
      e.gender === this.gender && e.animate === this.animate );

    if (singular && ending && ending.singular.length > 0) {
      if (this.gender === RusGender.Masc) {
        if (this.stem1 && !this.stem.endsWith('ин')) {
          if (c === RusCase.Nomn || (c === RusCase.Accs && !this.animate)) {
            return (new RusNoun(this.stem + ending.singular[c], this, c, true));
          } else {
            return (new RusNoun(this.stem1 + ending.singular[c], this, c, true));
          }
        } else {
          return (new RusNoun(this.stem + ending.singular[c], this, c, true));
        }
      }
      else if (this.gender === RusGender.Femn) {
        if (
          (
            (this.declensionZ === '8*b\'')
            &&
            (c === RusCase.Nomn || c === RusCase.Accs || c === RusCase.Ablt)
          ) ||
          this.declensionZ === '8*b\'ш' ||
          this.declensionZ === '5*a' ||
          this.declensionZ === '3*f\'' ||
          this.declensionZ === '3*f' ||
          this.declensionZ === '3*d' ||
          this.declensionZ === '3*b' ||
          this.declensionZ === '3*a' ||
          this.declensionZ === '2*a-ня' ||
          this.declensionZ === '2*a' ||
          this.declensionZ === '2*b' ||
          this.declensionZ === '2*d' ||
          this.declensionZ === '1*a' ||
          this.declensionZ === '1*b' ||
          this.declensionZ === '1*d' ||
          this.declensionZ === '1*f')
        {
          return (new RusNoun(this.stem + ending.singular[c], this, c, true));
        }
        else if (this.stem1) {
          return (new RusNoun(this.stem1 + ending.singular[c], this, c, true));
        } else {
          return (new RusNoun(this.stem + ending.singular[c], this, c, true));
        }
      } else {
        return (new RusNoun(this.stem + ending.singular[c], this, c, true));
      }
    }
    else if (!singular && ending && ending.plural.length) {
      if (this.gender === RusGender.Masc) {
        if (
          c === RusCase.Gent
          &&
          !this.animate
          &&
          (this.stem.endsWith('ок') || this.stem.endsWith('ек'))
          && !ending.plural[c])
        {
          return (new RusNoun(this.stem, this, c, false));
        }
        else if (this.stem2) {
          return (new RusNoun(this.stem2 + ending.plural[c], this, c, false));
        }
        else if (this.stem1) {
          return (new RusNoun(this.stem1 + ending.plural[c], this, c, false));
        } else {
          return (new RusNoun(this.stem + ending.plural[c], this, c, false));
        }
      }
      else if (this.gender === RusGender.Femn) {
        if (this.stem1) {
          if (
            ((
              this.declensionZ === '5*a' ||
              this.declensionZ === '3*f\'' ||
              this.declensionZ === '3*f' ||
              this.declensionZ === '3*d' ||
              this.declensionZ === '2*b' ||
              this.declensionZ === '2*d' ||
              this.declensionZ === '1*d' ||
              this.declensionZ === '1*f'
            ) && c !== RusCase.Gent)
            ||
            ((
              this.declensionZ === '1*a' ||
              this.declensionZ === '1*b' ||
              this.declensionZ === '2*a' ||
              this.declensionZ === '2*a-ня' ||
              this.declensionZ === '3*b' ||
              this.declensionZ === '3*a'
            ) && c !== RusCase.Gent && (c !== RusCase.Accs || !this.animate))
          )
          {
            return (new RusNoun(this.stem + ending.plural[c], this, c, false));
          } else {
            return (new RusNoun(this.stem1 + ending.plural[c], this, c, false));
          }
        } else {
          return (new RusNoun(this.stem + ending.plural[c], this, c, false));
        }
      }
      else {
        if ((c === RusCase.Gent || this.declensionZ === '3e^') && this.stem1) {
          return (new RusNoun(this.stem1 + ending.plural[c], this, c, false));
        } else {
          return (new RusNoun(this.stem + ending.plural[c], this, c, false));
        }
      }
    } else {
      throw new Error(`No data for noun endings found. Stem: ${this.stem}`);
    }
  }

  public hasPlural(): boolean {
    const ending = RusDeclensionZEndings.find( (e) => e.declensionZ === this.declensionZ &&
      e.gender === this.gender && e.animate === this.animate );
    return typeof ending !== 'undefined' && ending.plural.length > 0;
  }

  public getWordForms(): RusNoun[] {
    const wordForms: RusNoun[] = [];

    for (let c = RusCase.Nomn; c <= RusCase.Loct; c++) {
      wordForms.push(this.getWordForm({ c, singular: true }));
    }

    if (this.hasPlural()) {
      for (let c = RusCase.Nomn; c <= RusCase.Loct; c++) {
        wordForms.push(this.getWordForm({ c, singular: false }));
      }
    }

    return wordForms;
  }
}

export const RusNounLexemes: RusNounLexeme[] = rusNouns.map(
  n => new RusNounLexeme(n.stem, n.stem1, n.stem2, n.semMeanings, n.label, n.animate, n.gender, n.declension, n.declensionZ)
);

export class RusNoun extends Noun<RusNounLexeme> {
  public readonly grammCase: RusCase;
  public readonly singular: boolean;

  constructor (word: string, lexeme: RusNounLexeme, grammCase: RusCase, singular: boolean) {
    super(word, lexeme);
    this.grammCase = grammCase;
    this.singular = singular;
  }

  getDisplayText (): string {
    const lexeme = this.lexeme;
    const stem = this.word.startsWith(lexeme.stem) ? lexeme.stem :
      (this.word.startsWith(lexeme.stem1) ? lexeme.stem1 :
      (this.word.startsWith(lexeme.stem2) ? lexeme.stem2 : ''));
    const divided = stem + (this.word === stem ? '' : '-' + this.word.slice(stem.length - this.word.length));
    const decl = lexeme.declension === 1 ? '1-е скл.' :
      (lexeme.declension === 2 ? '2-е скл.' : '3-е скл.');
    const num = this.singular ? 'ед.ч.' : 'мн.ч.';
    const cs = RusCaseNames[this.grammCase];
    return this.word + '; ' + (divided !== this.word ? divided + '; ' : '') +
      'сущ; ' + (lexeme.animate ? 'од; ' : 'неод; ') +
      RusGenderNames[lexeme.gender] + ' род; ' +
      decl + ' (' + lexeme.declensionZ + '); ' +
      num + '; ' + cs;
  }

  static getSignature(animate: boolean, gender: RusGender, singular: boolean, grammCase: RusCase): string {
    const an = animate ? 'Anim' : 'Inan';
    const gd = ShortGenderNames[gender];
    const num = singular ? 'Sing' : 'Plur';
    const cs = ShortCaseNames[grammCase];
    return 'NOUN' + an + gd + num + cs;
  }

  getSignature (): string {
    const lexeme = this.lexeme;
    return RusNoun.getSignature(lexeme.animate, lexeme.gender, this.singular, this.grammCase);
  }
}