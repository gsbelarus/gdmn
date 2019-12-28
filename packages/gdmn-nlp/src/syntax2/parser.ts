import { INLPToken, IRusSentenceTemplate, RusPhraseElement, RusNoun, RusVerb, IRusSentence, Word, AnyWord } from "..";
import { nlpWhiteSpace, nlpLineBreak, nlpCyrillicWord, nlpIDToken, nlpQuotedLiteral } from "./tokenizer";
import { RusAdjective } from "../morphology/rusAdjective";
import { RusPreposition } from "../morphology/rusPreposition";
import { RusWordTemplate, RusSentenceWordOrToken } from "./types";
import { RusConjunction } from "../morphology/rusConjunction";

const match = (token: INLPToken, srcElements: RusPhraseElement[]) => {
  switch (token.tokenType) {
    case nlpCyrillicWord: {

      for (const element of srcElements.filter( e => e.type === 'WORD' )) {
        let res: AnyWord | undefined = undefined;
        const word = element as RusWordTemplate;

        switch (word.pos) {
          case 'NOUN':
            res = token.words && token.words.find(
              w => w instanceof RusNoun
                && (!word.image || word.image === w.getText())
                && (word.case === undefined || word.case === w.grammCase)
                && (word.number === undefined || (word.number === 'SINGULAR' && w.singular) || (word.number === 'PLURAL' && !w.singular))
            );
            break;

          case 'VERB':
            res = token.words && token.words.find(
              w => w instanceof RusVerb
                && (!word.image || word.image === w.getText())
                && (word.mood === undefined || word.mood === w.mood)
            );
            break;

          case 'ADJF':
            res = token.words && token.words.find(
              w => w instanceof RusAdjective
                && (!word.image || word.image === w.getText())
                && (word.case === undefined || word.case === w.grammCase)
            );
            break;

          case 'PREP':
            res = token.words && token.words.find(
              w => w instanceof RusPreposition
                && (!word.image || word.image === w.getText())
            );
        }

        if (res) {
          return res;
        }
      }

      return undefined;
    }

    case nlpIDToken: {
      return srcElements.some( e => e.type === 'ID' );
    }

    case nlpQuotedLiteral: {
      return srcElements.some( e => e.type === 'QUOTED_LITERAL' );
    }
  }
};

/**
 * Возвращает все возможные варианты разбора предложения
 * в соответствии с заданными шаблонами.
 * @param tokens Предложение для разбора.
 * @param templates Набор шаблонов.
 */
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

      if (token.tokenType !== nlpCyrillicWord && token.tokenType !== nlpIDToken && token.tokenType !== nlpQuotedLiteral) {
        matched = false;
        break;
      }

      const phrase = template.phrases[phraseIdx++];
      const foundWords: RusSentenceWordOrToken[] = [];
      const savedTokenIdx = tokenIdx;

      for (const altPhrase of phrase.alt) {
        let phraseElementIdx = 0;
        foundWords.length = 0;
        matched = true;

        while (tokenIdx < tokens.length && phraseElementIdx < altPhrase.template.elements.length) {
          token = tokens[tokenIdx];

          if (token.tokenType === nlpWhiteSpace || token.tokenType === nlpLineBreak) {
            tokenIdx++;
            continue;
          }

          const phraseElement = altPhrase.template.elements[phraseElementIdx];
          const found = match(token, phraseElement.alt);

          if (found) {
            if (found instanceof Word) {
              foundWords.push({ type: 'WORD', word: found, token });

              if (token.uniformPOS) {
                token.uniformPOS.forEach( u => {
                  if (u.words) {
                    const matchedUniform = u.words.find( mu => mu.getSignature() === found.getSignature() );

                    if (matchedUniform) {
                      foundWords.push({ type: 'WORD', word: matchedUniform, token: u });
                    }
                    else if (u.words[0] instanceof RusConjunction) {
                      foundWords.push({ type: 'WORD', word: u.words[0], token: u });
                    }
                    else {
                      throw new Error(`Invaid token ${u}`);
                    }
                  } else {
                    if (u.tokenType !== nlpWhiteSpace && u.tokenType !== nlpLineBreak) {
                      foundWords.push({ type: 'TOKEN', token: u });
                    }
                  }
                });
              }
            } else {
              foundWords.push({ type: 'TOKEN', token });
            }
            tokenIdx++;
            phraseElementIdx++;
          } else {
            if (phraseElement.optional) {
              foundWords.push({ type: 'EMPTY' });
              phraseElementIdx++;
            } else {
              matched = false;
              break;
            }
          }
        }

        if (matched && foundWords.length) {
          sentence.phrases.push({
            phraseId: altPhrase.id,
            phraseTemplateId: altPhrase.template.id,
            wordOrToken: foundWords
          });
          break;
        } else {
          tokenIdx = savedTokenIdx;
        }
      }

      if (!foundWords.length && !phrase.optional) {
        matched = false;
        break;
      }

    }

    if (matched && sentence.phrases.length) {
      res.push(sentence);
    }
  }

  return res;
};
