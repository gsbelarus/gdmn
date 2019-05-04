import { Lexer, createToken, TokenType } from "chevrotain";
import { RusGender, RusCase, RusAdjectiveCategory, PrepositionType, ParticleType } from "../morphology/types";
import { RusNoun } from "../morphology/rusNoun";
import { RusAdjective } from "../morphology/rusAdjective";
import { RusPreposition } from "../morphology/rusPreposition";
import { RusNumeral } from "../morphology/rusNumeral";
import { RusParticle } from '../morphology/rusParticle';

export interface ITokenTypes {
  [name: string]: TokenType
};

export const morphTokens = (() => {

  const signatures = [
    'VERBTranPerfSingImpr',
    'VERBTranImpfSingImpr',
    'VERBTranImpfPresSing3perIndc',
    'VERBIntrImpfPresSing3perIndc',
    'VERBIntrImpfPresPlur3perIndc',
    'VERBTranImpfPresPlur3perIndc',
    'ADVBGoal',
    'ADVBMeas',
    'Comma',
    'CONJ',
    'DefinitionToken',
    'SearchValueToken'
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
   * Частицы
   */
  [
    ParticleType.Pointing,
    ParticleType.Specifying,
    ParticleType.Amplifying,
    ParticleType.ExcretoryRestrictive,
    ParticleType.ModalWilled,
    ParticleType.Affirmative,
    ParticleType.Negative,
    ParticleType.Interrogative,
    ParticleType.Comparative,
    ParticleType.Emotive,
    ParticleType.Shaping
  ].forEach( particleType =>
    signatures.push(RusParticle.getSignature(particleType))
  );

/**
 * Числительные
 */

  [true, false].forEach( animate => {
    signatures.push(RusNumeral.getSignature(RusCase.Accs, undefined, animate, undefined));
  });

  [RusGender.Masc, RusGender.Femn, RusGender.Neut].forEach( gender => {
    [true, false].forEach( animate => {
      signatures.push(RusNumeral.getSignature(RusCase.Accs, undefined, animate, gender));
    })
  });

  [RusCase.Nomn, RusCase.Gent, RusCase.Accs, RusCase.Datv, RusCase.Ablt, RusCase.Loct].forEach(  grammCase =>
    signatures.push(RusNumeral.getSignature(grammCase, undefined, undefined, undefined))
  );

  return signatures.reduce(
    (p, s) => {
      p[s] = createToken({ name: s, pattern: Lexer.NA });
      return p;
    },
    {} as ITokenTypes
  );
})();
