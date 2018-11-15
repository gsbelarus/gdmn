import { Phrase } from "./syntax";
import { AnyWord } from "../morphology/morphology";
import { combinatorialMorph } from "./lexer";
import { Parser } from "chevrotain";
import { parsers } from "./grammar/rube/parsers";
import { IDescribedParser } from "./types";

export type ParsedText = {
  readonly wordsSignatures: string[];
  readonly phrase?: Phrase<AnyWord>;
  readonly parser?: Parser & IDescribedParser;
  readonly errors?: any;
};

function internalParsePhrase(text: string, parser: any, visitor: any): ParsedText {
  let wordsSignatures: string[] = [];
  let phrase: Phrase<AnyWord> | undefined = undefined;
  let errors: any = undefined;

  combinatorialMorph(text).some( t => {
    parser.input = t;
    const value = parser.sentence();
    wordsSignatures = t.map( y => y.tokenType!.name );
    if (value && !parser.errors.length) {
      phrase = visitor.visit(value);
      return true;
    } else {
      errors = parser.errors;
      return false;
    }
  })

  if (phrase) {
    return {
      wordsSignatures,
      phrase
    }
  } else {
    return {
      wordsSignatures,
      errors
    }
  }
};

export function parsePhrase(text: string): ParsedText {
  for (let i = 0; i < parsers.length; i++) {
    const res = internalParsePhrase(text, parsers[i].parser, parsers[i].visitor);
    if (res.phrase) {
      return {...res, parser: parsers[i].parser};
    }
  }
  throw new Error(`Unknown grammar of phrase "${text}"`);
};

export function debugPhrase(text: string): ParsedText[] {
  const res: ParsedText[] = [];

  for (let i = 0; i < parsers.length; i++) {
    const parser = parsers[i].parser;
    const visitor = parsers[i].visitor;
    combinatorialMorph(text).forEach( t => {
      parser.input = t;
      const value = parser.sentence();
      const wordsSignatures = t.map( y => y.tokenType!.name );
      if (value && !parser.errors.length) {
        res.push({
          wordsSignatures,
          phrase: visitor.visit(value),
          parser
        });
      } else {
        res.push({
          wordsSignatures,
          parser,
          errors: parser.errors
        });
      }
    });
  }

  return res;
};
