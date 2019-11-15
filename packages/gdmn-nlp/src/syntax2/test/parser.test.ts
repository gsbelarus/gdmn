import { sentenceTemplates } from "../templates";
import { nlpParse } from "../parser";
import { nlpTokenize, RusVerb, RusNoun, RusPreposition, RusAdjective } from "../..";

test('nlpParser2', () => {
  let tokens = nlpTokenize('покажи организации из минска');
  expect(tokens.length).toEqual(1);

  let sentences = nlpParse(tokens[0], sentenceTemplates);
  expect(sentences.length).toEqual(1);
  expect(sentences[0].templateId).toEqual('VPShowByPlace');
  expect(sentences[0].phrases.length).toEqual(3);
  expect(sentences[0].phrases[0].phraseId).toEqual('verb');
  expect(sentences[0].phrases[0].words[0]).toBeInstanceOf(RusVerb);
  expect((sentences[0].phrases[0].words[0] as RusVerb).getText()).toEqual('покажи');
  expect(sentences[0].phrases[1].phraseId).toEqual('entity');
  expect(sentences[0].phrases[1].words[0]).toEqual(null);
  expect(sentences[0].phrases[1].words[1]).toBeInstanceOf(RusNoun);
  expect((sentences[0].phrases[1].words[1] as RusNoun).getText()).toEqual('организации');
  expect(sentences[0].phrases[2].phraseId).toEqual('fromPlace');
  expect(sentences[0].phrases[2].words[0]).toBeInstanceOf(RusPreposition);
  expect((sentences[0].phrases[2].words[0] as RusPreposition).getText()).toEqual('из');
  expect(sentences[0].phrases[2].words[1]).toBeInstanceOf(RusNoun);
  expect((sentences[0].phrases[2].words[1] as RusNoun).getText()).toEqual('минска');

  tokens = nlpTokenize('покажи все TgdcFunction');
  expect(tokens.length).toEqual(1);

  sentences = nlpParse(tokens[0], sentenceTemplates);
  expect(sentences.length).toEqual(1);
  expect(sentences[0].templateId).toEqual('VPShowByPlace');
  expect(sentences[0].phrases.length).toEqual(2);
  expect(sentences[0].phrases[0].phraseId).toEqual('verb');
  expect(sentences[0].phrases[0].words[0]).toBeInstanceOf(Object);
  expect((sentences[0].phrases[0].words[0] as RusVerb).getText()).toEqual('покажи');
  expect(sentences[0].phrases[1].phraseId).toEqual('entity');
  expect(sentences[0].phrases[1].words[0]).toBeInstanceOf(Object);
  expect((sentences[0].phrases[1].words[0] as RusAdjective).getText()).toEqual('все');
  expect(typeof sentences[0].phrases[1].words[1]).toEqual('string');
  expect(sentences[0].phrases[1].words[1]).toEqual('TgdcFunction');

  tokens = nlpTokenize('покажи все организации из минска');
  expect(tokens.length).toEqual(1);
  sentences = nlpParse(tokens[0], sentenceTemplates);
  expect(sentences.length).toEqual(1);

  tokens = nlpTokenize('покажи все организации из минска и пинска');
  expect(tokens.length).toEqual(1);
  sentences = nlpParse(tokens[0], sentenceTemplates);
  expect(sentences.length).toEqual(1);
});
