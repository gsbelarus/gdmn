import { createToken, Lexer, IToken, TokenType } from 'chevrotain';

export const WhiteSpace: TokenType = createToken({
  name: 'WhiteSpace',
  pattern: /[ \t]+/,
  line_breaks: false
});

export const LineBreak: TokenType = createToken({
  name: 'LineBreak',
  pattern: /[\n\r]+/,
  line_breaks: true
});

export const Comma: TokenType = createToken({
  name: 'Comma',
  pattern: /,/
});

export const PunctuationMark: TokenType = createToken({
  name: 'PunctuationMark',
  pattern: /[.?!]{1}/
});

export const CyrillicWord: TokenType = createToken({
  name: 'CyrillicWord',
  pattern: /(?:[А-Яа-я]+-[А-Яа-я]+)|(?:[А-Яа-я]+)/
});

export const Other: TokenType = createToken({
  name: 'Other',
  pattern: /[A-Za-z0-9]+/
})

const allTokens: TokenType[] = [
  LineBreak,
  WhiteSpace,
  PunctuationMark,
  Comma,
  CyrillicWord,
  Other
];

export const tokenizer = new Lexer(allTokens);

export function tokenize(text: string): IToken[] {
  const tokenized = tokenizer.tokenize(text);

  if (tokenized.errors.length) {
    throw new Error(`Invalid text "${text}". Tokenizer errors: ${JSON.stringify(tokenized.errors, undefined, 2)}`);
  }

  return tokenized.tokens;
}

