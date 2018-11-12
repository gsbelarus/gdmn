import { IToken } from "chevrotain";
import { AnyWord } from "../morphology/morphology";

export interface IMorphToken extends IToken {
  word: AnyWord;
};

function isMorphToken(arg: any): arg is IMorphToken {
  return arg.word !== undefined;
};

