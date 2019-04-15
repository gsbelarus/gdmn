import { RusVerb } from '../morphology/rusVerb';
import { RusNoun } from '../morphology/rusNoun';
import { RusAdjective } from '../morphology/rusAdjective';
import { RusPreposition } from '../morphology/rusPreposition';
import { RusWord } from '../morphology/rusMorphology';
import { Phrase, PhraseName } from './syntax';
import { AnyWord } from '../morphology/morphology';
import { DateValue, DefinitionValue, idEntityValue } from './value';

export class RusPhrase extends Phrase<RusWord> {};

export class RusVP extends RusPhrase {
  getName(): PhraseName {
    return {
      label: 'RusVP',
      description: 'Предложение с глаголом'
    }
  }
}

export class RusImperativeVP extends RusVP {
  constructor (imperativeVerb: RusVerb, imperativeNP?: RusNP) {
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
