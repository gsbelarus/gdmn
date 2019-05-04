import { VPParser3 } from "./VPParser3";
import { RusPSP, RusVDO, RusPV } from "../../rusSyntax";
import { idEntityValue, SearchValue } from '../../value';

export const vpParser3 = new VPParser3();

const BaseVPVisitor3 = vpParser3.getBaseCstVisitorConstructor();

export class VPVisitor3 extends BaseVPVisitor3 {
  constructor() {
    super();
    this.validateVisitor();
  }

  public sentence = (ctx: any) => {
    return this.visit(ctx.tsm);
  }

  public tsm = (ctx: any) => {
    return new RusPSP(this.visit(ctx.subject), this.visit(ctx.predicate));
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
    if(ctx.directObject) {
      return new RusVDO(this.visit(ctx.pv), this.visit(ctx.directObject));
    } else {
      return new RusVDO(this.visit(ctx.pv));
    }    
  }

  public pv = (ctx: any) => {
    if(ctx.negativeParticle) {
      return new RusPV(this.visit(ctx.verb), this.visit(ctx.negativeParticle));
    } else {
      return new RusPV(this.visit(ctx.verb));
    }  
  }

  /*
public predicate = (ctx: any) => {
    if(ctx.directObject) {
      if(ctx.pv) {
        return new RusVDO(this.visit(ctx.pv), this.visit(ctx.directObject));
      } else {
        return new RusVDO(this.visit(ctx.verb), this.visit(ctx.directObject));
      }
    } else {
      if(ctx.pv) {
        return new RusVDO(this.visit(ctx.pv));
      } else {
        return new RusVDO(this.visit(ctx.verb));
      }
    }    
  }
  
  public pv = (ctx: any) => {
    return new RusPV(this.visit(ctx.negativeParticle), this.visit(ctx.verb));
  }
*/


  public verb = (ctx: any) => {
    return ctx.VERBTranImpfPresSing3perIndc ? ctx.VERBTranImpfPresSing3perIndc[0].word
    : ctx.VERBIntrImpfPresSing3perIndc ? ctx.VERBIntrImpfPresSing3perIndc[0].word
    : ctx.VERBIntrImpfPresPlur3perIndc ? ctx.VERBIntrImpfPresPlur3perIndc[0].word
    : ctx.VERBTranImpfPresPlur3perIndc ? ctx.VERBTranImpfPresPlur3perIndc[0].word
    : ctx.ADVBMeas ? ctx.ADVBMeas[0].word
    : undefined;
  }

  public negativeParticle = (ctx: any) => {
    return ctx.PARTNegt ? ctx.PARTNegt[0].word : undefined;
  }

  public directObject = (ctx: any) => {
    return new SearchValue(ctx.SearchValueToken[0].image);
  }
};

export const vpVisitor3 = new VPVisitor3();
