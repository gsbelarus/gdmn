import { parsePhrase } from "../parser";
import { RusVerb } from "../../morphology/rusVerb";
import { RusNP, RusPP, RusANP } from "../rusSyntax";
import { RusWord } from "../../morphology/rusMorphology";

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

  test("покажи все организации из минска и минска", () => {
    const result = parsePhrase('покажи все организации из минска и минска');
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
});


