import { VPParser1 } from "./VPParser1";
import { RusImperativeVP, RusNP, RusANP, RusPP, RusHmNouns, RusNNP, RusCN } from "../../rusSyntax";
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
    if (ctx.qualImperativeANPNoun) {
      return this.visit(ctx.qualImperativeANPNoun);
    } else {
      return this.visit(ctx.qualImperativeNNPNoun);
    };
  }

  public qualImperativeANPNoun = (ctx: any) => {
    if (ctx.imperativeDets) {
      const impN = this.visit(ctx.imperativeNoun);

      if (Array.isArray(impN)) {
        return new RusANP(this.visit(ctx.imperativeDets), new RusHmNouns(impN));
      } else {
        return new RusANP(this.visit(ctx.imperativeDets), impN);
      }
    } else {
      return this.visit(ctx.imperativeNoun);
    };
  }

  public qualImperativeNNPNoun = (ctx: any) => {
      const impCN = this.visit(ctx.imperativeNNPNumr);
      const impN = this.visit(ctx.imperativeNNPNoun);

      if (Array.isArray(impN)) {
        if (Array.isArray(impCN)) {
          return new RusNNP(new RusCN(impCN), new RusHmNouns(impN));
        } else {
          return new RusNNP( impCN, new RusHmNouns(impN));
        }
      } else {
        if (Array.isArray(impCN)) {
          return new RusNNP(new RusCN(impCN), impN);
        } else {
          return new RusNNP(impCN, impN);
        }
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

  public imperativeNNPNumr = (ctx: any) => {
    return ctx.NUMRInanMascSingAccs ? ctx.NUMRInanMascSingAccs[0]
    : ctx.NUMRInanFemnSingAccs ? ctx.NUMRInanFemnSingAccs[0]
    : ctx.NUMRInanNeutSingAccs ? ctx.NUMRInanNeutSingAccs[0]
    : ctx.NUMRAnimMascSingAccs ? ctx.NUMRAnimMascSingAccs[0]
    : ctx.NUMRAnimFemnSingAccs ? ctx.NUMRAnimFemnSingAccs[0]
    : ctx.NUMRAnimNeutSingAccs ? ctx.NUMRAnimNeutSingAccs[0]
    : ctx.NUMRInanPlurGent ? ctx.NUMRInanPlurGent[0]
    : undefined;
  }

  public imperativeNNPNoun = (ctx: any) => {
    return tokenToWordOrHomogeneous(ctx.NOUNAnimMascSingAccs ? ctx.NOUNAnimMascSingAccs[0]
      : ctx.NOUNAnimFemnSingAccs ? ctx.NOUNAnimFemnSingAccs[0]
      : ctx.NOUNAnimNeutSingAccs ? ctx.NOUNAnimNeutSingAccs[0]
      : ctx.NOUNAnimMascPlurAccs ? ctx.NOUNAnimMascPlurAccs[0]
      : ctx.NOUNAnimFemnPlurAccs ? ctx.NOUNAnimFemnPlurAccs[0]
      : ctx.NOUNAnimNeutPlurAccs ? ctx.NOUNAnimNeutPlurAccs[0]
      : ctx.NOUNInanMascSingGent ? ctx.NOUNInanMascSingGent[0]
      : ctx.NOUNInanFemnSingGent ? ctx.NOUNInanFemnSingGent[0]
      : ctx.NOUNInanNeutSingGent ? ctx.NOUNInanNeutSingGent[0]
      : ctx.NOUNInanMascPlurGent ? ctx.NOUNInanMascPlurGent[0]
      : ctx.NOUNInanFemnPlurGent ? ctx.NOUNInanFemnPlurGent[0]
      : ctx.NOUNInanNeutPlurGent ? ctx.NOUNInanNeutPlurGent[0]
      : ctx.NOUNInanMascSingAccs ? ctx.NOUNInanMascSingAccs[0]
      : ctx.NOUNInanFemnSingAccs ? ctx.NOUNInanFemnSingAccs[0]
      : ctx.NOUNInanNeutSingAccs ? ctx.NOUNInanNeutSingAccs[0]
      : ctx.NOUNInanMascPlurAccs ? ctx.NOUNInanMascPlurAccs[0]
      : ctx.NOUNInanFemnPlurAccs ? ctx.NOUNInanFemnPlurAccs[0]
      : ctx.NOUNInanNeutPlurAccs ? ctx.NOUNInanNeutPlurAccs[0]
      : undefined);
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
      return new RusPP(this.visit(ctx.prep), new RusHmNouns(ppn));
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