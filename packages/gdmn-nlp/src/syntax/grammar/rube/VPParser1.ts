import { Parser } from "chevrotain";
import { morphTokens } from "../../rusMorphTokens";
import { IDescribedParser, ParserName } from "../../types";

/**
 * Грамматика для фразы типа "Покажи все организации из Минска"
 */
export class VPParser1 extends Parser implements IDescribedParser {
  constructor() {
    super(morphTokens);
    Parser.performSelfAnalysis(this);
  };

  public getName(): ParserName {
    return {
      label: 'VPParser1',
      description: 'Глагольное предложение с императивных глаголом и сказуемым, выраженным существительным с дополнением (дополнениями). Пример: Покажи [все] организации [из Минска [или Пинска]].'
    };
  }

  public sentence = this.RULE('sentence', () => this.SUBRULE(this.vp) );

  public vp = this.RULE('vp', () => this.SUBRULE(this.imperativeVP) );

  public imperativeVP = this.RULE('imperativeVP', () => {
    this.SUBRULE(this.imperativeVerb);
    this.SUBRULE(this.imperativeNP);
  });

  public imperativeVerb = this.RULE('imperativeVerb', () => this.CONSUME(morphTokens.VERBTranPerfSingImpr) );

  public imperativeNP = this.RULE('imperativeNP', () => {
    this.SUBRULE(this.qualImperativeNoun);
    this.OPTION( () => this.SUBRULE(this.pp) );
  });

  public qualImperativeNoun = this.RULE('qualImperativeNoun', () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.qualImperativeANPNoun) },
      { ALT: () => this.SUBRULE(this.qualImperativeNNPNoun) },
    ]);
  });

  public qualImperativeANPNoun = this.RULE('qualImperativeANPNoun', () => {
    this.OPTION( () => this.SUBRULE(this.imperativeDets) );
    this.SUBRULE(this.imperativeNoun);
  });

  public qualImperativeNNPNoun = this.RULE('qualImperativeNNPNoun', () => {
    this.SUBRULE(this.imperativeNNPNumr);
    this.SUBRULE(this.imperativeNNPNoun);
  });


  public imperativeDets = this.RULE('imperativeDets', () => {
    this.SUBRULE(this.imperativeDet);
  });

  public imperativeDet = this.RULE('imperativeDet', () => {
    this.OR([
      { ALT: () => this.CONSUME(morphTokens.ADJFAProPlurAccs) },
      { ALT: () => this.CONSUME(morphTokens.ADJFQualPlurAccs) },
      { ALT: () => this.CONSUME(morphTokens.ADJFRelvPlurAccs) },
    ]);
  });

  public imperativeNNPNumr = this.RULE('imperativeNNPNumr', () => {
    this.OR([
      { ALT: () => this.CONSUME(morphTokens.NUMRInanMascSingAccs) },
      { ALT: () => this.CONSUME(morphTokens.NUMRInanFemnSingAccs) },
      { ALT: () => this.CONSUME(morphTokens.NUMRInanNeutSingAccs) },
      { ALT: () => this.CONSUME(morphTokens.NUMRAnimMascSingAccs) },
      { ALT: () => this.CONSUME(morphTokens.NUMRAnimFemnSingAccs) },
      { ALT: () => this.CONSUME(morphTokens.NUMRAnimNeutSingAccs) },
      { ALT: () => this.CONSUME(morphTokens.NUMRInanPlurGent)},
    ]);
  });

  public imperativeNNPNoun = this.RULE('imperativeNNPNoun', () => {
    this.OR([
      { ALT: () => this.CONSUME(morphTokens.NOUNAnimMascSingAccs) },
      { ALT: () => this.CONSUME(morphTokens.NOUNAnimFemnSingAccs) },
      { ALT: () => this.CONSUME(morphTokens.NOUNAnimNeutSingAccs) },
      { ALT: () => this.CONSUME(morphTokens.NOUNAnimMascPlurAccs) },
      { ALT: () => this.CONSUME(morphTokens.NOUNAnimFemnPlurAccs) },
      { ALT: () => this.CONSUME(morphTokens.NOUNAnimNeutPlurAccs) },

      { ALT: () => this.CONSUME(morphTokens.NOUNInanMascSingGent) },
      { ALT: () => this.CONSUME(morphTokens.NOUNInanFemnSingGent) },
      { ALT: () => this.CONSUME(morphTokens.NOUNInanNeutSingGent) },
      { ALT: () => this.CONSUME(morphTokens.NOUNInanMascPlurGent) },
      { ALT: () => this.CONSUME(morphTokens.NOUNInanFemnPlurGent) },
      { ALT: () => this.CONSUME(morphTokens.NOUNInanNeutPlurGent) },

      { ALT: () => this.CONSUME(morphTokens.NOUNInanMascSingAccs) },
      { ALT: () => this.CONSUME(morphTokens.NOUNInanFemnSingAccs) },
      { ALT: () => this.CONSUME(morphTokens.NOUNInanNeutSingAccs) },
      { ALT: () => this.CONSUME(morphTokens.NOUNInanMascPlurAccs) },
      { ALT: () => this.CONSUME(morphTokens.NOUNInanFemnPlurAccs) },
      { ALT: () => this.CONSUME(morphTokens.NOUNInanNeutPlurAccs) },
    ]);

  });

  public imperativeNoun = this.RULE('imperativeNoun', () => this.SUBRULE(this.nounAccs) );

  public nounAccs = this.RULE('nounAccs', () => {
    this.OR([
      { ALT: () => this.CONSUME(morphTokens.NOUNAnimMascPlurAccs) },
      { ALT: () => this.CONSUME(morphTokens.NOUNAnimFemnPlurAccs) },
      { ALT: () => this.CONSUME(morphTokens.NOUNAnimNeutPlurAccs) },
      { ALT: () => this.CONSUME(morphTokens.NOUNInanMascPlurAccs) },
      { ALT: () => this.CONSUME(morphTokens.NOUNInanFemnPlurAccs) },
      { ALT: () => this.CONSUME(morphTokens.NOUNInanNeutPlurAccs) },
    ]);
  });

  public pp = this.RULE('pp', () => {
    this.SUBRULE(this.prep);
    this.SUBRULE(this.ppNoun);
  });

  public prep = this.RULE('prep', () => this.CONSUME(morphTokens.PREPPlce) );

  public ppNoun = this.RULE('ppNoun', () => {
    this.SUBRULE(this.nounGent);
  });

  public nounGent = this.RULE('nounGent', () => {
    this.OR([
      { ALT: () => this.CONSUME(morphTokens.NOUNInanMascSingGent) },
      { ALT: () => this.CONSUME(morphTokens.NOUNInanFemnSingGent) },
      { ALT: () => this.CONSUME(morphTokens.NOUNInanNeutSingGent) },
      { ALT: () => this.CONSUME(morphTokens.NOUNInanMascPlurGent) },
      { ALT: () => this.CONSUME(morphTokens.NOUNInanFemnPlurGent) },
      { ALT: () => this.CONSUME(morphTokens.NOUNInanNeutPlurGent) },
    ]);
  });
};