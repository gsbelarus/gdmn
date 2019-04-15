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
  pattern: /(?:[А-ЯЎІЁа-яўіё]+-[А-ЯЎІЁа-яўіё]+)|(?:[А-ЯЎІЁа-яўіё]+)/
});

export const Numeric: TokenType = createToken({
  name: 'Numeric',
  pattern: /[0-9]+/
});

export const DateToken: TokenType = createToken({
  name: 'DateToken',
  pattern: /(31|30|2[0-9]|1[0-9]|0[1-9]|[1-9]){1}\.(12|11|10|0[1-9]|[1-9]){1}\.([1-2]{1}[0-9]{3}|[0-9]{2})/
});

export const idEntityToken: TokenType = createToken({
  name: 'idEntityToken',
  pattern: /[A-Za-z]+/
});

const allTokens: TokenType[] = [
  LineBreak,
  WhiteSpace,
  DateToken,
  Numeric,
  CyrillicWord,
  PunctuationMark,
  Comma,
  idEntityToken
];

export const tokenizer = new Lexer(allTokens);

export function tokenize(text: string): IToken[] {
  const tokenized = tokenizer.tokenize(text);

  if (tokenized.errors.length) {
    throw new Error(`Invalid text "${text}". Tokenizer errors: ${JSON.stringify(tokenized.errors, undefined, 2)}`);
  }

  return tokenized.tokens;
}
