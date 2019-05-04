import { PrepositionLexeme, Preposition, Word } from './morphology';
import { PrepositionType, RusPrepositionTypeNames, ShortPrepositionTypeNames } from './types';

export const rusPrepositions = [
  {
    prepositionType: PrepositionType.Place,
    words: ['от', 'до', 'из', 'на', 'около', 'вблизи', 'за', 'из-под']
  },
  {
    prepositionType: PrepositionType.Object,
    words: ['о', 'по', 'про', 'за', 'в', 'на', 'с', 'насчет']
  },
  {
    prepositionType: PrepositionType.Time,
    words: ['с', 'от', 'до', 'в', 'на', 'после']  // в течение, в продолжение
  },
  {
    prepositionType: PrepositionType.Reason,
    words: ['из-за', 'по', 'от', 'вследствие', 'ввиду']
  },
  {
    prepositionType: PrepositionType.Goal,
    words: ['для', 'ради']  // в целях, во имя
  },
  {
    prepositionType: PrepositionType.Comparative,
    words: ['с', 'вроде', 'наподобие']
  }
];

export class RusPrepositionLexeme extends PrepositionLexeme {
  readonly prepositionType: PrepositionType;

  constructor (preposition: string, prepositionType: PrepositionType) {
    super (preposition);
    this.prepositionType = prepositionType;
  }

  public analyze(word: string, result: (w: Word<RusPrepositionLexeme>) => void): void {
    if (this.stem === word) {
      result(new RusPreposition(word, this));
    }
  }

  public getWordForm(): RusPreposition {
    return new RusPreposition(this.stem, this);
  }

  public getWordForms(): RusPreposition[] {
    return [new RusPreposition(this.stem, this)];
  }
}

export const RusPrepositionLexemes = rusPrepositions.reduce(
  (prev, p) => {
    p.words.forEach( w => prev.push(new RusPrepositionLexeme(w, p.prepositionType)) );
    return prev;
  },
  [] as RusPrepositionLexeme[]
);

export class RusPreposition extends Preposition<RusPrepositionLexeme> {
  getDisplayText (): string {
    return this.word + '; предлог; ' +
      RusPrepositionTypeNames[this.lexeme.prepositionType];
  }

  static getSignature(prepositionType: PrepositionType): string {
    return `PREP${ShortPrepositionTypeNames[prepositionType]}`;
  }

  getSignature (): string {
    return RusPreposition.getSignature(this.lexeme.prepositionType);
  }
}
