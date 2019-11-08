import { AnyWords } from "..";

export interface INLPTokenType {
  name: string;
  pattern: RegExp;
};

export interface INLPToken {
  image: string;
  startOffset: number;
  tokenType: INLPTokenType;
  words?: AnyWords;
  uniformPOS?: INLPToken[];
  numerals?: INLPToken[];
  value?: number;
};
