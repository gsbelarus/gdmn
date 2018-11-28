import { VPParser1 } from "./VPParser1";
import { RusImperativeVP, RusNP, RusANP, RusPP, RusHomogeneousNouns } from "../../rusSyntax";
import { RusNoun } from "../../../morphology/rusNoun";
import { AnyWord } from "../../../morphology/morphology";
import { RusConjunction } from "../../../morphology/rusConjunction";
import { IToken } from "chevrotain";
import { tokenToWordOrHomogeneous } from "../../parser";

export const vpParser1 = new VPParser1();

export const BaseVPVisitor1 = vpParser1.getBaseCstVisitorConstructor();

export class VPVisitor1 extends BaseVPVisitor1 {
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
    const imperativeNP = this.visit(ctx.imperativeNP);

    return new RusImperativeVP(imperativeVerb, imperativeNP);
  }

  public imperativeVerb = (ctx: any) => {
    return ctx.VERBTranPerfSingImpr[0].word;
  }

  public imperativeNP = (ctx: any) => {
    if (ctx.pp) {
      return new RusNP(this.visit(ctx.qualImperativeNoun), this.visit(ctx.pp));
    } else {
      return new RusNP(this.visit(ctx.qualImperativeNoun));
    }
  }

  public qualImperativeNoun = (ctx: any) => {
    if (ctx.imperativeDets) {
      const impN = this.visit(ctx.imperativeNoun);

      if (Array.isArray(impN)) {
        return new RusANP(this.visit(ctx.imperativeDets), new RusHomogeneousNouns(impN));
      } else {
        return new RusANP(this.visit(ctx.imperativeDets), impN);
      }
    } else {
      return this.visit(ctx.imperativeNoun);
    };
  }

  public imperativeDets = (ctx: any) => {
    return this.visit(ctx.imperativeDet);
  }

  public imperativeDet = (ctx: any) => {
    return ctx.ADJFAProPlurAccs ? ctx.ADJFAProPlurAccs[0].word
      : ctx.ADJFQualPlurAccs ? ctx.ADJFQualPlurAccs[0].word
      : ctx.ADJFRelvPlurAccs ? ctx.ADJFRelvPlurAccs[0].word
      : undefined;
  }

  public imperativeNoun = (ctx: any) => {
    return this.visit(ctx.nounAccs);
  }

  public nounAccs = (ctx: any) => {
    return tokenToWordOrHomogeneous(ctx.NOUNAnimMascPlurAccs ? ctx.NOUNAnimMascPlurAccs[0]
    : ctx.NOUNAnimFemnPlurAccs ? ctx.NOUNAnimFemnPlurAccs[0]
    : ctx.NOUNAnimNeutPlurAccs ? ctx.NOUNAnimNeutPlurAccs[0]
    : ctx.NOUNInanMascPlurAccs ? ctx.NOUNInanMascPlurAccs[0]
    : ctx.NOUNInanFemnPlurAccs ? ctx.NOUNInanFemnPlurAccs[0]
    : ctx.NOUNInanNeutPlurAccs ? ctx.NOUNInanNeutPlurAccs[0]
    : undefined);
  }

  public pp = (ctx: any) => {
    const ppn = this.visit(ctx.ppNoun);

    if (Array.isArray(ppn)) {
      return new RusPP(this.visit(ctx.prep), new RusHomogeneousNouns(ppn));
    } else {
      return new RusPP(this.visit(ctx.prep), ppn);
    }
  }

  public prep = (ctx: any) => {
    return ctx.PREPPlce[0].word;
  }

  public ppNoun = (ctx: any) => {
    return this.visit(ctx.nounGent);
  }

  public nounGent = (ctx: any) => {
    return tokenToWordOrHomogeneous(ctx.NOUNInanMascSingGent ? ctx.NOUNInanMascSingGent[0]
    : ctx.NOUNInanFemnSingGent ? ctx.NOUNInanFemnSingGent[0]
    : ctx.NOUNInanNeutSingGent ? ctx.NOUNInanNeutSingGent[0]
    : ctx.NOUNInanMascPlurGent ? ctx.NOUNInanMascPlurGent[0]
    : ctx.NOUNInanFemnPlurGent ? ctx.NOUNInanFemnPlurGent[0]
    : ctx.NOUNInanNeutPlurGent ? ctx.NOUNInanNeutPlurGent[0]
    : undefined);
  }

};

export const vpVisitor1 = new VPVisitor1();