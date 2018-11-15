import { IToken } from "chevrotain";
import { AnyWord } from "../morphology/morphology";

export interface IMorphToken extends IToken {
  word: AnyWord;
};

export interface ParserName {
  label: string;
  description: string;
};

export interface IDescribedParser {
  getName: () => ParserName;
};
