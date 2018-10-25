import { Lexer, createToken, IToken, TokenType } from "chevrotain";
import { AnyWord } from "../morphology/morphology";
import { RusGender, RusCase, RusAdjectiveCategory } from "../morphology/types";
import { RusNoun, RusAdjective } from "..";

export interface IMorphToken extends IToken {
  word: AnyWord;
};

export interface ITokenTypes {
  [name: string]: TokenType
};

const signatures = [
  'VERBTranPerfSingImpr',
  'PREPPlce',
  'CONJ'
];

export const morphTokens = (() => {
  [true, false].forEach( an =>
    [RusGender.Masc, RusGender.Femn, RusGender.Neut].forEach( gender =>
      [true, false].forEach( singular =>
        [RusCase.Nomn, RusCase.Gent, RusCase.Datv, RusCase.Accs, RusCase.Ablt, RusCase.Loct].forEach( grammCase =>
          signatures.push(RusNoun.getSignature(an, gender, singular, grammCase))
        )
      )
    )
  );

  /**
   * Прилагательные, единственное число.
   */
  [RusAdjectiveCategory.Qual, RusAdjectiveCategory.Pron].forEach( category =>
    [RusGender.Masc, RusGender.Femn, RusGender.Neut].forEach( gender =>
      [RusCase.Nomn, RusCase.Gent, RusCase.Datv, RusCase.Accs, RusCase.Ablt, RusCase.Loct].forEach( grammCase => {
        signatures.push(RusAdjective.getSignature(false, category, gender, true, grammCase));
      })
    )
  );

  /**
   * Прилагательные, множественное число.
   */
  [RusAdjectiveCategory.Qual, RusAdjectiveCategory.Pron, RusAdjectiveCategory.Rel].forEach( category =>
    [RusCase.Nomn, RusCase.Gent, RusCase.Datv, RusCase.Accs, RusCase.Ablt, RusCase.Loct].forEach( grammCase => {
      signatures.push(RusAdjective.getSignature(false, category, undefined, false, grammCase));
    })
  );

  return signatures.reduce(
    (p, s) => {
      p[s] = createToken({ name: s, pattern: Lexer.NA });
      return p;
    },
    {} as ITokenTypes
  );
})();