import { Phrase } from "./syntax";
import { AnyWord } from "../morphology/morphology";
import { combinatorialMorph } from "./lexer";
import { vpParser1, vpVisitor1 } from "./grammar/rube/VPParser1Visitor";
import { vpParser2, vpVisitor2 } from "./grammar/rube/VPParser2Visitor";

export type ParsedText = {
  readonly wordsSignatures: string[];
  readonly phrase?: Phrase<AnyWord>;
};

function internalParsePhrase(text: string, parser: any, visitor: any): ParsedText {
  let wordsSignatures: string[] = [];
  let phrase: Phrase<AnyWord> | undefined = undefined;

  combinatorialMorph(text).some( t => {
    console.log(`parser input: ${t.map( tok => tok.image ).join(' ')} -- ${t.map( tok => tok.tokenType!.name ).join('-')}`);
    parser.input = t;
    const value = parser.sentence();
    wordsSignatures = t.map( y => y.tokenType!.name );
    if (value && !parser.errors.length) {
      phrase = visitor.visit(value);
      return true;
    } else {
      console.log(JSON.stringify(parser.errors.map( (e: any) => e.message ), undefined, 2));
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
      wordsSignatures
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
      return res;
    }
  }
  throw new Error(`Unknown grammar of phrase ${text}`);
};
