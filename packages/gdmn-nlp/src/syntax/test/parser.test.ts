import { parsePhrase } from "../parser";
import { combinatorialMorph } from "../lexer";
import { RusVerb } from "../../morphology/rusVerb";
import { RusNP, RusPP, RusANP } from "../rusSyntax";
import { RusWord } from "../../morphology/rusMorphology";

describe("parser", () => {

  test("vp", () => {
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

  /*
  test("vp1", () => {
    const result = parsePhrase('отсортируй по названиям');
    const vp = result.phrase;
    expect(vp).toBeDefined();
    const verb = vp!.items[0] as RusVerb;
    expect(verb).toBeDefined();
    expect(verb.word).toEqual('отсортируй');
    const np = vp!.items[1] as RusNP;
    const pp = np!.items[0] as RusPP;
    const pp1 = np!.items[1] as RusPP;
    expect(pp1).toBeUndefined();
    expect((pp!.items[0] as RusWord).word).toEqual('по');
    expect((pp!.items[1] as RusWord).word).toEqual('названиям');
  });
  */

  test("vp2", () => {
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

  test("vp3", () => {
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

  test("vp4", () => {
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

test('combinatorialMorph', () => {
  const tokens = combinatorialMorph('большое поле');
  expect(tokens.length).toBe(6);
  expect(tokens[0][0].tokenType!.tokenName).toBe('ADJFQualNeutSingNomn');
  expect(tokens[0][1].tokenType!.tokenName).toBe('NOUNInanNeutSingNomn');
  expect(tokens[1][0].tokenType!.tokenName).toBe('ADJFQualNeutSingNomn');
  expect(tokens[1][1].tokenType!.tokenName).toBe('NOUNInanNeutSingAccs');
  expect(tokens[2][0].tokenType!.tokenName).toBe('ADJFQualNeutSingNomn');
  expect(tokens[2][1].tokenType!.tokenName).toBe('NOUNInanNeutSingLoct');
  expect(tokens[3][0].tokenType!.tokenName).toBe('ADJFQualNeutSingAccs');
  expect(tokens[3][1].tokenType!.tokenName).toBe('NOUNInanNeutSingNomn');
  expect(tokens[4][0].tokenType!.tokenName).toBe('ADJFQualNeutSingAccs');
  expect(tokens[4][1].tokenType!.tokenName).toBe('NOUNInanNeutSingAccs');
  expect(tokens[5][0].tokenType!.tokenName).toBe('ADJFQualNeutSingAccs');
  expect(tokens[5][1].tokenType!.tokenName).toBe('NOUNInanNeutSingLoct');
});
