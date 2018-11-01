import { tokenize } from "../tokenizer";

test('tokenizer', () => {
  const tokens = tokenize('слово , \n\rслово\n');
  expect(tokens.length).toEqual(7);

  const tokens2 = tokenize('из-за');
  expect(tokens2.length).toEqual(1);
  
  const tokens3 = tokenize('отсортируй по названию');
  expect(tokens3.length).toEqual(5);
});

