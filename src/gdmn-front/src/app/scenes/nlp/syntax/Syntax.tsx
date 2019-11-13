import { ISyntaxProps } from "./Syntax.types";
import { useTab } from "@src/app/hooks/useTab";
import React, { useReducer } from "react";
import { CommandBar, ComboBox, Stack } from "office-ui-fabric-react";
import { Frame } from "../../gdmn/components/Frame";
import { INLPToken, nlpTokenize, IRusSentence, nlpParse, sentenceTemplates } from "gdmn-nlp";
import { NLPToken } from "./NLPToken";
import { NLPSentence } from "./NLPSentence";

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
};

type Action =
  { type: 'SET_TEXT', text: string };

function reducer(state: ISyntaxState, action: Action): ISyntaxState {

  switch (action.type) {

    case 'SET_TEXT': {
      const tokens = action.text ? nlpTokenize(action.text) : [];
      return {
        ...state,
        text: action.text,
        tokens,
        parsed: tokens.length ? nlpParse(tokens[0], sentenceTemplates) : []
      };
    }
  }

  return state;
};

export const Syntax = (props: ISyntaxProps): JSX.Element => {

  const { viewTab, url, dispatch, theme, history } = props;
  const [{ text, tokens, selectedTokensIdx, parsed }, reactDispatch] = useReducer(reducer,
    {
      text: '',
      tokens: [],
      selectedTokensIdx: 0,
      parsed: []
    }
  );

  useTab(viewTab, url, 'Syntax', true, dispatch);

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
            <Frame marginTop border selected={idx === selectedTokensIdx}>
              <Stack
                horizontal
                wrap
                tokens={{ childrenGap: '4px' }}
                styles={{
                  root: { overflow: 'hidden' }
                }}
              >
                {t.map( w => <NLPToken token={w} onClick={ () => history.push(`/spa/gdmn/morphology/${w.image}`) } /> )}
              </Stack>
            </Frame>
          )
        }
        {
          parsed.map( (sentence, idx) =>
            <Frame marginTop border>
              <NLPSentence sentence={sentence} />
            </Frame>
          )
        }
      </Frame>
    </>
  );
};
