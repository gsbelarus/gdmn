import { INLPToken, IRusSentenceTemplate, RusPhraseElement, RusNoun, RusVerb, AnyWord, IRusSentence } from "..";
import { nlpWhiteSpace, nlpLineBreak, nlpCyrillicWord, nlpIDToken } from "./tokenizer";
import { RusAdjective } from "../morphology/rusAdjective";
import { RusPreposition } from "../morphology/rusPreposition";
import { RusWordTemplate, RusPhraseWord } from "./types";

const match = (token: INLPToken, srcElements: RusPhraseElement[]) => {
  switch (token.tokenType) {
    case nlpCyrillicWord: {
      for (const element of srcElements.filter( e => e.type === 'WORD' )) {
        const word = element as RusWordTemplate;

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
    }

    case nlpIDToken: {
      return token.image;
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

      if (token.tokenType !== nlpCyrillicWord && token.tokenType !== nlpIDToken) {
        matched = false;
        break;
      }

      const phrase = template.phrases[phraseIdx++];

      let phraseElementIdx = 0;
      const foundWords: RusPhraseWord[] = [];
      while (tokenIdx < tokens.length && phraseElementIdx < phrase.template.elements.length) {
        token = tokens[tokenIdx];

        if (token.tokenType === nlpWhiteSpace || token.tokenType === nlpLineBreak) {
          tokenIdx++;
          continue;
        }

        const phraseElement = phrase.template.elements[phraseElementIdx];
        const found = match(token, phraseElement.alt);

        if (found) {
          foundWords.push(found);
          tokenIdx++;
          phraseElementIdx++;
        } else {
          if (phraseElement.optional) {
            phraseElementIdx++;
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
