import { RusPV, RusPSPRW, RusImperativeNP, RusPTimeP, RusPP } from "../../rusSyntax";
import { idEntityValue, DateValue, parseDate } from '../../value';
import { Parser5 } from './Parser5';

export const parser5 = new Parser5();

const BaseVisitor5 = parser5.getBaseCstVisitorConstructor();

export class Visitor5 extends BaseVisitor5 {
  constructor() {
    super();
    this.validateVisitor();
  }

  public sentence = (ctx: any) => {
    return this.visit(ctx.np);
  }

  public np = (ctx: any) => {
    return this.visit(ctx.imperativeNP);
  }

  public imperativeNP = (ctx: any) => {
    if (ctx.pp) {
      return new RusImperativeNP(this.visit(ctx.subject), this.visit(ctx.pp));
    } else {
      return new RusImperativeNP(this.visit(ctx.subject));
    }
  }

  public subject = (ctx: any) => {
    if(ctx.noun) {
      return this.visit(ctx.noun);
    } else {
      return this.visit(ctx.idEntity);
    }
  }
  
  public noun = (ctx: any) => {
    return ctx.NOUNAnimMascSingNomn ? ctx.NOUNAnimMascSingNomn[0].word
      : ctx.NOUNAnimFemnSingNomn ? ctx.NOUNAnimFemnSingNomn[0].word
      : ctx.NOUNAnimNeutSingNomn ? ctx.NOUNAnimNeutSingNomn[0].word
      : ctx.NOUNAnimMascPlurNomn ? ctx.NOUNAnimMascPlurNomn[0].word
      : ctx.NOUNAnimFemnPlurNomn ? ctx.NOUNAnimFemnPlurNomn[0].word
      : ctx.NOUNAnimNeutPlurNomn ? ctx.NOUNAnimNeutPlurNomn[0].word
      : ctx.NOUNInanMascSingNomn ? ctx.NOUNInanMascSingNomn[0].word
      : ctx.NOUNInanFemnSingNomn ? ctx.NOUNInanFemnSingNomn[0].word
      : ctx.NOUNInanNeutSingNomn ? ctx.NOUNInanNeutSingNomn[0].word
      : ctx.NOUNInanMascPlurNomn ? ctx.NOUNInanMascPlurNomn[0].word
      : ctx.NOUNInanFemnPlurNomn ? ctx.NOUNInanFemnPlurNomn[0].word
      : ctx.NOUNInanNeutPlurNomn ? ctx.NOUNInanNeutPlurNomn[0].word
      : undefined;
  }
  
  public idEntity = (ctx: any) => {
    return new idEntityValue(ctx.idEntityToken[0].image);
  }

  public pp = (ctx: any) => {
    return new RusPTimeP(this.visit(ctx.prepTime), new DateValue(ctx.DateToken[0].image, parseDate(ctx.DateToken[0].image)));
  }

  public prepTime = (ctx: any) => {
    return ctx.PREPTime[0].word;
  }

};

export const visitor5 = new Visitor5();
