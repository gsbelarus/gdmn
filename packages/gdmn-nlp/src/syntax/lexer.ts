import { AnyWord } from '../morphology/morphology';
import { CyrillicWord, tokenize } from '../syntax/tokenizer';
import { morphAnalyzer } from '../morphology/morphAnalyzer';
import { IMorphToken, morphTokens } from './rusMorphTokens';

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
export function combinatorialMorph(text: string): IMorphToken[][]
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
  }

  const words = tokenize(text).reduce(
    (p, t) => {
      if (t.tokenType === CyrillicWord) {
        p.push(morphAnalyzer(t.image));
      }
      return p;
    },
    [] as AnyWord[][]);

  const cmbn: IMorphToken[][] = [];

  function recurs(curr: IMorphToken[]): void {
    if (curr.length >= words.length - 1) {
      words[words.length - 1].forEach( w => cmbn.push([...curr, createTokenInstance(w)]) );
    } else {
      words[curr.length].forEach( w => recurs([...curr, createTokenInstance(w)]) );
    }
  }

  if (words.length) {
    recurs([]);
  }

  return cmbn;
};