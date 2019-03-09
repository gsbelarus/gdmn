import { AnyWord, Numeral } from '../morphology/morphology';
import { CyrillicWord, tokenize, Comma, Numeric, DateToken } from '../syntax/tokenizer';
import { morphAnalyzer } from '../morphology/morphAnalyzer';
import { morphTokens } from './rusMorphTokens';
import { IMorphToken, isMorphToken } from './types';
import { IToken } from 'chevrotain';
import { RusNoun } from '../morphology/rusNoun';
import { RusConjunction } from '../morphology/rusConjunction';
import { RusNumeral, RusNumeralLexemes } from '../morphology/rusNumeral';
import { RusCase, RusGender } from '..';

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
      else if (t.tokenType === Comma || t.tokenType === Numeric || t.tokenType === DateToken) {
        p.push([t]);
      }
      return p;
    },
    [] as IToken[][]
  );

  /**
   * Найдем составные числительные
   */
  let startIdx = 0;
  while (startIdx < parts.length) {

    if (!isMorphToken(parts[startIdx][0]) || !((parts[startIdx][0] as IMorphToken).word instanceof RusNumeral)) {
      startIdx++;
      continue;
    }

    let endIdx = startIdx + 1;

    while (endIdx < parts.length && isMorphToken(parts[endIdx][0]) && (parts[endIdx][0] as IMorphToken).word instanceof RusNumeral) {
      endIdx++;
    }

    const cnt = endIdx - startIdx;

    if (cnt < 2) {
      parts[startIdx].forEach( n => (n as IMorphToken).image = ((parts[startIdx][0] as IMorphToken).word as RusNumeral).lexeme.value.toString() );
      startIdx++;
      continue;
    }

    let wereOnes = false;
    let wereTeens = false;
    let wereTens = false;
    let wereHundreds = false;
    let value = 0;

    for (let j = endIdx - 1; j >= startIdx; j--) {
      const num = (parts[j][0] as IMorphToken).word as RusNumeral;
      const currValue = num.lexeme.value;

      if (currValue >= 0 && currValue <= 9) {
        if (wereOnes || wereTeens || wereTens || wereHundreds) {
          throw new Error(`Invalid composite numerals structure`);
        }
        wereOnes = true;
      }

      if (currValue >= 10 && currValue <= 19) {
        if (wereTeens || wereOnes || wereTens || wereHundreds) {
          throw new Error(`Invalid composite numerals structure`);
        }
        wereTeens = true;
      }

      if (currValue >= 20 && currValue <= 99) {
        if (wereTeens || wereTens || wereHundreds) {
          throw new Error(`Invalid composite numerals structure`);
        }
        wereTens = true;
      }

      if (currValue >= 100 && currValue <= 999) {
        if (wereHundreds) {
          throw new Error(`Invalid composite numerals structure`);
        }
        wereHundreds = true;
      }

      value += currValue;
    }

    const cn = parts.splice(startIdx, cnt, parts[startIdx]).map(
      p => p.reduce( (prev, w) => [...prev, (w as IMorphToken).word], [] as AnyWord[] )
    );
    parts[startIdx] = parts[startIdx].map( p => ({...p, image: value.toString(), cn}) );

    startIdx++;
  }

  /**
   * Найдем однородные существительные
   */

  startIdx = 0;
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