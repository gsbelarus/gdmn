import { RusVerb } from '../morphology/rusVerb';
import { RusNoun } from '../morphology/rusNoun';
import { RusAdjective } from '../morphology/rusAdjective';
import { RusPreposition } from '../morphology/rusPreposition';
import { RusWord } from '../morphology/rusMorphology';
import { Phrase, PhraseName } from './syntax';
import { AnyWord } from '../morphology/morphology';
import { DateValue, DefinitionValue, idEntityValue, SearchValue } from './value';
import { RusParticle } from '../morphology/rusParticle';
import { RusAdverb } from '../morphology/rusAdverb';

export class RusPhrase extends Phrase<RusWord> {};

/**
 * Two-member sentence
 */
  export class RusTMS extends RusPhrase {
  getName(): PhraseName {
    return {
      label: 'RusTMS',
      description: 'Двусоставное предложение'
    }
  }
}

/**
 * One-member Sentences
 */
export class RusOMS extends RusPhrase {
  getName(): PhraseName {
    return {
      label: 'RusOMS',
      description: 'Односоставное предложение'
    }
  }
}

/**
 * Principal Sentence Parts
 */
  export class RusPSP extends RusTMS {
  constructor (subject: RusNoun | idEntityValue, predicate: RusVDO) {
    super([subject, predicate]);
  }

  get subject(): RusNoun | idEntityValue {
    if(this.items[0] instanceof RusNoun) {
      return this.items[0] as RusNoun;
    } else {
      return this.items[0] as idEntityValue;
    }
  }

  get predicate(): RusVDO {
    return this.items[1] as RusVDO;
  }
  
  getName(): PhraseName {
    return {
      label: 'RusPSP',
      description: 'Главные члены предложения'
    }
  }
}

/**
 * Principal Sentence Parts with reverse word
 */
export class RusPSPRW extends RusTMS {
  constructor (predicate: RusPV, subject: RusNoun | idEntityValue) {
    super([predicate, subject]);
  }

  get predicate(): RusPV {
    return this.items[0] as RusPV;
  }

  get subject(): RusNoun | idEntityValue {
    if(this.items[1] instanceof RusNoun) {
      return this.items[1] as RusNoun;
    } else {
      return this.items[1] as idEntityValue;
    }
  }
  
  getName(): PhraseName {
    return {
      label: 'RusPSPRW',
      description: 'Главные члены предложения в обратном порядке'
    }
  }
}

export class RusVDO extends RusTMS {
  constructor (predicate: RusPV | RusVerb | RusAdverb, directObject?: SearchValue) {
    if (directObject) {
      super([predicate, directObject]);
    } else {
      super([predicate]);
    }
  }

  get predicate(): RusPV | RusVerb| RusAdverb {
    if(this.items[0] instanceof RusPV) {
      return this.items[0] as RusPV;
    } else if(this.items[0] instanceof RusVerb) {
      return this.items[0] as RusVerb;
    } else {
      return this.items[0] as RusAdverb;
    }
  }

  get directObject(): SearchValue | undefined {
    if (this.items[1] instanceof SearchValue) {
      return this.items[1] as SearchValue;
    } else {
      return undefined;
    }
  }

  getName(): PhraseName {
    return {
      label: 'RusVDO',
      description: 'Сказуемое с второстепенными членами предложения'
    }
  }
}

/**
 * Impersonal sentences
 */
export class RusIS extends RusOMS {
  constructor (predicate: RusParticle, directObject: SearchValue | RusNoun | idEntityValue) {
    super([predicate, directObject]);
  }

  get predicate(): RusParticle {
    return this.items[0] as RusParticle;
  }

  get directObject(): SearchValue | RusNoun | idEntityValue {
    if (this.items[1] instanceof SearchValue) {
      return this.items[1] as SearchValue;
    } else if (this.items[1] instanceof RusNoun) {
      return this.items[1] as RusNoun;
    } else {
      return this.items[1] as idEntityValue;
    }
  }

  getName(): PhraseName {
    return {
      label: 'RusIS',
      description: 'Сказуемое выраженное частицей, с второстепенными членами предложения'
    }
  }
}

/**
 * Verb with particle
 */
export class RusPV extends RusPhrase {
  constructor (verb: RusVerb, particle?: RusParticle) {
    if(particle) {
      super([particle, verb]);
    } else {
      super([verb]);
    }
  }

  get particle(): RusParticle | undefined {
    if(this.items.length > 1) {
      return this.items[0] as RusParticle;
    } else {
      return undefined;
    }
  }

  get verb(): RusVerb {
    if(this.items.length > 1) {
      return this.items[1] as RusVerb;
    } else {
      return this.items[0] as RusVerb;
    }
  }

  getName(): PhraseName {
    return {
      label: 'RusPV',
      description: 'Сказуемое с частицой'
    }
  }
}

/**
 * Secondary Sentence Parts
 */
  export class RusSSP extends RusTMS {
  getName(): PhraseName {
    return {
      label: 'RusSSP',
      description: 'Второстепенные члены предложения'
    }
  }
}

export class RusNounPhrase extends RusPhrase {
  getName(): PhraseName {
    return {
      label: 'RusNP',
      description: 'Предложение с именным подлежащим'
    }
  }
}

export class RusImperativeNP extends RusNounPhrase {
  constructor (imperativeNoun: RusNoun, pp?: RusPTimeP) {
    if (pp) {
      super([imperativeNoun, pp]);
    } else {
      super([imperativeNoun]);
    }
  }

  get imperativeNoun(): RusNoun {
    return this.items[0] as RusNoun;
  }

  get pp(): RusPTimeP | undefined {
    return this.items[1] as RusPTimeP;
  }

  getName(): PhraseName {
    return {
      label: 'RusImperativeNP',
      description: 'Предложение с именным подлежащим с дополнением'
    }
  }
}

export class RusVP extends RusPhrase {
  getName(): PhraseName {
    return {
      label: 'RusVP',
      description: 'Предложение с глаголом'
    }
  }
}

export class RusImperativeVP extends RusVP {
  constructor (imperativeVerb: RusVerb, imperativeNP?: RusPP) {
    if (imperativeNP) {
      super([imperativeVerb, imperativeNP]);
    } else {
      super([imperativeVerb]);
    }
  }

  get imperativeVerb(): RusVerb {
    return this.items[0] as RusVerb;
  }

  get imperativeNP(): RusNP | undefined {
    if (!this.items[1]) {
      return undefined;
    } else {
      return this.items[1] as RusNP;
    }
  }

  getName(): PhraseName {
    return {
      label: 'RusImperativeVP',
      description: 'Предложение с глаголом в повелительном наклонении'
    }
  }
}

export class RusNP extends RusPhrase {
  constructor (n: RusNoun | RusHmNouns | RusANP, pp?: RusPP) {
    if (pp) {
      super([n, pp]);
    } else {
      super([n]);
    }
  }

  get noun(): RusNoun | RusANP {
    if (this.items[0] instanceof RusNoun) {
      return this.items[0] as RusNoun;
    } else {
      return this.items[0] as RusANP;
    }
  }

  get pp(): RusPP | undefined {
    if (this.items[1] instanceof RusPP) {
      return this.items[1] as RusPP;
    } else {
      return undefined;
    }
  }

  getName(): PhraseName {
    return {
      label: 'RusNP',
      description: 'Словосочетание с существительным'
    }
  }
}

export class RusANP extends RusPhrase {
  constructor (adjf: RusAdjective | DefinitionValue, noun: RusNoun | RusHmNouns | idEntityValue) {
    super([adjf, noun]);
  }

  get adjf(): RusAdjective | DefinitionValue {
    if(this.items[0] instanceof RusAdjective) {
      return this.items[0] as RusAdjective;
    } else {
      return this.items[0] as DefinitionValue;
    }
  }

  get noun(): RusNoun | idEntityValue {
    if (this.items[1] instanceof idEntityValue) {
      return this.items[1] as idEntityValue;
    } else if (this.items[1] instanceof RusNoun) {
      return this.items[1] as RusNoun;
    } else {
      return (this.items[1] as RusHmNouns).items[0] as RusNoun;
    }
  }

  getName(): PhraseName {
    return {
      label: 'RusANP',
      description: 'Словосочетание прилагательное-существительное'
    }
  }
}

export class RusHmNouns extends RusPhrase {
  constructor (nouns: AnyWord[]) {
    if (!nouns.length || !(nouns[0] instanceof RusNoun)) {
      throw new Error(`Invalid homogeneous nouns`);
    }

    super(nouns as RusWord[]);
  }

  getName(): PhraseName {
    return {
      label: 'RusHmNouns',
      description: 'Однородные существительные'
    }
  }
}

export class RusPP extends RusPhrase {
  constructor (prep: RusPreposition, noun: RusNoun | RusHmNouns) {
    super([prep, noun]);
  }

  get prep(): RusPreposition {
    return this.items[0] as RusPreposition;
  }

  get noun(): RusNoun {
    if (this.items[1] instanceof RusNoun) {
      return this.items[1] as RusNoun;
    } else {
      return (this.items[1] as RusHmNouns).items[0] as RusNoun;
    }
  }

  getName(): PhraseName {
    return {
      label: 'RusPP',
      description: 'Существительное с предлогом'
    }
  }
}

export class RusPTimeP extends RusPhrase {
  constructor (prep: RusPreposition, date: DateValue) {
    super([prep, date]);
  }

  get prep(): RusPreposition {
    return this.items[0] as RusPreposition;
  }

  getName(): PhraseName {
    return {
      label: 'RusPTimeP',
      description: 'Предлог и дата'
    }
  }
}
