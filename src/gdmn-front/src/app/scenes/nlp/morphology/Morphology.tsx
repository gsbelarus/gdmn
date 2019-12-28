import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { IMorphologyProps } from './Morphology.types';
import { useTab } from '@src/app/hooks/useTab';
import {
  RusNounLexemes,
  RusCase,
  AnyWord,
  RusVerbLexemes,
  RusAdjectiveLexemes,
  RusGender,
  RusPrepositionLexemes,
  RusParticleLexemes,
  RusPronounLexemes,
  RusConjunctionLexemes,
  RusAdverbLexemes,
  RusNumeralLexemes,
  morphAnalyzer,
  RusPronoun,
  RusPronounLexeme,
  RusNumeral,
  RusNumeralLexeme,
  RusNumeralMorphSigns,
  RusConjunction,
  RusPreposition,
  RusParticle,
  RusAdverb,
  RusAdjective,
  RusAdjectiveLexeme,
  RusAdjectiveMorphSigns,
  RusVerb,
  RusVerbLexeme,
  RusVerbMorphSigns,
  RusAspect,
  RusTense,
  RusMood,
  Involvement,
  RusNoun,
  RusNounLexeme,
  RusNounMorphSigns,
  getSynonyms,
  SemContext,
  semCategory2Str
} from 'gdmn-nlp';
import { CommandBar, TextField, Stack, DefaultButton, getTheme, mergeStyleSets } from 'office-ui-fabric-react';
import { Frame } from '../../gdmn/components/Frame';
import { gdmnActions } from '../../gdmn/actions';

interface IMorphologyState {
  searchText: string;
  vocabulary?: AnyWord[];
  words?: AnyWord[];
};

export const Morphology = (props: IMorphologyProps): JSX.Element => {

  const { viewTab, url, dispatch, word, theme } = props;

  const { allWordsByPOS, allWords } = useMemo( () => {
    const allWordsByPOS: [string, () => AnyWord[]][] = [
      ['Nouns', () => RusNounLexemes.reduce((p, l) => {p.push(l.getWordForm({ c: RusCase.Nomn, singular: true })); return p;}, [] as AnyWord[])],
      ['Verbs', () => RusVerbLexemes.reduce((p, l) => {p.push(l.getWordForm({ infn: true })); return p;}, [] as AnyWord[])],
      ['Adjs', () => RusAdjectiveLexemes.reduce((p, l) => {p.push(l.getWordForm({ c: RusCase.Nomn, singular: true, gender: RusGender.Masc })); return p;}, [] as AnyWord[])],
      ['Preps', () => RusPrepositionLexemes.reduce((p, l) => {p.push(l.getWordForm()); return p;}, [] as AnyWord[])],
      ['Part', () => RusParticleLexemes.reduce((p, l) => {p.push(l.getWordForm()); return p;}, [] as AnyWord[])],
      ['Pron', () => RusPronounLexemes.reduce((p, l) => {p.push(l.getWordForm(RusCase.Nomn)); return p;}, [] as AnyWord[])],
      ['Conj', () => RusConjunctionLexemes.reduce((p, l) => {p.push(l.getWordForm()); return p;}, [] as AnyWord[])],
      ['Advb', () => RusAdverbLexemes.reduce((p, l) => {p.push(l.getWordForm()); return p;}, [] as AnyWord[])],
      ['Nums', () => RusNumeralLexemes.reduce((p, l) => {
        const wf = l.gender !== undefined ? l.getWordForm({ c: RusCase.Nomn, gender: l.gender })
        : l.getWordForm({ c: RusCase.Nomn });

        if (wf) {
          p.push(wf);
        }
        return p;
      }, [] as AnyWord[])]
    ];

    const allWords = allWordsByPOS.reduce(
      (prev, [_, f]) => ([...prev, ...f()]),
      [] as AnyWord[]
    );

    return { allWordsByPOS, allWords };
  }, []);

  const initState = (): IMorphologyState => {
    if (viewTab && viewTab.sessionData && typeof viewTab.sessionData.searchText === 'string') {
      return viewTab.sessionData as IMorphologyState;
    }

    if (word) {
      const words = morphAnalyzer(word);

      if (words.length) {
        return {
          searchText: word,
          words
        };
      }

      return {
        searchText: word,
        vocabulary: allWords.filter( f => f.word.indexOf(word) >= 0 )
      };
    } else {
      return { searchText: '' };
    }
  };

  const [state, setState] = useState<IMorphologyState>(initState());
  const { searchText, vocabulary, words } = state;

  useTab(viewTab, url, 'Morphology', true, dispatch);

  useEffect( () => {
    return () => {
      dispatch(gdmnActions.saveSessionData({
        viewTabURL: url,
        sessionData: state
      }));
    };
  }, [state, url]);

  const { thClass, tdClass, hoverClass } = useMemo( () => mergeStyleSets({
    thClass: {
      border: '1px solid ' + getTheme().palette.neutralSecondary,
      paddingLeft: '4px',
      paddingRight: '4px',
      fontWeight: 600
    },
    tdClass: {
      border: '1px solid ' + getTheme().palette.neutralSecondary,
      paddingLeft: '4px',
      paddingRight: '4px'
    },
    hoverClass: {
      color: getTheme().semanticColors.actionLink,
      selectors: {
        ':hover': {
          color: getTheme().semanticColors.actionLinkHovered
        }
      }
    }
  }), [theme]);

  const commandBarItems = [
    {
      key: 'clear',
      text: 'Clear',
      iconProps: {
        iconName: 'Clear'
      },
      onClick: () => { setState({ searchText: '' }) }
    }
  ];

  const getSynonymWords = useCallback( (w: AnyWord) => {
    return (w instanceof RusVerb && getSynonyms(w, SemContext.QueryDB) !== undefined)
      ? <Stack horizontal>
          {getSynonyms(w, SemContext.QueryDB)!.map(
            w => w.getWordForm({ infn: true })).filter(
              word => word.word !== w.word ).map(
            s => <span onClick = { () => setWord(s.word) }>{s.word}</span>
          )}
        </Stack>
      : undefined;
  }, []);

  const getCategoryWords = useCallback( (w: AnyWord) => {
    return w.lexeme.semMeanings?.length
      ?
        <Stack
          horizontal
          wrap
          styles={{
            root: {
              padding: '4px',
              backgroundColor: getTheme().palette.black
            }
          }}
        >
          {w.lexeme.semMeanings?.map(
            ({ semCategory }, idx) =>
              <span
                key={idx}
                style={{
                  border: '1px solid ' + getTheme().palette.white,
                  padding: '2px', borderRadius: '2px',
                  color: getTheme().palette.white
                }}
              >
                {semCategory2Str(semCategory)}
              </span>
          )}
        </Stack>
      : undefined;
  }, [theme]);

  const formatWordForms = useCallback( (w: AnyWord) => {
    if (w instanceof RusPronoun) {
      const l = w.lexeme as RusPronounLexeme;
      const f = (c: RusCase) => (
        <div className={hoverClass} onClick={ e => setWord(e.currentTarget.innerText)} >
          {l.getWordForm(c).word}
        </div>
      );

      return (
        <Stack styles={{ root: { paddingLeft: '4px' } }}>
          {f(RusCase.Nomn)}
          {f(RusCase.Gent)}
          {f(RusCase.Datv)}
          {f(RusCase.Accs)}
          {f(RusCase.Ablt)}
          {f(RusCase.Loct)}
        </Stack>
      );
    }

    if (w instanceof RusNumeral) {
      const l = (w as RusNumeral).lexeme as RusNumeralLexeme;
      const f = (morphSigns: RusNumeralMorphSigns) => (
        <div className={hoverClass} onClick={ e => setWord(e.currentTarget.innerText)} >
          {l.getWordForm(morphSigns).word}
        </div>
      );

      return (
        <table style={{
          backgroundColor: getTheme().semanticColors.bodyBackground,
          color: getTheme().semanticColors.bodyText,
          minWidth: '100%',
          borderCollapse: 'collapse',
          borderStyle: 'hidden'
        }}>
          <thead>
            <tr>
              <th className={thClass} colSpan={2}>падеж</th>
              <th className={thClass}>формы</th>
            </tr>
          </thead>
            {
              l.value === 1 || l.value === 2 ?
              <tbody>
                <tr>
                  <th className={thClass} colSpan={2}>Им.</th>
                  <td className={tdClass}>{f({ c: RusCase.Nomn, gender: l.gender })}</td>
                </tr>
                <tr>
                  <th className={thClass} colSpan={2}>Рд.</th>
                  <td className={tdClass}>{f({ c: RusCase.Gent, gender: l.gender })}</td>
                </tr>
                <tr>
                  <th className={thClass} colSpan={2}>Дт.</th>
                  <td className={tdClass}>{f({ c: RusCase.Datv, gender: l.gender })}</td>
                </tr>
                <tr>
                  <th className={thClass} rowSpan={2}>Вн.</th>
                  <th className={thClass}>одуш.</th>
                  <td className={tdClass}>{f({ c: RusCase.Accs, gender: l.gender, animate: true })}</td>
                </tr>
                <tr>
                  <th className={thClass}>неодуш.</th>
                  <td className={tdClass}>{f({ c: RusCase.Accs, gender: l.gender, animate: false })}</td>
                </tr>
                <tr>
                  <th className={thClass} colSpan={2}>Тв.</th>
                  <td className={tdClass}>{f({ c: RusCase.Ablt, gender: l.gender })}</td>
                </tr>
                <tr>
                  <th className={thClass} colSpan={2}>Пр.</th>
                  <td className={tdClass}>{f({ c: RusCase.Loct, gender: l.gender })}</td>
                </tr>
              </tbody>
            :
            <tbody>
              <tr>
                <th className={thClass} colSpan={2}>Им.</th>
                <td className={tdClass}>{f({ c: RusCase.Nomn })}</td>
              </tr>
              <tr>
                <th className={thClass} colSpan={2}>Рд.</th>
                <td className={tdClass}>{f({ c: RusCase.Gent })}</td>
              </tr>
              <tr>
                <th className={thClass} colSpan={2}>Дт.</th>
                <td className={tdClass}>{f({ c: RusCase.Datv })}</td>
              </tr>
              <tr>
                <th className={thClass} rowSpan={2}>Вн.</th>
                <th className={thClass}>одуш.</th>
                <td className={tdClass}>{f({ c: RusCase.Accs, animate: true })}</td>
              </tr>
              <tr>
                <th className={thClass}>неодуш.</th>
                <td className={tdClass}>{f({ c: RusCase.Accs, animate: false })}</td>
              </tr>
              <tr>
                <th className={thClass} colSpan={2}>Тв.</th>
                <td className={tdClass}>{f({ c: RusCase.Ablt })}</td>
              </tr>
              <tr>
                <th className={thClass} colSpan={2}>Пр.</th>
                <td className={tdClass}>{f({ c: RusCase.Loct })}</td>
              </tr>
            </tbody>
          }
        </table>
      );
    }

    if (w instanceof RusConjunction) return <div />;

    if (w instanceof RusPreposition) return <div />;

    if (w instanceof RusParticle) return <div />;

    if (w instanceof RusAdverb) return <div />;

    if (w instanceof RusAdjective) {
      const l = (w as RusAdjective).lexeme as RusAdjectiveLexeme;
      const f = (morphSigns: RusAdjectiveMorphSigns) => (
        <div className={hoverClass} onClick={ e => setWord(e.currentTarget.innerText)} >
          {l.getWordForm(morphSigns).word}
        </div>
      );
      const getShortForm = () => {
        if (!l.hasShortForm()) return null;

        return (
          <tr>
            <th className={thClass} colSpan={2}>Кратк. форма</th>
            <td className={tdClass}>{f({ singular: true, gender: RusGender.Masc, short: true })}</td>
            <td className={tdClass}>{f({ singular: true, gender: RusGender.Neut, short: true })}</td>
            <td className={tdClass}>{f({ singular: true, gender: RusGender.Femn, short: true })}</td>
            <td className={tdClass}>{f({ singular: false, short: true })}</td>
          </tr>
        );
      }

      return (
        <table style={{
          backgroundColor: getTheme().semanticColors.bodyBackground,
          color: getTheme().semanticColors.bodyText,
          minWidth: '100%',
          borderCollapse: 'collapse',
          borderStyle: 'hidden'
        }}>
          <thead>
            <tr>
              <th className={thClass} rowSpan={2} colSpan={2}>
                падеж
              </th>
              <th className={thClass} colSpan={3}>ед. ч.</th>
              <th className={thClass} rowSpan={2}>мн. ч.</th>
            </tr>
            <tr>
              <th className={thClass}>муж.р.</th>
              <th className={thClass}>ср.р.</th>
              <th className={thClass}>жен.р.</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th className={thClass} colSpan={2}>Им.</th>
              <td className={tdClass}>{f({ c: RusCase.Nomn, singular: true, gender: RusGender.Masc })}</td>
              <td className={tdClass}>{f({ c: RusCase.Nomn, singular: true, gender: RusGender.Neut })}</td>
              <td className={tdClass}>{f({ c: RusCase.Nomn, singular: true, gender: RusGender.Femn })}</td>
              <td className={tdClass}>{f({ c: RusCase.Nomn, singular: false })}</td>
            </tr>
            <tr>
              <th className={thClass} colSpan={2}>Рд.</th>
              <td className={tdClass}>{f({ c: RusCase.Gent, singular: true, gender: RusGender.Masc })}</td>
              <td className={tdClass}>{f({ c: RusCase.Gent, singular: true, gender: RusGender.Neut })}</td>
              <td className={tdClass}>{f({ c: RusCase.Gent, singular: true, gender: RusGender.Femn })}</td>
              <td className={tdClass}>{f({ c: RusCase.Gent, singular: false })}</td>
            </tr>
            <tr>
              <th className={thClass} colSpan={2}>Дт.</th>
              <td className={tdClass}>{f({ c: RusCase.Datv, singular: true, gender: RusGender.Masc })}</td>
              <td className={tdClass}>{f({ c: RusCase.Datv, singular: true, gender: RusGender.Neut })}</td>
              <td className={tdClass}>{f({ c: RusCase.Datv, singular: true, gender: RusGender.Femn })}</td>
              <td className={tdClass}>{f({ c: RusCase.Datv, singular: false })}</td>
            </tr>
            <tr>
              <th className={thClass} rowSpan={2}>Вн.</th>
              <th className={thClass}>одуш.</th>
              <td className={tdClass}>{f({ c: RusCase.Accs, singular: true, gender: RusGender.Masc, animate: true })}</td>
              <td className={tdClass} rowSpan={2}>{f({ c: RusCase.Accs, singular: true, gender: RusGender.Neut })}</td>
              <td className={tdClass} rowSpan={2}>{f({ c: RusCase.Accs, singular: true, gender: RusGender.Femn })}</td>
              <td className={tdClass}>{f({ c: RusCase.Accs, singular: false, animate: true })}</td>
            </tr>
            <tr>
              <th className={thClass}>неодуш.</th>
              <td className={tdClass}>{f({ c: RusCase.Accs, singular: true, gender: RusGender.Masc, animate: false })}</td>
              <td className={tdClass}>{f({ c: RusCase.Accs, singular: false, animate: false })}</td>
            </tr>
            <tr>
              <th className={thClass} colSpan={2}>Тв.</th>
              <td className={tdClass}>{f({ c: RusCase.Ablt, singular: true, gender: RusGender.Masc })}</td>
              <td className={tdClass}>{f({ c: RusCase.Ablt, singular: true, gender: RusGender.Neut })}</td>
              <td className={tdClass}>{f({ c: RusCase.Ablt, singular: true, gender: RusGender.Femn })}</td>
              <td className={tdClass}>{f({ c: RusCase.Ablt, singular: false })}</td>
            </tr>
            <tr>
              <th className={thClass} colSpan={2}>Пр.</th>
              <td className={tdClass}>{f({ c: RusCase.Loct, singular: true, gender: RusGender.Masc })}</td>
              <td className={tdClass}>{f({ c: RusCase.Loct, singular: true, gender: RusGender.Neut })}</td>
              <td className={tdClass}>{f({ c: RusCase.Loct, singular: true, gender: RusGender.Femn })}</td>
              <td className={tdClass}>{f({ c: RusCase.Loct, singular: false })}</td>
            </tr>
            {getShortForm()}
          </tbody>
        </table>
      );
    }

    if (w instanceof RusVerb) {
      const l = (w as RusVerb).lexeme as RusVerbLexeme;
      const f = (morphSigns: RusVerbMorphSigns) => (
        <div className={hoverClass} onClick={ e => setWord(e.currentTarget.innerText)} >
          {l.getWordForm(morphSigns).word}
        </div>
      );

      return (
        <table style={{
          backgroundColor: getTheme().semanticColors.bodyBackground,
          color: getTheme().semanticColors.bodyText,
          minWidth: '100%',
          borderCollapse: 'collapse',
          borderStyle: 'hidden'
        }}>
          {
            l.aspect === RusAspect.Perf
            ?
            <>
              <thead>
                <tr>
                  <th className={thClass}>&nbsp;</th>
                  <th className={thClass}>будущее</th>
                  <th className={thClass}>прош.</th>
                  <th className={thClass}>повелит.</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th className={thClass}>Я</th>
                  <td className={tdClass}>{f({ tense: RusTense.Futr, singular: true, person: 1, mood: RusMood.Indc })}</td>
                  <td className={tdClass}>
                    {f({ tense: RusTense.Past, singular: true, gender: RusGender.Masc, mood: RusMood.Indc })}
                    {f({ tense: RusTense.Past, singular: true, gender: RusGender.Femn, mood: RusMood.Indc })}
                  </td>
                  <td className={tdClass}>&mdash;</td>
                </tr>
                <tr>
                  <th className={thClass}>Ты</th>
                  <td className={tdClass}>{f({ tense: RusTense.Futr, singular: true, person: 2, mood: RusMood.Indc })}</td>
                  <td className={tdClass}>
                    {f({ tense: RusTense.Past, singular: true, gender: RusGender.Masc, mood: RusMood.Indc })}
                    {f({ tense: RusTense.Past, singular: true, gender: RusGender.Femn, mood: RusMood.Indc })}
                  </td>
                  <td className={tdClass}>
                    {l.hasImprMood() ? f({ singular: true, mood: RusMood.Impr, involvement: Involvement.Excl }) : '-'}
                  </td>
                </tr>
                <tr>
                  <th className={thClass}>
                    Он
                    <br />
                    Она
                    <br />
                    Оно
                  </th>
                  <td className={tdClass}>{f({ tense: RusTense.Futr, singular: true, person: 3, mood: RusMood.Indc })}</td>
                  <td className={tdClass}>
                    {f({ tense: RusTense.Past, singular: true, gender: RusGender.Masc, mood: RusMood.Indc })}
                    {f({ tense: RusTense.Past, singular: true, gender: RusGender.Femn, mood: RusMood.Indc })}
                    {f({ tense: RusTense.Past, singular: true, gender: RusGender.Neut, mood: RusMood.Indc })}
                  </td>
                  <td className={tdClass}>&mdash;</td>
                </tr>
                <tr>
                  <th className={thClass}>Мы</th>
                  <td className={tdClass}>{f({ tense: RusTense.Futr, singular: false, person: 1, mood: RusMood.Indc })}</td>
                  <td className={tdClass}>{f({ tense: RusTense.Past, singular: false, mood: RusMood.Indc })}</td>
                  <td className={tdClass}>&mdash;</td>
                </tr>
                <tr>
                  <th className={thClass}>Вы</th>
                  <td className={tdClass}>{f({ tense: RusTense.Futr, singular: false, person: 2, mood: RusMood.Indc })}</td>
                  <td className={tdClass}>{f({ tense: RusTense.Past, singular: false, mood: RusMood.Indc })}</td>
                  <td className={tdClass}>
                    {l.hasImprMood() ? f({ singular: false, mood: RusMood.Impr, involvement: Involvement.Excl }) : '-'}
                  </td>
                </tr>
                <tr>
                  <th className={thClass}>Они</th>
                  <td className={tdClass}>{f({ tense: RusTense.Futr, singular: false, person: 3, mood: RusMood.Indc })}</td>
                  <td className={tdClass}>{f({ tense: RusTense.Past, singular: false, mood: RusMood.Indc })}</td>
                  <td className={tdClass}>&mdash;</td>
                </tr>
              </tbody>
            </>
            :
            <>
              <thead>
                <tr>
                  <th className={thClass}>&nbsp;</th>
                  <th className={thClass}>наст.</th>
                  <th className={thClass}>прош.</th>
                  <th className={thClass}>повелит.</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th className={thClass}>Я</th>
                  <td className={tdClass}>{f({ tense: RusTense.Pres, singular: true, person: 1, mood: RusMood.Indc })}</td>
                  <td className={tdClass}>
                    {f({ tense: RusTense.Past, singular: true, gender: RusGender.Masc, mood: RusMood.Indc })}
                    {f({ tense: RusTense.Past, singular: true, gender: RusGender.Femn, mood: RusMood.Indc })}
                  </td>
                  <td className={tdClass}>&mdash;</td>
                </tr>
                <tr>
                  <th className={thClass}>Ты</th>
                  <td className={tdClass}>{f({ tense: RusTense.Pres, singular: true, person: 2, mood: RusMood.Indc })}</td>
                  <td className={tdClass}>
                    {f({ tense: RusTense.Past, singular: true, gender: RusGender.Masc, mood: RusMood.Indc })}
                    {f({ tense: RusTense.Past, singular: true, gender: RusGender.Femn, mood: RusMood.Indc })}
                  </td>
                  <td className={tdClass}>
                    {l.hasImprMood() ? f({ singular: true, mood: RusMood.Impr, involvement: Involvement.Excl }) : '-'}
                  </td>
                </tr>
                <tr>
                  <th className={thClass}>
                    Он
                    <br />
                    Она
                    <br />
                    Оно
                  </th>
                  <td className={tdClass}>{f({ tense: RusTense.Pres, singular: true, person: 3, mood: RusMood.Indc })}</td>
                  <td className={tdClass}>
                    {f({ tense: RusTense.Past, singular: true, gender: RusGender.Masc, mood: RusMood.Indc })}
                    {f({ tense: RusTense.Past, singular: true, gender: RusGender.Femn, mood: RusMood.Indc })}
                    {f({ tense: RusTense.Past, singular: true, gender: RusGender.Neut, mood: RusMood.Indc })}
                  </td>
                  <td className={tdClass}>&mdash;</td>
                </tr>
                <tr>
                  <th className={thClass}>Мы</th>
                  <td className={tdClass}>{f({ tense: RusTense.Pres, singular: false, person: 1, mood: RusMood.Indc })}</td>
                  <td className={tdClass}>{f({ tense: RusTense.Past, singular: false, mood: RusMood.Indc })}</td>
                  <td className={tdClass}>&mdash;</td>
                </tr>
                <tr>
                  <th className={thClass}>Вы</th>
                  <td className={tdClass}>{f({ tense: RusTense.Pres, singular: false, person: 2, mood: RusMood.Indc })}</td>
                  <td className={tdClass}>{f({ tense: RusTense.Past, singular: false, mood: RusMood.Indc })}</td>
                  <td className={tdClass}>
                    {l.hasImprMood() ? f({ singular: false, mood: RusMood.Impr, involvement: Involvement.Excl }) : '-'}
                  </td>
                </tr>
                <tr>
                  <th className={thClass}>Они</th>
                  <td className={tdClass}>{f({ tense: RusTense.Pres, singular: false, person: 3, mood: RusMood.Indc })}</td>
                  <td className={tdClass}>{f({ tense: RusTense.Past, singular: false, mood: RusMood.Indc })}</td>
                  <td className={tdClass}>&mdash;</td>
                </tr>
                <tr>
                  <th className={thClass}>Будущее</th>
                  <td className={tdClass} colSpan={3}>буду/будешь {f({ infn: true })}</td>
                </tr>
              </tbody>
            </>
          }
        </table>
      );
    } else {
      const l = (w as RusNoun).lexeme as RusNounLexeme;

      const f = (morphSigns: RusNounMorphSigns) => (
        <div className={hoverClass} onClick={ e => setWord(e.currentTarget.innerText)} >
          {l.getWordForm(morphSigns).word}
        </div>
      );

      if (l.hasPlural()) {
        return (
          <Stack horizontal styles={{ root: { paddingLeft: '4px' } }}>
            <Stack.Item grow={1}>
              {f({ c: RusCase.Nomn, singular: true })}
              {f({ c: RusCase.Gent, singular: true })}
              {f({ c: RusCase.Datv, singular: true })}
              {f({ c: RusCase.Accs, singular: true })}
              {f({ c: RusCase.Ablt, singular: true })}
              {f({ c: RusCase.Loct, singular: true })}
            </Stack.Item>
            <Stack.Item grow={1}>
              {f({ c: RusCase.Nomn, singular: false })}
              {f({ c: RusCase.Gent, singular: false })}
              {f({ c: RusCase.Datv, singular: false })}
              {f({ c: RusCase.Accs, singular: false })}
              {f({ c: RusCase.Ablt, singular: false })}
              {f({ c: RusCase.Loct, singular: false })}
            </Stack.Item>
          </Stack>
        );
      } else {
        return (
          <Stack styles={{ root: { paddingLeft: '4px' } }}>
            {f({ c: RusCase.Nomn, singular: true })}
            {f({ c: RusCase.Gent, singular: true })}
            {f({ c: RusCase.Datv, singular: true })}
            {f({ c: RusCase.Accs, singular: true })}
            {f({ c: RusCase.Ablt, singular: true })}
            {f({ c: RusCase.Loct, singular: true })}
          </Stack>
        );
      }
    }
  }, []);

  const setWord = (w: string) => {
    setState({
      searchText: w,
      words: morphAnalyzer(w)
    })
  };

  return (
    <>
      <CommandBar
        items={commandBarItems}
      />
      <Frame marginLeft marginRight>
        <Stack horizontal verticalAlign="end" tokens={{ childrenGap: '4px' }}>
          <TextField
            label="Search:"
            value={searchText}
            onChange={ (_e, newValue) => {
              if (newValue) {
                const vocabulary = allWords.filter( f => f.word.indexOf(newValue) >= 0 );
                const words = vocabulary.length === 1 ? morphAnalyzer(newValue) : undefined;
                setState({
                  searchText: newValue,
                  vocabulary: words && words.length ? undefined : vocabulary,
                  words: words && words.length ? words : undefined
                })
              } else {
                setState({
                  searchText: ''
                })
              }
            }}
          />
          {
            allWordsByPOS.map( ([posName, f]) => (
              <DefaultButton
                key={posName}
                text={posName}
                onClick={() => { setState({ searchText: '', vocabulary: f() }) }}
              />
            ))
          }
        </Stack>
      </Frame>
      <Frame marginTop marginLeft marginRight>
        <Stack horizontal wrap tokens={{ childrenGap: '4px' }} styles={{ root: { overflowX: 'hidden' } }}>
          {
            vocabulary && vocabulary.sort( (a, b) => a.word.localeCompare(b.word) ).map((l, idx) =>
              <DefaultButton
                key={`${l.word}${idx}`}
                text={l.word}
                onRenderText={
                  l.lexeme.semMeanings?.length
                ? () => {
                    return <>{l.word}<sup>{l.lexeme.semMeanings?.length}</sup></>;
                  }
                  : undefined
                }
                onClick={ () => { setState({ searchText: l.word, words: morphAnalyzer(l.word) }) } }
              />
            )
          }
          {
            words && words.map( w =>
              <span
                key={w.getDisplayText()}
                style={{
                  border: '1px solid ' + getTheme().palette.themeDarker,
                  minWidth: '280px',
                  cursor: 'default',
                  backgroundColor: getTheme().semanticColors.bodyBackground
                }}
              >
                <div>
                  <div>
                    {w.getDisplayText().split(';').map(
                      (s, i) =>
                        <div
                          key={i}
                          style={
                            i ?
                            {
                              paddingLeft: '4px',
                              backgroundColor: getTheme().palette.neutralLight,
                              color: getTheme().palette.black
                            }
                            :
                            {
                              paddingLeft: '4px',
                              backgroundColor: getTheme().palette.themeDarker,
                              color: getTheme().palette.white,
                              fontWeight: 600
                            }
                          }
                        >
                          {s}
                        </div>
                    )}
                  </div>
                  <div
                    style={{
                      paddingLeft: '4px',
                      backgroundColor: getTheme().palette.neutralLight,
                      color: getTheme().palette.black,
                      borderBottom: '1px solid ' + getTheme().palette.black,
                      borderTop: '1px dotted ' + getTheme().palette.black,
                      fontWeight: 600
                    }}
                  >
                    {w.getSignature()}
                  </div>
                </div>
                {getSynonymWords(w)}
                {getCategoryWords(w)}
                {formatWordForms(w)}
              </span>
            )
          }
        </Stack>
      </Frame>
    </>
  );
};