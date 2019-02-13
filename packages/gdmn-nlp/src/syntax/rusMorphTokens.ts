import { Lexer, createToken, TokenType } from "chevrotain";
import { RusGender, RusCase, RusAdjectiveCategory, PrepositionType } from "../morphology/types";
import { RusNoun } from "../morphology/rusNoun";
import { RusAdjective } from "../morphology/rusAdjective";
import { RusPreposition } from "../morphology/rusPreposition";
import { RusNumeral } from "../morphology/rusNumeral";

export interface ITokenTypes {
  [name: string]: TokenType
};

export const morphTokens = (() => {

  const signatures = [
    'VERBTranPerfSingImpr',
    'Numeric',
    'VERBTranImpfSingImpr',
    'ADVBGoal',
    'Comma',
    'CONJ'
  ];

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

  /**
   * Предлоги
   */
  [
    PrepositionType.Place,
    PrepositionType.Object,
    PrepositionType.Time,
    PrepositionType.Reason,
    PrepositionType.Goal,
    PrepositionType.Comparative
  ].forEach( prepositionType =>
    signatures.push(RusPreposition.getSignature(prepositionType))
  );

/**
 * Числительные
 */

  [true, false].forEach( animate => {
    signatures.push(RusNumeral.getSignature(true, RusCase.Accs, animate, undefined));
  });

  [RusGender.Masc, RusGender.Femn, RusGender.Neut].forEach( gender => {
    [true, false].forEach( animate => {
      signatures.push(RusNumeral.getSignature(true, RusCase.Accs, animate, gender));
    }) 
  });

  [RusCase.Nomn, RusCase.Gent, RusCase.Accs, RusCase.Datv, RusCase.Ablt, RusCase.Loct].forEach(  grammCase =>
    [true, false].forEach( singular => {
      signatures.push(RusNumeral.getSignature(singular, grammCase, undefined, undefined));
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