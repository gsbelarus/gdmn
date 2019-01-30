import { IToken } from "chevrotain";
import { AnyWord } from "../morphology/morphology";

export interface IMorphToken extends IToken {
  word: AnyWord;
  hsm?: AnyWord[][];
  cn?: AnyWord[][];
};

export interface ParserName {
  label: string;
  description: string;
};

export interface IDescribedParser {
  getName: () => ParserName;
};

export function isMorphToken(token: IToken | IMorphToken): token is IMorphToken {
  return (token as IMorphToken).word !== undefined;
};
