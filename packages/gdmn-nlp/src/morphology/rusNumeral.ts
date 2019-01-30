import { NumeralLexeme, Numeral } from "./morphology";
import { RusCase, NumeralValue, NumeralCatagory, RusGender, ShortGenderNames, NumeralStructure, RusCaseNames, RusGenderNames, RusNumeralValueNames, RusNumeralStructureNames, RusNumeralCatagoryNames, RusDeclensionNumeralZ, RusNumeralMorphSigns, ShortCaseNames } from "./types";
import { rusNumerals } from "./rusNumeralData";
import { RusNumeralZEndings } from "./rusNumeralEndings";

export class RusNumeralLexeme extends NumeralLexeme {
  public readonly stem3: string;
  public readonly possiblePlural: boolean;
  public digitalWrite: string;
  public readonly numeralValue: NumeralValue;
  public readonly structure: NumeralStructure;
  public readonly declensionZ: RusDeclensionNumeralZ;
  public readonly declensionZ1?: RusDeclensionNumeralZ;
  public readonly catagory?: NumeralCatagory;

  constructor (stem: string, stem1: string, stem2: string, stem3: string,
      possiblePlural: boolean,
      digitalWrite: string,
      numeralValue: NumeralValue,
      structure: NumeralStructure,
      declensionZ: RusDeclensionNumeralZ, 
      declensionZ1?: RusDeclensionNumeralZ, 
      catagory?: NumeralCatagory) {
    super(stem, stem1, stem2);
    this.stem3 = stem3;
    this.possiblePlural = possiblePlural;
    this.digitalWrite = digitalWrite;
    this.numeralValue = numeralValue;
    this.structure = structure;
    this.declensionZ = declensionZ;
    this.declensionZ1 = declensionZ1;
    this.catagory = catagory;
  }

  public getWordForm(morphSigns: RusNumeralMorphSigns): RusNumeral {
    const declZEnding = RusNumeralZEndings.find( (e) => e.declensionZ === this.declensionZ );
    
    if (!declZEnding) { throw 'Unknown declensionZ ending'; }

    const ending = declZEnding.endings.find( e => e.c === morphSigns.c
      && e.gender === morphSigns.gender
      && e.singular === morphSigns.singular
      && e.animate === morphSigns.animate );

    if (!ending) {
      throw 'Numeral ending not found ' + JSON.stringify(morphSigns);
    }

    if (this.structure === NumeralStructure.Complex) {

      const declZEnding1 = RusNumeralZEndings.find( (e) => e.declensionZ === this.declensionZ1 );
    
      if (!declZEnding1) { throw 'Unknown declensionZ ending'; }
      
      const ending1 = declZEnding1.endings.find( e => e.c === morphSigns.c
        && e.gender === morphSigns.gender
        && e.singular === morphSigns.singular
        && e.animate === morphSigns.animate );
      
      if (!ending1) {
        throw 'Numeral ending not found ' + JSON.stringify(morphSigns);
      }

      if (this.numeralValue === NumeralValue.Orinal) {
        const endingOrinalNumeral = declZEnding.endings.find( e => e.c === RusCase.Gent
          && e.gender === RusGender.Femn
          && e.singular === true);
        if (!endingOrinalNumeral) {
          throw 'Numeral ending not found ';
        }
        if(this.declensionZ === 'pqs5' && this.stem1) {
          if (this.stem3) {
            return new RusNumeral(this.stem1 + endingOrinalNumeral.ending + this.stem3 + ending1.ending, this, morphSigns);
          } else {
            return new RusNumeral(this.stem1 + endingOrinalNumeral.ending + this.stem2 + ending1.ending, this, morphSigns);
          }
        } else {
          return new RusNumeral(this.stem + endingOrinalNumeral.ending + this.stem3 + ending1.ending, this, morphSigns);
        }
      }

      if (morphSigns.singular && (this.declensionZ === 'pqs4' || this.declensionZ === 'pqs5') && this.declensionZ1 === 'pqc1') {
        if(morphSigns.c === RusCase.Datv || morphSigns.c === RusCase.Ablt || morphSigns.c === RusCase.Loct) {
          if(this.declensionZ === 'pqs5') {
            return new RusNumeral(this.stem1 + ending.ending + this.stem2 + ending1.ending, this, morphSigns);
          } else {
            return new RusNumeral(this.stem + ending.ending + this.stem2 + ending1.ending, this, morphSigns);
          }
        } else {
          if(this.declensionZ === 'pqs5' && morphSigns.c === RusCase.Gent) {
            return new RusNumeral(this.stem1 + ending.ending + this.stem3 + ending1.ending, this, morphSigns);
          } else {
            return new RusNumeral(this.stem + ending.ending + this.stem3 + ending1.ending, this, morphSigns);
          }
        }

      } else if(morphSigns.singular && this.declensionZ === 'pqs5' && this.declensionZ1 === 'pqc') {
        if(morphSigns.c === RusCase.Nomn || morphSigns.c === RusCase.Accs) {
          return new RusNumeral(this.stem + ending.ending + this.stem2 + ending1.ending, this, morphSigns);
        } else {
          return new RusNumeral(this.stem1 + ending.ending + this.stem2 + ending1.ending, this, morphSigns);
        }
      } else if(morphSigns.singular && (this.declensionZ1 === 'pqc2' || this.declensionZ1 === 'pqc3')) {
        if(morphSigns.c === RusCase.Gent) {
          return new RusNumeral(this.stem + ending.ending + this.stem3 + ending1.ending, this, morphSigns);
        } else {
          return new RusNumeral(this.stem + ending.ending + this.stem2 + ending1.ending, this, morphSigns);
        }
      } else {
        return new RusNumeral(this.stem + ending.ending + this.stem2 + ending1.ending, this, morphSigns);
      }
  

    } else {


      if (morphSigns.singular && this.stem1 && this.declensionZ === 'pqs') {
        if(morphSigns.gender === RusGender.Masc
          && (morphSigns.c === RusCase.Nomn || (morphSigns.c === RusCase.Accs && !morphSigns.animate))) {
          return new RusNumeral(this.stem + ending.ending, this, morphSigns);
        } else {
          return new RusNumeral(this.stem1 + ending.ending, this, morphSigns);
        }
      } else if(this.declensionZ === 'pqs5') {
        if(morphSigns.c === RusCase.Nomn || morphSigns.c === RusCase.Accs) {
          return new RusNumeral(this.stem + ending.ending, this, morphSigns);
        } else {
          return new RusNumeral(this.stem1 + ending.ending, this, morphSigns);
        }
      } else if (!morphSigns.singular && this.declensionZ === 'pqs8') {
        if(morphSigns.c === RusCase.Gent) {
          return new RusNumeral(this.stem1 + ending.ending, this, morphSigns);
        } else {
          return new RusNumeral(this.stem + ending.ending, this, morphSigns);
        }
      }  else if (morphSigns.singular && this.declensionZ === 'pqc1') {
        if(morphSigns.c === RusCase.Datv || morphSigns.c === RusCase.Ablt || morphSigns.c === RusCase.Loct) {
          return new RusNumeral(this.stem1 + ending.ending, this, morphSigns);
        } else {
          return new RusNumeral(this.stem + ending.ending, this, morphSigns);
        }
      } else {
        if(this.declensionZ === 'pqs') {
          return new RusNumeral(this.stem1 + ending.ending, this, morphSigns);
        } else {
          return new RusNumeral(this.stem + ending.ending, this, morphSigns);
        }
      }
    }
  }

  public getWordForms(): RusNumeral[] {
    const wordForms: RusNumeral[] = [];

    for (let c = RusCase.Nomn; c <= RusCase.Loct; c++) {
      if (c === RusCase.Accs) {
        wordForms.push(this.getWordForm({ c, singular: true, gender: RusGender.Masc, animate: true }));
        wordForms.push(this.getWordForm({ c, singular: true, gender: RusGender.Masc, animate: false }));
        wordForms.push(this.getWordForm({ c, singular: true, gender: RusGender.Femn, animate: true }));
        wordForms.push(this.getWordForm({ c, singular: true, gender: RusGender.Femn, animate: false }));
        wordForms.push(this.getWordForm({ c, singular: true, gender: RusGender.Neut, animate: true }));
        wordForms.push(this.getWordForm({ c, singular: true, gender: RusGender.Neut, animate: false }));
        if (this.possiblePlural && this.declensionZ !== 'pqs8') {
          wordForms.push(this.getWordForm({ c, singular: false, animate: true }));
          wordForms.push(this.getWordForm({ c, singular: false, animate: false }));
        }
      } else {
        wordForms.push(this.getWordForm({ c, singular: true, gender: RusGender.Masc }));
        wordForms.push(this.getWordForm({ c, singular: true, gender: RusGender.Femn }));
        wordForms.push(this.getWordForm({ c, singular: true, gender: RusGender.Neut }));
        if (this.possiblePlural && (this.declensionZ !== 'pqs8' && c !== RusCase.Nomn)) {
          wordForms.push(this.getWordForm({ c, singular: false }));
        }
      }
    }

    return wordForms;
  }
}

export const RusNumeralLexemes: RusNumeralLexeme[] = rusNumerals.map(
  (v) => new RusNumeralLexeme(v.stem, v.stem1, v.stem2, v.stem3, v.possiblePlural, v.digitalWrite, v.numeralValue, v.structure, v.declensionZ, v.declensionZ1, v.catagory)
);

export class RusNumeral extends Numeral<RusNumeralLexeme> {
  public readonly singular: boolean;
  public readonly grammCase: RusCase ;
  public readonly gender?: RusGender;
  public readonly animate?: boolean;

  constructor (word: string, lexeme: RusNumeralLexeme, morphSigns: RusNumeralMorphSigns) {
    super(word, lexeme);
    this.grammCase = morphSigns.c;
    this.singular = morphSigns.singular;
    this.gender= morphSigns.gender;
    this.animate= morphSigns.animate;
    }
  
  getDisplayText(): string {
    const lexeme = this.lexeme;
    const stem = this.word.startsWith(lexeme.stem) ? lexeme.stem :
      (this.word.startsWith(lexeme.stem1) ? lexeme.stem1 : '');
    const stem1 = this.word.indexOf(lexeme.stem2, stem.length) >= 0 ? lexeme.stem2 :
      (this.word.indexOf(lexeme.stem3, stem.length) >= 0 ? lexeme.stem3 : '');
    const divided = stem + (this.word === stem 
      ? '' 
      : '-' + ((lexeme.structure === NumeralStructure.Complex) 
        ? this.word.slice(stem.length - this.word.length, this.word.indexOf(stem1)) + '-' + stem1 +
          ( (this.word.indexOf(stem1) + stem1.length) !== this.word.length ? '-' + this.word.slice(stem1.length + this.word.indexOf(stem1) - this.word.length) : '')
        : this.word.slice(stem.length - this.word.length)));
    const num = this.singular ? 'ед.ч.' : 'мн.ч.';
    return this.word + '; числительное; ' + (divided !== this.word ? divided + '; ' : '') +
      lexeme.digitalWrite + '; ' +
      RusNumeralValueNames[lexeme.numeralValue] + '; ' +
      (lexeme.numeralValue === NumeralValue.Quantitative && lexeme.catagory ? RusNumeralCatagoryNames[lexeme.catagory]  + '; ' : '') +
      RusNumeralStructureNames[lexeme.structure] + '; ' +
      (this.singular ? (this.gender ? RusGenderNames[this.gender] + ' род; ' : RusGenderNames[0] + ' род; ') : '') +
      num + '; ' + RusCaseNames[this.grammCase];
  }

  static getSignature(singular: boolean, grammCase: RusCase, animate?: boolean, gender?: RusGender): string {
                  const an = animate ? 'Anim' : 'Inan';
                  const gd = singular ? (gender ? ShortGenderNames[gender] : 'Masc') : '';
                  const num = singular ? 'Sing' : 'Plur';
                  const cs = ShortCaseNames[grammCase];
    return 'NUMR' + an + gd + num + cs;
  }

  getSignature(): string {
    return RusNumeral.getSignature(this.singular, this.grammCase, this.animate, this.gender, );
  }
}