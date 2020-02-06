import { XPhraseElement, XRusWordTemplate, IXPhraseTemplate, IXPhrase, XWordOrToken, isIXPhraseTemplate, isIXInheritedPhraseTemplate, XPhraseTemplate } from "./types";
import { INLPToken, nlpCyrillicWord, AnyWord, RusNoun, RusPreposition, RusAdjective, RusVerb, nlpIDToken, nlpQuotedLiteral, nlpWhiteSpace, nlpLineBreak, RusConjunction, nlpPeriod } from "..";

const match = (token: INLPToken, element: XPhraseElement): XWordOrToken | undefined => {
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
            type: 'WORD',
            word: res
          };
        }
      }

      return undefined;
    }

    case nlpIDToken: {
      return element.type === 'ID' ? { type: 'TOKEN', token } : undefined;
    }

    case nlpQuotedLiteral: {
      return element.type === 'QUOTED_LITERAL' ? { type: 'TOKEN', token } : undefined;
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

interface IXParseResultSuccess extends IXParseResultBase {
  type: 'SUCCESS';
  restTokens: INLPToken[];
  phrase: IXPhrase;
};

interface IXParseResultError extends IXParseResultBase {
  type: 'ERROR';
  restTokens: INLPToken[];
  errorStack: IXParseError[];
};

type XParseResult = IXParseResultSuccess | IXParseResultError;

export const mergeTemplates = (template: XPhraseTemplate): IXPhraseTemplate => {
  if (isIXPhraseTemplate(template)) {
    return template;
  } else {
    return {...mergeTemplates(template.parent), ...template}
  }
};

export const xParse = (inTokens: INLPToken[], inTemplate: XPhraseTemplate): XParseResult => {

  const template = mergeTemplates(inTemplate);

  let restTokens = inTokens;
  let phrase: Partial<IXPhrase> = {
    phraseTemplateId: template.id
  };

  if (template.specifier) {
    const r = xParse(restTokens, template.specifier.template);
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

  let tokenIdx = 0;

  while (tokenIdx < restTokens.length) {
    let token = restTokens[tokenIdx];

    if (token.tokenType === nlpWhiteSpace || token.tokenType === nlpLineBreak) {
      tokenIdx++;
    } else {
      break;
    }
  }

  if (tokenIdx) {
    restTokens = restTokens.slice(tokenIdx);
  }

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

      const token = restTokens[0];
      const m = match(token, element);

      if (m) {
        if (m.type === 'WORD' && token.uniformPOS && !template.head.noUniform) {
          m.uniform = [];

          token.uniformPOS.forEach( u => {
            if (u.words) {
              const matchedUniform = u.words.find( mu => mu.getSignature() === m.word.getSignature() );

              if (matchedUniform) {
                m.uniform!.push({ type: 'WORD', word: matchedUniform });
              }
              else if (u.words[0] instanceof RusConjunction) {
                m.uniform!.push({ type: 'WORD', word: u.words[0] });
              }
              else {
                return {
                  restTokens,
                  error: `Invaid token ${u}`
                };
              }
            } else {
              if (u.tokenType !== nlpWhiteSpace && u.tokenType !== nlpLineBreak) {
                m.uniform!.push({ type: 'TOKEN', token: u });
              }
            }
          });
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

  if (template.complements) {
    phrase.complements = [];

    for (const complement of template.complements) {
      const r = xParse(restTokens, complement.template);
      if (r.type === 'SUCCESS') {
        restTokens = r.restTokens;
        phrase.complements.push(r.phrase);
      }
      else if (!complement.optional) {
        return {
          type: 'ERROR',
          restTokens,
          errorStack: [{ phraseTemplateId: template.id, error: `Missed complement ${complement.template.id}.` }, ...r.errorStack]
        }
      }
    }

    if (!phrase.complements.length) {
      phrase.complements = undefined;
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
    if (path[i] === 'H' && (path[i + 1] ?? '0') === '0') {
      return phrase.headTokens?.[0] ?? phrase.head;
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
