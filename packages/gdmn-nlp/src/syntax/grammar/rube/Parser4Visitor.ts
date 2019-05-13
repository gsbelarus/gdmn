import { RusPV, RusPSPRW } from "../../rusSyntax";
import { idEntityValue } from '../../value';
import { Parser4 } from './Parser4';

export const parser4 = new Parser4();

const BaseVisitor4 = parser4.getBaseCstVisitorConstructor();

export class Visitor4 extends BaseVisitor4 {
  constructor() {
    super();
    this.validateVisitor();
  }

  public sentence = (ctx: any) => {
    return this.visit(ctx.psprw);
  }

  public psprw = (ctx: any) => {
    return new RusPSPRW(this.visit(ctx.predicate), this.visit(ctx.subject));
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

  public predicate = (ctx: any) => {
    if(ctx.negativeParticle) {
      return new RusPV(this.visit(ctx.verb), this.visit(ctx.negativeParticle));
    } else {
      return new RusPV(this.visit(ctx.verb));
    }
  }

  public verb = (ctx: any) => {
    return ctx.VERBTranImpfPresSing3perIndc ? ctx.VERBTranImpfPresSing3perIndc[0].word
    : ctx.VERBIntrImpfPresSing3perIndc ? ctx.VERBIntrImpfPresSing3perIndc[0].word
    : ctx.VERBIntrImpfPresPlur3perIndc ? ctx.VERBIntrImpfPresPlur3perIndc[0].word
    : ctx.VERBTranImpfPresPlur3perIndc ? ctx.VERBTranImpfPresPlur3perIndc[0].word
    : undefined;
  }

  public negativeParticle = (ctx: any) => {
    return ctx.PARTNegt ? ctx.PARTNegt[0].word : undefined;
  }

};

export const visitor4 = new Visitor4();
