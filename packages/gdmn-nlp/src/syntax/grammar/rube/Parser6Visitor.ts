import { RusPV, RusIS } from "../../rusSyntax";
import { idEntityValue } from '../../value';
import { Parser6 } from './Parser6';

export const parser6 = new Parser6();

const BaseVisitor6 = parser6.getBaseCstVisitorConstructor();

export class Visitor6 extends BaseVisitor6 {
  constructor() {
    super();
    this.validateVisitor();
  }

  public sentence = (ctx: any) => {
    return this.visit(ctx.is);
  }

  public is = (ctx: any) => {
    return new RusIS(this.visit(ctx.predicate), this.visit(ctx.directObject));
  }

  public directObject = (ctx: any) => {
    if(ctx.noun) {
      return this.visit(ctx.noun);
    } else {
      return this.visit(ctx.idEntity);
    }
  }

  public noun = (ctx: any) => {
    return ctx.NOUNAnimMascSingGent ? ctx.NOUNAnimMascSingGent[0].word
      : ctx.NOUNAnimFemnSingGent ? ctx.NOUNAnimFemnSingGent[0].word
      : ctx.NOUNAnimNeutSingGent ? ctx.NOUNAnimNeutSingGent[0].word
      : ctx.NOUNAnimMascPlurGent ? ctx.NOUNAnimMascPlurGent[0].word
      : ctx.NOUNAnimFemnPlurGent ? ctx.NOUNAnimFemnPlurGent[0].word
      : ctx.NOUNAnimNeutPlurGent ? ctx.NOUNAnimNeutPlurGent[0].word
      : ctx.NOUNInanMascSingGent ? ctx.NOUNInanMascSingGent[0].word
      : ctx.NOUNInanFemnSingGent ? ctx.NOUNInanFemnSingGent[0].word
      : ctx.NOUNInanNeutSingGent ? ctx.NOUNInanNeutSingGent[0].word
      : ctx.NOUNInanMascPlurGent ? ctx.NOUNInanMascPlurGent[0].word
      : ctx.NOUNInanFemnPlurGent ? ctx.NOUNInanFemnPlurGent[0].word
      : ctx.NOUNInanNeutPlurGent ? ctx.NOUNInanNeutPlurGent[0].word
      : undefined;
  }

  public idEntity = (ctx: any) => {
    return new idEntityValue(ctx.idEntityToken[0].image);
  }

  public predicate = (ctx: any) => {
      return ctx.PARTNegt ? ctx.PARTNegt[0].word : undefined;
  }

};

export const visitor6 = new Visitor6();
