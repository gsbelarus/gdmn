import { parsePhrase } from "../parser";
import { RusVerb } from "../../morphology/rusVerb";
import { RusNP, RusPP, RusANP, RusPhrase, RusNNP, RusCN, RusPTimeP } from "../rusSyntax";
import { RusWord } from "../../morphology/rusMorphology";
import { RusNoun } from "../../morphology/rusNoun";
import { RusConjunction } from "../../morphology/rusConjunction";
import { RusNumeral } from '../../morphology/rusNumeral';
import { Value } from "../value";

describe("vpparser1", () => {

  test("покажи все организации из минска", () => {
    const result = parsePhrase('покажи все организации из минска');
    const vp = result.phrase;
    expect(vp).toBeDefined();
    const verb = vp!.items[0] as RusVerb;
    expect(verb).toBeDefined();
    expect(verb.word).toEqual('покажи');
    const np = vp!.items[1] as RusNP;
    const anp = np!.items[0] as RusANP;
    const pp = np!.items[1] as RusPP;
    expect((anp!.items[0] as RusWord).word).toEqual('все');
    expect((anp!.items[1] as RusWord).word).toEqual('организации');
    expect((pp!.items[0] as RusWord).word).toEqual('из');
    expect((pp!.items[1] as RusWord).word).toEqual('минска');
  });

  test("покажи все организации из минска и пинска", () => {
    const result = parsePhrase('покажи все организации из минска и пинска');
    const vp = result.phrase;
    expect(vp).toBeDefined();
    const verb = vp!.items[0] as RusVerb;
    expect(verb).toBeDefined();
    expect(verb.word).toEqual('покажи');
    const np = vp!.items[1] as RusNP;
    const anp = np!.items[0] as RusANP;
    const pp = np!.items[1] as RusPP;
    expect((anp!.items[0] as RusWord).word).toEqual('все');
    expect((anp!.items[1] as RusWord).word).toEqual('организации');
    expect((pp!.items[0] as RusWord).word).toEqual('из');
    expect(((pp!.items[1] as RusPhrase).items[0] as RusNoun).word).toEqual('минска');
    expect(((pp!.items[1] as RusPhrase).items[1] as RusConjunction).word).toEqual('и');
    expect(((pp!.items[1] as RusPhrase).items[2] as RusNoun).word).toEqual('пинска');
  });

  test("покажи все организации из минска, пинска", () => {
    const result = parsePhrase('покажи все организации из минска, пинска');
    const vp = result.phrase;
    expect(vp).toBeDefined();
    const verb = vp!.items[0] as RusVerb;
    expect(verb).toBeDefined();
    expect(verb.word).toEqual('покажи');
    const np = vp!.items[1] as RusNP;
    const anp = np!.items[0] as RusANP;
    const pp = np!.items[1] as RusPP;
    expect((anp!.items[0] as RusWord).word).toEqual('все');
    expect((anp!.items[1] as RusWord).word).toEqual('организации');
    expect((pp!.items[0] as RusWord).word).toEqual('из');
    expect(((pp!.items[1] as RusPhrase).items[0] as RusNoun).word).toEqual('минска');
    expect(((pp!.items[1] as RusPhrase).items[1] as RusNoun).word).toEqual('пинска');
  });

  test("покажи минские организации", () => {
    const result = parsePhrase('покажи минские организации');
    const vp = result.phrase;
    expect(vp).toBeDefined();
    const verb = vp!.items[0] as RusVerb;
    expect(verb).toBeDefined();
    expect(verb.word).toEqual('покажи');
    const np = vp!.items[1] as RusNP;
    const anp = np!.items[0] as RusANP;
    const pp = np!.items[1] as RusANP;
    expect(pp).toBeUndefined();
    expect((anp!.items[0] as RusWord).word).toEqual('минские');
    expect((anp!.items[1] as RusWord).word).toEqual('организации');
  });

  test("покажи все организации", () => {
    const result = parsePhrase('покажи все организации');
    const vp = result.phrase;
    expect(vp).toBeDefined();
    const verb = vp!.items[0] as RusVerb;
    expect(verb).toBeDefined();
    expect(verb.word).toEqual('покажи');
    const np = vp!.items[1] as RusNP;
    const anp = np!.items[0] as RusANP;
    const pp = np!.items[1] as RusPP;
    expect(pp).toBeUndefined();
    expect((anp!.items[0] as RusWord).word).toEqual('все');
    expect((anp!.items[1] as RusWord).word).toEqual('организации');
  });

  test("покажи лучшие организации", () => {
    const result = parsePhrase('покажи лучшие организации');
    const vp = result.phrase;
    expect(vp).toBeDefined();
    const verb = vp!.items[0] as RusWord;
    expect(verb).toBeDefined();
    expect(verb.word).toEqual('покажи');
    const np = vp!.items[1] as RusNP;
    const anp = np!.items[0] as RusANP;
    const pp = np!.items[1] as RusPP;
    expect(pp).toBeUndefined();
    expect((anp!.items[0] as RusWord).word).toEqual('лучшие');
    expect((anp!.items[1] as RusWord).word).toEqual('организации');
  });

  test("покажи курсы на 10.10.2018", () => {
    const result = parsePhrase('покажи курсы на 10.10.2018');
    const vp = result.phrase;
    expect(vp).toBeDefined();
    const verb = vp!.items[0] as RusWord;
    expect(verb).toBeDefined();
    expect(verb.word).toEqual('покажи');
    const np = vp!.items[1] as RusNP;
    const n = np!.items[0] as RusWord;
    expect(n.word).toEqual('курсы');
    const pp = np!.items[1] as RusPTimeP;
    expect((pp!.items[0] as RusWord).word).toEqual('на');
    expect((pp!.items[1] as Value).image).toEqual('10.10.2018');
  });

  /*
  test("покажи 100 организаций из минска", () => {
    const result = parsePhrase('покажи 100 организаций из минска');
    const vp = result.phrase;
    expect(vp).toBeDefined();
    const verb = vp!.items[0] as RusVerb;
    expect(verb).toBeDefined();
    expect(verb.word).toEqual('покажи');
    const np = vp!.items[1] as RusNP;
    const nnp = np!.items[0] as RusNNP;
    const pp = np!.items[1] as RusPP;
    expect((nnp!.items[0] as RusNumeral).word).toEqual('сто');
    expect((nnp!.items[1] as RusWord).word).toEqual('организаций');
    expect((pp!.items[0] as RusWord).word).toEqual('из');
    expect((pp!.items[1] as RusWord).word).toEqual('минска');
  });

  test("покажи 915 организаций из минска", () => {
    const result = parsePhrase('покажи 915 организаций из минска');
    const vp = result.phrase;
    expect(vp).toBeDefined();
    const verb = vp!.items[0] as RusVerb;
    expect(verb).toBeDefined();
    expect(verb.word).toEqual('покажи');
    const np = vp!.items[1] as RusNP;
    const nnp = np!.items[0] as RusNNP;
    const cn = nnp!.items[0] as RusCN;
    const pp = np!.items[1] as RusPP;
    expect((cn!.items[0] as RusNumeral).word).toEqual('девятьсот');
    expect((cn!.items[1] as RusNumeral).word).toEqual('пятнадцать');
    expect((nnp!.items[1] as RusWord).word).toEqual('организаций');
    expect((pp!.items[0] as RusWord).word).toEqual('из');
    expect((pp!.items[1] as RusWord).word).toEqual('минска');
  });
  */

  test("покажи двести восемьдесят шесть организаций из минска, пинска", () => {
    const result = parsePhrase('покажи двести восемьдесят шесть организаций из минска, пинска');
    const vp = result.phrase;
    expect(vp).toBeDefined();
    const verb = vp!.items[0] as RusVerb;
    expect(verb).toBeDefined();
    expect(verb.word).toEqual('покажи');
    const np = vp!.items[1] as RusNP;
    const nnp = np!.items[0] as RusNNP;
    const cn = nnp!.items[0] as RusCN;
    const pp = np!.items[1] as RusPP;
    expect((cn!.items[0] as RusNumeral).word).toEqual('двести');
    expect((cn!.items[1] as RusNumeral).word).toEqual('восемьдесят');
    expect((cn!.items[2] as RusNumeral).word).toEqual('шесть');
    expect((nnp!.items[1] as RusWord).word).toEqual('организаций');
    expect((pp!.items[0] as RusWord).word).toEqual('из');
    expect(((pp!.items[1] as RusPhrase).items[0] as RusNoun).word).toEqual('минска');
    expect(((pp!.items[1] as RusPhrase).items[1] as RusNoun).word).toEqual('пинска');
  });
});
