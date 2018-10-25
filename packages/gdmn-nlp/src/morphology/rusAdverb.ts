import { AdverbLexeme, Adverb, Word } from './morphology';
import { AdverbType, RusAdverbTypeNames, ShortAdverbTypeNames } from './types';

export const rusAdverbs = [
  {
    adverbType: AdverbType.ModeOfAction,
    words: [ 'быстро', 'медленно', 'неспеша', 'устно', 'беззвучно' ]
  },
  {
    adverbType: AdverbType.Measure,
    words: [ 'мало', 'много', 'очень', 'чуть-чуть' ]
  },
  {
    adverbType: AdverbType.Place,
    words: [ 'впереди', 'издали', 'направо', 'налево', 'внизу', 'вверху' ]
  },
  {
    adverbType: AdverbType.Time,
    words: [ 'тотчас', 'сегодня' ]
  },
  {
    adverbType: AdverbType.Cause,
    words: [ 'намеренно', 'назло', 'нарочно' ]
  },
  {
    adverbType: AdverbType.Goal,
    words: [ 'затем', 'потом', 'после', 'прежде', 'ранее', 'далее', 'впрок', 'намеренно', 'вначале', 'сперва', 'сначала' ]
  }
];

export class RusAdverbLexeme extends AdverbLexeme {
  readonly adverbType: AdverbType;

  constructor(adverb: string, adverbType: AdverbType) {
    super(adverb);
    this.adverbType = adverbType;
  }

  public analyze(word: string, result: (w: Word<RusAdverbLexeme>) => void): void {
    if (this.stem === word) {
      result(new RusAdverb(word, this));
    }
  }

  public getWordForm(): RusAdverb {
    return new RusAdverb(this.stem, this);
  }

  public getWordForms(): RusAdverb[] {
    return [ new RusAdverb(this.stem, this) ];
  }
}

export const RusAdverbLexemes = rusAdverbs.reduce(
  (prev, p) => {
    p.words.forEach(w => prev.push(new RusAdverbLexeme(w, p.adverbType)));
    return prev;
  },
  [] as RusAdverbLexeme[]
);

export class RusAdverb extends Adverb<RusAdverbLexeme> {
  getDisplayText(): string {
    return this.word + '; наречие; ' +
      RusAdverbTypeNames[ this.lexeme.adverbType ];
  }

  getSignature(): string {
    return 'ADVB' +
      ShortAdverbTypeNames[ this.lexeme.adverbType ];
  }
}
