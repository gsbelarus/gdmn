import { nlpTokenize } from "../tokenizer";

test('nlpTokenizer2', () => {
  const tokens = nlpTokenize('слово , \n\rслово\n');
  expect(tokens.length).toEqual(7);

  const tokens2 = nlpTokenize('из-за');
  expect(tokens2.length).toEqual(1);

  const tokens3 = nlpTokenize('отсортируй по названию');
  expect(tokens3.length).toEqual(5);

  const tokens4 = nlpTokenize('отсортируй по названию и убыванию');
  expect(tokens4.length).toEqual(9);

  const tokens5 = nlpTokenize('отсортируй по названию, по возрастанию');
  expect(tokens5.length).toEqual(10);

  const tokens6 = nlpTokenize('отсортируй по названию, затем по адресу');
  expect(tokens6.length).toEqual(12);
  expect(tokens6[5].tokenType!.name).toEqual('Comma');

  const tokens7 = nlpTokenize('покажи 342 организации');
  expect(tokens7.length).toEqual(5);
  expect(tokens7[2].tokenType!.name).toEqual('Number');

  const tokens8 = nlpTokenize('покажи все TgdcUserDocument147134915_1757699501');
  expect(tokens8.length).toEqual(5);
  expect(tokens8[4].tokenType!.name).toEqual('IDToken');
});
