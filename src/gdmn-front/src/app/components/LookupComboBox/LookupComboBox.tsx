import React, { useEffect, useReducer, useRef, useLayoutEffect, FormEvent } from 'react';
import { ComboBox, IComboBoxOption, IComboBox, ISelectableOption, IRenderFunction, VirtualizedComboBox } from 'office-ui-fabric-react';
import { getDefaultSettings } from 'http2';

export type TOnLookup = (filter?: string) => Promise<IComboBoxOption[]>;

export interface ILookupComboBoxProps {
  preSelectedOption?: IComboBoxOption;
  onLookup: TOnLookup;
};

type TMenuState = 'OPENED' | 'CLOSED' | 'OPEN' | 'CLOSE';

interface ILookupComboboxState {
  selectedOption?: IComboBoxOption;
  options: IComboBoxOption[];
  query: boolean;
  text: string;
  prevText: string;
  lookupText: string;
  hasFocus: boolean;
  menuState: TMenuState;
  forceQuery: boolean;
};

type Action = { type: 'SET_SELECTED_OPTION', option: IComboBoxOption }
  | { type: 'SET_TEXT', text: string }
  | { type: 'SET_FOCUS', hasFocus: boolean }
  | { type: 'SET_MENU_STATE', menuState: TMenuState }
  | { type: 'START_QUERY', text: string }
  | { type: 'FORCE_QUERY' }
  | { type: 'QUERY_RESULT', options: IComboBoxOption[] };

function reducer(state: ILookupComboboxState, action: Action): ILookupComboboxState {
  switch (action.type) {
    case 'SET_SELECTED_OPTION': {
      const { option } = action;
      return {
        ...state,
        selectedOption: option,
        text: option.text,
        prevText: option.text,
      };
    }

    case 'SET_TEXT': {
      const { text } = action;
      return {
        ...state,
        selectedOption: undefined,
        text,
        options: [],
        menuState: state.menuState === 'OPENED' && text !== state.text ? 'CLOSE' : state.menuState
      };
    }

    case 'SET_FOCUS': {
      const { hasFocus } = action;
      return {
        ...state,
        hasFocus
      };
    }

    case 'SET_MENU_STATE': {
      const { menuState } = action;
      if (menuState === 'OPENED' && !state.options.length) {
        return {
          ...state,
          menuState: 'CLOSED'
        };
      } else {
        return {
          ...state,
          menuState
        };
      }
    }

    case 'START_QUERY': {
      const { text } = action;
      return {
        ...state,
        query: true,
        forceQuery: false,
        text,
        prevText: text,
        lookupText: text
      };
    }

    case 'FORCE_QUERY': {
      if (state.query) {
        return state;
      } else {
        return {
          ...state,
          forceQuery: true,
        }
      }
    }

    case 'QUERY_RESULT': {
      const { options } = action;
      if (options.length === 1) {
        return {
          ...state,
          query: false,
          options,
          text: options[0].text,
          prevText: options[0].text,
          selectedOption: options[0],
          menuState: state.menuState === 'OPENED' ? 'CLOSE' : state.menuState
        };
      } else {
        return {
          ...state,
          query: false,
          options,
          menuState: state.hasFocus && state.menuState !== 'OPENED' ? 'OPEN' : state.menuState
        };
      }
    }

    default:
      return state;
  }
};

function init(preSelectedOption: IComboBoxOption | undefined): ILookupComboboxState {
  return {
    selectedOption: preSelectedOption,
    options: preSelectedOption ? [preSelectedOption] : [],
    text: preSelectedOption && preSelectedOption.text ? preSelectedOption.text : '',
    prevText: preSelectedOption && preSelectedOption.text ? preSelectedOption.text : '',
    lookupText: '',
    hasFocus: true,
    menuState: 'CLOSED',
    query: false,
    forceQuery: false
  };
};

export const LookupComboBox = (props: ILookupComboBoxProps) => {

  const { preSelectedOption, onLookup } = props;
  const [state, dispatch] = useReducer(reducer, preSelectedOption, init);
  const { options, query, selectedOption, text, prevText, lookupText, hasFocus, menuState, forceQuery } = state;
  const ref = useRef<IComboBox | null>(null);

  useEffect( () => {
    if (!ref.current) return;

    if (menuState === 'OPEN') {
      ref.current.focus(true);
    }
    else if (menuState === 'CLOSE') {
      ref.current.dismissMenu();
    }
  }, [menuState]);

  useEffect( () => {
    if (forceQuery) {
      dispatch({ type: 'START_QUERY', text });
      onLookup(text).then( opt => dispatch({ type: 'QUERY_RESULT', options: opt }) );
    }
  }, [forceQuery, text]);

  useEffect( () => {
    if (text === prevText || !hasFocus || query) {
      return;
    }

    if (text.length < 3) {
      return;
    }

    const timerID = setTimeout(
      () => {
        dispatch({ type: 'START_QUERY', text });
        onLookup(text).then( opt => dispatch({ type: 'QUERY_RESULT', options: opt }) );
      }, 2000
    );

    return () => clearTimeout(timerID);
  }, [text, prevText, hasFocus, query]);

  const onChange = (_event: FormEvent<IComboBox>, option?: IComboBoxOption, _index?: number, _value?: string) => {
    if (option) {
      dispatch({ type: 'SET_SELECTED_OPTION', option });
    }
  };

  const onInputChange = (value: string) => {
    if (value !== undefined) {
      dispatch({ type: 'SET_TEXT', text: value });
    }
    return value;
  };

  const onBlur = () => {
    dispatch({ type: 'SET_FOCUS', hasFocus: false });
  };

  const onFocus = () => {
    dispatch({ type: 'SET_FOCUS', hasFocus: true });
  };

  const onMenuOpen = () => {
    if (options.length) {
      dispatch({ type: 'SET_MENU_STATE', menuState: 'OPENED' });
    } else {
      dispatch({ type: 'FORCE_QUERY' });
    }
  };

  const onMenuDismissed = () => {
    dispatch({ type: 'SET_MENU_STATE', menuState: 'CLOSED' });
  };

  const onRenderOption: IRenderFunction<ISelectableOption> = props => {
    if (props && lookupText) {
      const parts = props.text.toUpperCase().split(lookupText.toUpperCase());
      let start = 0;
      const res = parts.reduce(
        (p, i, idx) => {
          p.push(<span>{props.text.substring(start, start + i.length)}</span>);
          start += i.length;
          if (idx < (parts.length - 1)) {
            p.push(<span style={{ color: 'red' }}>{lookupText}</span>);
            start += lookupText.length;
          }
          return p;
        },
        [] as JSX.Element[]
      );
      return <>{res}</>;
    } else {
      return <span>{props && props.text}</span>;
    }
  };

  return (
    <div>
      <div>{text}</div>
      <div>{prevText}</div>
      <div>{menuState}</div>
      <ComboBox
        options={options}
        allowFreeform
        autoComplete="off"
        text={text}
        componentRef={ r => ref.current = r }
        autofill={{
          onInputChange,
          preventValueSelection: true
        }}
        onRenderOption={onRenderOption}
        styles={
          selectedOption
          ? {
            root: {
              backgroundColor: '#44ff44'
            },
            input: {
              backgroundColor: '#44ff44'
            }
          }
          : undefined
        }
        onBlur={onBlur}
        onFocus={onFocus}
        onChange={onChange}
        onMenuOpen={onMenuOpen}
        onMenuDismissed={onMenuDismissed}
      />
    </div>
  );
};