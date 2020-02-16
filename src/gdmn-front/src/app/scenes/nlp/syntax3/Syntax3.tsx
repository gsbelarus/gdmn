import { ISyntax3Props } from "./Syntax3.types";
import { useTab } from "@src/app/hooks/useTab";
import React, { useReducer, useEffect } from "react";
import { CommandBar, ComboBox, Stack, Checkbox, Label, getTheme } from "office-ui-fabric-react";
import { Frame } from "../../gdmn/components/Frame";
import { INLPToken, nlpTokenize, text2Tokens, tokens2sentenceTokens, xParse, xTemplates, IXParseResultSuccess } from "gdmn-nlp";
import { NLPToken } from "../syntax/NLPToken";
import * as H from 'history';
import { IRSSQLSelect } from "gdmn-recordset";
import { XPhrase } from "./XPhrase";
import { ERTranslatorRU3, command2Text, xTranslators } from "gdmn-nlp-agent";
import { IEntityQueryInspector } from "gdmn-orm";
import { apiService } from "@src/app/services/apiService";
import { EQ } from "../syntax/EntityQuery";

const predefinedPhrases = [
  'название не содержит "ООО"',
  'покажи все TgdcFunction',
  'покажи все организации и банки из минска и пинска',
  'покажи все организации, банки из минска, пинска',
  'покажи все организации из минска',
  'покажи все организации. NAME атрибута PLACEKEY содержит "минск".',
  'покажи все организации из минска или пинска. отсортируй по наименованию.',
  'покажи все организации из минска или пинска. отсортируй по наименованию. наименование содержит "ООО".',
  'покажи все организации из минска или пинска. наименование содержит "ООО". отсортируй по наименованию, по убыванию.',
  'покажи все организации из минска, пинска',
  'отсортируй по наименованию',
  'покажи все TgdcUserDocument147134915_1757699501',
  'покажи 10 первых организаций',
  'покажи 10 первых организаций, банков из минска и пинска',
  'покажи сто двадцать пять организаций из минска',
  'покажи пятую организацию из минска',
  'покажи курсы на 10.10.2018',
  'покажи пятьсот двадцать три  миллиарда шестьсот восемьдесят восемь миллионов триста тридцать тысяч сто сорок одну организацию',
  'три доски',
  'три три доски',
  'три доску',
];

interface ISentence {
  tokens: INLPToken[][];
  selectedTokensIdx: number;
  parsed?: IXParseResultSuccess;
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
        parsed
        &&
        <Frame key={parsed.phrase.phraseTemplateId} marginTop border caption={parsed.phrase.phraseTemplateId} canMinimize>
          <XPhrase parsed={parsed} />
        </Frame>
      }
    </>
  )
};

interface ISyntax3State {
  text: string;
  /**
   * Текст может состоять из предложений.
   * Каждое предложение может иметь несколько вариантов
   * если какое-нибудь слово может быть несколькими частями
   * речи.
   * Каждый вариант -- это последовательность токенов.
   */
  sentences: ISentence[];
  translator?: ERTranslatorRU3;
  sql?: IRSSQLSelect;
};

type Action = { type: 'SET_TEXT', text: string }
  | { type: 'SET_TRANSLATOR', translator?: ERTranslatorRU3 }
  | { type: 'SET_SQL', sql?: IRSSQLSelect }
  | { type: 'TOGGLE_PROCESS_UNIFORM' };

function reducer(state: ISyntax3State, action: Action): ISyntax3State {

  switch (action.type) {
    case 'SET_TEXT': {
      let { translator } = state;
      const { text } = action;
      const rawTokens = text ? text2Tokens(text) : undefined;
      const sentenceTokens = rawTokens ? tokens2sentenceTokens(rawTokens) : [];
      const sentences: ISentence[] = [];

      if (translator) {
        translator = translator.clear();
      }

      for (const st of sentenceTokens) {
        const tokens = nlpTokenize(st, translator?.processUniform);
        let errorMessage: string | undefined = undefined;
        let parsed: IXParseResultSuccess | undefined = undefined;
        try {
          for (const template of Object.values(xTemplates)) {
            const res = xParse(tokens[0], template);

            if (res.type === 'SUCCESS' && !res.restTokens?.length) {
              parsed = res;
              break;
            }
          }

          if (translator && parsed) {
            const tr = xTranslators[parsed.phrase.phraseTemplateId];

            if (!tr) {
              errorMessage = `Unsupported phrase template id: ${parsed.phrase.phraseTemplateId}`;
              break;
            }

            translator = translator.process(parsed.phrase, tr, text);
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
        translator,
        sql: undefined
      };
    }

    case 'TOGGLE_PROCESS_UNIFORM': {
      const { translator } = state;

      if (!translator) {
        return state;
      }

      return {
        ...state,
        text: '',
        sentences: [],
        sql: undefined,
        translator: new ERTranslatorRU3({erModel: translator.erModel, processUniform: !translator.processUniform})
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

export const Syntax3 = (props: ISyntax3Props): JSX.Element => {

  const { viewTab, url, dispatch, history, erModel } = props;
  const [{ text, sentences, translator, sql }, reactDispatch] = useReducer(reducer,
    {
      text: '',
      sentences: [],
      translator: erModel && new ERTranslatorRU3({erModel, processUniform: true})
    }
  );
  const command = translator?.hasCommand() ? translator.command : undefined;

  useTab(viewTab, url, 'Syntax3', true, dispatch);

  useEffect( () => {
    if (!erModel) {
      reactDispatch({ type: 'SET_TRANSLATOR', translator: undefined })
    } else {
      if (!translator || translator.erModel !== erModel) {
        reactDispatch({ type: 'SET_TRANSLATOR', translator: new ERTranslatorRU3({erModel, processUniform: true}) })
      }
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
          checked={translator?.processUniform}
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
                {command &&
                  <Frame border marginTop caption="Command" canMinimize>
                    <div>
                      {command2Text(command)}
                    </div>
                    <EQ eq={command.payload} />
                  </Frame>
                }
                {sql &&
                  <Frame border marginTop caption="SQL" canMinimize>
                    <Stack><pre>{sql.select}</pre><pre>{JSON.stringify(sql.params, undefined, 2)}</pre></Stack>
                  </Frame>
                }
              </Stack>
            </Frame>
          :
            null
        }
      </Frame>
    </>
  );
};
