export type TokenKind = 'space' | 'word' | 'punct' | 'nl' | 'spec';

const Punctuation = ['.', ',', '!', '?', ';'];

export class Token {
  readonly kind: TokenKind;
  readonly tkn: string;
  readonly startOffset: number;

  constructor (kind: TokenKind, tkn: string, startOffset: number) {
    this.kind = kind;
    this.tkn = tkn;
    this.startOffset = startOffset;
  }

  getDisplayText = () => {
    return this.kind === 'space' ? this.tkn.replace(' ', String.fromCharCode(9251)) : this.tkn;
  }
}

function charBelongs(s: string, i: number): TokenKind {
  if (s.charAt(i) === ' ' || s.charCodeAt(i) === 9) {
    return 'space';
  } else if (s.charCodeAt(i) === 13 || s.charCodeAt(i) === 10) {
    return 'nl';
  } else if (Punctuation.indexOf(s.charAt(i)) > -1) {
    return 'punct';
  } else if (s.charCodeAt(i) < 32) {
    return 'spec';
  } else {
    return 'word';
  }
}

export type Tokens = Token[];

export function tokenize(text: string): Tokens {
  let result: Tokens = [], b: number = 0;
  while (b < text.length) {
    let bKind: TokenKind = charBelongs(text, b), e: number = b + 1;
    while (e < text.length && bKind === charBelongs(text, e)) { e++; }
    if (e - b) { result.push(new Token(bKind, text.slice(b, e), b)); }
    b = e;
  }
  return result;
}