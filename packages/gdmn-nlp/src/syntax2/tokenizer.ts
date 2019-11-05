import { ITokenType, IToken } from "./types"

export const WhiteSpace: ITokenType = {
  name: 'WhiteSpace',
  pattern: /^[ \t]+/
}

export const LineBreak: ITokenType = {
  name: 'LineBreak',
  pattern: /^((\n\r)|(\n))/
}

export const Comma: ITokenType = {
  name: 'Comma',
  pattern: /^,/
}

export const PunctuationMark: ITokenType = {
  name: 'PunctuationMark',
  pattern: /^[.?!]/
}

export const CyrillicWord: ITokenType = {
  name: 'CyrillicWord',
  pattern: /^((?:[А-ЯЎІЁа-яўіё]+-[А-ЯЎІЁа-яўіё]+)|(?:[А-ЯЎІЁа-яўіё]+))/
}

export const Number: ITokenType = {
  name: 'Number',
  pattern: /^[0-9]+/
}

export const DateToken: ITokenType = {
  name: 'DateToken',
  pattern: /^(31|30|2[0-9]|1[0-9]|0[1-9]|[1-9]){1}\.(12|11|10|0[1-9]|[1-9]){1}\.([1-2]{1}[0-9]{3}|[0-9]{2})/
}

export const IDToken: ITokenType = {
  name: 'IDToken',
  pattern: /^[A-Za-z$_]+[A-Za-z0-9$_]*/
}

const allTokens = [
  LineBreak,
  WhiteSpace,
  DateToken,
  Number,
  CyrillicWord,
  PunctuationMark,
  Comma,
  IDToken
]

export function tokenize(text: string): IToken[] {
  const res: IToken[] = []
  let startOffset = 0

  while (startOffset < text.length) {
    let found = false
    for (const tokenType of allTokens) {
      const match = tokenType.pattern.exec(text.slice(startOffset))
      if (match) {
        res.push({
          image: match[0],
          startOffset,
          tokenType
        })
        startOffset += match[0].length
        found = true
        break
      }
    }

    if (!found) {
      throw new Error(`Invalid text "${text}"`)
    }
  }

  return res
}
