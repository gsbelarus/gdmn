import { VPParser2 } from "./VPParser2";
import { RusPP, RusImperativeVP } from "../../rusSyntax";

export const vpParser2 = new VPParser2();

const BaseVPVisitor2 = vpParser2.getBaseCstVisitorConstructor();

export class VPVisitor2 extends BaseVPVisitor2 {
  constructor() {
    super();
    this.validateVisitor();
  }

  public sentence = (ctx: any) => {
    return this.visit(ctx.vp);
  }

  public vp = (ctx: any) => {
    return this.visit(ctx.imperativeVP);
  }

  public imperativeVP = (ctx: any) => {
    const imperativeVerb = this.visit(ctx.imperativeVerb);
    const pp = this.visit(ctx.pp);

    return new RusImperativeVP(imperativeVerb, pp);
  }

  public imperativeVerb = (ctx: any) => {
    return ctx.VERBTranPerfSingImpr[0].word;
  }

  public pp = (ctx: any) => {
    return new RusPP(this.visit(ctx.prep), this.visit(ctx.nounDatv));
  }

  public prep = (ctx: any) => {
    return ctx.PREPObjt[0].word;
  }

  public nounDatv = (ctx: any) => {
    return ctx.NOUNInanMascSingDatv ? ctx.NOUNInanMascSingDatv[0].word
      : ctx.NOUNInanFemnSingDatv ? ctx.NOUNInanFemnSingDatv[0].word
      : ctx.NOUNInanNeutSingDatv ? ctx.NOUNInanNeutSingDatv[0].word
      : undefined;
  }
};

export const vpVisitor2 = new VPVisitor2();
