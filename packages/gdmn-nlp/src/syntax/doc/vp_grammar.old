export const grammar = {
  'bnf': {
    'SENTENCE':
      [
        'VP',
        'NP'
      ],
    'VP':
      ['IMPERATIVE_VP'],
    'IMPERATIVE_VP':
      [
        ['IMPERATIVE_VERB IMPERATIVE_NP', 'yy.node("VP", [$1], 1)'],
        ['IMPERATIVE_VERB', 'yy.node("VP", [$1])']
      ],
    'IMPERATIVE_VERB':
      ['VERBTranPerfSingImpr'],
    'IMPERATIVE_NP':
      [
        ['QUAL_IMPERATIVE_NOUN', ''],
        ['QUAL_IMPERATIVE_NOUN PP', 'yy.node("NP", [], 2)']
      ],
    'QUAL_IMPERATIVE_NOUN':
      [
        ['IMPERATIVE_DETS IMPERATIVE_NOUN', '$$ = yy.node("ANP", [...$1, $2])'],
        ['IMPERATIVE_NOUN', 'yy.node("NP", [$1])']
      ],
    'IMPERATIVE_DETS':
      [
        ['IMPERATIVE_DETS IMPERATIVE_DET', '$$ = [...$1, $2]'],
        ['IMPERATIVE_DET', '$$ = [$1]'],
      ],
    'IMPERATIVE_DET':
      [
        'ADJFAProPlurAccs',
        'ADJFQualPlurAccs'
      ],
    'IMPERATIVE_NOUN':
      ['NOUN_ACCS'],
    'NOUN_ACCS':
      [
        'NOUNAnimMascPlurAccs',
        'NOUNAnimFemnPlurAccs',
        'NOUNAnimNeutPlurAccs',
        'NOUNInanMascPlurAccs',
        'NOUNInanFemnPlurAccs',
        'NOUNInanNeutPlurAccs'
      ],
    'PP':
      [['PREP PP_NOUN', 'yy.node("PP", [$1, ...$2])']],
    'PREP':
      ['PREPPlce'],
    'PP_NOUN':
      [
        ['PP_NOUN CONJ NOUN_GENT', '$$ = [...$1, $2, $3]'],
        ['NOUN_GENT', '$$ = [$1]']
      ],
    'NOUN_GENT':
      [
        'NOUNInanMascSingGent',
        'NOUNInanFemnSingGent',
        'NOUNInanNeutSingGent',
        'NOUNInanMascPlurGent',
        'NOUNInanFemnPlurGent',
        'NOUNInanNeutPlurGent'
      ]
  }
};