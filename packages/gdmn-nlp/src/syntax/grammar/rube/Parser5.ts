import { Parser } from "chevrotain";
import { morphTokens } from "../../rusMorphTokens";
import { IDescribedParser, ParserName } from "../../types";
import { idEntityToken, DateToken, Numeric } from '../../tokenizer';

export class Parser5 extends Parser implements IDescribedParser {
  constructor() {
    super({...morphTokens, idEntityToken, DateToken, Numeric});
    Parser.performSelfAnalysis(this);
  };

  public getName(): ParserName {
    return {
      label: 'Parser5',
      description: 'Односоставное простое  именное предложение'
    }
  }

  public sentence = this.RULE('sentence', () => this.SUBRULE(this.np) );

  public np = this.RULE('np', () => this.SUBRULE(this.imperativeNP) );

  public imperativeNP = this.RULE('imperativeNP', () => {
    this.SUBRULE(this.subject);
    this.SUBRULE(this.pp);
  });

  public subject = this.RULE('subject', () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.noun) },
      { ALT: () => this.SUBRULE(this.idEntity) },
      
    ]);
  });

  public noun = this.RULE('noun', () => {
    this.OR([
      { ALT: () => this.CONSUME(morphTokens.NOUNAnimMascSingNomn) },
      { ALT: () => this.CONSUME(morphTokens.NOUNAnimFemnSingNomn) },
      { ALT: () => this.CONSUME(morphTokens.NOUNAnimNeutSingNomn) },
      { ALT: () => this.CONSUME(morphTokens.NOUNAnimMascPlurNomn) },
      { ALT: () => this.CONSUME(morphTokens.NOUNAnimFemnPlurNomn) },
      { ALT: () => this.CONSUME(morphTokens.NOUNAnimNeutPlurNomn) },

      { ALT: () => this.CONSUME(morphTokens.NOUNInanMascSingNomn) },
      { ALT: () => this.CONSUME(morphTokens.NOUNInanFemnSingNomn) },
      { ALT: () => this.CONSUME(morphTokens.NOUNInanNeutSingNomn) },
      { ALT: () => this.CONSUME(morphTokens.NOUNInanMascPlurNomn) },
      { ALT: () => this.CONSUME(morphTokens.NOUNInanFemnPlurNomn) },
      { ALT: () => this.CONSUME(morphTokens.NOUNInanNeutPlurNomn) },
    ]);
  });

  public idEntity = this.RULE('idEntity', () => this.CONSUME(idEntityToken) );

  public pp = this.RULE('pp', () => {
    this.SUBRULE(this.prepTime);
    this.CONSUME(DateToken);
  });

  public prepTime = this.RULE('prepTime', () => this.CONSUME(morphTokens.PREPTime) );
};
