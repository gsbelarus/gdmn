import {Lexeme, AnyWords, AnyWord} from './morphology';
import { RusNounLexemes } from './rusNoun';
import { RusVerbLexemes } from './rusVerb';
import { RusAdjectiveLexemes } from './rusAdjective';
import { RusPrepositionLexemes } from './rusPreposition';
import { RusPronounLexemes } from './rusPronoun';
import { RusConjunctionLexemes } from './rusConjunction';
import { RusAdverbLexemes } from './rusAdverb';
import { RusNumeralLexemes } from './rusNumeral';
import { RusParticleLexemes } from './rusParticle';

/**
 * Возвращает все возможные словоформы для заданного слова.
 * @param word заданное слово
 */
export function morphAnalyzer(word: string): AnyWords {
  const res: AnyWords = [];
  const resFunc = function (w: AnyWord): void { res.push(w); };
  const lw = word.toLowerCase();
  const pos: Lexeme[][] = [RusNounLexemes, RusNumeralLexemes, RusVerbLexemes, RusAdjectiveLexemes,
    RusPronounLexemes, RusConjunctionLexemes, RusPrepositionLexemes, RusParticleLexemes, RusAdverbLexemes];
  pos.forEach( lexemes => lexemes.forEach( l => l.analyze(lw, resFunc)) );
  return res;
}
