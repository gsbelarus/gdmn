import { INLPTokenType, INLPToken } from "./types";
import { morphAnalyzer } from "../morphology/morphAnalyzer";

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

export function nlpTokenize(text: string): INLPToken[] {
  const res: INLPToken[] = [];
  let startOffset = 0;

  while (startOffset < text.length) {
    let found = false;
    for (const tokenType of allTokens) {
      const match = tokenType.pattern.exec(text.slice(startOffset));
      if (match) {
        res.push({
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

  return res;
};
