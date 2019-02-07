import { NumeralRank, NumeralStructure, NumeralType, RusDeclensionNumeral, RusCase, RusGender, RusNumeralMorphSigns, ShortGenderNames, ShortCaseNames, RusGenderNames, RusCaseNames, RusNumeralTypeNames, RusNumeralStructureNames, RusNumeralRankNames } from "./types";
import { Numeral, NumeralLexeme } from "./morphology";
import { rusNumerals } from "./rusNumeralsData";
import { RusNumeralEndings } from "./rusNumeralEndings";

export class RusNumeralLexeme extends NumeralLexeme {
  public readonly type: NumeralType;
  public readonly structure: NumeralStructure;
  public readonly value: number;
  public readonly declension: RusDeclensionNumeral;
  public readonly gender?: RusGender;
  public readonly rank?: NumeralRank;

  constructor(stem: string, stem1: string, stem2: string,
    type: NumeralType,
    structure: NumeralStructure,
    value: number,
    declension: RusDeclensionNumeral,
    gender?: RusGender,
    rank?: NumeralRank
    ) {
      super(stem, stem1, stem2);
      this.type = type;
      this.structure = structure;
      this.value = value;
      this.declension = declension;
      this.gender = gender;
      this.rank = rank;
  }

  public getWordForm(morphSigns: RusNumeralMorphSigns): RusNumeral {
    const declEnding = RusNumeralEndings.find( (e) => e.declension === this.declension );
    
    if (!declEnding) { throw 'Unknown declensionZ ending'; }

    let ending = declEnding.endings.find( e => e.c === morphSigns.c
      && e.gender === morphSigns.gender
      && e.singular === morphSigns.singular
      && e.animate === morphSigns.animate );
    
    if (!ending) {
      throw new Error(`Numeral ending not found for numeral ${this.value} ${JSON.stringify(morphSigns)}`);
    }

    if (morphSigns.singular && this.stem1 && this.declension === 'pqs1') {
      if(this.gender === RusGender.Masc && (morphSigns.c === RusCase.Nomn || (morphSigns.c === RusCase.Accs && !morphSigns.animate))) {
        return new RusNumeral(this.stem + ending.ending, this, morphSigns);
      } else {
        return new RusNumeral(this.stem1 + ending.ending, this, morphSigns);
      }
    } else if (morphSigns.singular && this.stem1 && this.declension === 'pqs8') {
      if(morphSigns.c === RusCase.Nomn || morphSigns.c === RusCase.Accs) {
        return new RusNumeral(this.stem + ending.ending, this, morphSigns);
      } else {
        return new RusNumeral(this.stem1 + ending.ending, this, morphSigns);
      }
    } else if (morphSigns.singular && this.declension === 'pqc50,60,70,80') {
      if(morphSigns.c === RusCase.Nomn || morphSigns.c === RusCase.Accs) {
        return new RusNumeral(this.stem + ending.ending, this, morphSigns);
      } else if(morphSigns.c === RusCase.Ablt) {
        return new RusNumeral(this.stem2 + ending.ending, this, morphSigns);
      } else{
        return new RusNumeral(this.stem1 + ending.ending, this, morphSigns);
      }
    } else {
      return new RusNumeral(this.stem + ending.ending, this, morphSigns);
    }
  }

  public getWordForms(): RusNumeral[] {
    const wordForms: RusNumeral[] = [];

    for (let c = RusCase.Nomn; c <= RusCase.Loct; c++) {
      c !== RusCase.Accs
        ? wordForms.push(this.getWordForm({ c, gender: this.gender, singular: true }))
        : [true, false].forEach( animate => {
          wordForms.push(this.getWordForm({ c, gender: this.gender, singular: true, animate: animate }))
        })
    }

    return wordForms;
  }
}

export const RusNumeralLexemes: RusNumeralLexeme[] = rusNumerals.map(
  v => new RusNumeralLexeme(v.stem, v.stem1, v.stem2, v.type, v.structure, v.value, v.declension, v.gender, v.rank)
);

export class RusNumeral extends Numeral<RusNumeralLexeme> {
  public readonly singular: boolean;
  public readonly grammCase: RusCase;
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
      const num = this.singular ? 'ед. ч.' : 'мн. ч.';
      const rank = typeof lexeme.rank === 'undefined' ? '' : RusNumeralRankNames[lexeme.rank];
      return this.word + '; числительное; ' +
        lexeme.value + '; ' +
        RusNumeralTypeNames[lexeme.type] + '; ' +
        RusNumeralStructureNames[lexeme.structure] + '; ' +
        rank + '; ' +
        cs + '; ' +
        an + '; ' +
        gd + '; ' +
        num;
    }

  static getSignature(singular: boolean, grammCase: RusCase, animate?: boolean, gender?: RusGender): string {
    const cs = typeof grammCase !== 'undefined' ? ShortCaseNames[grammCase] : '';
    const an = typeof animate === 'undefined' ? '' : (animate ? 'Anim' : 'Inan');
    const gd = typeof gender === 'undefined' ? '' : ShortGenderNames[gender];
    const num = singular ? 'Sing' : 'Plur';
  return 'NUMR' + an + gd + num + cs;
}

  getSignature(): string {
    return RusNumeral.getSignature(this.singular, this.grammCase, this.animate, this.gender );
  }
}