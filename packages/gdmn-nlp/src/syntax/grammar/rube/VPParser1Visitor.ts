import { VPParser1 } from "./VPParser1";
import { RusImperativeVP, RusNP, RusANP, RusPP, RusHmNouns, RusPTimeP } from "../../rusSyntax";
import { tokenToWordOrHomogeneous } from "../../parser";
import { DateValue, parseDate, DefinitionValue, idEntityValue } from "../../value";

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
      return this.visit(ctx.qualImperativeANPNoun);
  }

  public qualImperativeANPNoun = (ctx: any) => {
    if (ctx.imperativeDets) {
      const impN = this.visit(ctx.imperativeNouns);

      if (Array.isArray(impN)) {
        return new RusANP(this.visit(ctx.imperativeDets), new RusHmNouns(impN));
      } else {
        return new RusANP(this.visit(ctx.imperativeDets), impN);
      }
    } else {
      return this.visit(ctx.imperativeNouns);
    };
  }
  
  public imperativeDets = (ctx: any) => {
    if(ctx.imperativeDet) {
      return this.visit(ctx.imperativeDet);
    } else {
      return this.visit(ctx.imperativeDefin);
    }
  }

  public imperativeDet = (ctx: any) => {
    return ctx.ADJFAProPlurAccs ? ctx.ADJFAProPlurAccs[0].word
      : ctx.ADJFQualPlurAccs ? ctx.ADJFQualPlurAccs[0].word
      : ctx.ADJFRelvPlurAccs ? ctx.ADJFRelvPlurAccs[0].word
      : undefined;
  }

  public imperativeDefin = (ctx: any) => {
    return new DefinitionValue(ctx.DefinitionToken[0].image, ctx.DefinitionToken[0].quantity, ctx.DefinitionToken[0].kInd);
  }

  public imperativeNouns = (ctx: any) => {
    if(ctx.nounAccs) {
      return this.visit(ctx.nounAccs);
    } else if(ctx.nounGent) {
      return this.visit(ctx.nounGent);
    } else {
      return this.visit(ctx.idEntity);
    }
  }

  public idEntity = (ctx: any) => {
    return new idEntityValue(ctx.idEntityToken[0].image);
  }

  public imperativeNoun = (ctx: any) => {
    return this.visit(ctx.nounAccs);
  }

  public nounAccs = (ctx: any) => {
    return tokenToWordOrHomogeneous(ctx.NOUNAnimMascSingAccs ? ctx.NOUNAnimMascSingAccs[0]
      : ctx.NOUNAnimFemnSingAccs ? ctx.NOUNAnimFemnSingAccs[0]
      : ctx.NOUNAnimNeutSingAccs ? ctx.NOUNAnimNeutSingAccs[0]
      : ctx.NOUNAnimMascPlurAccs ? ctx.NOUNAnimMascPlurAccs[0]
      : ctx.NOUNAnimFemnPlurAccs ? ctx.NOUNAnimFemnPlurAccs[0]
      : ctx.NOUNAnimNeutPlurAccs ? ctx.NOUNAnimNeutPlurAccs[0]
      : ctx.NOUNInanMascSingAccs ? ctx.NOUNInanMascSingAccs[0]
      : ctx.NOUNInanFemnSingAccs ? ctx.NOUNInanFemnSingAccs[0]
      : ctx.NOUNInanNeutSingAccs ? ctx.NOUNInanNeutSingAccs[0]
      : ctx.NOUNInanMascPlurAccs ? ctx.NOUNInanMascPlurAccs[0]
      : ctx.NOUNInanFemnPlurAccs ? ctx.NOUNInanFemnPlurAccs[0]
      : ctx.NOUNInanNeutPlurAccs ? ctx.NOUNInanNeutPlurAccs[0]
      : undefined);
  }

  public pp = (ctx: any) => {
    if (ctx.ppPlace) {
      return this.visit(ctx.ppPlace);
    } else {
      return this.visit(ctx.ppTime);
    };
  }

  public ppPlace = (ctx: any) => {
    const ppn = this.visit(ctx.ppNoun);

    if (Array.isArray(ppn)) {
      return new RusPP(this.visit(ctx.prepPlace), new RusHmNouns(ppn));
    } else {
      return new RusPP(this.visit(ctx.prepPlace), ppn);
    }
  }

  public prepPlace = (ctx: any) => {
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

  public ppTime = (ctx: any) => {
    return new RusPTimeP(this.visit(ctx.prepTime), new DateValue(ctx.DateToken[0].image, parseDate(ctx.DateToken[0].image)));
  }

  public prepTime = (ctx: any) => {
    return ctx.PREPTime[0].word;
  }

};

export const vpVisitor1 = new VPVisitor1();
