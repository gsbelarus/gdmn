import { Parser } from "chevrotain";
import { morphTokens } from "../../rusMorphTokens";
import { IDescribedParser, ParserName } from "../../types";
import { DateToken } from "../../..";
import { Numeric, idEntityToken } from '../../tokenizer';

/**
 * Грамматика для фразы типа "Покажи все организации из Минска"
 */
export class VPParser1 extends Parser implements IDescribedParser {
  constructor() {
    super({...morphTokens, DateToken, Numeric, idEntityToken});
    Parser.performSelfAnalysis(this);
  };

  public getName(): ParserName {
    return {
      label: 'VPParser1',
      description: 'Глагольное предложение с императивных глаголом и сказуемым, выраженным существительным с дополнением (дополнениями). Пример: Покажи [все][10][10 первых] организации [из Минска [или Пинска]].'
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
      this.SUBRULE(this.qualImperativeANPNoun);
  });

  public qualImperativeANPNoun = this.RULE('qualImperativeANPNoun', () => {
    this.OPTION( () => this.SUBRULE(this.imperativeDets) );
    this.SUBRULE(this.imperativeNouns);
  });

  public imperativeDets = this.RULE('imperativeDets', () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.imperativeDet) },
      { ALT: () => this.SUBRULE(this.imperativeDefin) },
    ]);
  });

  public imperativeDet = this.RULE('imperativeDet', () => {
    this.OR([
      { ALT: () => this.CONSUME(morphTokens.ADJFAProPlurAccs) },
      { ALT: () => this.CONSUME(morphTokens.ADJFQualPlurAccs) },
      { ALT: () => this.CONSUME(morphTokens.ADJFRelvPlurAccs) },
    ]);
  });

  public imperativeDefin  = this.RULE('imperativeDefin', () => {
    this.CONSUME(morphTokens.DefinitionToken);
  });
  
  public imperativeNouns = this.RULE('imperativeNouns', () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.nounAccs) },
      { ALT: () => this.SUBRULE(this.nounGent) },
      { ALT: () => this.SUBRULE(this.idEntity) },
    ]);
  });

  public idEntity = this.RULE('idEntity', () => this.CONSUME(idEntityToken) );
  
  public imperativeNoun = this.RULE('imperativeNoun', () => this.SUBRULE(this.nounAccs) );

  public nounAccs = this.RULE('nounAccs', () => {
    this.OR([
      { ALT: () => this.CONSUME(morphTokens.NOUNAnimMascPlurAccs) },
      { ALT: () => this.CONSUME(morphTokens.NOUNAnimFemnPlurAccs) },
      { ALT: () => this.CONSUME(morphTokens.NOUNAnimNeutPlurAccs) },
      { ALT: () => this.CONSUME(morphTokens.NOUNInanMascPlurAccs) },
      { ALT: () => this.CONSUME(morphTokens.NOUNInanFemnPlurAccs) },
      { ALT: () => this.CONSUME(morphTokens.NOUNInanNeutPlurAccs) },
      { ALT: () => this.CONSUME(morphTokens.NOUNAnimMascSingAccs) },
      { ALT: () => this.CONSUME(morphTokens.NOUNAnimFemnSingAccs) },
      { ALT: () => this.CONSUME(morphTokens.NOUNAnimNeutSingAccs) },
      { ALT: () => this.CONSUME(morphTokens.NOUNInanMascSingAccs) },
      { ALT: () => this.CONSUME(morphTokens.NOUNInanFemnSingAccs) },
      { ALT: () => this.CONSUME(morphTokens.NOUNInanNeutSingAccs) },
    ]);
  });

  public pp = this.RULE('pp', () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.ppPlace) },
      { ALT: () => this.SUBRULE(this.ppTime) },
    ]);
  });

  public ppPlace = this.RULE('ppPlace', () => {
    this.SUBRULE(this.prepPlace);
    this.SUBRULE(this.ppNoun);
  });

  public prepPlace = this.RULE('prepPlace', () => this.CONSUME(morphTokens.PREPPlce) );

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

  public ppTime = this.RULE('ppTime', () => {
    this.SUBRULE(this.prepTime);
    this.CONSUME(DateToken);
  });

  public prepTime = this.RULE('prepTime', () => this.CONSUME(morphTokens.PREPTime) );
};
