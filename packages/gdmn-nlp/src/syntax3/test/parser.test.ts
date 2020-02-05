import { nlpTokenize, text2Tokens, tokens2sentenceTokens, xParse, xTemplates, XWordOrToken } from "../..";

test('nlpParser3', () => {

  const f = (text: string) => nlpTokenize(tokens2sentenceTokens(text2Tokens(text))[0]);

  const testWord = (t: XWordOrToken | undefined, w: string) => t && t.type === 'WORD' && t.word?.word === w;
  const testToken = (t: XWordOrToken | undefined, i: string) => t && t.type === 'TOKEN' && t.token?.image === i;

  let tokens = f('покажи организации');
  expect(tokens.length).toEqual(1);

  let res = xParse(tokens[0], xTemplates.vpShow) as any;
  expect(res.phrase?.headTokens?.length).toEqual(1);
  expect(testWord(res.phrase?.headTokens?.[0], 'покажи')).toEqual(true);
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

  tokens = f('покажи все TgdcCompany из минска и пинска');
  expect(tokens.length).toEqual(1);

  res = xParse(tokens[0], xTemplates.vpShowByPlace);
  expect(res.phrase?.headTokens?.length).toEqual(1);
  expect(testWord(res.phrase?.headTokens?.[0], 'покажи')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[0]?.specifier?.headTokens?.[0], 'все')).toEqual(true);
  expect(testToken(res.phrase?.complements?.[0]?.headTokens?.[0], 'TgdcCompany')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[0]?.complements?.[0]?.headTokens?.[0], 'из')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[0]?.complements?.[0]?.complements?.[0]?.headTokens?.[0], 'минска')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[0]?.complements?.[0]?.complements?.[0]?.headTokens?.[1], 'и')).toEqual(true);
  expect(testWord(res.phrase?.complements?.[0]?.complements?.[0]?.complements?.[0]?.headTokens?.[2], 'пинска')).toEqual(true);

  tokens = f('покажи все TgdcCompany из 2');
  expect(tokens.length).toEqual(1);

  res = xParse(tokens[0], xTemplates.vpShowByPlace);
  expect(res.type).toEqual('ERROR');
  expect(res.errorStack.length).toEqual(4);
});
