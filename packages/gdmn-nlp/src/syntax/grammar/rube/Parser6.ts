import { Parser } from "chevrotain";
import { morphTokens } from "../../rusMorphTokens";
import { IDescribedParser, ParserName } from "../../types";
import { idEntityToken } from '../../tokenizer';

/**
 * Может новый тип предложения для фраз типа "Есть/нет/нету телефона/phone"
 * Грамматика для фразы типа "Есть/нет/нету телефона/phone"
 */
export class Parser6 extends Parser implements IDescribedParser {
  constructor() {
    super({...morphTokens, idEntityToken});
    Parser.performSelfAnalysis(this);
  };

  public getName(): ParserName {
    return {
      label: 'Parser6',
      description: 'Безличное предложение'
    }
  }

  public sentence = this.RULE('sentence', () => this.SUBRULE(this.is) );

  public is = this.RULE('is', () => {
    this.SUBRULE(this.predicate);
    this.SUBRULE(this.directObject);
    }
  );

  public directObject = this.RULE('directObject', () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.noun) },
      { ALT: () => this.SUBRULE(this.idEntity) },
      
    ]);
  });

  public noun = this.RULE('noun', () => {
    this.OR([
      { ALT: () => this.CONSUME(morphTokens.NOUNAnimMascSingGent) },
      { ALT: () => this.CONSUME(morphTokens.NOUNAnimFemnSingGent) },
      { ALT: () => this.CONSUME(morphTokens.NOUNAnimNeutSingGent) },
      { ALT: () => this.CONSUME(morphTokens.NOUNAnimMascPlurGent) },
      { ALT: () => this.CONSUME(morphTokens.NOUNAnimFemnPlurGent) },
      { ALT: () => this.CONSUME(morphTokens.NOUNAnimNeutPlurGent) },

      { ALT: () => this.CONSUME(morphTokens.NOUNInanMascSingGent) },
      { ALT: () => this.CONSUME(morphTokens.NOUNInanFemnSingGent) },
      { ALT: () => this.CONSUME(morphTokens.NOUNInanNeutSingGent) },
      { ALT: () => this.CONSUME(morphTokens.NOUNInanMascPlurGent) },
      { ALT: () => this.CONSUME(morphTokens.NOUNInanFemnPlurGent) },
      { ALT: () => this.CONSUME(morphTokens.NOUNInanNeutPlurGent) },
    ]);
  });

  public idEntity = this.RULE('idEntity', () => this.CONSUME(idEntityToken) );

  public predicate = this.RULE('predicate', () => {
    return this.CONSUME(morphTokens.PARTNegt);
  });
  
};
