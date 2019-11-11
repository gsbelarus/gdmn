import { INLPToken, IRusSentenceTemplate, RusPhraseWordTemplate, RusNoun, RusVerb, AnyWord, IRusSentence } from "..";
import { nlpWhiteSpace, nlpLineBreak, nlpCyrillicWord } from "./tokenizer";
import { RusAdjective } from "../morphology/rusAdjective";
import { RusPreposition } from "../morphology/rusPreposition";

const match = (token: INLPToken, words: RusPhraseWordTemplate[]) => {
  for (const word of words) {
    switch (word.pos) {
      case 'NOUN':
        return token.words && token.words.find(
          w => w instanceof RusNoun
            && (!word.image || word.image === w.getText())
            && (word.case === undefined || word.case === w.grammCase)
            && (word.number === undefined || (word.number === 'SINGULAR' && w.singular) || (word.number === 'PLURAL' && !w.singular))
        );

      case 'VERB':
        return token.words && token.words.find(
          w => w instanceof RusVerb
            && (!word.image || word.image === w.getText())
            && (word.mood === undefined || word.mood === w.mood)
        );

      case 'ADJF':
        return token.words && token.words.find(
          w => w instanceof RusAdjective
            && (!word.image || word.image === w.getText())
            && (word.case === undefined || word.case === w.grammCase)
        );

      case 'PREP':
        return token.words && token.words.find(
          w => w instanceof RusPreposition
            && (!word.image || word.image === w.getText())
        );
    }
  }
};

export const nlpParse = (tokens: INLPToken[], templates: IRusSentenceTemplate[]): IRusSentence[] => {
  const res: IRusSentence[] = [];

  for (const template of templates) {
    let tokenIdx = 0;
    let phraseIdx = 0;
    let matched = true;
    const sentence: IRusSentence = { templateId: template.id, phrases: [] };

    while (tokenIdx < tokens.length && phraseIdx < template.phrases.length) {
      let token = tokens[tokenIdx];

      if (token.tokenType === nlpWhiteSpace || token.tokenType === nlpLineBreak) {
        tokenIdx++;
        continue;
      }

      if (token.tokenType !== nlpCyrillicWord) {
        matched = false;
        break;
      }

      const phrase = template.phrases[phraseIdx++];

      let phraseWordIdx = 0;
      const foundWords: AnyWord[] = [];
      while (tokenIdx < tokens.length && phraseWordIdx < phrase.template.words.length) {
        token = tokens[tokenIdx];

        if (token.tokenType === nlpWhiteSpace || token.tokenType === nlpLineBreak) {
          tokenIdx++;
          continue;
        }

        const phraseWord = phrase.template.words[phraseWordIdx];
        const found = match(token, phraseWord.wordForms);

        if (found) {
          foundWords.push(found);
          tokenIdx++;
          phraseWordIdx++;
        } else {
          if (phraseWord.optional) {
            phraseWordIdx++;
          } else {
            matched = false;
            break;
          }
        }
      }

      if (!foundWords.length && !phrase.optional) {
        matched = false;
        break;
      }

      if (foundWords.length) {
        sentence.phrases.push({
          phraseId: phrase.id,
          words: foundWords
        });
      }
    }

    if (matched && sentence.phrases.length) {
      res.push(sentence);
    }
  }

  return res;
};
