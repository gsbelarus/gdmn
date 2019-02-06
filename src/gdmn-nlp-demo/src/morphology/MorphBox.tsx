import React, { MouseEvent, Component } from 'react';
import { IToken } from 'chevrotain';
import { TextField  } from 'office-ui-fabric-react/lib/components/TextField';
import { DefaultButton } from 'office-ui-fabric-react/lib/components/Button';
import {
  Involvement,
  RusAdjective,
  RusAdjectiveLexeme,
  RusAdjectiveMorphSigns,
  RusAspect,
  RusCase,
  RusConjunction,
  RusGender,
  RusMood,
  RusNoun,
  RusNounLexeme,
  RusNounMorphSigns,
  RusPreposition,
  RusPronoun,
  RusPronounLexeme,
  RusTense,
  RusVerb,
  RusVerbLexeme,
  RusVerbMorphSigns,
  AnyWord,
  RusNounLexemes,
  RusVerbLexemes,
  RusAdjectiveLexemes,
  RusConjunctionLexemes,
  RusPronounLexemes,
  RusAdverbLexemes,
  RusPrepositionLexemes,
  RusNumeralLexemes,
  RusAdverb,
  getSynonyms,
  SemContext,
  semCategory2Str,
  RusNumeral,
  RusNumeralLexeme,
  RusNumeralMorphSigns
} from 'gdmn-nlp';

import './MorphBox.css';

export interface IMorphBoxProps {
  readonly text: string;
  readonly token: IToken;
  readonly words: AnyWord[];
  readonly onSetText: (text: string) => any;
};

export interface IMorphBoxState {
  vocabulary?: AnyWord[];
};

export class MorphBox extends Component<IMorphBoxProps, IMorphBoxState> {

  state: IMorphBoxState = {};

  private _allWordsByPOS: [string, () => AnyWord[]][];
  private _allWords: AnyWord[];

  constructor(props) {
    super(props);

    this._allWordsByPOS = [
      ['Nouns', () => RusNounLexemes.reduce((p, l) => {p.push(l.getWordForm({ c: RusCase.Nomn, singular: true })); return p;}, [] as AnyWord[])],
      ['Verbs', () => RusVerbLexemes.reduce((p, l) => {p.push(l.getWordForm({ infn: true })); return p;}, [] as AnyWord[])],
      ['Adjs', () => RusAdjectiveLexemes.reduce((p, l) => {p.push(l.getWordForm({ c: RusCase.Nomn, singular: true, gender: RusGender.Masc })); return p;}, [] as AnyWord[])],
      ['Preps', () => RusPrepositionLexemes.reduce((p, l) => {p.push(l.getWordForm()); return p;}, [] as AnyWord[])],
      ['Pron', () => RusPronounLexemes.reduce((p, l) => {p.push(l.getWordForm(RusCase.Nomn)); return p;}, [] as AnyWord[])],
      ['Conj', () => RusConjunctionLexemes.reduce((p, l) => {p.push(l.getWordForm()); return p;}, [] as AnyWord[])],
      ['Advb', () => RusAdverbLexemes.reduce((p, l) => {p.push(l.getWordForm()); return p;}, [] as AnyWord[])],
      ['Nums', () => RusNumeralLexemes.reduce((p, l) => {
        const wf = l.gender !== undefined ? l.getWordForm({ c: RusCase.Nomn, singular: true, gender: l.gender }) 
        : l.getWordForm({ c: RusCase.Nomn, singular: true }); 

        if (wf) {
          p.push(wf);
        }
        return p;
      }, [] as AnyWord[])]
    ];

    this._allWords = this._allWordsByPOS.reduce(
      (prev, pos) => ([...prev, ...pos[1]()]),
      [] as AnyWord[]
    )
  }

  private _getPOSButtons = () => {
    return this._allWordsByPOS.map( i =>
      i[1] && <DefaultButton
        key={i[0]}
        text={i[0]}
        onClick={() => {
          this.props.onSetText("");
          this.setState({ vocabulary: i[1]().sort( (a, b) => a.word.localeCompare(b.word)) })
        }}
      />
    );
  };

  public render() {
    const { text, words, onSetText } = this.props;

    const { vocabulary } = this.state;

    return (
      <div className="ContentBox">
        <div className="MorphInput">
          <TextField
            label="Word"
            style={{maxWidth: '200px'}}
            value={text}
            onChange={ (e: React.ChangeEvent<HTMLInputElement>) => {
              const foundWords: AnyWord[] = this._allWords.filter( f => f.word.indexOf(e.target.value) >= 0 );
              onSetText(e.target.value);
              this.setState({ vocabulary: foundWords });
            }
          }
          />
          {this._getPOSButtons()}
        </div>
        {vocabulary &&
          <div className="MorphVocabulary">
            {
              vocabulary.reduce((p, l, idx) => {
                p.push(
                  <DefaultButton
                    key={idx}
                    text={l.word}
                    onRenderText={
                      l.lexeme.semCategories.length
                    ? () => {
                        return <>{l.word}<sup>{l.lexeme.semCategories.length}</sup></>;
                      }
                      : undefined
                    }
                    onClick={ () => { onSetText(l.word); this.setState({ vocabulary: undefined }); } }
                  />
                );
                return p;
              }, [] as JSX.Element[])
            }
          </div>
        }
        {words.length ?
          <div className="MorphOutput">
            {words.map( (w, idx) => (
              <span key={idx}>
                <div>
                  <div className="MorphOutputDisplayText">
                    {w.getDisplayText().split(';').map(
                      (s, i) => <div key={i}>{s}</div>
                    )}
                  </div>
                  <div className="MorphOutputSignature">{w.getSignature()}</div>
                </div>
                {this.getSynonymWords(w)}
                {this.getCategoryWords(w)}
                {this.formatWordForms(w, onSetText)}
              </span>
            ))}
          </div>
          :
          undefined
        }
      </div>
    );
  }

  private getSynonymWords(w: AnyWord): JSX.Element {
    const { onSetText } = this.props;
    return (w instanceof RusVerb && getSynonyms(w, SemContext.QueryDB) !== undefined)
      ? <div className="SynonymWords">
          {getSynonyms(w, SemContext.QueryDB).map(
            w => w.getWordForm({ infn: true })).filter(
              word => word.word !== w.word ).map(
            s => <span onClick = { () => onSetText(s.word) }>{s.word}</span>
          )}
        </div>
      : undefined;
  }

  private getCategoryWords(w: AnyWord) : JSX.Element {
    return w.lexeme.semCategories.length
      ?
        <div className="SemCategories">
          {w.lexeme.semCategories.map( (c, idx) => <span key={idx}>{semCategory2Str(c)}</span>)}
        </div>
      : undefined;
  }

  private formatWordForms(
    w: AnyWord,
    onSetText: Function
  ): JSX.Element {
    if (w instanceof RusPronoun) {
      const l = w.lexeme as RusPronounLexeme;
      const f = (c: RusCase) => (
        <div onClick={(e: MouseEvent<HTMLDivElement>) => onSetText(e.currentTarget.innerText)}>
          {l.getWordForm(c).word}
        </div>
      );

      return (
        <div className="MorphOutputFlex">
          <span>
            {f(RusCase.Nomn)}
            {f(RusCase.Gent)}
            {f(RusCase.Datv)}
            {f(RusCase.Accs)}
            {f(RusCase.Ablt)}
            {f(RusCase.Loct)}
          </span>
        </div>
      );
    }

    if (w instanceof RusNumeral) {
      const l = (w as RusNumeral).lexeme as RusNumeralLexeme;
      const f = (morphSigns: RusNumeralMorphSigns) => (
        <div onClick={(e: MouseEvent<HTMLDivElement>) => onSetText(e.currentTarget.innerText)}>
          {l.getWordForm(morphSigns).word}
        </div>
      );

      return (
        <div className="MorphOutputFlex">
          <table>
            <thead>
              <tr>
                <th colSpan={2}>падеж</th>
                <th>формы</th>
              </tr>
            </thead>
              {
                l.value === 1 || l.value === 2 ? 
                <tbody>
                <tr>
                  <th colSpan={2}>Им.</th>
                  <td>{f({ c: RusCase.Nomn, singular: true, gender: l.gender })}</td>
                </tr>
                <tr>
                  <th colSpan={2}>Рд.</th>
                  <td>{f({ c: RusCase.Gent, singular: true, gender: l.gender })}</td>
                </tr>
                <tr>
                  <th colSpan={2}>Дт.</th>
                  <td>{f({ c: RusCase.Datv, singular: true, gender: l.gender })}</td>
                </tr>
                <tr>
                  <th rowSpan={2}>Вн.</th>
                  <th>одуш.</th>
                  <td>{f({ c: RusCase.Accs, singular: true, gender: l.gender, animate: true })}</td>
                </tr>
                <tr>
                  <th>неодуш.</th>
                  <td>{f({ c: RusCase.Accs, singular: true, gender: l.gender, animate: false })}</td>
                </tr>
                <tr>
                  <th colSpan={2}>Тв.</th>
                  <td>{f({ c: RusCase.Ablt, singular: true, gender: l.gender })}</td>
                </tr>
                <tr>
                  <th colSpan={2}>Пр.</th>
                  <td>{f({ c: RusCase.Loct, singular: true, gender: l.gender })}</td>
                </tr>
              </tbody>
              :
              <tbody>
              <tr>
                <th colSpan={2}>Им.</th>
                <td>{f({ c: RusCase.Nomn, singular: true })}</td>
              </tr>
              <tr>
                <th colSpan={2}>Рд.</th>
                <td>{f({ c: RusCase.Gent, singular: true })}</td>
              </tr>
              <tr>
                <th colSpan={2}>Дт.</th>
                <td>{f({ c: RusCase.Datv, singular: true })}</td>
              </tr>
              <tr>
                <th rowSpan={2}>Вн.</th>
                <th>одуш.</th>
                <td>{f({ c: RusCase.Accs, singular: true, animate: true })}</td>
              </tr>
              <tr>
                <th>неодуш.</th>
                <td>{f({ c: RusCase.Accs, singular: true, animate: false })}</td>
              </tr>
              <tr>
                <th colSpan={2}>Тв.</th>
                <td>{f({ c: RusCase.Ablt, singular: true })}</td>
              </tr>
              <tr>
                <th colSpan={2}>Пр.</th>
                <td>{f({ c: RusCase.Loct, singular: true })}</td>
              </tr>
            </tbody>
              }
          </table>
        </div>
      );
    }

    if (w instanceof RusConjunction) return <div />;

    if (w instanceof RusPreposition) return <div />;

    if (w instanceof RusAdverb) return <div />;

    if (w instanceof RusAdjective) {
      const l = (w as RusAdjective).lexeme as RusAdjectiveLexeme;
      const f = (morphSigns: RusAdjectiveMorphSigns) => (
        <div onClick={(e: MouseEvent<HTMLElement>) => onSetText(e.currentTarget.innerText)}>
          {l.getWordForm(morphSigns).word}
        </div>
      );
      const getShortForm = () => {
        if (!l.hasShortForm()) return null;

        return (
          <tr>
            <th colSpan={2}>Кратк. форма</th>
            <td>{f({ singular: true, gender: RusGender.Masc, short: true })}</td>
            <td>{f({ singular: true, gender: RusGender.Neut, short: true })}</td>
            <td>{f({ singular: true, gender: RusGender.Femn, short: true })}</td>
            <td>{f({ singular: false, short: true })}</td>
          </tr>
        );
      }

      return (
        <div className="MorphOutputFlex">
          <table>
            <thead>
              <tr>
                <th rowSpan={2} colSpan={2}>
                  падеж
                </th>
                <th colSpan={3}>ед. ч.</th>
                <th rowSpan={2}>мн. ч.</th>
              </tr>
              <tr>
                <th>муж.р.</th>
                <th>ср.р.</th>
                <th>жен.р.</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th colSpan={2}>Им.</th>
                <td>{f({ c: RusCase.Nomn, singular: true, gender: RusGender.Masc })}</td>
                <td>{f({ c: RusCase.Nomn, singular: true, gender: RusGender.Neut })}</td>
                <td>{f({ c: RusCase.Nomn, singular: true, gender: RusGender.Femn })}</td>
                <td>{f({ c: RusCase.Nomn, singular: false })}</td>
              </tr>
              <tr>
                <th colSpan={2}>Рд.</th>
                <td>{f({ c: RusCase.Gent, singular: true, gender: RusGender.Masc })}</td>
                <td>{f({ c: RusCase.Gent, singular: true, gender: RusGender.Neut })}</td>
                <td>{f({ c: RusCase.Gent, singular: true, gender: RusGender.Femn })}</td>
                <td>{f({ c: RusCase.Gent, singular: false })}</td>
              </tr>
              <tr>
                <th colSpan={2}>Дт.</th>
                <td>{f({ c: RusCase.Datv, singular: true, gender: RusGender.Masc })}</td>
                <td>{f({ c: RusCase.Datv, singular: true, gender: RusGender.Neut })}</td>
                <td>{f({ c: RusCase.Datv, singular: true, gender: RusGender.Femn })}</td>
                <td>{f({ c: RusCase.Datv, singular: false })}</td>
              </tr>
              <tr>
                <th rowSpan={2}>Вн.</th>
                <th>одуш.</th>
                <td>{f({ c: RusCase.Accs, singular: true, gender: RusGender.Masc, animate: true })}</td>
                <td rowSpan={2}>{f({ c: RusCase.Accs, singular: true, gender: RusGender.Neut })}</td>
                <td rowSpan={2}>{f({ c: RusCase.Accs, singular: true, gender: RusGender.Femn })}</td>
                <td>{f({ c: RusCase.Accs, singular: false, animate: true })}</td>
              </tr>
              <tr>
                <th>неодуш.</th>
                <td>{f({ c: RusCase.Accs, singular: true, gender: RusGender.Masc, animate: false })}</td>
                <td>{f({ c: RusCase.Accs, singular: false, animate: false })}</td>
              </tr>
              <tr>
                <th colSpan={2}>Тв.</th>
                <td>{f({ c: RusCase.Ablt, singular: true, gender: RusGender.Masc })}</td>
                <td>{f({ c: RusCase.Ablt, singular: true, gender: RusGender.Neut })}</td>
                <td>{f({ c: RusCase.Ablt, singular: true, gender: RusGender.Femn })}</td>
                <td>{f({ c: RusCase.Ablt, singular: false })}</td>
              </tr>
              <tr>
                <th colSpan={2}>Пр.</th>
                <td>{f({ c: RusCase.Loct, singular: true, gender: RusGender.Masc })}</td>
                <td>{f({ c: RusCase.Loct, singular: true, gender: RusGender.Neut })}</td>
                <td>{f({ c: RusCase.Loct, singular: true, gender: RusGender.Femn })}</td>
                <td>{f({ c: RusCase.Loct, singular: false })}</td>
              </tr>
              {getShortForm()}
            </tbody>
          </table>
        </div>
      );
    }

    if (w instanceof RusVerb) {
      const l = (w as RusVerb).lexeme as RusVerbLexeme;
      const f = (morphSigns: RusVerbMorphSigns) => (
        <div onClick={(e: MouseEvent<HTMLElement>) => onSetText(e.currentTarget.innerText)}>
          {l.getWordForm(morphSigns).word}
        </div>
      );

      if (l.aspect === RusAspect.Perf) {
        return (
          <div className="MorphOutputFlex">
            <table>
              <thead>
                <tr>
                  <th>&nbsp;</th>
                  <th>будущее</th>
                  <th>прош.</th>
                  <th>повелит.</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>Я</th>
                  <td>{f({ tense: RusTense.Futr, singular: true, person: 1, mood: RusMood.Indc })}</td>
                  <td>
                    {f({ tense: RusTense.Past, singular: true, gender: RusGender.Masc, mood: RusMood.Indc })}
                    {f({ tense: RusTense.Past, singular: true, gender: RusGender.Femn, mood: RusMood.Indc })}
                  </td>
                  <td>&mdash;</td>
                </tr>
                <tr>
                  <th>Ты</th>
                  <td>{f({ tense: RusTense.Futr, singular: true, person: 2, mood: RusMood.Indc })}</td>
                  <td>
                    {f({ tense: RusTense.Past, singular: true, gender: RusGender.Masc, mood: RusMood.Indc })}
                    {f({ tense: RusTense.Past, singular: true, gender: RusGender.Femn, mood: RusMood.Indc })}
                  </td>
                  <td>
                    {l.hasImprMood() ? f({ singular: true, mood: RusMood.Impr, involvement: Involvement.Excl }) : '-'}
                  </td>
                </tr>
                <tr>
                  <th>
                    Он
                    <br />
                    Она
                    <br />
                    Оно
                  </th>
                  <td>{f({ tense: RusTense.Futr, singular: true, person: 3, mood: RusMood.Indc })}</td>
                  <td>
                    {f({ tense: RusTense.Past, singular: true, gender: RusGender.Masc, mood: RusMood.Indc })}
                    {f({ tense: RusTense.Past, singular: true, gender: RusGender.Femn, mood: RusMood.Indc })}
                    {f({ tense: RusTense.Past, singular: true, gender: RusGender.Neut, mood: RusMood.Indc })}
                  </td>
                  <td>&mdash;</td>
                </tr>
                <tr>
                  <th>Мы</th>
                  <td>{f({ tense: RusTense.Futr, singular: false, person: 1, mood: RusMood.Indc })}</td>
                  <td>{f({ tense: RusTense.Past, singular: false, mood: RusMood.Indc })}</td>
                  <td>&mdash;</td>
                </tr>
                <tr>
                  <th>Вы</th>
                  <td>{f({ tense: RusTense.Futr, singular: false, person: 2, mood: RusMood.Indc })}</td>
                  <td>{f({ tense: RusTense.Past, singular: false, mood: RusMood.Indc })}</td>
                  <td>
                    {l.hasImprMood() ? f({ singular: false, mood: RusMood.Impr, involvement: Involvement.Excl }) : '-'}
                  </td>
                </tr>
                <tr>
                  <th>Они</th>
                  <td>{f({ tense: RusTense.Futr, singular: false, person: 3, mood: RusMood.Indc })}</td>
                  <td>{f({ tense: RusTense.Past, singular: false, mood: RusMood.Indc })}</td>
                  <td>&mdash;</td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      }

      return (
        <div className="MorphOutputFlex">
          <table>
            <thead>
              <tr>
                <th>&nbsp;</th>
                <th>наст.</th>
                <th>прош.</th>
                <th>повелит.</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Я</th>
                <td>{f({ tense: RusTense.Pres, singular: true, person: 1, mood: RusMood.Indc })}</td>
                <td>
                  {f({ tense: RusTense.Past, singular: true, gender: RusGender.Masc, mood: RusMood.Indc })}
                  {f({ tense: RusTense.Past, singular: true, gender: RusGender.Femn, mood: RusMood.Indc })}
                </td>
                <td>&mdash;</td>
              </tr>
              <tr>
                <th>Ты</th>
                <td>{f({ tense: RusTense.Pres, singular: true, person: 2, mood: RusMood.Indc })}</td>
                <td>
                  {f({ tense: RusTense.Past, singular: true, gender: RusGender.Masc, mood: RusMood.Indc })}
                  {f({ tense: RusTense.Past, singular: true, gender: RusGender.Femn, mood: RusMood.Indc })}
                </td>
                <td>
                  {l.hasImprMood() ? f({ singular: true, mood: RusMood.Impr, involvement: Involvement.Excl }) : '-'}
                </td>
              </tr>
              <tr>
                <th>
                  Он
                  <br />
                  Она
                  <br />
                  Оно
                </th>
                <td>{f({ tense: RusTense.Pres, singular: true, person: 3, mood: RusMood.Indc })}</td>
                <td>
                  {f({ tense: RusTense.Past, singular: true, gender: RusGender.Masc, mood: RusMood.Indc })}
                  {f({ tense: RusTense.Past, singular: true, gender: RusGender.Femn, mood: RusMood.Indc })}
                  {f({ tense: RusTense.Past, singular: true, gender: RusGender.Neut, mood: RusMood.Indc })}
                </td>
                <td>&mdash;</td>
              </tr>
              <tr>
                <th>Мы</th>
                <td>{f({ tense: RusTense.Pres, singular: false, person: 1, mood: RusMood.Indc })}</td>
                <td>{f({ tense: RusTense.Past, singular: false, mood: RusMood.Indc })}</td>
                <td>&mdash;</td>
              </tr>
              <tr>
                <th>Вы</th>
                <td>{f({ tense: RusTense.Pres, singular: false, person: 2, mood: RusMood.Indc })}</td>
                <td>{f({ tense: RusTense.Past, singular: false, mood: RusMood.Indc })}</td>
                <td>
                  {l.hasImprMood() ? f({ singular: false, mood: RusMood.Impr, involvement: Involvement.Excl }) : '-'}
                </td>
              </tr>
              <tr>
                <th>Они</th>
                <td>{f({ tense: RusTense.Pres, singular: false, person: 3, mood: RusMood.Indc })}</td>
                <td>{f({ tense: RusTense.Past, singular: false, mood: RusMood.Indc })}</td>
                <td>&mdash;</td>
              </tr>
              <tr>
                <th>Будущее</th>
                <td colSpan={3}>буду/будешь {f({ infn: true })}</td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    } else {
      const l = (w as RusNoun).lexeme as RusNounLexeme;

      const f = (morphSigns: RusNounMorphSigns) => (
        <div onClick={(e: MouseEvent<HTMLDivElement>) => onSetText(e.currentTarget.innerText)}>
          {l.getWordForm(morphSigns).word}
        </div>
      );

      if (l.hasPlural()) {
        return (
          <div className="MorphOutputFlex">
            <span>
              {f({ c: RusCase.Nomn, singular: true })}
              {f({ c: RusCase.Gent, singular: true })}
              {f({ c: RusCase.Datv, singular: true })}
              {f({ c: RusCase.Accs, singular: true })}
              {f({ c: RusCase.Ablt, singular: true })}
              {f({ c: RusCase.Loct, singular: true })}
            </span>
            <span>
              {f({ c: RusCase.Nomn, singular: false })}
              {f({ c: RusCase.Gent, singular: false })}
              {f({ c: RusCase.Datv, singular: false })}
              {f({ c: RusCase.Accs, singular: false })}
              {f({ c: RusCase.Ablt, singular: false })}
              {f({ c: RusCase.Loct, singular: false })}
            </span>
          </div>
        );
      } else {
        return (
          <div className="MorphOutputFlex">
            <span>
              {f({ c: RusCase.Nomn, singular: true })}
              {f({ c: RusCase.Gent, singular: true })}
              {f({ c: RusCase.Datv, singular: true })}
              {f({ c: RusCase.Accs, singular: true })}
              {f({ c: RusCase.Ablt, singular: true })}
              {f({ c: RusCase.Loct, singular: true })}
            </span>
          </div>
        );
      }
    }
  }
};