import { morphAnalyzer } from "../morphAnalyzer";
import { RusAdjective, RusAdjectiveLexeme } from "../rusAdjective";
import { RusCase, RusMood, Involvement, AdverbType, PrepositionType, NumeralStructure, RusGender, NumeralType, NumeralRank } from "../types";
import { RusVerb } from "../rusVerb";
import { RusAdverb } from "../rusAdverb";
import { RusPreposition } from "../rusPreposition";
import { RusNumeral } from "../rusNumeral";

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

describe('числительные', () => {
  test("одному", () => {
    const result = morphAnalyzer('одному');
    expect(result.length).toEqual(2);
    expect(result[0] instanceof RusNumeral).toBeTruthy();
    const n = result[0] as RusNumeral;
    expect(n.lexeme.value).toEqual(1);
    expect(n.lexeme.type).toEqual(NumeralType.Cardinal);
    expect(n.lexeme.structure).toEqual(NumeralStructure.Simple);
    expect(n.lexeme.rank).toBeDefined();
    expect(n.lexeme.rank).toEqual(NumeralRank.ProperQuantitative);
    expect(n.singular).toBeUndefined();
    expect(n.lexeme.gender).toBeDefined();
    expect(n.lexeme.gender).toEqual(RusGender.Masc);
  });
  test("один", () => {
    const result = morphAnalyzer('один');
    expect(result.length).toEqual(2);
    expect(result[0] instanceof RusNumeral).toBeTruthy();
    const n = result[0] as RusNumeral;
    expect(n.lexeme.value).toEqual(1);
    expect(n.lexeme.type).toEqual(NumeralType.Cardinal);
    expect(n.lexeme.structure).toEqual(NumeralStructure.Simple);
    expect(n.lexeme.rank).toBeDefined();
    expect(n.lexeme.rank).toEqual(NumeralRank.ProperQuantitative);
    expect(n.singular).toBeUndefined();
    expect(n.lexeme.gender).toBeDefined();
    expect(n.lexeme.gender).toEqual(RusGender.Masc);
  });
  test("одно", () => {
    const result = morphAnalyzer('одно');
    expect(result.length).toEqual(3);
    expect(result[0] instanceof RusNumeral).toBeTruthy();
    const n = result[0] as RusNumeral;
    expect(n.lexeme.value).toEqual(1);
    expect(n.lexeme.type).toEqual(NumeralType.Cardinal);
    expect(n.lexeme.structure).toEqual(NumeralStructure.Simple);
    expect(n.lexeme.rank).toBeDefined();
    expect(n.lexeme.rank).toEqual(NumeralRank.ProperQuantitative);
    expect(n.singular).toBeUndefined();
    expect(n.lexeme.gender).toBeDefined();
    expect(n.lexeme.gender).toEqual(RusGender.Neut);
  });
  test("двух", () => {
    const result = morphAnalyzer('двух');
    expect(result.length).toEqual(9);
    expect(result[0] instanceof RusNumeral).toBeTruthy();
    const n = result[0] as RusNumeral;
    expect(n.lexeme.value).toEqual(2);
    expect(n.lexeme.type).toEqual(NumeralType.Cardinal);
    expect(n.lexeme.structure).toEqual(NumeralStructure.Simple);
    expect(n.lexeme.rank).toBeDefined();
    expect(n.lexeme.rank).toEqual(NumeralRank.ProperQuantitative);
    expect(n.singular).toBeUndefined();
    expect(n.lexeme.gender).toBeDefined();
    expect(n.lexeme.gender).toEqual(RusGender.Masc);
  });
  test("восьмью", () => {
    const result = morphAnalyzer('восьмью');
    expect(result.length).toEqual(1);
    expect(result[0] instanceof RusNumeral).toBeTruthy();
    const n = result[0] as RusNumeral;
    expect(n.lexeme.value).toEqual(8);
    expect(n.lexeme.type).toEqual(NumeralType.Cardinal);
    expect(n.lexeme.structure).toEqual(NumeralStructure.Simple);
    expect(n.lexeme.rank).toBeDefined();
    expect(n.lexeme.rank).toEqual(NumeralRank.ProperQuantitative);
    expect(n.singular).toBeUndefined();
    expect(n.lexeme.gender).toBeUndefined();
  });
  test("шестьюдесятью", () => {
    const result = morphAnalyzer('шестьюдесятью');
    expect(result.length).toEqual(1);
    expect(result[0] instanceof RusNumeral).toBeTruthy();
    const n = result[0] as RusNumeral;
    expect(n.lexeme.value).toEqual(60);
    expect(n.lexeme.type).toEqual(NumeralType.Cardinal);
    expect(n.lexeme.structure).toEqual(NumeralStructure.Complex);
    expect(n.lexeme.rank).toBeDefined();
    expect(n.lexeme.rank).toEqual(NumeralRank.ProperQuantitative);
    expect(n.singular).toBeUndefined();
    expect(n.lexeme.gender).toBeUndefined();
  });
  test("пятидесяти", () => {
    const result = morphAnalyzer('пятидесяти');
    expect(result.length).toEqual(3);
    expect(result[0] instanceof RusNumeral).toBeTruthy();
    const n = result[0] as RusNumeral;
    expect(n.lexeme.value).toEqual(50);
    expect(n.lexeme.type).toEqual(NumeralType.Cardinal);
    expect(n.lexeme.structure).toEqual(NumeralStructure.Complex);
    expect(n.lexeme.rank).toBeDefined();
    expect(n.lexeme.rank).toEqual(NumeralRank.ProperQuantitative);
    expect(n.singular).toBeUndefined();
    expect(n.lexeme.gender).toBeUndefined();
  });
  test("двухсот", () => {
    const result = morphAnalyzer('двухсот');
    expect(result.length).toEqual(1);
    expect(result[0] instanceof RusNumeral).toBeTruthy();
    const n = result[0] as RusNumeral;
    expect(n.lexeme.value).toEqual(200);
    expect(n.lexeme.type).toEqual(NumeralType.Cardinal);
    expect(n.lexeme.structure).toEqual(NumeralStructure.Complex);
    expect(n.lexeme.rank).toBeDefined();
    expect(n.lexeme.rank).toEqual(NumeralRank.ProperQuantitative);
    expect(n.singular).toBeUndefined();
    expect(n.lexeme.gender).toBeUndefined();
  });
});
