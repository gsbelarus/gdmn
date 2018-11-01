import { morphAnalyzer } from "../morphAnalyzer";
import { RusAdjective, RusAdjectiveLexeme } from "../rusAdjective";
import { RusCase, RusMood, Involvement, AdverbType, PrepositionType } from "../types";
import { RusVerb } from "../rusVerb";
import { RusAdverb } from "../rusAdverb";
import { RusPreposition } from "../rusPreposition";

describe("существительные", () => {
  test("минск", () => {
    const minsk = morphAnalyzer('минск');
    expect(minsk.length).toEqual(2);
  });

  test("кий", () => {
    const kij = morphAnalyzer('кий');
    expect(kij.length).toEqual(2);
  });

  test("название", () => {
    const nazvanie = morphAnalyzer('название');
    expect(nazvanie.length).toEqual(2);
  });
});

describe("прилагательные", () => {
  test("минский", () => {
    const result = morphAnalyzer('минский');
    expect(result.length).toEqual(2);
    expect(result[0].getSignature()).toEqual('ADJFRelvMascSingNomn');

    const [minsk] = morphAnalyzer('минск');
    expect((result[0].lexeme as RusAdjectiveLexeme).getNounLexeme()).toEqual(minsk.lexeme);
  });

  test("минские", () => {
    const result = morphAnalyzer('минские');
    expect(result.length).toEqual(2);
    expect(result[0].getSignature()).toEqual('ADJFRelvPlurNomn');
    expect(result[1].getSignature()).toEqual('ADJFRelvPlurAccs');
  });

  test("самый", () => {
    const result = morphAnalyzer('самый');
    expect(result.length).toEqual(2);
    expect(result[0] instanceof RusAdjective).toBeTruthy();
    expect((result[0] as RusAdjective).grammCase).toEqual(RusCase.Nomn);
    expect(result[1] instanceof RusAdjective).toBeTruthy();
    expect((result[1] as RusAdjective).grammCase).toEqual(RusCase.Accs);
  });
});

describe('глаголы', () => {

  test("покажи", () => {
    const result = morphAnalyzer('покажи');
    expect(result.length).toEqual(1);
    expect(result[0] instanceof RusVerb).toBeTruthy();
    const v = result[0] as RusVerb;
    expect(v.infn).toEqual(false);
    expect(v.tense).toBeUndefined();
    expect(v.singular).toEqual(true);
    expect(v.person).toBeUndefined();
    expect(v.gender).toBeUndefined();
    expect(v.mood).toEqual(RusMood.Impr);
    expect(v.involvement).toEqual(Involvement.Excl);
  });

  test("продемонстрируй", () => {
    const result = morphAnalyzer('продемонстрируй');
    expect(result.length).toEqual(1);
    expect(result[0] instanceof RusVerb).toBeTruthy();
    const v = result[0] as RusVerb;
    expect(v.infn).toEqual(false);
    expect(v.tense).toBeUndefined();
    expect(v.singular).toEqual(true);
    expect(v.person).toBeUndefined();
    expect(v.gender).toBeUndefined();
    expect(v.mood).toEqual(RusMood.Impr);
    expect(v.involvement).toEqual(Involvement.Excl);
  });

  test("уничтожь", () => {
    const result = morphAnalyzer('уничтожь');
    expect(result.length).toEqual(1);
    expect(result[0] instanceof RusVerb).toBeTruthy();
    const v = result[0] as RusVerb;
    expect(v.infn).toEqual(false);
    expect(v.tense).toBeUndefined();
    expect(v.singular).toEqual(true);
    expect(v.person).toBeUndefined();
    expect(v.gender).toBeUndefined();
    expect(v.mood).toEqual(RusMood.Impr);
    expect(v.involvement).toEqual(Involvement.Excl);
  });

  test("отсортируй", () => {
    const result = morphAnalyzer('отсортируй');
    expect(result.length).toEqual(1);
    expect(result[0] instanceof RusVerb).toBeTruthy();
    const v = result[0] as RusVerb;
    expect(v.infn).toEqual(false);
    expect(v.tense).toBeUndefined();
    expect(v.singular).toEqual(true);
    expect(v.person).toBeUndefined();
    expect(v.gender).toBeUndefined();
    expect(v.mood).toEqual(RusMood.Impr);
    expect(v.involvement).toEqual(Involvement.Excl);
  });

  test("уничтожить", () => {
    const result = morphAnalyzer('уничтожить');
    expect(result.length).toEqual(1);
    expect(result[0] instanceof RusVerb).toBeTruthy();
    const v = result[0] as RusVerb;
    expect(v.infn).toEqual(true);
  });
});

describe('наречия', () => {

  test("затем", () => {
    const result = morphAnalyzer('затем');
    expect(result.length).toEqual(1);
    expect(result[0] instanceof RusAdverb).toBeTruthy();
    const v = result[0] as RusAdverb;
    expect(v.lexeme.adverbType).toEqual(AdverbType.Goal);
  });
});

describe('предлоги', () => {
  test("по", () => {
    const result = morphAnalyzer('по');
    expect(result.length).toEqual(2);
    expect(result[0] instanceof RusPreposition).toBeTruthy();
    const v1 = result[0] as RusPreposition;
    expect(v1.lexeme.prepositionType).toEqual(PrepositionType.Object);
    expect(result[1] instanceof RusPreposition).toBeTruthy();
    const v2 = result[1] as RusPreposition;
    expect(v2.lexeme.prepositionType).toEqual(PrepositionType.Reason);
  });
});
