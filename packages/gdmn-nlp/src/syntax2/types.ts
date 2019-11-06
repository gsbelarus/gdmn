export interface ITokenType {
  name: string
  pattern: RegExp
}

export interface IToken {
  image: string
  startOffset: number
  tokenType: ITokenType
}
