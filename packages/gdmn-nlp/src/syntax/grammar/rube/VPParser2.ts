import { Parser } from "chevrotain";
import { morphTokens } from "../../rusMorphTokens";
import { IDescribedParser, ParserName } from "../../types";

export class VPParser2 extends Parser implements IDescribedParser {
  constructor() {
    super(morphTokens);
    Parser.performSelfAnalysis(this);
  };

  public getName(): ParserName {
    return {
      label: 'VPParser2',
      description: 'Глагольное предложение с императивным глаголом. Без сказуемого. С дополнениями в виде существительного с предлогом. Пример: Сортируй по названию.'
    }
  }

  public sentence = this.RULE('sentence', () => this.SUBRULE(this.vp) );

  public vp = this.RULE('vp', () => this.SUBRULE(this.imperativeVP) );

  public imperativeVP = this.RULE('imperativeVP', () => {
    this.SUBRULE(this.imperativeVerb);
    this.SUBRULE(this.pp);
    this.OPTION(
      () => {
            this.CONSUME(morphTokens.Comma);
            this.SUBRULE1(this.pp);
          }
    );
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
