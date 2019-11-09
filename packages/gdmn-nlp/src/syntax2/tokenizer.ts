import { INLPTokenType, INLPToken } from "./types";
import { morphAnalyzer } from "../morphology/morphAnalyzer";
import { RusNoun, RusVerb, RusConjunction, AnyWord, RusNumeral, NumeralRank } from "..";
import { RusAdjective } from "../morphology/rusAdjective";
import { RusNumeralLexeme } from "../morphology/rusNumeral";
import { RusParticle } from "../morphology/rusParticle";

export const nlpWhiteSpace: INLPTokenType = {
  name: 'WhiteSpace',
  pattern: /^[ \t]+/
};

export const nlpLineBreak: INLPTokenType = {
  name: 'LineBreak',
  pattern: /^((\n\r)|(\n))/
};

export const nlpComma: INLPTokenType = {
  name: 'Comma',
  pattern: /^,/
};

export const nlpPunctuationMark: INLPTokenType = {
  name: 'PunctuationMark',
  pattern: /^[.?!]/
};

export const nlpCyrillicWord: INLPTokenType = {
  name: 'CyrillicWord',
  pattern: /^((?:[А-ЯЎІЁа-яўіё]+-[А-ЯЎІЁа-яўіё]+)|(?:[А-ЯЎІЁа-яўіё]+))/
};

export const nlpNumber: INLPTokenType = {
  name: 'Number',
  pattern: /^[-]{0,1}[0-9]+/
};

export const nlpDateToken: INLPTokenType = {
  name: 'DateToken',
  pattern: /^(31|30|2[0-9]|1[0-9]|0[1-9]|[1-9]){1}\.(12|11|10|0[1-9]|[1-9]){1}\.([1-2]{1}[0-9]{3}|[0-9]{2})/
};

export const nlpIDToken: INLPTokenType = {
  name: 'IDToken',
  pattern: /^[A-Za-z$_]+[A-Za-z0-9$_]*/
};

const allTokens = [
  nlpWhiteSpace,
  nlpCyrillicWord,
  nlpComma,
  nlpIDToken,
  nlpLineBreak,
  nlpDateToken,
  nlpNumber,
  nlpPunctuationMark
];

const isUniformPOS = (w1: AnyWord, w2: AnyWord) => {
  if (w1 instanceof RusNoun && w2 instanceof RusNoun) {
    return w1.grammCase === w2.grammCase;
  }

  return w1.getSignature() === w2.getSignature();
};

/**
 * Убираем частицы. Они переплетаются с союзами и путаются под ногами.
 */
const transform = (tokens: INLPToken[]): INLPToken[] => {
  return tokens.map( t => t.words ? {...t, words: t.words.filter( w => !(w instanceof RusParticle) )} : t);
}

/**
 * Проверяем массивы словоформ у каждого токена. Если встречаются
 * словоформы разных частей речи, то разделяем их.
 * Например, для фразы "три доски" мы получим два варианта разбора.
 * Один для "три", как числительного, и второй -- как для глагола.
 */
const separateByPOS = (tokens: INLPToken[]): INLPToken[][] => {
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.words && token.words.length) {
      const posNames = token.words.reduce( (p, w) => { p[w.getSignature().slice(0, 4)] = true; return p; }, {} as { [name: string]: boolean });
      const keys = Object.keys(posNames);
      const res: INLPToken[][] = [];
      if (keys.length > 1) {
        for (const key of keys) {
          const newToken = {
            ...token,
            words: token.words.filter( w => w.getSignature().slice(0, 4) === key )
          };
          res.push(...separateByPOS([newToken, ...tokens.slice(i + 1)]));
        }
        return res.map( r => [...tokens.slice(0, i), ...r]);
      }
    }
  }

  return [tokens];
};

/**
 * Замена числительных на число
 */
const replaceNumerals = (tokens: INLPToken[]): INLPToken[] => {
  let startIdx = 0;
  while (startIdx < tokens.length) {
    const startToken = tokens[startIdx];

    if (!startToken.words ||
      !startToken.words.length ||
      !(
        (
          startToken.words[0] instanceof RusNumeral &&
          (startToken.words[0].lexeme as RusNumeralLexeme).rank === NumeralRank.ProperQuantitative
        )
        ||
        (
          startToken.words[0] instanceof RusNoun &&
          (
            startToken.words[0].lexeme.stem === 'нол'
            ||
            startToken.words[0].lexeme.stem === 'тысяч'
            ||
            startToken.words[0].lexeme.stem === 'миллион'
            ||
            startToken.words[0].lexeme.stem === 'миллиард'
          )
        )
      )
    ) {
      startIdx++;
      continue;
    }

    let was_1e9 = false;
    let was_1e6 = false;
    let was_1e3 = false;
    let cnt = 0;
    let value = 0;
    let currValue = 0;

    while (startIdx + cnt < tokens.length) {
      const token = tokens[startIdx + cnt];

      if (token.tokenType === nlpWhiteSpace || token.tokenType === nlpLineBreak) {
        cnt++;
        continue;
      }

      if (token.words && token.words.length) {
        if (token.words[0] instanceof RusNumeral && (token.words[0].lexeme as RusNumeralLexeme).rank === NumeralRank.ProperQuantitative) {
          cnt++;
          currValue += (token.words[0].lexeme as RusNumeralLexeme).value;
          continue;
        }

        if (token.words[0] instanceof RusNoun) {
          let cont = true;

          switch (token.words[0].lexeme.stem) {
            case 'нол': {
              currValue = 0;
              break;
            }

            case 'тысяч': {
              value += currValue * 1000;
              currValue = 0;
              was_1e3 = true;
              break;
            }

            case 'миллион': {
              value += currValue * 1000000;
              currValue = 0;
              was_1e6 = true;
              break;
            }

            case 'миллиард': {
              value += currValue * 1000000000;
              currValue = 0;
              was_1e9 = true;
              break;
            }

            default:
              cont = false;
          }

          if (cont) {
            cnt++;
            continue;
          }
        }
      }

      break;
    }

    if (currValue) {
      value += currValue;
    }

    while (cnt &&
      (
        tokens[startIdx + cnt - 1].tokenType === nlpWhiteSpace ||
        tokens[startIdx + cnt - 1].tokenType === nlpLineBreak
      )
    ) {
      cnt--;
    }

    if (cnt) {
      const newTokens = [...tokens];
      const newToken: INLPToken = {
        image: '',
        startOffset: -1,
        tokenType: nlpNumber,
        value
      };
      const numerals = newTokens.splice(startIdx, cnt, newToken);
      newToken.image = value.toString();
      newToken.startOffset = numerals[0].startOffset;
      newToken.numerals = numerals;
      return newTokens;
    }
  }

  return tokens;
};

/**
 * Замена однородных частей речи на один токен.
 * По однородными частями мы понимаем два и более слова,
 * относящихся к одной части речи и имеющих одинаковые
 * морфологические характеристики, разделенные пробелами,
 * запятыми или союзами "и" или "или".
 *
 * Примеры:
 *   -- зеленый, красный, фиолетовый
 *   -- Минска и Пинска
 */
const replaceUniform = (inputTokens: INLPToken[]): INLPToken[] => {
  const tokens = [...inputTokens];
  let startIdx = 0;
  while (startIdx < tokens.length) {

    const startToken = tokens[startIdx];

    if (!startToken.words || !startToken.words.length ||
      !(
        startToken.words[0] instanceof RusNoun ||
        startToken.words[0] instanceof RusVerb ||
        startToken.words[0] instanceof RusAdjective
      )
    ) {
      startIdx++;
      continue;
    }

    let endIdx = startIdx + 1;
    let cnt = 0;
    let wasConjunction = false;

    while (endIdx < tokens.length &&
      (
        tokens[endIdx].tokenType === nlpWhiteSpace
        ||
        tokens[endIdx].tokenType === nlpLineBreak
        ||
        tokens[endIdx].tokenType === nlpComma
        ||
        (
          tokens[endIdx].words
          &&
          tokens[endIdx].words!.length
          &&
          (
            tokens[endIdx].words![0] instanceof RusConjunction
            ||
            tokens[endIdx].words!.some( w => startToken.words!.find( sw => isUniformPOS(sw, w) ) )
          )
        )
      )
    ) {
      if (tokens[endIdx].words && tokens[endIdx].words!.length) {
        if (tokens[endIdx].words![0] instanceof RusConjunction) {
          if (wasConjunction) {
            break;
          }
          wasConjunction = true;
        } else {
          wasConjunction = false;
        }
      }

      endIdx++;
      cnt++;
    }

    while (cnt &&
      (
        tokens[startIdx + cnt].tokenType === nlpWhiteSpace ||
        tokens[startIdx + cnt].tokenType === nlpLineBreak ||
        tokens[startIdx + cnt].tokenType === nlpComma ||
        (
          tokens[startIdx + cnt].words
          &&
          tokens[startIdx + cnt].words!.length
          &&
          tokens[startIdx + cnt].words![0] instanceof RusConjunction
        )
      )
    ) {
      cnt--;
    }

    if (cnt) {
      startToken.uniformPOS = tokens.splice(startIdx + 1, cnt);
    }

    startIdx++;
  }

  return tokens;
};

export function nlpTokenize(text: string): INLPToken[][] {
  /**
   * Поочередно проверяем строку на регулярные выражения
   * из массива типов токенов. Если регулярное выражение срабатывает,
   * то создаем токен соответствующего типа. Для чисел -- получаем
   * значение преобразованием из строки, для слов -- определяем массив
   * словоформ. Передвигаем указатель на следующую позицию (после
   * найденного токена) и повторяем цикл пока не достигнем конца строки.
   */
  const tokens: INLPToken[] = [];
  let startOffset = 0;

  while (startOffset < text.length) {
    let found = false;
    for (const tokenType of allTokens) {
      const match = tokenType.pattern.exec(text.slice(startOffset));
      if (match) {
        tokens.push({
          image: match[0],
          startOffset,
          tokenType,
          words: tokenType === nlpCyrillicWord ?  morphAnalyzer(match[0]) : undefined,
          value: tokenType === nlpNumber ? Number(match[0]) : undefined
        });
        startOffset += match[0].length;
        found = true;
        break;
      }
    }

    if (!found) {
      throw new Error(`Invalid text "${text}"`);
    }
  }

  return separateByPOS(transform(tokens)).map( t => replaceUniform(replaceNumerals(t)) );
};
