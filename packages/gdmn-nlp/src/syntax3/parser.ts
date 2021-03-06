import { XPhraseElement, XRusWordTemplate, IXPhraseTemplate, IXPhrase, XWordOrToken, isIXPhraseTemplate, isIXInheritedPhraseTemplate, XPhraseTemplate } from "./types";
import { INLPToken, nlpCyrillicWord, AnyWord, RusNoun, RusPreposition, RusAdjective, RusVerb, nlpIDToken, nlpQuotedLiteral, nlpWhiteSpace, nlpLineBreak, RusConjunction } from "..";
import { nlpComma } from "../syntax2/tokenizer";

let xid = 1;

const match = (token: INLPToken, negative: boolean, element: XPhraseElement): XWordOrToken | undefined => {
  if (isIXPhraseTemplate(element) || isIXInheritedPhraseTemplate(element)) {
    return undefined;
  }

  switch (token.tokenType) {
    case nlpCyrillicWord: {

      if (element.type === 'WORD' ) {
        let res: AnyWord | undefined = undefined;
        const word = element as XRusWordTemplate;

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
          return {
            id: xid++,
            type: 'WORD',
            word: res,
            negative
          };
        }
      }

      return undefined;
    }

    case nlpIDToken: {
      return element.type === 'ID' ? { id: xid++, type: 'TOKEN', token } : undefined;
    }

    case nlpQuotedLiteral: {
      return element.type === 'QUOTED_LITERAL' ? { id: xid++, type: 'TOKEN', token } : undefined;
    }
  }
};

interface IXParseError {
  phraseTemplateId: string;
  error: string;
};

interface IXParseResultBase {
  type: 'ERROR' | 'SUCCESS';
}

export interface IXParseResultSuccess extends IXParseResultBase {
  type: 'SUCCESS';
  restTokens: INLPToken[];
  phrase: IXPhrase;
};

export interface IXParseResultError extends IXParseResultBase {
  type: 'ERROR';
  restTokens: INLPToken[];
  errorStack: IXParseError[];
};

export type XParseResult = IXParseResultSuccess | IXParseResultError;

export const mergeTemplates = (template: XPhraseTemplate): IXPhraseTemplate => {
  if (isIXPhraseTemplate(template)) {
    return template;
  } else {
    return {...mergeTemplates(template.parent), ...template}
  }
};

const skipWhiteSpaces = (tokens: INLPToken[], startIdx = 0, skipComma?: boolean) => {
  while (startIdx < tokens.length) {
    let token = tokens[startIdx];

    if (token.tokenType === nlpWhiteSpace || token.tokenType === nlpLineBreak) {
      startIdx++;
    }
    else if (token.tokenType === nlpComma && skipComma) {
      startIdx++;
    } else {
      break;
    }
  }

  if (startIdx) {
    return tokens.slice(startIdx);
  } else {
    return tokens;
  }
};

export const xParse = (inTokens: INLPToken[], inTemplate: XPhraseTemplate, skipComma?: boolean): XParseResult => {

  const template = mergeTemplates(inTemplate);

  let restTokens = inTokens;
  let phrase: Partial<IXPhrase> = {
    id: xid++,
    phraseTemplateId: template.id
  };

  if (template.specifier) {
    const r = xParse(restTokens, template.specifier.template, skipComma);
    if (r.type === 'SUCCESS') {
      restTokens = r.restTokens;
      phrase.specifier = r.phrase;
    }
    else if (!template.specifier.optional) {
      return {
        type: 'ERROR',
        restTokens,
        errorStack: [{ phraseTemplateId: template.id, error: 'No specifier found.' }, ...r.errorStack]
      }
    }
  }

  restTokens = skipWhiteSpaces(restTokens, 0, skipComma);

  if (!restTokens.length) {
    return {
      type: 'ERROR',
      restTokens,
      errorStack: [{ phraseTemplateId: template.id, error: 'No head found' }]
    }
  }

  for (const element of template.head.template) {
    if (isIXPhraseTemplate(element)) {
      const r = xParse(restTokens, element);
      if (r.type === 'SUCCESS') {
        restTokens = r.restTokens;
        phrase.head = r.phrase;
        break;
      }
    } else {
      if (restTokens[0].tokenType !== nlpCyrillicWord && restTokens[0].tokenType !== nlpIDToken && restTokens[0].tokenType !== nlpQuotedLiteral) {
        return {
          type: 'ERROR',
          restTokens,
          errorStack: [{ phraseTemplateId: template.id, error: `Invalid symbol "${restTokens[0].image}"` }]
        }
      }

      let negative = false;

      if (restTokens[0].words?.[0]?.getSignature() === 'PARTNegt') {
        restTokens = skipWhiteSpaces(restTokens, 1);

        if (!restTokens.length) {
          return {
            type: 'ERROR',
            restTokens,
            errorStack: [{ phraseTemplateId: template.id, error: 'No head found' }]
          }
        }

        negative = true;
      }

      const token = restTokens[0];
      const m = match(token, negative, element);

      if (m) {
        if (token.uniformPOS && !template.head.noUniform) {
          m.uniform = [];
          if (m.type === 'WORD') {
            token.uniformPOS.forEach( u => {
              if (u.words) {
                const matchedUniform = u.words.find( mu => {
                  if (m.word instanceof RusNoun && mu instanceof RusNoun) {
                    return mu.grammCase === m.word.grammCase && mu.singular === m.word.singular;
                  } else {
                    return mu.getSignature() === m.word.getSignature()
                  }
                } );

                if (matchedUniform) {
                  m.uniform!.push({ id: xid++, type: 'WORD', word: matchedUniform });
                }
                else if (u.words[0] instanceof RusConjunction) {
                  m.uniform!.push({ id: xid++, type: 'WORD', word: u.words[0] });
                }
                else {
                  return {
                    restTokens,
                    error: `Invaid token ${u}`
                  };
                }
              } else {
                if (u.tokenType !== nlpWhiteSpace && u.tokenType !== nlpLineBreak) {
                  m.uniform!.push({ id: xid++, type: 'TOKEN', token: u });
                }
              }
            });
          } else {
            token.uniformPOS.forEach( u => {
              if (u.tokenType !== nlpWhiteSpace && u.tokenType !== nlpLineBreak) {
                m.uniform!.push({ id: xid++, type: 'TOKEN', token: u });
              }
            });
          }
        }

        phrase.headTokens = [m];

        restTokens = restTokens.slice(1);
        break;
      }
    }
  }

  if (!phrase.head && !phrase.headTokens) {
    return {
      type: 'ERROR',
      restTokens,
      errorStack: [{ phraseTemplateId: template.id, error: 'Invalid phrase head' }]
    }
  }

  if (template.complements?.length ) {
    phrase.complements = [];

    while (restTokens.length) {
      let complementFound = false;

      for (const complement of template.complements) {
        const r = xParse(restTokens, complement.template, !!complement.comma && !!phrase.complements.length);
        if (r.type === 'SUCCESS') {
          restTokens = r.restTokens;
          phrase.complements.push(r.phrase);
          complementFound = true;
        }
        else if (!complement.optional) {
          if (!phrase.complements.find( pc => pc.phraseTemplateId === complement.template.id )) {
            return {
              type: 'ERROR',
              restTokens,
              errorStack: [{ phraseTemplateId: template.id, error: `Missed complement ${complement.template.id}.` }, ...r.errorStack]
            }
          }
        }
      }

      if (!complementFound) {
        break;
      }
    }

    if (!phrase.complements.length) {
      phrase.complements = undefined;
    } else {
      for (let i = 1; i < phrase.complements.length; i++) {
        phrase.complements[i].prevSibling = phrase.complements[i - 1];
      }
    }
  }

  return {
    type: 'SUCCESS',
    restTokens,
    phrase: phrase as IXPhrase
  }
};

export const phraseFind = (inPhrase: IXPhrase, inPath: string): XWordOrToken | IXPhrase | undefined => {
  const path = inPath.split('/');

  let phrase = inPhrase;
  let foundPhrase: IXPhrase | undefined = undefined;
  let i = 0;

  while (i < path.length) {

    if (path[i] === 'H') {
      if ((path[i + 1] ?? '0') === '0') {
        return phrase.headTokens?.[0] ?? phrase.head;
      }

      const tId = path[i + 1];

      if (phrase.head && phrase.head.phraseTemplateId === tId) {
        phrase = phrase.head;
        i += 2;
        continue;
      } else {
        return undefined;
      }
    }

    if (path[i] === 'C') {
      const tId = path[i + 1];
      foundPhrase = phrase.complements?.find( c => c.phraseTemplateId === tId );
      if (foundPhrase) {
        phrase = foundPhrase;
        i += 2;
        continue;
      } else {
        return undefined;
      }
    }

    if (path[i] === 'A') {
      const tId = path[i + 1];
      foundPhrase = phrase.adjunct?.find( a => a.phraseTemplateId === tId );
      if (foundPhrase) {
        phrase = foundPhrase;
        i += 2;
        continue;
      } else {
        return undefined;
      }
    }


    throw new Error(`Invalid path ${inPath}.`);
  }

  if (foundPhrase) {
    return foundPhrase;
  }

  throw new Error('Empty path.');
};
