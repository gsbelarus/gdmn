import { nlpTokenize, text2Tokens, tokens2sentenceTokens } from "../tokenizer";

test('nlpTokenizer2', () => {
  const f = (text: string) => nlpTokenize(tokens2sentenceTokens(text2Tokens(text))[0]);

  let tokens = f('слово , \n\rслово\n');
  expect(tokens.length).toEqual(1);
  expect(tokens[0].length).toEqual(7);

  tokens = f('из-за');
  expect(tokens.length).toEqual(1);
  expect(tokens[0].length).toEqual(1);

  tokens = f('отсортируй по названию');
  expect(tokens.length).toEqual(1);
  expect(tokens[0].length).toEqual(5);

  tokens = f('отсортируй по названию и убыванию');
  expect(tokens.length).toEqual(1);
  expect(tokens[0].length).toEqual(5);
  expect(tokens[0][4].uniformPOS!.length).toEqual(4);

  tokens = f('отсортируй по названию и или убыванию');
  expect(tokens.length).toEqual(1);
  expect(tokens[0].length).toEqual(11);

  tokens = f('отсортируй по названию, по возрастанию');
  expect(tokens.length).toEqual(1);
  expect(tokens[0].length).toEqual(10);

  tokens = f('отсортируй по названию, затем по адресу');
  expect(tokens.length).toEqual(1);
  expect(tokens[0].length).toEqual(12);
  expect(tokens[0][5].tokenType!.name).toEqual('Comma');

  tokens = f('покажи 342 организации');
  expect(tokens.length).toEqual(1);
  expect(tokens[0].length).toEqual(5);
  expect(tokens[0][2].tokenType!.name).toEqual('Number');
  expect(tokens[0][2].value).toEqual(342);

  tokens = f('покажи -342 организации');
  expect(tokens.length).toEqual(1);
  expect(tokens[0].length).toEqual(5);
  expect(tokens[0][2].tokenType!.name).toEqual('Number');
  expect(tokens[0][2].value).toEqual(-342);

  tokens = f('покажи три организации');
  expect(tokens.length).toEqual(2);
  expect(tokens[0].length).toEqual(5);
  expect(tokens[0][2].tokenType!.name).toEqual('Number');
  expect(tokens[0][2].value).toEqual(3);

  tokens = f('покажи тридцать три организации');
  expect(tokens.length).toEqual(2);
  expect(tokens[0].length).toEqual(5);
  expect(tokens[0][2].tokenType!.name).toEqual('Number');
  expect(tokens[0][2].value).toEqual(33);

  tokens = f('покажи триста тридцать три организации');
  expect(tokens.length).toEqual(2);
  expect(tokens[0].length).toEqual(5);
  expect(tokens[0][2].tokenType!.name).toEqual('Number');
  expect(tokens[0][2].value).toEqual(333);

  tokens = f('покажи триста тридцать три тысячи организаций');
  expect(tokens.length).toEqual(2);
  expect(tokens[0].length).toEqual(5);
  expect(tokens[0][2].tokenType!.name).toEqual('Number');
  expect(tokens[0][2].value).toEqual(333000);

  tokens = f('покажи пятьсот двадцать три  миллиарда шестьсот восемьдесят восемь миллионов триста тридцать тысяч сто сорок одну организацию');
  expect(tokens.length).toEqual(2);
  expect(tokens[0].length).toEqual(5);
  expect(tokens[0][2].tokenType!.name).toEqual('Number');
  expect(tokens[0][2].value).toEqual(523688330141);

  tokens = f('покажи ноль организаций');
  expect(tokens.length).toEqual(1);
  expect(tokens[0].length).toEqual(5);
  expect(tokens[0][2].tokenType!.name).toEqual('Number');
  expect(tokens[0][2].value).toEqual(0);

  tokens = f('покажи все TgdcUserDocument147134915_1757699501');
  expect(tokens.length).toEqual(1);
  expect(tokens[0].length).toEqual(5);
  expect(tokens[0][4].tokenType!.name).toEqual('IDToken');

  tokens = f('покажи все организации из Минска и Пинска');
  expect(tokens.length).toEqual(1);
  expect(tokens[0].length).toEqual(9);

  tokens = f('название содержит "название"');
  expect(tokens.length).toEqual(1);
  expect(tokens[0].length).toEqual(5);
  expect(tokens[0][4].tokenType!.name).toEqual('QuotedLiteral');
});
