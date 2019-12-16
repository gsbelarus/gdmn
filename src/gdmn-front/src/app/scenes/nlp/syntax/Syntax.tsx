import { ISyntaxProps } from "./Syntax.types";
import { useTab } from "@src/app/hooks/useTab";
import React, { useReducer, useEffect } from "react";
import { CommandBar, ComboBox, Stack, Checkbox } from "office-ui-fabric-react";
import { Frame } from "../../gdmn/components/Frame";
import { INLPToken, nlpTokenize, IRusSentence, nlpParse, sentenceTemplates, text2Tokens } from "gdmn-nlp";
import { NLPToken } from "./NLPToken";
import { NLPSentence } from "./NLPSentence";
import { ERTranslatorRU2, ICommand } from "gdmn-nlp-agent";
import { EQ } from "./EntityQuery";
import { apiService } from "@src/app/services/apiService";
import { IEntityQueryInspector } from "gdmn-orm";

const predefinedPhrases = [
  'название не содержит ООО',
  'покажи все TgdcFunction',
  'покажи 10 первых организаций',
  'покажи 10 первых организаций, банков из минска и пинска',
  'покажи все организации и банки из минска и пинска',
  'покажи все организации, банки из минска, пинска',
  'покажи все организации из минска',
  'покажи все организации из минска или пинска',
  'покажи все организации из минска, пинска',
  'покажи сто двадцать пять организаций из минска',
  'покажи пятую организацию из минска',
  'отсортируй по названию',
  'покажи курсы на 10.10.2018',
  'покажи все TgdcUserDocument147134915_1757699501',
  'покажи пятьсот двадцать три  миллиарда шестьсот восемьдесят восемь миллионов триста тридцать тысяч сто сорок одну организацию',
  'три доски',
  'три три доски',
  'три доску',
];

interface ISyntaxState {
  text: string;
  tokens: INLPToken[][];
  selectedTokensIdx: number;
  parsed: IRusSentence[];
  translator?: ERTranslatorRU2;
  command: ICommand[];
  errorMessage?: string;
  processUniform: boolean;
  sql?: string;
};

type Action = { type: 'SET_TEXT', text: string }
  | { type: 'SET_TRANSLATOR', translator: ERTranslatorRU2 }
  | { type: 'SET_SQL', sql: string }
  | { type: 'TOGGLE_PROCESS_UNIFORM' };

function reducer(state: ISyntaxState, action: Action): ISyntaxState {

  switch (action.type) {
    case 'SET_TEXT': {
      const tokens = action.text ? nlpTokenize(text2Tokens(action.text), state.processUniform) : [];
      const { translator } = state;

      let errorMessage: string | undefined = undefined;
      let parsed: IRusSentence[] = [];
      let command: ICommand[] = [];

      try {
        parsed = tokens.length ? nlpParse(tokens[0], sentenceTemplates) : [];

        if (translator && parsed.length) {
          command = translator.process(parsed);
        }
      }
      catch (e) {
        errorMessage = e.message;
      }

      return {
        ...state,
        text: action.text,
        tokens,
        selectedTokensIdx: 0,
        parsed,
        command,
        sql: undefined,
        errorMessage
      };
    }

    case 'TOGGLE_PROCESS_UNIFORM': {
      return {
        ...state,
        text: '',
        tokens: [],
        parsed: [],
        command: [],
        errorMessage: undefined,
        sql: undefined,
        processUniform: !state.processUniform
      };
    }

    case 'SET_TRANSLATOR': {
      return {
        ...state,
        text: '',
        tokens: [],
        parsed: [],
        translator: action.translator,
        command: [],
        sql: undefined,
        errorMessage: undefined
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

  const { viewTab, url, dispatch, theme, history, erModel } = props;
  const [{ text, tokens, selectedTokensIdx, parsed, translator, command, errorMessage, processUniform, sql }, reactDispatch] = useReducer(reducer,
    {
      text: '',
      tokens: [],
      selectedTokensIdx: 0,
      parsed: [],
      translator: erModel && new ERTranslatorRU2(erModel),
      command: [],
      processUniform: true
    }
  );

  useTab(viewTab, url, 'Syntax', true, dispatch);

  useEffect( () => {
    if (erModel && (!translator || translator.erModel !== erModel)) {
      reactDispatch({ type: 'SET_TRANSLATOR', translator: new ERTranslatorRU2(erModel) })
    }
  }, [erModel, translator]);

  useEffect( () => {
    if (command && command.length) {
      const inspector = command[0].payload.inspect();
      const query: IEntityQueryInspector = { ...inspector, options: { ...inspector.options, first: 1 } };
      apiService.query({ query })
      .then( res => {
        if (res.payload && res.payload.result && !res.error) {
          console.log(res.payload);
          reactDispatch({ type: 'SET_SQL', sql: res.payload.result.info?.select });
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
      <Frame marginLeft marginRight>
        <ComboBox
          label="Text"
          text={text}
          allowFreeform
          autoComplete={'off'}
          options={predefinedPhrases.map( p => ({ key: p, text: p }) )}
          errorMessage={erModel ? errorMessage : 'erModel isn\'t loaded'}
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
        {
          tokens.map( (t, idx) =>
            <Frame key={idx} marginTop border selected={idx === selectedTokensIdx}>
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
            <Frame key={sentence.templateId} marginTop border caption={sentence.templateId}>
              <NLPSentence sentence={sentence} />
            </Frame>
          )
        }
        {
          command.length ?
            <Frame border marginTop caption="Command" scroll height={'400px'}>
              <EQ eq={command[0].payload} />
            </Frame>
          :
            null
        }
        {
          sql ?
            <Frame border marginTop caption="SQL" scroll height={'400px'}>
              <pre>
                {sql}
              </pre>
            </Frame>
          :
            null
        }
      </Frame>
    </>
  );
};
