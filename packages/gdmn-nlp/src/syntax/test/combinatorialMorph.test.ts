import { combinatorialMorph } from "../lexer";

test('combinatorialMorph', () => {
  const tokens = combinatorialMorph('большое поле');
  expect(tokens.length).toBe(6);
  expect(tokens[0][0].tokenType!.tokenName).toBe('ADJFQualNeutSingNomn');
  expect(tokens[0][1].tokenType!.tokenName).toBe('NOUNInanNeutSingNomn');
  expect(tokens[1][0].tokenType!.tokenName).toBe('ADJFQualNeutSingNomn');
  expect(tokens[1][1].tokenType!.tokenName).toBe('NOUNInanNeutSingAccs');
  expect(tokens[2][0].tokenType!.tokenName).toBe('ADJFQualNeutSingNomn');
  expect(tokens[2][1].tokenType!.tokenName).toBe('NOUNInanNeutSingLoct');
  expect(tokens[3][0].tokenType!.tokenName).toBe('ADJFQualNeutSingAccs');
  expect(tokens[3][1].tokenType!.tokenName).toBe('NOUNInanNeutSingNomn');
  expect(tokens[4][0].tokenType!.tokenName).toBe('ADJFQualNeutSingAccs');
  expect(tokens[4][1].tokenType!.tokenName).toBe('NOUNInanNeutSingAccs');
  expect(tokens[5][0].tokenType!.tokenName).toBe('ADJFQualNeutSingAccs');
  expect(tokens[5][1].tokenType!.tokenName).toBe('NOUNInanNeutSingLoct');
});