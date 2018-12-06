import { SemContext } from "./types";
import { RusVerbLexeme, RusVerbLexemes, RusVerb } from "../morphology/rusVerb";

function v(word: string): RusVerbLexeme {
  const found = RusVerbLexemes.find( l => l.matchStems(word) );
  if (found) {
    return found;
  } else {
    throw new Error(`Unknown word ${word}`);
  }
}

export interface IRusVerbSynonyms {
  semContext: SemContext;
  chains: RusVerbLexeme[][];
};

const rusVerbSynonyms: IRusVerbSynonyms[] = [
  {
    semContext: SemContext.QueryDB,
    chains: [
      ['показать', 'вывести', 'продемонстрировать'].map( w => v(w) ),
      ['удалить', 'уничтожить'].map( w => v(w) )
    ]
  }
];

export function getSynonyms(word: RusVerb, semContext: SemContext) : RusVerbLexeme[] | undefined {
  const synonyms = rusVerbSynonyms.find( s => s.semContext === semContext );
  return synonyms ? synonyms.chains.find( r => r.includes(word.lexeme) ) : undefined;
}

export function hasMeaning(semContext: SemContext, meaning: string, word: RusVerb): boolean {
  const meaningLexeme = v(meaning);

  if (!meaningLexeme) {
    throw new Error(`Unknown word ${meaning}`);
  }

  if (meaningLexeme === word.lexeme) {
    return true;
  }

  const synonyms = rusVerbSynonyms.find( s => s.semContext === semContext );

  return !!synonyms && !!synonyms.chains.find( chain => {
    return !!chain.find( l => l === meaningLexeme )
      && !!chain.find( l => l === word.lexeme );
  });
}