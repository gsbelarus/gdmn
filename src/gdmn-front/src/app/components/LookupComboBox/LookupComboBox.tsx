import React, { useEffect, useReducer, useRef, FormEvent } from 'react';
import { ComboBox, IComboBoxOption, IComboBox, ISelectableOption, IRenderFunction, ActionButton, initializeComponentRef } from 'office-ui-fabric-react';
import { ISessionData } from '@src/app/scenes/gdmn/types';

export type TOnLookup = (filter: string, limit: number) => Promise<IComboBoxOption[]>;

export interface ILookupComboBoxProps {
  name?: string;
  preSelectedOption?: IComboBoxOption;
  label?: string;
  onLookup: TOnLookup;
  getSessionData?: () => ISessionData;
  onChanged: (option: IComboBoxOption | undefined) => void;
  onFocus?: () => void;
  componentRef?: (ref: IComboBox | null) => void;
};

type TQueryState = 'IDLE' | 'START' | 'INPROGRESS';

interface ILookupComboboxState {
  selectedOption?: IComboBoxOption;
  options: IComboBoxOption[];
  queryState: TQueryState;
  text: string;
  lookupText: string;
  limit: number;
  dropDown: boolean;
};

type Action = { type: 'SET_SELECTED_OPTION', option: IComboBoxOption }
  | { type: 'SET_TEXT', text: string }
  | { type: 'RESTORE_STATE', state: ILookupComboboxState }
  | { type: 'QUERY_START' }
  | { type: 'DROP_DOWN' }
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

    case 'RESTORE_STATE': {
      return action.state;
    }

    case 'QUERY_START': {
      return {
        ...state,
        queryState: 'START',
        dropDown: false
      };
    }

    case 'DROP_DOWN': {
      return {
        ...state,
        queryState: 'START',
        dropDown: true
      };
    }

    case 'QUERY_LOADMORE': {
      return {
        ...state,
        queryState: 'START',
        text: state.lookupText,
        limit: state.limit * 2,
        dropDown: false
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
          //selectedOption: undefined,
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
    limit: defLimit,
    dropDown: false
  };
};

export const LookupComboBox = (props: ILookupComboBoxProps) => {

  const { preSelectedOption, onLookup, name, label, getSessionData, onChanged, onFocus, componentRef } = props;
  const [state, dispatch] = useReducer(reducer, preSelectedOption, init);
  const { options, selectedOption, queryState, text, lookupText, limit, dropDown } = state;
  const ref = useRef<IComboBox | null>(null);
  const hasFocus = useRef(false);
  const isMounted = useRef(false);
  const refState = useRef(state);

  useEffect( () => {
    isMounted.current = true;

    if (name && getSessionData) {
      const savedState = getSessionData()[name];
      if (savedState) {
        dispatch({ type: 'RESTORE_STATE', state: savedState as ILookupComboboxState});
      }
    }

    return () => {
      if (name && getSessionData) {
        getSessionData()[name] = refState.current;
      }
      isMounted.current = false;
    }
  }, []);

  useEffect( () => {
    refState.current = state;
  }, [state]);

  useEffect( () => {
    if (queryState === 'START') {
      if (hasFocus.current && options.length && ref.current) {
        ref.current.dismissMenu();
      }

      const doLookup = async () => {
        const lookupText = dropDown && options.length === 1 && preSelectedOption && options[0].key === preSelectedOption.key
          ? ''
          : text;

        dispatch({ type: 'QUERY_INPROGRESS', lookupText });
        const res = await onLookup(lookupText, limit);
        if (isMounted.current) {
          dispatch({ type: 'QUERY_DONE', options: res });
          if (res.length > 1 && ref.current && hasFocus.current) {
            ref.current.focus(true, true);
          }
        }
      };

      doLookup();
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
  let onMenuOpen;

  if (queryState === 'IDLE') {
    onChange = (_event: FormEvent<IComboBox>, option?: IComboBoxOption, _index?: number, _value?: string) => {
      if (option) {
        dispatch({ type: 'SET_SELECTED_OPTION', option });
        onChanged(option);
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

      if (e.key === 'Escape' && preSelectedOption && preSelectedOption.text !== text) {
        e.preventDefault();
        e.stopPropagation();
        dispatch({ type: 'SET_SELECTED_OPTION', option: preSelectedOption });
        onChanged(preSelectedOption);
      }
    };

    onMenuOpen = () => {
      if (options.length === 1 && preSelectedOption && options[0].key === preSelectedOption.key) {
        dispatch({ type: 'DROP_DOWN' })
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
    onMenuOpen = undefined;
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
      label={label}
      options={options}
      allowFreeform
      autoComplete="off"
      text={ queryState === 'INPROGRESS' && !selectedOption ? 'Идёт поиск...' : text }
      componentRef={
        r => {
          ref.current = r;
          if (componentRef) {
            componentRef(r)
          }
        }
      }
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
      onFocus={
        () => {
          hasFocus.current = true;
          if (onFocus) {
            onFocus();
          }
        }
      }
      onBlur={
        () => {
          hasFocus.current = false;
          if (!text) {
            onChanged(undefined);
          }
        }
      }
      onRenderLowerContent={onRenderLowerContent}
      onMenuOpen={onMenuOpen}
    />
  );
};