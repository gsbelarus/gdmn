import { Parser } from "chevrotain";
import { morphTokens } from "../../rusMorphTokens";
import { IDescribedParser, ParserName } from "../../types";
import { idEntityToken, Numeric, CyrillicWord } from '../../tokenizer';

/**
 * Грамматика для фразы типа "Name содержит ООО"
 */
export class VPParser3 extends Parser implements IDescribedParser {
  constructor() {
    super({...morphTokens, Numeric, idEntityToken, CyrillicWord});
    Parser.performSelfAnalysis(this);
  };

  public getName(): ParserName {
    return {
      label: 'VPParser3',
      description: 'Двусоставное простое предложение'
    }
  }

  public sentence = this.RULE('sentence', () => this.SUBRULE(this.tsm) );

  public tsm = this.RULE('tsm', () => {
    this.SUBRULE(this.subject);
    this.SUBRULE(this.predicate);
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
    this.SUBRULE(this.pv);
    this.OPTION( () => this.SUBRULE(this.directObject) );
  });

  public pv = this.RULE('pv', () => {
    this.OPTION( () => this.SUBRULE(this.negativeParticle) );
    this.SUBRULE(this.verb);
  });
  
  public negativeParticle = this.RULE('negativeParticle', () => {
    return this.CONSUME(morphTokens.PARTNegt);
  });

  public verb = this.RULE('verb', () => {
    this.OR([
      { ALT: () => this.CONSUME(morphTokens.VERBTranImpfPresSing3perIndc) },
      { ALT: () => this.CONSUME(morphTokens.VERBIntrImpfPresSing3perIndc) },
      { ALT: () => this.CONSUME(morphTokens.VERBIntrImpfPresPlur3perIndc) },
      { ALT: () => this.CONSUME(morphTokens.VERBTranImpfPresPlur3perIndc) },
      { ALT: () => this.CONSUME(morphTokens.ADVBMeas) },
    ]);
  });

  public directObject = this.RULE('directObject', () => {
    this.CONSUME(morphTokens.SearchValueToken);
  });
};
