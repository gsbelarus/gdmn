import { AnyWord } from '../morphology/morphology';
import { getNextID } from '../utils/idGenerator';
import { Value } from './value';

export class Sentence {}

export type PhraseItem<W extends AnyWord> = W | Phrase<W> | Value;

export interface PhraseName {
  label: string,
  description: string
};

export abstract class Phrase<W extends AnyWord> {
  public items: PhraseItem<W>[];
  readonly id: number = getNextID();

  constructor (items: PhraseItem<W>[]) {
    if (!items.length || items.find( i => !i ) ) {
      throw new Error('Invalid phrase items');
    }

    this.items = items;
  }

  getName(): PhraseName {
    return {
      label: this.constructor.name,
      description: this.constructor.name
    }
  }

  getText(): string {
    return this.items.reduce(
      (prev, p) =>
        prev + p.getText() + ' ',
      ''
    );
  }

  simplify() {
    const recurs = (parentParent: Phrase<W>, parent: Phrase<W>, idx: number) => {
      parent.items.forEach(
        (i, x) => {
          if (i.constructor === parent.constructor) {
            recurs(parent, i as Phrase<W>, x);
          }
        }
      );

      if (parent.items.length === 1) {
        const temp = parent.items[0];
        parent.items = [];
        parentParent.items[idx] = temp;
      }
    };

    this.items.forEach(
      (i, idx) => {
        if (i.constructor === this.constructor) {
          recurs(this, i as Phrase<W>, idx);
        }
      }
    );
  }
}