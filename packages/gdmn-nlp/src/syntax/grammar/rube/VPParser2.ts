import { Parser } from "chevrotain";
import { morphTokens } from "../../rusMorphTokens";

export class VPParser2 extends Parser {
  constructor() {
    super(morphTokens);
    Parser.performSelfAnalysis(this);
  };

  public sentence = this.RULE('sentence', () => this.SUBRULE(this.vp) );

  public vp = this.RULE('vp', () => this.SUBRULE(this.imperativeVP) );

  public imperativeVP = this.RULE('imperativeVP', () => {
    this.SUBRULE(this.imperativeVerb);
    this.SUBRULE(this.pp);
    /*
    this.OPTION(
      () => {
        this.MANY(
          () => {
            this.CONSUME(morphTokens.Comma);
            this.SUBRULE(this.pp);
          }
        );
      }
    );
    */
  });

  public imperativeVerb = this.RULE('imperativeVerb', () => this.CONSUME(morphTokens.VERBTranPerfSingImpr) );

  public pp = this.RULE('pp', () => {
    this.SUBRULE(this.prep);
    this.SUBRULE(this.nounDatv);
  });

  public prep = this.RULE('prep', () => this.CONSUME(morphTokens.PREPObjt) );

  public nounDatv = this.RULE('nounDatv', () => {
    this.OR([
    { ALT: () => this.CONSUME(morphTokens.NOUNInanMascSingDatv) },
    { ALT: () => this.CONSUME(morphTokens.NOUNInanFemnSingDatv) },
    { ALT: () => this.CONSUME(morphTokens.NOUNInanNeutSingDatv) }
    ]);
  });
};
