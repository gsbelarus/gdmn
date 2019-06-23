import { tokenize } from "../tokenizer";

test('tokenizer', () => {
  const tokens = tokenize('слово , \n\rслово\n');
  expect(tokens.length).toEqual(7);

  const tokens2 = tokenize('из-за');
  expect(tokens2.length).toEqual(1);

  const tokens3 = tokenize('отсортируй по названию');
  expect(tokens3.length).toEqual(5);

  const tokens4 = tokenize('отсортируй по названию и убыванию');
  expect(tokens4.length).toEqual(9);

  const tokens5 = tokenize('отсортируй по названию, по возрастанию');
  expect(tokens5.length).toEqual(10);

  const tokens6 = tokenize('отсортируй по названию, затем по адресу');
  expect(tokens6.length).toEqual(12);
  expect(tokens6[5].tokenType!.name).toEqual('Comma');

  const tokens7 = tokenize('покажи 342 организации');
  expect(tokens7.length).toEqual(5);
  expect(tokens7[2].tokenType!.name).toEqual('Numeric');

  const tokens8 = tokenize('покажи все TgdcUserDocument147134915_1757699501');
  expect(tokens8.length).toEqual(5);
  expect(tokens8[4].tokenType!.name).toEqual('idEntityToken');
});
