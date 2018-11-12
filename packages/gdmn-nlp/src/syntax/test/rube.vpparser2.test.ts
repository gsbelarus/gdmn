import { parsePhrase } from "../parser";
import { RusVerb } from "../../morphology/rusVerb";
import { RusPP } from "../rusSyntax";
import { RusWord } from "../../morphology/rusMorphology";

describe("vpparser2", () => {
  test("отсортируй по названию", () => {
    const result = parsePhrase('отсортируй по названию');
    const vp = result.phrase;
    expect(vp).toBeDefined();
    const verb = vp!.items[0] as RusVerb;
    expect(verb).toBeDefined();
    expect(verb.word).toEqual('отсортируй');
    const pp = vp!.items[1] as RusPP;
    expect((pp.items[0] as RusWord).word).toEqual('по');
    expect((pp!.items[1] as RusWord).word).toEqual('названию');
  });

  test("отсортируй по названию по убыванию", () => {
    const result = parsePhrase('отсортируй по названию по убыванию');
    const vp = result.phrase;
    expect(vp).toBeDefined();
    const verb = vp!.items[0] as RusVerb;
    expect(verb).toBeDefined();
    expect(verb.word).toEqual('отсортируй');
    const pp = vp!.items[1] as RusPP;
    expect((pp.items[0] as RusWord).word).toEqual('по');
    expect((pp!.items[1] as RusWord).word).toEqual('названию');
  });
});