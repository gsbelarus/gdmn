import { morphAnalyzer } from "../../morphology/morphAnalyzer";
import { hasMeaning } from '../rusVerbSynonyms';
import { RusVerb } from "../../morphology/rusVerb";
import { semCategoryNames, str2SemCategory, semCategory2Str, SemContext } from "../categories";

describe('синонимы', () => {
  test("синонимы для слова покажи", () => {
    const v = morphAnalyzer('вывести')[0];
    expect(hasMeaning(SemContext.QueryDB, 'показать', (v as RusVerb))).toBeTruthy();

    const p = morphAnalyzer('продемонстрируй')[0];
    expect(hasMeaning(SemContext.QueryDB, 'покажи', (p as RusVerb))).toBeTruthy();
  });

  test("синонимы для слова удалить", () => {
    const v = morphAnalyzer('удалить')[0];
    expect(hasMeaning(SemContext.QueryDB, 'уничтожить', (v as RusVerb))).toBeTruthy();
  });

  test("синонимы для слова уничтожить", () => {
    const v = morphAnalyzer('уничтожить')[0];
    expect(hasMeaning(SemContext.QueryDB, 'удалить', (v as RusVerb))).toBeTruthy();
  });
});

describe('конвертация из строки в категорию и обратно', () => {
  test("", () => {
    const categories = semCategoryNames.map( n => str2SemCategory(n));
    expect(semCategoryNames).toEqual(categories.map( c => semCategory2Str(c) ));
  });
});