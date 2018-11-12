import { AnyWord } from '../morphology/morphology';
import { CyrillicWord, tokenize, Comma } from '../syntax/tokenizer';
import { morphAnalyzer } from '../morphology/morphAnalyzer';
import { morphTokens } from './rusMorphTokens';
import { IMorphToken } from './types';
import { IToken } from 'chevrotain';

/**
 * Функция определяет возможные словоформы для каждого
 * из переданных слов. Например, для слова "дом" это будут
 * две возможные словормы: ед. ч., м. род, им п. и ед. ч., м.род,
 * вин. п.
 *
 * Затем, комбинаторно строятся все возможные варианты сочетаний
 * словоформ.
 *
 * Функция вовращает массив из массивов словоформ.
 *
 * @param text слово, словосочетание или предложение.
 */
export function combinatorialMorph(text: string): IToken[][]
{
  function createTokenInstance(w: AnyWord): IMorphToken {
    const tokType = morphTokens[w.getSignature()];

    if (!tokType) {
      throw new Error(`Unknown type signature ${w.getSignature()} of word ${w.word}`);
    }

    return {
      word: w,
      image: w.word,
      startOffset: 1,
      tokenTypeIdx: (<any>tokType).tokenTypeIdx,
      tokenType: tokType
    }
  };

  const parts = tokenize(text).reduce(
    (p, t) => {
      if (t.tokenType === CyrillicWord) {
        p.push(morphAnalyzer(t.image).map( w => createTokenInstance(w) ));
      }
      else if (t.tokenType === Comma) {
        p.push([t]);
      }
      return p;
    },
    [] as IToken[][]);

  const cmbn: IToken[][] = [];

  function recurs(curr: IToken[]): void {
    if (curr.length >= parts.length - 1) {
      parts[parts.length - 1].forEach( p => cmbn.push([...curr, p]) );
    } else {
      parts[curr.length].forEach( p => recurs([...curr, p]) );
    }
  }

  if (parts.length) {
    recurs([]);
  }

  return cmbn;
};