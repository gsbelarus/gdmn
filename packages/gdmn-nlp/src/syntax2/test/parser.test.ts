import { sentenceTemplates } from "../templates";
import { nlpParse } from "../parser";
import { nlpTokenize, text2Tokens, RusVerb, RusNoun, RusPreposition, RusAdjective, IRusSentenceWord, IRusSentenceToken, tokens2sentenceTokens } from "../..";

test('nlpParser2', () => {

  const f = (text: string) => nlpTokenize(tokens2sentenceTokens(text2Tokens(text))[0]);

  let tokens = f('покажи организации из минска');
  expect(tokens.length).toEqual(1);

  let sentences = nlpParse(tokens[0], sentenceTemplates);
  expect(sentences.length).toEqual(1);
  expect(sentences[0].templateId).toEqual('VPShowByPlace');
  expect(sentences[0].phrases.length).toEqual(3);
  expect(sentences[0].phrases[0].phraseId).toEqual('verb');
  expect((sentences[0].phrases[0].wordOrToken[0] as IRusSentenceWord).word).toBeInstanceOf(RusVerb);
  expect(((sentences[0].phrases[0].wordOrToken[0] as IRusSentenceWord).word as RusVerb).getText()).toEqual('покажи');
  expect(sentences[0].phrases[1].phraseId).toEqual('entity');
  expect(sentences[0].phrases[1].wordOrToken[0].type).toEqual('EMPTY');
  expect((sentences[0].phrases[1].wordOrToken[1] as IRusSentenceWord).word).toBeInstanceOf(RusNoun);
  expect(((sentences[0].phrases[1].wordOrToken[1] as IRusSentenceWord).word as RusNoun).getText()).toEqual('организации');
  expect(sentences[0].phrases[2].phraseId).toEqual('fromPlace');
  expect((sentences[0].phrases[2].wordOrToken[0] as IRusSentenceWord).word).toBeInstanceOf(RusPreposition);
  expect(((sentences[0].phrases[2].wordOrToken[0] as IRusSentenceWord).word as RusPreposition).getText()).toEqual('из');
  expect((sentences[0].phrases[2].wordOrToken[1] as IRusSentenceWord).word).toBeInstanceOf(RusNoun);
  expect(((sentences[0].phrases[2].wordOrToken[1] as IRusSentenceWord).word as RusNoun).getText()).toEqual('минска');

  tokens = f('покажи все TgdcFunction');
  expect(tokens.length).toEqual(1);

  sentences = nlpParse(tokens[0], sentenceTemplates);
  expect(sentences.length).toEqual(1);
  expect(sentences[0].templateId).toEqual('VPShowByPlace');
  expect(sentences[0].phrases.length).toEqual(2);
  expect(sentences[0].phrases[0].phraseId).toEqual('verb');
  expect((sentences[0].phrases[0].wordOrToken[0] as IRusSentenceWord).word).toBeInstanceOf(RusVerb);
  expect(((sentences[0].phrases[0].wordOrToken[0] as IRusSentenceWord).word as RusVerb).getText()).toEqual('покажи');
  expect(sentences[0].phrases[1].phraseId).toEqual('entity');
  expect((sentences[0].phrases[1].wordOrToken[0] as IRusSentenceWord).word).toBeInstanceOf(RusAdjective);
  expect(((sentences[0].phrases[1].wordOrToken[0] as IRusSentenceWord).word as RusAdjective).getText()).toEqual('все');
  expect((sentences[0].phrases[1].wordOrToken[1] as IRusSentenceToken).token.tokenType.name).toEqual('IDToken');
  expect((sentences[0].phrases[1].wordOrToken[1] as IRusSentenceToken).token.image).toEqual('TgdcFunction');

  tokens = f('покажи все организации из минска');
  expect(tokens.length).toEqual(1);
  sentences = nlpParse(tokens[0], sentenceTemplates);
  expect(sentences.length).toEqual(1);

  tokens = f('покажи все организации из минска и пинска');
  expect(tokens.length).toEqual(1);
  sentences = nlpParse(tokens[0], sentenceTemplates);
  expect(sentences.length).toEqual(1);

  /*
  tokens = f('покажи все организации и банки из минска и пинска');
  expect(tokens.length).toEqual(1);
  sentences = nlpParse(tokens[0], sentenceTemplates);
  expect(sentences.length).toEqual(0);
  */

  tokens = f('отсортируй по названию');
  expect(tokens.length).toEqual(1);
  sentences = nlpParse(tokens[0], sentenceTemplates);
  expect(sentences.length).toEqual(1);

  tokens = f('название содержит "значение"');
  expect(tokens.length).toEqual(1);
  sentences = nlpParse(tokens[0], sentenceTemplates);
  expect(sentences.length).toEqual(1);
});
