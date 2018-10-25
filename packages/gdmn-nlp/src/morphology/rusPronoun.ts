import { PronounLexeme, Pronoun } from './morphology';
import { RusCase, RusCaseNames, RusPronounData, RusPronounTypeNames,
  ShortCaseNames, ShortPronounTypeNames } from './types';
import { rusPronouns } from './rusPronounsData';

export class RusPronounLexeme extends PronounLexeme {
  public data: RusPronounData;

  constructor (data: RusPronounData) {
    super(data.words[0]);
    this.data = data;
  }

  public analyze(word: string, result: (w: RusPronoun) => void): void {
    this.data.words.some( (d, idx) => {
        if (d === word && (!this.data.noNomn || idx !== RusCase.Nomn)) {
          result(new RusPronoun(word, this, idx));
          return true;
        } else {
          return false;
        }
      }
    );
  }

  public getWordForm(c: RusCase): RusPronoun {
    return new RusPronoun(this.data.words[c], this, c);
  }

  public getWordForms(): RusPronoun[] {
    return this.data.words.map( (d, idx) => new RusPronoun(d, this, idx) );
  }
}

export const RusPronounLexemes: RusPronounLexeme[] = rusPronouns.map(
  p => new RusPronounLexeme(p)
);

export class RusPronoun extends Pronoun<RusPronounLexeme> {
  public readonly grammCase: RusCase;

  constructor (word: string, lexeme: RusPronounLexeme, grammCase: RusCase) {
    super(word, lexeme);
    this.grammCase = grammCase;
  }

  getDisplayText (): string {
    return this.word + '; ' + RusPronounTypeNames[this.lexeme.data.pronounType] +
      ' местоимение; ' + RusCaseNames[this.grammCase];
  }

  getSignature (): string {
    return 'NPRO' + ShortPronounTypeNames[this.lexeme.data.pronounType] +
      ShortCaseNames[this.grammCase];
  }
}
