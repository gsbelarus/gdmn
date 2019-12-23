import { ISyntaxProps } from "./Syntax.types";
import { useTab } from "@src/app/hooks/useTab";
import React, { useReducer, useEffect } from "react";
import { CommandBar, ComboBox, Stack, Checkbox, Label, getTheme } from "office-ui-fabric-react";
import { Frame } from "../../gdmn/components/Frame";
import { INLPToken, nlpTokenize, IRusSentence, nlpParse, sentenceTemplates, text2Tokens, tokens2sentenceTokens } from "gdmn-nlp";
import { NLPToken } from "./NLPToken";
import { NLPSentence } from "./NLPSentence";
import { ERTranslatorRU2 } from "gdmn-nlp-agent";
import { EQ } from "./EntityQuery";
import { apiService } from "@src/app/services/apiService";
import { IEntityQueryInspector } from "gdmn-orm";
import * as H from 'history';
import { IRSSQLSelect } from "gdmn-recordset";

const predefinedPhrases = [
  'название не содержит ООО',
  'покажи все TgdcFunction',
  'покажи 10 первых организаций',
  'покажи 10 первых организаций, банков из минска и пинска',
  'покажи все организации и банки из минска и пинска',
  'покажи все организации, банки из минска, пинска',
  'покажи все организации из минска',
  'покажи все организации из минска или пинска. отсортируй по наименованию.',
  'покажи все организации из минска или пинска. отсортируй по наименованию. наименование содержит "ООО".',
  'покажи все организации из минска или пинска. наименование содержит "ООО". отсортируй по наименованию.',
  'покажи все организации из минска, пинска',
  'покажи сто двадцать пять организаций из минска',
  'покажи пятую организацию из минска',
  'отсортируй по наименованию',
  'покажи курсы на 10.10.2018',
  'покажи все TgdcUserDocument147134915_1757699501',
  'покажи пятьсот двадцать три  миллиарда шестьсот восемьдесят восемь миллионов триста тридцать тысяч сто сорок одну организацию',
  'три доски',
  'три три доски',
  'три доску',
];

interface ISentence {
  tokens: INLPToken[][];
  selectedTokensIdx: number;
  parsed: IRusSentence[];
  errorMessage?: string;
};

interface ISentenceProps extends ISentence {
  history: H.History;
};

function Sentence({ tokens, selectedTokensIdx, parsed, errorMessage, history }: ISentenceProps) {
  return (
    <>
      {
        errorMessage ?
          <Label styles={{ root: { color: getTheme().palette.red } }}>
            {errorMessage}
          </Label>
        :
          undefined
      }
      {
        tokens.map( (t, idx) =>
          <Frame key={idx} marginTop border selected={idx === selectedTokensIdx} canMinimize>
            <Stack
              horizontal
              wrap
              tokens={{ childrenGap: '4px' }}
              styles={{
                root: { overflow: 'hidden' }
              }}
            >
              {t.map( (w, idx) => <NLPToken key={idx} token={w} onClick={ () => history.push(`/spa/gdmn/morphology/${w.image}`) } /> )}
            </Stack>
          </Frame>
        )
      }
      {
        parsed.map( sentence =>
          <Frame key={sentence.templateId} marginTop border caption={sentence.templateId} canMinimize>
            <NLPSentence sentence={sentence} />
          </Frame>
        )
      }
    </>
  )
};

interface ISyntaxState {
  text: string;
  /**
   * Текст может состоять из предложений.
   * Каждое предложение может иметь несколько вариантов
   * если какое-нибудь слово может быть несколькими частями
   * речи.
   * Каждый вариант -- это последовательность токенов.
   */
  sentences: ISentence[];
  translator?: ERTranslatorRU2;
  processUniform: boolean;
  sql?: IRSSQLSelect;
};

type Action = { type: 'SET_TEXT', text: string }
  | { type: 'SET_TRANSLATOR', translator: ERTranslatorRU2 }
  | { type: 'SET_SQL', sql?: IRSSQLSelect }
  | { type: 'TOGGLE_PROCESS_UNIFORM' };

function reducer(state: ISyntaxState, action: Action): ISyntaxState {

  switch (action.type) {
    case 'SET_TEXT': {
      const { translator, processUniform } = state;
      const { text } = action;
      const rawTokens = text ? text2Tokens(text) : undefined;
      const sentenceTokens = rawTokens ? tokens2sentenceTokens(rawTokens) : [];
      const sentences: ISentence[] = [];

      if (translator) {
        translator.clear();
      }

      for (const st of sentenceTokens) {
        const tokens = nlpTokenize(st, processUniform);
        let errorMessage: string | undefined = undefined;
        let parsed: IRusSentence[] = [];
        try {
          parsed = nlpParse(tokens[0], sentenceTemplates);

          if (translator) {
            translator.process(parsed[0]);
          }
        }
        catch (e) {
          errorMessage = e.message;
        }
        sentences.push({
          tokens,
          selectedTokensIdx: 0,
          parsed,
          errorMessage
        });
      }

      return {
        ...state,
        text,
        sentences,
        sql: undefined
      };
    }

    case 'TOGGLE_PROCESS_UNIFORM': {
      return {
        ...state,
        text: '',
        sentences: [],
        sql: undefined,
        processUniform: !state.processUniform
      };
    }

    case 'SET_TRANSLATOR': {
      return {
        ...state,
        text: '',
        sentences: [],
        translator: action.translator,
        sql: undefined
      };
    }

    case 'SET_SQL': {
      return {
        ...state,
        sql: action.sql
      };
    }
  }
};

export const Syntax = (props: ISyntaxProps): JSX.Element => {

  const { viewTab, url, dispatch, history, erModel } = props;
  const [{ text, sentences, translator, processUniform, sql }, reactDispatch] = useReducer(reducer,
    {
      text: '',
      sentences: [],
      translator: erModel && new ERTranslatorRU2(erModel),
      processUniform: true
    }
  );
  const command = translator?.command;

  useTab(viewTab, url, 'Syntax', true, dispatch);

  useEffect( () => {
    if (erModel && (!translator || translator.erModel !== erModel)) {
      reactDispatch({ type: 'SET_TRANSLATOR', translator: new ERTranslatorRU2(erModel) })
    }
  }, [erModel, translator]);

  useEffect( () => {
    if (command) {
      const inspector = command.payload.inspect();
      const query: IEntityQueryInspector = { ...inspector, options: { ...inspector.options, first: 1 } };
      apiService.query({ query })
      .then( res => {
        if (res.payload && res.payload.result && !res.error) {
          reactDispatch({ type: 'SET_SQL', sql: res.payload.result.info });
        }
      });
    }
  }, [command]);

  const commandBarItems = [
    {
      key: 'clear',
      text: 'Clear',
      iconProps: {
        iconName: 'Clear'
      },
      onClick: () => { reactDispatch({ type: 'SET_TEXT', text: '' }) }
    }
  ];

  return (
    <>
      <CommandBar
        items={commandBarItems}
      />
      <Frame marginLeft marginRight marginBottom>
        <ComboBox
          label="Text"
          text={text}
          allowFreeform
          autoComplete={'off'}
          options={predefinedPhrases.map( p => ({ key: p, text: p }) )}
          onChange={
            (_event, option, _index, text) =>
              text
              ? reactDispatch({ type: 'SET_TEXT', text })
              : option
              ? reactDispatch({ type: 'SET_TEXT', text: option.text })
              : reactDispatch({ type: 'SET_TEXT', text: '' })
          }
        />
        <Checkbox
          label="Обрабатывать однородные части речи"
          checked={processUniform}
          onChange={ () => reactDispatch({ type: 'TOGGLE_PROCESS_UNIFORM' }) }
        />
      </Frame>
      <Frame scroll height='748px' marginLeft>
        {
          sentences.map( (s, idx) => <Sentence key={idx} {...{...s, history}} /> )
        }
        {
          command || sql
          ?
            <Frame border marginTop caption="Command and SQL" canMinimize>
              <Stack horizontal tokens={{ childrenGap: '8px' }}>
                {command ? <EQ eq={command.payload} /> : null}
                {sql ? <Stack><pre>{sql.select}</pre><pre>{JSON.stringify(sql.params, undefined, 2)}</pre></Stack> : null}
              </Stack>
            </Frame>
          :
            null
        }
      </Frame>
    </>
  );
};
