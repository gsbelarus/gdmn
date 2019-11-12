import { sentenceTemplates } from "../templates";
import { nlpParse } from "../parser";
import { nlpTokenize } from "../..";

test('nlpParser2', () => {
  let tokens = nlpTokenize('покажи организации из минска');
  expect(tokens.length).toEqual(1);

  let sentences = nlpParse(tokens[0], sentenceTemplates);
  expect(sentences.length).toEqual(1);
  expect(sentences[0].templateId).toEqual('VPShowByPlace');
  expect(sentences[0].phrases.length).toEqual(3);
  expect(sentences[0].phrases[0].phraseId).toEqual('verb');
  expect(sentences[0].phrases[0].words[0].getText()).toEqual('покажи');
  expect(sentences[0].phrases[1].phraseId).toEqual('object');
  expect(sentences[0].phrases[1].words[0].getText()).toEqual('организации');
  expect(sentences[0].phrases[2].phraseId).toEqual('fromPlace');
  expect(sentences[0].phrases[2].words[0].getText()).toEqual('из');
  expect(sentences[0].phrases[2].words[1].getText()).toEqual('минска');

  tokens = nlpTokenize('покажи все организации из минска');
  expect(tokens.length).toEqual(1);
  sentences = nlpParse(tokens[0], sentenceTemplates);
  expect(sentences.length).toEqual(1);

  tokens = nlpTokenize('покажи все организации из минска и пинска');
  expect(tokens.length).toEqual(1);
  sentences = nlpParse(tokens[0], sentenceTemplates);
  expect(sentences.length).toEqual(1);
});
