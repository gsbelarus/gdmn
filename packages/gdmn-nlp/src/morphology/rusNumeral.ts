import { NumeralRank, NumeralStructure, NumeralType, RusDeclensionNumeral, RusCase, RusGender, RusNumeralMorphSigns, ShortGenderNames, ShortCaseNames, RusGenderNames, RusCaseNames, RusNumeralTypeNames, RusNumeralStructureNames, RusNumeralRankNames } from "./types";
import { Numeral, NumeralLexeme, AnyWords } from "./morphology";
import { rusNumerals } from "./rusNumeralsData";
import { RusNumeralEndings } from "./rusNumeralEndings";
import { number } from 'prop-types';

export class RusNumeralLexeme extends NumeralLexeme {
  public readonly type: NumeralType;
  public readonly structure: NumeralStructure;
  public readonly declension?: RusDeclensionNumeral;
  public readonly gender?: RusGender;
  public readonly rank?: NumeralRank;

  constructor(value: number,
    stem: string,
    stem1: string,
    stem2: string,
    type: NumeralType,
    structure: NumeralStructure,
    declension?: RusDeclensionNumeral,
    gender?: RusGender,
    rank?: NumeralRank,
  ) {
      super(value, stem, stem1, stem2);
      this.type = type;
      this.structure = structure;
      this.declension = declension;
      this.gender = gender;
      this.rank = rank;
  }

  public getWordForm(morphSigns: RusNumeralMorphSigns): RusNumeral {
    const declEnding = RusNumeralEndings.find( (e) => e.declension === this.declension );

    if (!declEnding) { throw 'Unknown declension ending'; }

    let ending = declEnding.endings.find( e => e.c === morphSigns.c
      && e.gender === morphSigns.gender
      && e.singular === morphSigns.singular
      && e.animate === morphSigns.animate );

    if (!ending) {
      throw new Error(`Numeral ending not found for numeral ${this.value} ${JSON.stringify(morphSigns)}`);
    }

    if (this.stem1 && this.declension === 'pqs1') {
      if(this.gender === RusGender.Masc && (morphSigns.c === RusCase.Nomn || (morphSigns.c === RusCase.Accs && !morphSigns.animate))) {
        return new RusNumeral(this.stem + ending.ending, this, morphSigns);
      } else {
        return new RusNumeral(this.stem1 + ending.ending, this, morphSigns);
      }
    } else if (this.stem1 && this.declension === 'pqs8') {
      if(morphSigns.c === RusCase.Nomn || morphSigns.c === RusCase.Accs) {
        return new RusNumeral(this.stem + ending.ending, this, morphSigns);
      } else {
        return new RusNumeral(this.stem1 + ending.ending, this, morphSigns);
      }
    } else if (this.declension === 'pqc50,60,70,80') {
      if(morphSigns.c === RusCase.Nomn || morphSigns.c === RusCase.Accs) {
        return new RusNumeral(this.stem + ending.ending, this, morphSigns);
      } else if(morphSigns.c === RusCase.Ablt) {
        return new RusNumeral(this.stem2 + ending.ending, this, morphSigns);
      } else{
        return new RusNumeral(this.stem1 + ending.ending, this, morphSigns);
      }
    }

    return new RusNumeral(this.stem + ending.ending, this, morphSigns);
  }

  public getWordForms(): RusNumeral[] {
    const wordForms: RusNumeral[] = [];

    for (let c = RusCase.Nomn; c <= RusCase.Loct; c++) {
      c !== RusCase.Accs
        ? wordForms.push(this.getWordForm({ c, gender: this.gender }))
        : [true, false].forEach( animate => {
          wordForms.push(this.getWordForm({ c, gender: this.gender, animate: animate }))
        })
    }

    return wordForms;
  }
}

export class RusNumeralLexemeSot extends RusNumeralLexeme {
  constructor(value: number) {
    super(value, '', '', '', NumeralType.Cardinal, NumeralStructure.Complex, undefined, undefined, NumeralRank.ProperQuantitative);
  }

  public getWordForm(morphSigns: RusNumeralMorphSigns): RusNumeral {

    const wordForms: { [v: number]: string[] } =
      {
        200: ['двести', 'двухсот', 'двумстам', 'двести', 'двумястами', 'двухстах'],
        300: ['триста', 'трёхсот', 'трёмстам', 'триста', 'тремястами', 'трёхстах'],
        400: ['четыреста', 'четырёхсот', 'четырёмстам', 'четыреста', 'четырьмястами', 'четырёхстах'],
        500: ['пятьсот', 'пятисот', 'пятистам', 'пятьсот', 'пятьюстами', 'пятистах'],
        600: ['шестьсот', 'шестисот', 'шестистам', 'шестьсот', 'шестьюстами', 'шестистах'],
        700: ['семьсот', 'семисот', 'семистам', 'семьсот', 'семьюстами', 'семистах'],
        800: ['восемьсот', 'восьмисот', 'восьмистам', 'восемьсот', 'восьмюстами', 'восьмистах'],
        900: ['девятьсот', 'девятисот', 'девятистам', 'девятьсот', 'девятьюстами', 'девятистах']
      };

    const wf = wordForms[this.value];

    if (!wf) {
      throw new Error(`Wrong value ${this.value}`);
    }

    return new RusNumeral(wf[morphSigns.c], this, morphSigns);
  }

  public getWordForms(): RusNumeral[] {
    const wordForms: RusNumeral[] = [];

    for (let c = RusCase.Nomn; c <= RusCase.Loct; c++) {
      wordForms.push(this.getWordForm({ c }));
    }

    return wordForms;
  }
}

export const RusNumeralLexemes: RusNumeralLexeme[] = rusNumerals.map(
  v => new RusNumeralLexeme(v.value, v.stem, v.stem1, v.stem2, v.type, v.structure, v.declension, v.gender, v.rank)
).concat( [200, 300, 400, 500, 600, 700, 800, 900].map( n => new RusNumeralLexemeSot(n) ) );

export class RusNumeral extends Numeral<RusNumeralLexeme> {
  public readonly grammCase: RusCase;
  public readonly singular?: boolean;
  public readonly gender?: RusGender;
  public readonly animate?: boolean;

  constructor (word: string, lexeme: RusNumeralLexeme, morphSigns: RusNumeralMorphSigns) {
    super(word, lexeme);
    this.grammCase = morphSigns.c;
    this.singular = morphSigns.singular;
    this.gender= this.gender;
    this.animate= morphSigns.animate;
    }

    getDisplayText(): string {
      const lexeme = this.lexeme;
      const cs = typeof this.grammCase !== 'undefined' ? RusCaseNames[this.grammCase] : '';
      const an = typeof this.animate === 'undefined' ? '' : (this.animate ? 'одуш.' : 'неодуш.');
      const gd = typeof lexeme.gender === 'undefined' ? '' : RusGenderNames[lexeme.gender] + ' род';
      const rank = typeof lexeme.rank === 'undefined' ? '' : RusNumeralRankNames[lexeme.rank];
      return this.word + '; числительное; ' +
        lexeme.value + '; ' +
        RusNumeralTypeNames[lexeme.type] + '; ' +
        RusNumeralStructureNames[lexeme.structure] + '; ' +
        rank + '; ' +
        cs + '; ' +
        an + '; ' +
        gd;
    }

  static getSignature(grammCase: RusCase, singular?: boolean, animate?: boolean, gender?: RusGender): string {
    const cs = typeof grammCase !== 'undefined' ? ShortCaseNames[grammCase] : '';
    const an = typeof animate === 'undefined' ? '' : (animate ? 'Anim' : 'Inan');
    const gd = typeof gender === 'undefined' ? '' : ShortGenderNames[gender];
  return 'NUMR' + an + gd + cs;
}

  getSignature(): string {
    return RusNumeral.getSignature(this.grammCase, this.singular, this.animate, this.gender );
  }
}
