import React, { useEffect, useReducer, useRef, FormEvent } from 'react';
import { ComboBox, IComboBoxOption, IComboBox, ISelectableOption, IRenderFunction, DefaultButton, ActionButton } from 'office-ui-fabric-react';

export type TOnLookup = (filter: string, limit: number) => Promise<IComboBoxOption[]>;

export interface ILookupComboBoxProps {
  preSelectedOption?: IComboBoxOption;
  onLookup: TOnLookup;
};

type TQueryState = 'IDLE' | 'START' | 'INPROGRESS';

interface ILookupComboboxState {
  selectedOption?: IComboBoxOption;
  options: IComboBoxOption[];
  queryState: TQueryState;
  text: string;
  lookupText: string;
  limit: number;
};

type Action = { type: 'SET_SELECTED_OPTION', option: IComboBoxOption }
  | { type: 'SET_TEXT', text: string }
  | { type: 'QUERY_START' }
  | { type: 'QUERY_LOADMORE' }
  | { type: 'QUERY_INPROGRESS', lookupText: string }
  | { type: 'QUERY_DONE', options: IComboBoxOption[] };

function reducer(state: ILookupComboboxState, action: Action): ILookupComboboxState {
  switch (action.type) {
    case 'SET_SELECTED_OPTION': {
      const { option } = action;
      return {
        ...state,
        selectedOption: option,
        text: option.text
      };
    }

    case 'SET_TEXT': {
      const { text } = action;
      return {
        ...state,
        selectedOption: undefined,
        options: [],
        text,
        limit: defLimit
      };
    }

    case 'QUERY_START': {
      return {
        ...state,
        queryState: 'START'
      };
    }

    case 'QUERY_LOADMORE': {
      return {
        ...state,
        queryState: 'START',
        text: state.lookupText,
        limit: state.limit * 2
      };
    }

    case 'QUERY_INPROGRESS': {
      const { lookupText } = action;
      return {
        ...state,
        queryState: 'INPROGRESS',
        lookupText
      };
    }

    case 'QUERY_DONE': {
      const { options } = action;
      if (options.length === 1) {
        return {
          ...state,
          selectedOption: options[0],
          options,
          queryState: 'IDLE',
          text: options[0].text
        };
      } else {
        return {
          ...state,
          selectedOption: undefined,
          options,
          queryState: 'IDLE',
        };
      }
    }

    default:
      return state;
  }
};

const defLimit = 16;

function init(preSelectedOption: IComboBoxOption | undefined): ILookupComboboxState {
  return {
    selectedOption: preSelectedOption,
    options: preSelectedOption ? [preSelectedOption] : [],
    queryState: 'IDLE',
    text: preSelectedOption && preSelectedOption.text ? preSelectedOption.text : '',
    lookupText: '',
    limit: defLimit
  };
};

export const LookupComboBox = (props: ILookupComboBoxProps) => {

  const { preSelectedOption, onLookup } = props;
  const [state, dispatch] = useReducer(reducer, preSelectedOption, init);
  const { options, selectedOption, queryState, text, lookupText, limit } = state;
  const ref = useRef<IComboBox | null>(null);
  const hasFocus = useRef(false);
  const isMounted = useRef(false);

  useEffect( () => {
    isMounted.current = true;
    return () => { isMounted.current = false; }
  }, []);

  useEffect( () => {
    if (queryState === 'START') {
      if (hasFocus.current && options.length && ref.current) {
        ref.current.dismissMenu();
      }
      dispatch({ type: 'QUERY_INPROGRESS', lookupText: text });
      onLookup(text, limit)
        .then( res => {
          if (isMounted.current) {
            dispatch({ type: 'QUERY_DONE', options: res });
            if (res.length > 1 && ref.current && hasFocus.current) {
              ref.current.focus(true, true);
            }
          }
        });
    }
  }, [queryState]);

  useEffect( () => {
    if (isMounted.current && hasFocus.current && !options.length && ref.current) {
      ref.current.dismissMenu();
    }
  }, [options]);

  let onChange;
  let onPendingValueChanged;
  let onKeyDown;
  let onRenderLowerContent;

  if (queryState === 'IDLE') {
    onChange = (_event: FormEvent<IComboBox>, option?: IComboBoxOption, _index?: number, _value?: string) => {
      if (option) {
        dispatch({ type: 'SET_SELECTED_OPTION', option });
      }
    };

    onPendingValueChanged = (_option?: IComboBoxOption, _index?: number, value?: string | undefined) => {
      if (value !== undefined) {
        dispatch({ type: 'SET_TEXT', text: value });
      }
    };

    onKeyDown = (e: React.KeyboardEvent<IComboBox>) => {
      if (e.key === 'F3') {
        e.preventDefault();
        e.stopPropagation();
        dispatch({ type: 'QUERY_START' })
      }
    };

    if (!options.length) {
      onRenderLowerContent = () =>
        <ActionButton
          style={{
            width: '100%'
          }}
          iconProps={{ iconName: 'Search' }}
          text={ text ? 'Искать... (F3)' : 'Показать все...' }
          onClick={ () => dispatch({ type: 'QUERY_START' }) }
        />;
    }
    else if (options.length > limit) {
      onRenderLowerContent = () =>
        <ActionButton
          style={{
            width: '100%'
          }}
          iconProps={{ iconName: 'Download' }}
          text="Загрузить еще..."
          onClick={ () => dispatch({ type: 'QUERY_LOADMORE' }) }
        />;
    } else {
      onRenderLowerContent = undefined;
    }
  } else {
    onChange = undefined;
    onPendingValueChanged = undefined;
    onKeyDown = undefined;
    onRenderLowerContent = undefined;
  }

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
    <ComboBox
      options={options}
      allowFreeform
      autoComplete="off"
      text={ queryState === 'INPROGRESS' ? 'Идёт поиск...' : text }
      componentRef={ r => ref.current = r }
      onRenderOption={onRenderOption}
      styles={
        selectedOption
        ? {
          root: {
            backgroundColor: '#77ff77'
          },
          input: {
            backgroundColor: '#77ff77'
          }
        }
        : undefined
      }
      onChange={onChange}
      onPendingValueChanged={onPendingValueChanged}
      onKeyDown={onKeyDown}
      onFocus={ () => hasFocus.current = true }
      onBlur={ () => hasFocus.current = false }
      onRenderLowerContent={onRenderLowerContent}
    />
  );
};