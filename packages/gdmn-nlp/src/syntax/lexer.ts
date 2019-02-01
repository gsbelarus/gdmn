import { AnyWord, Lexeme } from '../morphology/morphology';
import { CyrillicWord, tokenize, Comma, Numeric } from '../syntax/tokenizer';
import { morphAnalyzer } from '../morphology/morphAnalyzer';
import { morphTokens } from './rusMorphTokens';
import { IMorphToken, isMorphToken } from './types';
import { IToken } from 'chevrotain';
import { RusNoun } from '../morphology/rusNoun';
import { RusConjunction } from '../morphology/rusConjunction';
import { RusNumeralLexemes, RusNumeral } from '../morphology/rusNumeral';
import { RusGender, RusCase, NumeralValue } from '../morphology/types';

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
      else if (t.tokenType === Numeric) {
        const number = RusNumeralLexemes.filter(num => 
          num.digitalWrite === t.image).reduce((p, l) => {
            p.push(l.getWordForm({c: RusCase.Accs, gender: RusGender.Masc, animate: false, singular: true}));
            return p;
          }, [] as AnyWord[]);
        if(number.length !== 0) {
          p.push(number.map( w => createTokenInstance(w) ));
        } else {
          let tokenImage = Number(t.image);
          if (String(tokenImage).length > 9) {
            const digit = Number(String(tokenImage).slice(0, -9))
            if ( digit !== 0) {
              if (digit !== 1) {
                analysisOneDigitNumber(digit);
              }
              findStringNumber(1000000000);
              tokenImage = tokenImage - digit * 1000000000;
            }
          }
          if (String(tokenImage).length > 6) {
            const digit = Number(String(tokenImage).slice(0, -6))
            if (digit !== 0) {
              if (digit !== 1 ) {
                analysisOneDigitNumber(digit);
              }
              findStringNumber(1000000);
              tokenImage = tokenImage - digit * 1000000;
            }
          }
          if (String(tokenImage).length > 3) {
            const digit = Number(String(tokenImage).slice(0, -3))
            if (digit !== 0) {
              if (digit !== 1) {
                analysisOneDigitNumber(digit);
              }
              findStringNumber(1000);
              tokenImage = tokenImage - digit * 1000;
              }
          }
          if (String(tokenImage).length <= 3 && tokenImage > 0) {
            analysisOneDigitNumber(tokenImage);
          }

          function analysisOneDigitNumber (digit: number) {
            if(digit >= 100) {
              findStringNumber(digit - (digit % 100));
              digit = digit % 100;
            }
            if (digit !== 0) {
              if (digit < 20 && digit > 0) {
                findStringNumber(digit);
              } else {
                findStringNumber(digit - (digit % 10));
                if (digit % 10 > 0) {
                  findStringNumber(digit % 10);
                }
              }
              }
          }

          function findStringNumber(digitalNumber: number) {
            let findNumber = RusNumeralLexemes.filter(num => 
              num.digitalWrite === String(digitalNumber)).reduce((p, l) => {
                p.push(l.getWordForm({c: RusCase.Accs, gender: RusGender.Masc, animate: false, singular: true}));
                return p;
              }, [] as AnyWord[]);
            p.push(findNumber.map( w => createTokenInstance(w) ));
          }

        }
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

      if (!isMorphToken(firstToken) || !(firstToken.word instanceof RusNumeral)) {
        startIdx++;
      } else {
        let endIdx = startIdx + 1;
        let found = false;
        let foundOrinalNumreal = false;
  
        while (endIdx < parts.length) {
          const lastToken = parts[endIdx][0];
  
          if (!isMorphToken(lastToken)) {
            break;
          }
  
          if (!(lastToken.word instanceof RusNumeral)) {
            break;
          }

          const intersect = parts[endIdx].filter(
            p => firstParts.some(
              fp => isMorphToken(fp) && fp.word instanceof RusNumeral && isMorphToken(p)
                && p.word instanceof RusNumeral && (p.word.grammCase === fp.word.grammCase || p.word.grammCase === RusCase.Gent)
            )
          );
  
          if (!intersect.length) {
            break;
          }

          if (!(isMorphToken(parts[endIdx][0]) && (parts[endIdx][0] as IMorphToken).word instanceof RusNumeral)) {
            throw new Error(`Invalid numeral`);
          }

          if(isMorphToken(parts[endIdx + 1][0]) && (parts[endIdx + 1][0] as IMorphToken).word instanceof RusNumeral) {

            const numural = (parts[endIdx][0] as IMorphToken).word as RusNumeral;
            const nextNumeral = (parts[endIdx + 1][0] as IMorphToken).word as RusNumeral;

            if (!foundOrinalNumreal) {
              foundOrinalNumreal = nextNumeral.lexeme.numeralValue === NumeralValue.Orinal;
            }

            if(Number(nextNumeral.lexeme.digitalWrite) % 1000 !== 0) {
              if(numural.lexeme.digitalWrite.length <= nextNumeral.lexeme.digitalWrite.length
                && nextNumeral.lexeme.numeralValue !== NumeralValue.Orinal) {
                  throw new Error(`Invalid structure numeral`);
              }

              if ( Number(numural.lexeme.digitalWrite) % 10 !== 0 && nextNumeral.lexeme.numeralValue !== NumeralValue.Orinal) {
                  throw new Error(`Invalid structure numeral`);
              }
            }
          }
  
          found = true;
  
          firstParts = firstParts.filter(
            p => intersect.some(
              fp => isMorphToken(fp) && fp.word instanceof RusNumeral && isMorphToken(p)
                && p.word instanceof RusNumeral && (p.word.grammCase === fp.word.grammCase || fp.word.grammCase === RusCase.Gent)
            )
          );
  
          endIdx++;
        }

        if (found && firstParts.length) {
          endIdx--;
          
          let idxON = -1;
          if(foundOrinalNumreal) {
            idxON = parts.findIndex(num => ((num[0] as IMorphToken).word as RusNumeral).lexeme.numeralValue === NumeralValue.Orinal)
          }

          if(idxON >= 0 && idxON !== startIdx && idxON !== endIdx) {
            throw new Error(`Invalid structure numeral`);
          }

          const cnt = endIdx - startIdx + 1 - (idxON >= 0 ? 1 : 0);
          startIdx = startIdx + (idxON === startIdx ? 1 : 0);
  
          if (cnt >= 2) {

            const cn = parts.splice(startIdx, cnt, parts[startIdx]).map(
              p => p.reduce( (prev, w) => isMorphToken(w) ? [...prev, w.word] : prev, [] as AnyWord[] )
            );

            const summ = String(cn.map(item => {
                if (item[0] instanceof RusNumeral) {
                  return Number((item[0] as RusNumeral).lexeme.digitalWrite);
                }
              }).reduce( (res, curr) => {
                curr = (curr) ? curr : 0;
                res = (res) ? res : 0;
                const mid = (curr % 1000 === 0 && res % 1000 > 0) ? res % 1000 : 1;
                return ((res !== 0 && mid !== 1) ? (res - mid) : res) + mid * curr;
              }, 0))
            parts[startIdx] = firstParts.map( p => isMorphToken(p) ? {...p, cn} : p );
            parts[startIdx].map(item => item.image = summ)
          }
        }
        startIdx++;
      }

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