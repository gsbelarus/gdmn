import { ISyntaxProps } from "./Syntax.types";
import { useTab } from "@src/app/hooks/useTab";
import React, { useReducer, useEffect } from "react";
import { CommandBar, ComboBox, Stack } from "office-ui-fabric-react";
import { Frame } from "../../gdmn/components/Frame";
import { INLPToken, nlpTokenize, IRusSentence, nlpParse, sentenceTemplates } from "gdmn-nlp";
import { NLPToken } from "./NLPToken";
import { NLPSentence } from "./NLPSentence";
import { ERTranslatorRU2, ICommand } from "gdmn-nlp-agent";

const predefinedPhrases = [
  'название не содержит ООО',
  'покажи все TgdcFunction',
  'покажи 10 первых организаций',
  'покажи 10 первых организаций, банков из минска и пинска',
  'покажи все организации и банки из минска и пинска',
  'покажи все организации, банки из минска, пинска',
  'покажи все организации из минска',
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
};

type Action = { type: 'SET_TEXT', text: string }
  | { type: 'SET_TRANSLATOR', translator: ERTranslatorRU2 };

function reducer(state: ISyntaxState, action: Action): ISyntaxState {

  switch (action.type) {
    case 'SET_TEXT': {
      const tokens = action.text ? nlpTokenize(action.text) : [];
      const { translator } = state;

      const parsed = tokens.length ? nlpParse(tokens[0], sentenceTemplates) : [];
      let command: ICommand[] = [];
      let errorMessage: string | undefined = undefined;

      try {
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
        errorMessage
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
        errorMessage: undefined
      };
    }
  }
};

export const Syntax = (props: ISyntaxProps): JSX.Element => {

  const { viewTab, url, dispatch, theme, history, erModel } = props;
  const [{ text, tokens, selectedTokensIdx, parsed, translator, command, errorMessage }, reactDispatch] = useReducer(reducer,
    {
      text: '',
      tokens: [],
      selectedTokensIdx: 0,
      parsed: [],
      translator: erModel && new ERTranslatorRU2(erModel),
      command: []
    }
  );

  useTab(viewTab, url, 'Syntax', true, dispatch);

  useEffect( () => {
    if (erModel && (!translator || translator.erModel !== erModel)) {
      reactDispatch({ type: 'SET_TRANSLATOR', translator: new ERTranslatorRU2(erModel) })
    }
  }, [erModel, translator]);

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
            <Frame border marginTop caption="Command" scroll height={'200px'}>
              <pre>
                {JSON.stringify(command[0].payload.inspect(), undefined, 2)}
              </pre>
            </Frame>
          :
            null
        }
      </Frame>
    </>
  );
};
