import { Parser } from "chevrotain";
import { morphTokens } from "../../rusMorphTokens";

/**
 * Грамматика для фразы типа "Покажи все организации из Минска"
 */
export class VPParser1 extends Parser {
  constructor() {
    super(morphTokens);
    Parser.performSelfAnalysis(this);
  };

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
    this.OPTION( () => this.SUBRULE(this.imperativeDets) );
    this.SUBRULE(this.imperativeNoun);
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
    this.OPTION( () => {
      this.CONSUME(morphTokens.CONJ);
      this.SUBRULE(this.ppNoun);
    });
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