import { AnyWord } from '../morphology/morphology';
import { CyrillicWord, tokenize, Comma } from '../syntax/tokenizer';
import { morphAnalyzer } from '../morphology/morphAnalyzer';
import { morphTokens } from './rusMorphTokens';
import { IMorphToken, isMorphToken } from './types';
import { IToken } from 'chevrotain';
import { RusNoun } from '../morphology/rusNoun';
import { RusConjunction } from '../morphology/rusConjunction';

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

  /**
   * Найдем однородные существительные
   */

  let startIdx = 0;
  while (startIdx < parts.length) {

    let firstParts = [...parts[startIdx]];
    const firstToken = firstParts[0];

    if (!isMorphToken(firstToken) || !(firstToken.word instanceof RusNoun)) {
      startIdx++;
    } else {
      let endIdx = startIdx + 1;
      let found = false;
      let wasConj = false;
      let wasComma = false;

      while (endIdx < parts.length) {
        const lastToken = parts[endIdx][0];

        if (lastToken.tokenType === Comma) {
          if (wasComma) {
            throw new Error(`Invalid punctuation marks`);
          } else {
            wasComma = true;
            endIdx++;
            continue;
          }
        }

        wasComma = false;

        if (!isMorphToken(lastToken)) {
          break;
        }

        if (lastToken.word instanceof RusConjunction) {
          if (wasConj) {
            break;
          } else {
            wasConj = true;
            endIdx++;
            continue;
          }
        }

        wasConj = false;

        if (!(lastToken.word instanceof RusNoun)) {
          break;
        }

        const intersect = parts[endIdx].filter(
          p => firstParts.some(
            fp => isMorphToken(fp) && fp.word instanceof RusNoun && isMorphToken(p)
              && p.word instanceof RusNoun && p.word.grammCase === fp.word.grammCase
          )
        );

        if (!intersect.length) {
          break;
        }

        found = true;

        firstParts = firstParts.filter(
          p => intersect.some(
            fp => isMorphToken(fp) && fp.word instanceof RusNoun && isMorphToken(p)
              && p.word instanceof RusNoun && p.word.grammCase === fp.word.grammCase
          )
        );

        endIdx++;
      }

      if (found && firstParts.length) {
        endIdx--;

        if (wasConj) {
          endIdx--;
        }

        const cnt = endIdx - startIdx + 1;

        if (cnt >= 2) {
          const hsm = parts.splice(startIdx + 1, cnt - 1).filter( t => t[0].tokenType !== Comma ).map(
            p => p.reduce( (prev, w) => isMorphToken(w) ? [...prev, w.word] : prev, [] as AnyWord[] )
          );
          parts[startIdx] = firstParts.map( p => isMorphToken(p) ? {...p, hsm} : p );
        }
      }

      startIdx++;
    }
  }

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