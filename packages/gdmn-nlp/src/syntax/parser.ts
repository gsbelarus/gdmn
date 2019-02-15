import { Phrase } from "./syntax";
import { AnyWord } from "../morphology/morphology";
import { combinatorialMorph } from "./lexer";
import { Parser } from "chevrotain";
import { parsers } from "./grammar/rube/parsers";
import { IDescribedParser, IMorphToken } from "./types";
import { RusNoun } from "../morphology/rusNoun";
import { RusConjunction } from "../morphology/rusConjunction";
import { RusNumeral } from "../morphology/rusNumeral";
import { RusCase } from "../morphology/types";

export type ParsedText<W extends AnyWord = AnyWord> = {
  readonly wordsSignatures: string[];
  readonly phrase?: Phrase<W>;
  readonly parser?: Parser & IDescribedParser;
  readonly errors?: any;
};

function internalParsePhrase(
  text: string,
  parser: any,
  visitor: any
): ParsedText {
  let wordsSignatures: string[] = [];
  let phrase: Phrase<AnyWord> | undefined = undefined;
  let errors: any = undefined;

  combinatorialMorph(text).some(t => {
    parser.input = t;
    const value = parser.sentence();
    wordsSignatures = t.map(y => y.tokenType!.name);
    if (value && !parser.errors.length) {
      phrase = visitor.visit(value);
      return true;
    } else {
      errors = parser.errors;
      return false;
    }
  });

  if (phrase) {
    return {
      wordsSignatures,
      phrase
    };
  } else {
    return {
      wordsSignatures,
      errors
    };
  }
}

export function parsePhrase<W extends AnyWord = AnyWord>(
  text: string
): ParsedText<W> {
  for (let i = 0; i < parsers.length; i++) {
    const res = internalParsePhrase(
      text,
      parsers[i].parser,
      parsers[i].visitor
    );
    if (res.phrase) {
      return <ParsedText<W>>{ ...res, parser: parsers[i].parser };
    }
  }
  throw new Error(`Unknown grammar of phrase "${text}"`);
}

export function debugPhrase(text: string): ParsedText[] {
  const res: ParsedText[] = [];

  for (let i = 0; i < parsers.length; i++) {
    const parser = parsers[i].parser;
    const visitor = parsers[i].visitor;
    combinatorialMorph(text).forEach(t => {
      parser.input = t;
      const value = parser.sentence();
      const wordsSignatures = t.map(y => y.tokenType!.name);
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
}

/**
 * Функция вернет массив однородных членов, если они есть в токене,
 * или слово из токена, если однородных членов нет.
 */
export function tokenToWordOrHomogeneous(
  t?: IMorphToken
): AnyWord | AnyWord[] | undefined {
  if (!t) {
    return undefined;
  }

  const word = t.word;

  if (!(word instanceof RusNoun)) {
    throw new Error(
      `Only rus nouns supported. Word ${word.getText()} encountered.`
    );
  }

  if (!t.hsm || !t.hsm.length) {
    return word as RusNoun;
  }

  return t.hsm.reduce(
    (prev, w) => {
      if (w[0] instanceof RusConjunction) {
        return [...prev, w[0] as RusConjunction];
      }

      const found = w.find(
        n => (n as RusNoun).grammCase === (word as RusNoun).grammCase
      );

      if (found) {
        return [...prev, found as RusNoun];
      }

      throw new Error(`Invalid homogeneous structure`);
    },
    [word as RusNoun]
  );
}

export function tokenToWordOrCompositeNumerals(
  t?: IMorphToken
): AnyWord | AnyWord[] | undefined {
  if (!t) {
    return undefined;
  }

  const word = t.word;

  if (!(word instanceof RusNumeral)) {
    throw new Error(
      `Only rus numerals supported. Word ${word.getText()} encountered.`
    );
  }

  if (!t.cn || !t.cn.length) {
    return word as RusNumeral;
  }

  t.cn.reduce( (prev, curr) => {
    if((prev[0] as RusNumeral).lexeme.value.toString().length <= (curr[0] as RusNumeral).lexeme.value.toString().length) {
      throw new Error(`Invalid composite numerals structure`);
    }
    return curr;
  })

  return t.cn.reduce(
    (prev, w) => {
      const found = w.find(
        n => (n as RusNumeral).grammCase === (word as RusNumeral).grammCase
          || (n as RusNumeral).grammCase === RusCase.Gent
      );
      if (found) {
        return [...prev, found as RusNumeral];
      }

      throw new Error(`Invalid composite numerals structure`);
    },
    []
  );
}
