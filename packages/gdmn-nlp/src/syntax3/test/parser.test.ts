import { nlpTokenize, text2Tokens, tokens2sentenceTokens, xParse, xTemplates, XWordOrToken, IXPhrase, phraseFind } from "../..";
import { isIXToken, isIXWord, IXPhraseTemplate } from "../types";

test('nlpParser3', () => {

  const f = (text: string) => nlpTokenize(tokens2sentenceTokens(text2Tokens(text))[0]);

  const testWord = (t: XWordOrToken | undefined, w: string) => isIXWord(t) && t.word.word === w;
  const testToken = (t: XWordOrToken | undefined, i: string) => isIXToken(t) && t.token.image === i;
  const test = (phrase: IXPhrase | undefined, path: string, w: string) => {
    if (phrase) {
      const found = phraseFind(phrase, path);

      if (isIXWord(found)) {
        return found.word.word === w;
      }
      else if (isIXToken(found)) {
        return found.token.image === w;
      }
    }

    return false;
  };
  const t = (s: string, templ: IXPhraseTemplate, path: string, w: string) => {
    const tokens = f(s);
    expect(tokens.length).toEqual(1);
    const res = xParse(tokens[0], templ) as any;
    expect(test(res.phrase, path, w)).toEqual(true);
  }

  let tokens = f('покажи организации');
  expect(tokens.length).toEqual(1);

  let res = xParse(tokens[0], xTemplates.vpShow) as any;
  expect(res.phrase?.headTokens?.length).toEqual(1);
  expect(test(res.phrase, 'H', 'покажи')).toEqual(true);
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

  t('по убыванию', xTemplates.ppSortOrder, 'C/nounSortOrder/H', 'убыванию');
});
