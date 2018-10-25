import { ConjunctionLexeme, Conjunction } from './morphology';

export class RusConjunctionLexeme extends ConjunctionLexeme {

  public analyze(word: string, result: (w: RusConjunction) => void): void {
    if (this.stem === word) {
      result(new RusConjunction(word, this));
    }
  }

  public getWordForm(): RusConjunction {
    return new RusConjunction(this.stem, this);
  }

  public getWordForms(): RusConjunction[] {
    return [new RusConjunction(this.stem, this)];
  }
}

const rusConjunctions = ['и', 'или'];

export const RusConjunctionLexemes: RusConjunctionLexeme[] = rusConjunctions.map(
  с => new RusConjunctionLexeme(с)
);

export class RusConjunction extends Conjunction<RusConjunctionLexeme> {
  getDisplayText (): string {
    return this.word + '; союз';
  }

  getSignature (): string {
    return 'CONJ';
  }
}
