import { nlpTokenize, text2Tokens, tokens2sentenceTokens, xParse, xTemplates, XWordOrToken, IXPhrase, phraseFind } from "../..";
import { isIXToken, isIXWord, IXPhraseTemplate } from "../types";

test('nlpParser3', () => {

  const f = (text: string) => nlpTokenize(tokens2sentenceTokens(text2Tokens(text))[0]);

  const testWord = (t: XWordOrToken | undefined, w: string) => isIXWord(t) && t.word.word === w;
  const testToken = (t: XWordOrToken | undefined, i: string) => isIXToken(t) && t.token.image === i;
  const getString = (phrase: IXPhrase | undefined, path: string) => {
    if (phrase) {
      const found = phraseFind(phrase, path);

      if (isIXWord(found)) {
        return found.word.word;
      }
      else if (isIXToken(found)) {
        return found.token.image;
      }
    }

    return '';
  };
  const t = (s: string, templ: IXPhraseTemplate, path: string, w: string) => {
    const tokens = f(s);
    expect(tokens.length).toEqual(1);
    const res = xParse(tokens[0], templ) as any;
    expect(getString(res.phrase, path)).toEqual(w);
  }

  let tokens = f('покажи организации');
  expect(tokens.length).toEqual(1);

  let res = xParse(tokens[0], xTemplates.vpShow) as any;
  expect(res.phrase?.headTokens?.length).toEqual(1);
  expect(getString(res.phrase, 'H')).toEqual('покажи');
  expect(testWord(res.phrase?.complements?.[0]?.headTokens?.[0], 'организации')).toEqual(true);

  tokens = f('покажи все организации');
  expect(tokens.length).toEqual(1);

  res = xParse(tokens[0], xTemplates.vpShow);
  expect(res.phrase?.headTokens?.length).toEqual(1);
  expect(testWord(res.phrase?.headTokens?.[0], 'покажи')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[0]?.specifier?.headTokens?.[0], 'все')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[0]?.headTokens?.[0], 'организации')).toEqual(true);

  tokens = f('покажи все организации из минска');
  expect(tokens.length).toEqual(1);

  res = xParse(tokens[0], xTemplates.vpShowByPlace);
  expect(res.phrase?.headTokens?.length).toEqual(1);
  expect(testWord(res.phrase?.headTokens?.[0], 'покажи')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[0]?.specifier?.headTokens?.[0], 'все')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[0]?.headTokens?.[0], 'организации')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[0]?.complements?.[0]?.headTokens?.[0], 'из')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[0]?.complements?.[0]?.complements?.[0]?.headTokens?.[0], 'минска')).toEqual(true);

  tokens = f('покажи все TgdcCompany из минска');
  expect(tokens.length).toEqual(1);

  res = xParse(tokens[0], xTemplates.vpShowByPlace);
  expect(res.phrase?.headTokens?.length).toEqual(1);
  expect(testWord(res.phrase?.headTokens?.[0], 'покажи')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[0]?.specifier?.headTokens?.[0], 'все')).toEqual(true);
  expect(testToken(res.phrase?.complements?.[0]?.headTokens?.[0], 'TgdcCompany')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[0]?.complements?.[0]?.headTokens?.[0], 'из')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[0]?.complements?.[0]?.complements?.[0]?.headTokens?.[0], 'минска')).toEqual(true);

  tokens = f('покажи все TgdcCompany из минска или пинска');
  expect(tokens.length).toEqual(1);

  res = xParse(tokens[0], xTemplates.vpShow);
  expect(res.phrase?.headTokens?.length).toEqual(1);
  expect(res.restTokens.length).toBeGreaterThan(0);

  res = xParse(tokens[0], xTemplates.vpShowByPlace);
  expect(res.phrase?.headTokens?.length).toEqual(1);
  expect(res.restTokens.length).toEqual(0);
  expect(testWord(res.phrase?.headTokens?.[0], 'покажи')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[0]?.specifier?.headTokens?.[0], 'все')).toEqual(true);
  expect(testToken(res.phrase?.complements?.[0]?.headTokens?.[0], 'TgdcCompany')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[0]?.complements?.[0]?.headTokens?.[0], 'из')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[0]?.complements?.[0]?.complements?.[0]?.headTokens?.[0], 'минска')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[0]?.complements?.[0]?.complements?.[0]?.headTokens?.[0]?.uniform?.[0], 'или')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[0]?.complements?.[0]?.complements?.[0]?.headTokens?.[0]?.uniform?.[1], 'пинска')).toEqual(true);

  tokens = f('покажи все TgdcCompany из минска, пинска');
  expect(tokens.length).toEqual(1);

  res = xParse(tokens[0], xTemplates.vpShow);
  expect(res.phrase?.headTokens?.length).toEqual(1);
  expect(res.restTokens.length).toBeGreaterThan(0);

  res = xParse(tokens[0], xTemplates.vpShowByPlace);
  expect(res.phrase?.headTokens?.length).toEqual(1);
  expect(res.restTokens.length).toEqual(0);
  expect(testWord(res.phrase?.headTokens?.[0], 'покажи')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[0]?.specifier?.headTokens?.[0], 'все')).toEqual(true);
  expect(testToken(res.phrase?.complements?.[0]?.headTokens?.[0], 'TgdcCompany')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[0]?.complements?.[0]?.headTokens?.[0], 'из')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[0]?.complements?.[0]?.complements?.[0]?.headTokens?.[0], 'минска')).toEqual(true);
  expect(res.phrase?.complements?.[0]?.complements?.[0]?.complements?.[0]?.headTokens?.[0]?.uniform?.[0]?.token?.image).toEqual(',');
  expect(testWord(res.phrase?.complements?.[0]?.complements?.[0]?.complements?.[0]?.headTokens?.[0]?.uniform?.[1], 'пинска')).toEqual(true);

  tokens = f('покажи все TgdcCompany из 2');
  expect(tokens.length).toEqual(1);

  res = xParse(tokens[0], xTemplates.vpShowByPlace);
  expect(res.type).toEqual('ERROR');
  expect(res.errorStack.length).toEqual(4);

  t('сортируй по названию', xTemplates.vpSortBy, 'C/ppBy/C/nounDatv/H', 'названию');

  tokens = f('сортируй по названию, адресу');
  expect(tokens.length).toEqual(1);

  res = xParse(tokens[0], xTemplates.vpSortBy);
  expect(res.phrase?.headTokens?.length).toEqual(1);
  expect(res.restTokens.length).toEqual(0);
  expect(testWord(res.phrase?.headTokens?.[0], 'сортируй')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[0]?.headTokens?.[0], 'по')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[0]?.complements?.[0]?.headTokens?.[0], 'названию')).toEqual(true);
  expect(res.phrase?.complements?.[0]?.complements?.[0]?.headTokens?.[0]?.uniform?.[0]?.token?.image).toEqual(',');
  expect(testWord(res.phrase?.complements?.[0]?.complements?.[0]?.headTokens?.[0]?.uniform?.[1], 'адресу')).toEqual(true);

  tokens = f('сортируй по названию по адресу');
  expect(tokens.length).toEqual(1);

  res = xParse(tokens[0], xTemplates.vpSortBy);
  expect(res.phrase?.headTokens?.length).toEqual(1);
  expect(res.restTokens.length).toEqual(0);
  expect(testWord(res.phrase?.headTokens?.[0], 'сортируй')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[0]?.headTokens?.[0], 'по')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[0]?.complements?.[0]?.headTokens?.[0], 'названию')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[1]?.headTokens?.[0], 'по')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[1]?.complements?.[0]?.headTokens?.[0], 'адресу')).toEqual(true);

  tokens = f('сортируй по названию, по адресу');
  expect(tokens.length).toEqual(1);

  res = xParse(tokens[0], xTemplates.vpSortBy);
  expect(res.phrase?.headTokens?.length).toEqual(1);
  expect(res.restTokens.length).toEqual(0);
  expect(testWord(res.phrase?.headTokens?.[0], 'сортируй')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[0]?.headTokens?.[0], 'по')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[0]?.complements?.[0]?.headTokens?.[0], 'названию')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[1]?.headTokens?.[0], 'по')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[1]?.complements?.[0]?.headTokens?.[0], 'адресу')).toEqual(true);

  tokens = f('сортируй по названию, по убыванию, по адресу, по возрастанию');
  expect(tokens.length).toEqual(1);

  res = xParse(tokens[0], xTemplates.vpSortBy);
  expect(res.phrase?.headTokens?.length).toEqual(1);
  expect(res.restTokens.length).toEqual(0);
  expect(testWord(res.phrase?.headTokens?.[0], 'сортируй')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[0]?.headTokens?.[0], 'по')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[0]?.complements?.[0]?.headTokens?.[0], 'названию')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[1]?.headTokens?.[0], 'по')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[1]?.complements?.[0]?.headTokens?.[0], 'убыванию')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[2]?.headTokens?.[0], 'по')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[2]?.complements?.[0]?.headTokens?.[0], 'адресу')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[3]?.headTokens?.[0], 'по')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[3]?.complements?.[0]?.headTokens?.[0], 'возрастанию')).toEqual(true);

  tokens = f('сортируй по убыванию по названию, адресу');
  expect(tokens.length).toEqual(1);

  res = xParse(tokens[0], xTemplates.vpSortBy);
  expect(res.phrase?.headTokens?.length).toEqual(1);
  expect(res.restTokens.length).toEqual(0);
  expect(testWord(res.phrase?.headTokens?.[0], 'сортируй')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[0]?.headTokens?.[0], 'по')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[0]?.complements?.[0]?.headTokens?.[0], 'убыванию')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[1]?.headTokens?.[0], 'по')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[1]?.complements?.[0]?.headTokens?.[0], 'названию')).toEqual(true);
  expect(res.phrase?.complements?.[1]?.complements?.[0]?.headTokens?.[0]?.uniform?.[0]?.token?.image).toEqual(',');
  expect(testWord(res.phrase?.complements?.[1]?.complements?.[0]?.headTokens?.[0]?.uniform?.[1], 'адресу')).toEqual(true);

  tokens = f('сортируй по name, city');
  expect(tokens.length).toEqual(1);

  res = xParse(tokens[0], xTemplates.vpSortBy);
  expect(res.phrase?.headTokens?.length).toEqual(1);
  expect(res.restTokens.length).toEqual(0);
  expect(testWord(res.phrase?.headTokens?.[0], 'сортируй')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[0]?.headTokens?.[0], 'по')).toEqual(true);
  expect(testToken(res.phrase?.complements?.[0]?.complements?.[0]?.headTokens?.[0], 'name')).toEqual(true);
  expect(res.phrase?.complements?.[0]?.complements?.[0]?.headTokens?.[0]?.uniform?.[0]?.token?.image).toEqual(',');
  expect(testToken(res.phrase?.complements?.[0]?.complements?.[0]?.headTokens?.[0]?.uniform?.[1], 'city')).toEqual(true);

  tokens = f('отсортируй по name, city, по убыванию');
  expect(tokens.length).toEqual(1);

  res = xParse(tokens[0], xTemplates.vpSortBy);
  expect(res.phrase?.headTokens?.length).toEqual(1);
  expect(res.restTokens.length).toEqual(0);
  expect(testWord(res.phrase?.headTokens?.[0], 'отсортируй')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[0]?.headTokens?.[0], 'по')).toEqual(true);
  expect(testToken(res.phrase?.complements?.[0]?.complements?.[0]?.headTokens?.[0], 'name')).toEqual(true);
  expect(res.phrase?.complements?.[0]?.complements?.[0]?.headTokens?.[0]?.uniform?.[0]?.token?.image).toEqual(',');
  expect(testToken(res.phrase?.complements?.[0]?.complements?.[0]?.headTokens?.[0]?.uniform?.[1], 'city')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[1]?.headTokens?.[0], 'по')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[1]?.complements?.[0]?.headTokens?.[0], 'убыванию')).toEqual(true);

  tokens = f('отсортируй по name, по city, по убыванию');
  expect(tokens.length).toEqual(1);

  res = xParse(tokens[0], xTemplates.vpSortBy);
  expect(res.phrase?.headTokens?.length).toEqual(1);
  expect(res.restTokens.length).toEqual(0);
  expect(testWord(res.phrase?.headTokens?.[0], 'отсортируй')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[0]?.headTokens?.[0], 'по')).toEqual(true);
  expect(testToken(res.phrase?.complements?.[0]?.complements?.[0]?.headTokens?.[0], 'name')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[1]?.headTokens?.[0], 'по')).toEqual(true);
  expect(testToken(res.phrase?.complements?.[1]?.complements?.[0]?.headTokens?.[0], 'city')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[2]?.headTokens?.[0], 'по')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[2]?.complements?.[0]?.headTokens?.[0], 'убыванию')).toEqual(true);

  t('по убыванию', xTemplates.ppSortOrder, 'C/nounSortOrder/H', 'убыванию');

  tokens = f('название содержит "ххх"');
  expect(tokens.length).toEqual(1);

  res = xParse(tokens[0], xTemplates.npContains);
  expect(res.phrase?.headTokens?.length).toEqual(1);
  expect(res.restTokens.length).toEqual(0);
  expect(testWord(res.phrase?.headTokens?.[0], 'название')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[0]?.headTokens?.[0], 'содержит')).toEqual(true);
  expect(res.phrase?.complements?.[0]?.headTokens?.[0]?.negative).toBeFalsy();

  tokens = f('NAME содержит "ххх"');
  expect(tokens.length).toEqual(1);

  res = xParse(tokens[0], xTemplates.npContains);
  expect(res.phrase?.headTokens?.length).toEqual(1);
  expect(res.restTokens.length).toEqual(0);
  expect(testToken(res.phrase?.headTokens?.[0], 'NAME')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[0]?.headTokens?.[0], 'содержит')).toEqual(true);
  expect(res.phrase?.complements?.[0]?.headTokens?.[0]?.negative).toBeFalsy();

  tokens = f('название не содержит "ххх"');
  expect(tokens.length).toEqual(1);

  res = xParse(tokens[0], xTemplates.npContains);
  expect(res.phrase?.headTokens?.length).toEqual(1);
  expect(res.restTokens.length).toEqual(0);
  expect(testWord(res.phrase?.headTokens?.[0], 'название')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[0]?.headTokens?.[0], 'содержит')).toEqual(true);
  expect(res.phrase?.complements?.[0]?.headTokens?.[0]?.negative).toEqual(true);

  tokens = f('NAME атрибута PLACEKEY содержит "ххх"');
  expect(tokens.length).toEqual(1);

  res = xParse(tokens[0], xTemplates.npOfAttrContains);
  //console.log(JSON.stringify(res, undefined, 2));
  expect(res.phrase?.head).toBeDefined();
  expect(res.restTokens.length).toEqual(0);
  expect(testToken(res.phrase?.head?.headTokens?.[0], 'NAME')).toEqual(true);
  expect(testToken(res.phrase?.head?.complements?.[0]?.complements?.[0]?.headTokens?.[0], 'PLACEKEY')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[0]?.headTokens?.[0], 'содержит')).toEqual(true);
  expect(res.phrase?.complements?.[0]?.headTokens?.[0]?.negative).toBeFalsy();

  t('NAME атрибута PLACEKEY содержит "ххх"', xTemplates.npOfAttrContains, 'H/npOfAttr/H', 'NAME');
  t('NAME атрибута PLACEKEY содержит "ххх"', xTemplates.npOfAttrContains, 'C/vpContains/C/quotedLiteral/H', '"ххх"');
  t('NAME атрибута PLACEKEY содержит "ххх"', xTemplates.npOfAttrContains, 'H/npOfAttr/C/npGentAttr/C/nounNomn/H', 'PLACEKEY');

  tokens = f('Название атрибута PLACEKEY не содержит "ххх"');
  expect(tokens.length).toEqual(1);

  res = xParse(tokens[0], xTemplates.npOfAttrContains);
  expect(res.phrase?.head).toBeDefined();
  expect(res.restTokens.length).toEqual(0);
  expect(testWord(res.phrase?.head?.headTokens?.[0], 'название')).toEqual(true);
  expect(testToken(res.phrase?.head?.complements?.[0]?.complements?.[0]?.headTokens?.[0], 'PLACEKEY')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[0]?.headTokens?.[0], 'содержит')).toEqual(true);
  expect(res.phrase?.complements?.[0]?.headTokens?.[0]?.negative).toBeTruthy();
});
