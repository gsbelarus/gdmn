import { Phrase } from "./syntax";
import { AnyWord } from "../morphology/morphology";
import { combinatorialMorph } from "./lexer";
import { vpParser1, vpVisitor1 } from "./grammar/rube/VPParser1Visitor";
import { vpParser2, vpVisitor2 } from "./grammar/rube/VPParser2Visitor";
import { Parser } from "chevrotain";

export type ParsedText = {
  readonly wordsSignatures: string[];
  readonly phrase?: Phrase<AnyWord>;
  readonly parser?: Parser;
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

const parsers = [
  {
    parser: vpParser1,
    visitor: vpVisitor1
  },
  {
    parser: vpParser2,
    visitor: vpVisitor2
  },
];

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
