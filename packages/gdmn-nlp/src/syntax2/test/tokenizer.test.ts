import { nlpTokenize } from "../tokenizer";

test('nlpTokenizer2', () => {
  let tokens = nlpTokenize('слово , \n\rслово\n');
  expect(tokens.length).toEqual(1);
  expect(tokens[0].length).toEqual(7);

  tokens = nlpTokenize('из-за');
  expect(tokens.length).toEqual(1);
  expect(tokens[0].length).toEqual(1);

  tokens = nlpTokenize('отсортируй по названию');
  expect(tokens.length).toEqual(1);
  expect(tokens[0].length).toEqual(5);

  tokens = nlpTokenize('отсортируй по названию и убыванию');
  expect(tokens.length).toEqual(1);
  expect(tokens[0].length).toEqual(5);
  expect(tokens[0][4].uniformPOS!.length).toEqual(4);

  tokens = nlpTokenize('отсортируй по названию и или убыванию');
  expect(tokens.length).toEqual(1);
  expect(tokens[0].length).toEqual(11);

  tokens = nlpTokenize('отсортируй по названию, по возрастанию');
  expect(tokens.length).toEqual(1);
  expect(tokens[0].length).toEqual(10);

  tokens = nlpTokenize('отсортируй по названию, затем по адресу');
  expect(tokens.length).toEqual(1);
  expect(tokens[0].length).toEqual(12);
  expect(tokens[0][5].tokenType!.name).toEqual('Comma');

  tokens = nlpTokenize('покажи 342 организации');
  expect(tokens.length).toEqual(1);
  expect(tokens[0].length).toEqual(5);
  expect(tokens[0][2].tokenType!.name).toEqual('Number');
  expect(tokens[0][2].value).toEqual(342);

  tokens = nlpTokenize('покажи -342 организации');
  expect(tokens.length).toEqual(1);
  expect(tokens[0].length).toEqual(5);
  expect(tokens[0][2].tokenType!.name).toEqual('Number');
  expect(tokens[0][2].value).toEqual(-342);

  tokens = nlpTokenize('покажи три организации');
  expect(tokens.length).toEqual(2);
  expect(tokens[0].length).toEqual(5);
  expect(tokens[0][2].tokenType!.name).toEqual('Number');
  expect(tokens[0][2].value).toEqual(3);

  tokens = nlpTokenize('покажи тридцать три организации');
  expect(tokens.length).toEqual(2);
  expect(tokens[0].length).toEqual(5);
  expect(tokens[0][2].tokenType!.name).toEqual('Number');
  expect(tokens[0][2].value).toEqual(33);

  tokens = nlpTokenize('покажи триста тридцать три организации');
  expect(tokens.length).toEqual(2);
  expect(tokens[0].length).toEqual(5);
  expect(tokens[0][2].tokenType!.name).toEqual('Number');
  expect(tokens[0][2].value).toEqual(333);

  tokens = nlpTokenize('покажи триста тридцать три тысячи организаций');
  expect(tokens.length).toEqual(2);
  expect(tokens[0].length).toEqual(5);
  expect(tokens[0][2].tokenType!.name).toEqual('Number');
  expect(tokens[0][2].value).toEqual(333000);

  tokens = nlpTokenize('покажи пятьсот двадцать три  миллиарда шестьсот восемьдесят восемь миллионов триста тридцать тысяч сто сорок одну организацию');
  expect(tokens.length).toEqual(2);
  expect(tokens[0].length).toEqual(5);
  expect(tokens[0][2].tokenType!.name).toEqual('Number');
  expect(tokens[0][2].value).toEqual(523688330141);

  tokens = nlpTokenize('покажи ноль организаций');
  expect(tokens.length).toEqual(1);
  expect(tokens[0].length).toEqual(5);
  expect(tokens[0][2].tokenType!.name).toEqual('Number');
  expect(tokens[0][2].value).toEqual(0);

  tokens = nlpTokenize('покажи все TgdcUserDocument147134915_1757699501');
  expect(tokens.length).toEqual(1);
  expect(tokens[0].length).toEqual(5);
  expect(tokens[0][4].tokenType!.name).toEqual('IDToken');

  tokens = nlpTokenize('покажи все организации из Минска и Пинска');
  expect(tokens.length).toEqual(1);
  expect(tokens[0].length).toEqual(9);
});
