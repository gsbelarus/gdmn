import { Parser } from "chevrotain";
import { morphTokens } from "../../rusMorphTokens";
import { IDescribedParser, ParserName } from "../../types";
import { idEntityToken } from '../../tokenizer';

export class Parser4 extends Parser implements IDescribedParser {
  constructor() {
    super({...morphTokens, idEntityToken});
    Parser.performSelfAnalysis(this);
  };

  public getName(): ParserName {
    return {
      label: 'Parser4',
      description: 'Двусоставное простое предложение'
    }
  }

  public sentence = this.RULE('sentence', () => this.SUBRULE(this.psprw) );

  public psprw = this.RULE('psprw', () => {
    this.SUBRULE(this.predicate);
    this.SUBRULE(this.subject);
    }
  );

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

  public predicate = this.RULE('predicate', () => {
    this.OPTION( () => this.SUBRULE(this.negativeParticle) );
    this.SUBRULE(this.verb);
  });

  /*
  public predicate = this.RULE('predicate', () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.pv) },
      { ALT: () => this.SUBRULE(this.verb) },
    ]);
    this.OPTION( () => this.SUBRULE(this.directObject) );
  });

  public pv = this.RULE('pv', () => {
    this.SUBRULE(this.negativeParticle);
    this.SUBRULE(this.verb);
  });
*/
  
  public negativeParticle = this.RULE('negativeParticle', () => {
    return this.CONSUME(morphTokens.PARTNegt);
  });

  public verb = this.RULE('verb', () => {
    this.OR([
      { ALT: () => this.CONSUME(morphTokens.VERBTranImpfPresSing3perIndc) },
      { ALT: () => this.CONSUME(morphTokens.VERBIntrImpfPresSing3perIndc) },
      { ALT: () => this.CONSUME(morphTokens.VERBIntrImpfPresPlur3perIndc) },
      { ALT: () => this.CONSUME(morphTokens.VERBTranImpfPresPlur3perIndc) },
    ]);
  });
};
