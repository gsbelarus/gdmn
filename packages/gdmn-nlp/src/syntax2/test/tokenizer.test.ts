import { nlpTokenize } from "../tokenizer";

test('nlpTokenizer2', () => {
  const tokens = nlpTokenize('слово , \n\rслово\n');
  expect(tokens.length).toEqual(7);

  const tokens2 = nlpTokenize('из-за');
  expect(tokens2.length).toEqual(1);

  const tokens3 = nlpTokenize('отсортируй по названию');
  expect(tokens3.length).toEqual(5);

  const tokens4 = nlpTokenize('отсортируй по названию и убыванию');
  expect(tokens4.length).toEqual(5);
  expect(tokens4[4].uniformPOS!.length).toEqual(4);

  const tokens4a = nlpTokenize('отсортируй по названию и или убыванию');
  expect(tokens4a.length).toEqual(11);

  const tokens5 = nlpTokenize('отсортируй по названию, по возрастанию');
  expect(tokens5.length).toEqual(10);

  const tokens6 = nlpTokenize('отсортируй по названию, затем по адресу');
  expect(tokens6.length).toEqual(12);
  expect(tokens6[5].tokenType!.name).toEqual('Comma');

  const tokens7 = nlpTokenize('покажи 342 организации');
  expect(tokens7.length).toEqual(5);
  expect(tokens7[2].tokenType!.name).toEqual('Number');
  expect(tokens7[2].value).toEqual(342);

  const tokens7a = nlpTokenize('покажи -342 организации');
  expect(tokens7a.length).toEqual(5);
  expect(tokens7a[2].tokenType!.name).toEqual('Number');
  expect(tokens7a[2].value).toEqual(-342);

  const tokens7b = nlpTokenize('покажи три организации');
  expect(tokens7b.length).toEqual(5);
  expect(tokens7b[2].tokenType!.name).toEqual('Number');
  expect(tokens7b[2].value).toEqual(3);

  const tokens7c = nlpTokenize('покажи тридцать три организации');
  expect(tokens7c.length).toEqual(5);
  expect(tokens7c[2].tokenType!.name).toEqual('Number');
  expect(tokens7c[2].value).toEqual(33);

  const tokens7d = nlpTokenize('покажи триста тридцать три организации');
  expect(tokens7d.length).toEqual(5);
  expect(tokens7d[2].tokenType!.name).toEqual('Number');
  expect(tokens7d[2].value).toEqual(333);

  const tokens7e = nlpTokenize('покажи триста тридцать три тысячи организации');
  expect(tokens7e.length).toEqual(5);
  expect(tokens7e[2].tokenType!.name).toEqual('Number');
  expect(tokens7e[2].value).toEqual(333000);

  const tokens7f = nlpTokenize('покажи пятьсот двадцать три  миллиарда шестьсот восемьдесят восемь миллионов триста тридцать тысяч сто сорок одну организацию');
  expect(tokens7f.length).toEqual(5);
  expect(tokens7f[2].tokenType!.name).toEqual('Number');
  expect(tokens7f[2].value).toEqual(523688330141);

  const tokens7g = nlpTokenize('покажи ноль организаций');
  expect(tokens7g.length).toEqual(5);
  expect(tokens7g[2].tokenType!.name).toEqual('Number');
  expect(tokens7g[2].value).toEqual(0);

  const tokens8 = nlpTokenize('покажи все TgdcUserDocument147134915_1757699501');
  expect(tokens8.length).toEqual(5);
  expect(tokens8[4].tokenType!.name).toEqual('IDToken');

  const tokens9 = nlpTokenize('покажи все организации из Минска и Пинска');
  expect(tokens9.length).toEqual(9);
});
