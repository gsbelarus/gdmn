import { parsePhrase } from "../parser";
import { RusVerb } from "../../morphology/rusVerb";
import { RusNP, RusPP, RusANP, RusPhrase, RusPTimeP } from "../rusSyntax";
import { RusWord } from "../../morphology/rusMorphology";
import { RusNoun } from "../../morphology/rusNoun";
import { RusConjunction } from "../../morphology/rusConjunction";
import { Value, DefinitionValue, idEntityValue } from "../value";

describe("vpparser1", () => {

  test("покажи все организации из минска", () => {
    const result = parsePhrase('покажи все организации из минска');
    expect(result).toBeDefined();
    expect(result[0]).toBeDefined();
    const vp = result[0].phrase;
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
    expect(result).toBeDefined();
    expect(result[0]).toBeDefined();
    const vp = result[0].phrase;
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
    expect(result).toBeDefined();
    expect(result[0]).toBeDefined();
    const vp = result[0].phrase;
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
    expect(result).toBeDefined();
    expect(result[0]).toBeDefined();
    const vp = result[0].phrase;
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
    expect(result).toBeDefined();
    expect(result[0]).toBeDefined();
    const vp = result[0].phrase;
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
    expect(result).toBeDefined();
    expect(result[0]).toBeDefined();
    const vp = result[0].phrase;
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
    expect(result).toBeDefined();
    expect(result[0]).toBeDefined();
    const vp = result[0].phrase;
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

  test("покажи 100 организаций из минска", () => {
    const result = parsePhrase('покажи 100 организаций из минска');
    expect(result).toBeDefined();
    expect(result[0]).toBeDefined();
    const vp = result[0].phrase;
    expect(vp).toBeDefined();
    const verb = vp!.items[0] as RusVerb;
    expect(verb).toBeDefined();
    expect(verb.word).toEqual('покажи');
    const np = vp!.items[1] as RusNP;
    const anp = np!.items[0] as RusANP;
    const pp = np!.items[1] as RusPP;
    expect((anp!.items[0] as DefinitionValue).quantity).toEqual(100);
    expect((anp!.items[1] as RusWord).word).toEqual('организаций');
    expect((pp!.items[0] as RusWord).word).toEqual('из');
    expect((pp!.items[1] as RusWord).word).toEqual('минска');
  });

  test("покажи 915 организаций из минска", () => {
    const result = parsePhrase('покажи 915 организаций из минска');
    expect(result).toBeDefined();
    expect(result[0]).toBeDefined();
    const vp = result[0].phrase;
    expect(vp).toBeDefined();
    const verb = vp!.items[0] as RusVerb;
    expect(verb).toBeDefined();
    expect(verb.word).toEqual('покажи');
    const np = vp!.items[1] as RusNP;
    const anp = np!.items[0] as RusANP;
    const pp = np!.items[1] as RusPP;
    expect((anp!.items[0] as DefinitionValue).quantity).toEqual(915);
    expect((anp!.items[1] as RusWord).word).toEqual('организаций');
    expect((pp!.items[0] as RusWord).word).toEqual('из');
    expect((pp!.items[1] as RusWord).word).toEqual('минска');
  });

  test("покажи двести восемьдесят шесть организаций из минска, пинска", () => {
    const result = parsePhrase('покажи двести восемьдесят шесть организаций из минска, пинска');
    expect(result).toBeDefined();
    expect(result[0]).toBeDefined();
    const vp = result[0].phrase;
    expect(vp).toBeDefined();
    const verb = vp!.items[0] as RusVerb;
    expect(verb).toBeDefined();
    expect(verb.word).toEqual('покажи');
    const np = vp!.items[1] as RusNP;
    const anp = np!.items[0] as RusANP;
    const pp = np!.items[1] as RusPP;
    expect((anp!.items[0] as DefinitionValue).quantity).toEqual(286);
    expect((anp!.items[1] as RusWord).word).toEqual('организаций');
    expect((pp!.items[0] as RusWord).word).toEqual('из');
    expect(((pp!.items[1] as RusPhrase).items[0] as RusNoun).word).toEqual('минска');
    expect(((pp!.items[1] as RusPhrase).items[1] as RusNoun).word).toEqual('пинска');
  });

  test("покажи 915 последних организаций из минска", () => {
    const result = parsePhrase('покажи 915 последних организаций из минска');
    expect(result).toBeDefined();
    expect(result[0]).toBeDefined();
    const vp = result[0].phrase;
    expect(vp).toBeDefined();
    const verb = vp!.items[0] as RusVerb;
    expect(verb).toBeDefined();
    expect(verb.word).toEqual('покажи');
    const np = vp!.items[1] as RusNP;
    const anp = np!.items[0] as RusANP;
    const pp = np!.items[1] as RusPP;
    expect((anp!.items[0] as DefinitionValue).quantity).toEqual(915);
    expect((anp!.items[0] as DefinitionValue).kind).toEqual('LAST');
    expect((anp!.items[1] as RusWord).word).toEqual('организаций');
    expect((pp!.items[0] as RusWord).word).toEqual('из');
    expect((pp!.items[1] as RusWord).word).toEqual('минска');
  });

  test("покажи двести восемьдесят шесть первых организаций из минска, пинска", () => {
    const result = parsePhrase('покажи двести восемьдесят шесть первых организаций из минска, пинска');
    expect(result).toBeDefined();
    expect(result[0]).toBeDefined();
    const vp = result[0].phrase;
    expect(vp).toBeDefined();
    const verb = vp!.items[0] as RusVerb;
    expect(verb).toBeDefined();
    expect(verb.word).toEqual('покажи');
    const np = vp!.items[1] as RusNP;
    const anp = np!.items[0] as RusANP;
    const pp = np!.items[1] as RusPP;
    expect((anp!.items[0] as DefinitionValue).quantity).toEqual(286);
    expect((anp!.items[0] as DefinitionValue).kind).toEqual('FIRST');
    expect((anp!.items[1] as RusWord).word).toEqual('организаций');
    expect((pp!.items[0] as RusWord).word).toEqual('из');
    expect(((pp!.items[1] as RusPhrase).items[0] as RusNoun).word).toEqual('минска');
    expect(((pp!.items[1] as RusPhrase).items[1] as RusNoun).word).toEqual('пинска');
  });

  test("покажи первых 915 организаций из минска", () => {
    const result = parsePhrase('покажи первых 915 организаций из минска');
    expect(result).toBeDefined();
    expect(result[0]).toBeDefined();
    const vp = result[0].phrase;
    expect(vp).toBeDefined();
    const verb = vp!.items[0] as RusVerb;
    expect(verb).toBeDefined();
    expect(verb.word).toEqual('покажи');
    const np = vp!.items[1] as RusNP;
    const anp = np!.items[0] as RusANP;
    const pp = np!.items[1] as RusPP;
    expect((anp!.items[0] as DefinitionValue).quantity).toEqual(915);
    expect((anp!.items[0] as DefinitionValue).kind).toEqual('FIRST');
    expect((anp!.items[1] as RusWord).word).toEqual('организаций');
    expect((pp!.items[0] as RusWord).word).toEqual('из');
    expect((pp!.items[1] as RusWord).word).toEqual('минска');
  });

  test("покажи последних двести восемьдесят шесть организаций из минска, пинска", () => {
    const result = parsePhrase('покажи последних двести восемьдесят шесть организаций из минска, пинска');
    expect(result).toBeDefined();
    expect(result[0]).toBeDefined();
    const vp = result[0].phrase;
    expect(vp).toBeDefined();
    const verb = vp!.items[0] as RusVerb;
    expect(verb).toBeDefined();
    expect(verb.word).toEqual('покажи');
    const np = vp!.items[1] as RusNP;
    const anp = np!.items[0] as RusANP;
    const pp = np!.items[1] as RusPP;
    expect((anp!.items[0] as DefinitionValue).quantity).toEqual(286);
    expect((anp!.items[0] as DefinitionValue).kind).toEqual('LAST');
    expect((anp!.items[1] as RusWord).word).toEqual('организаций');
    expect((pp!.items[0] as RusWord).word).toEqual('из');
    expect(((pp!.items[1] as RusPhrase).items[0] as RusNoun).word).toEqual('минска');
    expect(((pp!.items[1] as RusPhrase).items[1] as RusNoun).word).toEqual('пинска');
  });

  test("покажи все TgdcCompany", () => {
    const result = parsePhrase('покажи все TgdcCompany');
    expect(result).toBeDefined();
    expect(result[0]).toBeDefined();
    const vp = result[0].phrase;
    expect(vp).toBeDefined();
    const verb = vp!.items[0] as RusVerb;
    expect(verb).toBeDefined();
    expect(verb.word).toEqual('покажи');
    const np = vp!.items[1] as RusNP;
    const anp = np!.items[0] as RusANP;
    const pp = np!.items[1] as RusPP;
    expect(pp).toBeUndefined();
    expect((anp!.items[0] as RusWord).word).toEqual('все');
    expect((anp!.items[1] as idEntityValue).image).toEqual('TgdcCompany');
  });

  test("покажи Tgdc", () => {
    const result = parsePhrase('покажи все Tgdc');
    expect(result).toBeDefined();
    expect(result[0]).toBeDefined();
    const vp = result[0].phrase;
    expect(vp).toBeDefined();
    const verb = vp!.items[0] as RusVerb;
    expect(verb).toBeDefined();
    expect(verb.word).toEqual('покажи');
    const np = vp!.items[1] as RusNP;
    const anp = np!.items[0] as RusANP;
    const pp = np!.items[1] as RusPP;
    expect(pp).toBeUndefined();
    expect((anp!.items[0] as RusWord).word).toEqual('все');
    expect((anp!.items[1] as idEntityValue).image).toEqual('Tgdc');
  });
});
