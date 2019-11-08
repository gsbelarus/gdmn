import { INLPTokenType, INLPToken } from "./types";
import { morphAnalyzer } from "../morphology/morphAnalyzer";
import { RusNoun, RusVerb, RusConjunction, AnyWord } from "..";
import { RusAdjective } from "../morphology/rusAdjective";

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
  pattern: /^[0-9]+/
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
  nlpLineBreak,
  nlpWhiteSpace,
  nlpDateToken,
  nlpNumber,
  nlpCyrillicWord,
  nlpPunctuationMark,
  nlpComma,
  nlpIDToken
];

const isUniformPOS = (w1: AnyWord, w2: AnyWord) => {
  if (w1 instanceof RusNoun && w2 instanceof RusNoun) {
    return w1.grammCase === w2.grammCase;
  }

  return w1.getSignature() === w2.getSignature();
};

export function nlpTokenize(text: string): INLPToken[] {
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
          words: tokenType === nlpCyrillicWord ?  morphAnalyzer(match[0]) : undefined
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
