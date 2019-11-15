import React, { useEffect, useReducer, useRef, FormEvent } from 'react';
import { ComboBox, IComboBoxOption, IComboBox, ISelectableOption, IRenderFunction, ActionButton, IComboBoxStyles } from 'office-ui-fabric-react';
import { ISessionData } from '@src/app/scenes/gdmn/types';

export type TOnLookup = (filter: string, limit: number) => Promise<IComboBoxOption[]>;

export interface ISetLookupComboBoxProps {
  name?: string;
  preSelectedOption?: IComboBoxOption[];
  label?: string;
  onLookup: TOnLookup;
  getSessionData?: () => ISessionData;
  onChanged: (option: IComboBoxOption[] | undefined) => void;
  componentRef?: (ref: IComboBox | null) => void;
  styles?: Partial<IComboBoxStyles>;
};

type TQueryState = 'IDLE' | 'START' | 'INPROGRESS';

interface ISetLookupComboBoxState {
  selectedOptions?: IComboBoxOption[];
  options: IComboBoxOption[];
  queryState: TQueryState;
  text: string;
  limit: number;
};

type Action = { type: 'SET_SELECTED_OPTIONS', selectedOptions: IComboBoxOption[] }
  | { type: 'SET_TEXT', text: string }
  | { type: 'RESTORE_STATE', state: ISetLookupComboBoxState }
  | { type: 'QUERY_START' }
  | { type: 'QUERY_LOADMORE' }
  | { type: 'QUERY_INPROGRESS' }
  | { type: 'QUERY_DONE', options: IComboBoxOption[] };

function reducer(state: ISetLookupComboBoxState, action: Action): ISetLookupComboBoxState {
  switch (action.type) {
    case 'SET_SELECTED_OPTIONS': {
      const { selectedOptions } = action;
      return {
        ...state,
        selectedOptions,
        options: state.options.map(o => ({...o, selected: !!selectedOptions.find(s => s.key === o.key)})) ,
        text: selectedOptions.map(o => o.text).join(', ')
      };
    }

    case 'SET_TEXT': {
      const { text } = action;
      return {
        ...state,
        selectedOptions: undefined,
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
        queryState: 'START'
      };
    }

    case 'QUERY_LOADMORE': {
      return {
        ...state,
        queryState: 'START',
        limit: state.limit * 2
      };
    }

    case 'QUERY_INPROGRESS': {
      return {
        ...state,
        queryState: 'INPROGRESS'
      };
    }

    case 'QUERY_DONE': {
      const { options } = action;
      return {
        ...state,
        options,
        queryState: 'IDLE',
      };
    }

    default:
      return state;
  }
};

const defLimit = 16;

function init(preSelectedOption: IComboBoxOption[] | undefined): ISetLookupComboBoxState {
  return {
    selectedOptions: preSelectedOption,
    options: [],
    queryState: 'IDLE',
    text: preSelectedOption ? preSelectedOption.map(m => m.text).join(', ') : '',
    limit: defLimit
  };
};

export const SetLookupComboBox = (props: ISetLookupComboBoxProps) => {

  const { preSelectedOption, onLookup, name, label, getSessionData, componentRef, onChanged, styles } = props;
  const [state, dispatch] = useReducer(reducer, preSelectedOption, init);
  const { options, selectedOptions, queryState, text, limit } = state;
  const ref = useRef<IComboBox | null>(null);
  const hasFocus = useRef(false);
  const isMounted = useRef(false);
  const refState = useRef(state);

  useEffect( () => {
    isMounted.current = true;

    if (name && getSessionData) {
      const savedState = getSessionData()[name];
      if (savedState) {
        dispatch({ type: 'RESTORE_STATE', state: savedState as ISetLookupComboBoxState});
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
        dispatch({ type: 'QUERY_INPROGRESS' });
        const res = await onLookup('', limit);
        /**
         * Пометим в массиве извлеченных значений, те, которые уже выбраны.
         */
        const newRes = res.map( r => selectedOptions && selectedOptions.find( so => so.key === r.key ) ? {...r, selected: true} : r );

        /**
         * Добавим в res отсутствующие значения. Отсортируем, чтобы выделенные отображалтсь вначале
         */
        const fullRes = (selectedOptions ? newRes.concat( selectedOptions.filter( so => !newRes.find( r => r.key === so.key ) ) ) : newRes)
          .sort((a, b) => a.text < b.text ? -1 : 1)
          .sort((a, b) => a.selected && a.selected !== b.selected ? -1 : 1);
        if (isMounted.current) {
          dispatch({ type: 'QUERY_DONE', options: fullRes });
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

  let onChangeMulti;
  let onPendingValueChanged;
  let onRenderLowerContent;
  let onMenuOpen;

  if (queryState === 'IDLE') {
    onChangeMulti = (event: React.FormEvent<IComboBox>, option?: IComboBoxOption, index?: number, value?: string) => {
      if (option) {
        const newSelectedOptions = selectedOptions ? [...selectedOptions] : [];
        const index = newSelectedOptions.findIndex(s => s.key === option.key);
        if (option.selected && index < 0) {
          newSelectedOptions.push({key: option.key, text: option.text, selected: true});
        } else {
          newSelectedOptions.splice(index, 1);
        }
        dispatch({ type: 'SET_SELECTED_OPTIONS', selectedOptions: newSelectedOptions});
        onChanged(newSelectedOptions);
      }
    };

    onPendingValueChanged = (_option?: IComboBoxOption, _index?: number, value?: string | undefined) => {
      if (value !== undefined) {
        dispatch({ type: 'SET_TEXT', text: value });
      }
    };

    onMenuOpen = () => {
      if (!options.length) {
        dispatch({ type: 'QUERY_START' });
      }
    };

    if (options.length > limit) {
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
    onChangeMulti = undefined;
    onPendingValueChanged = undefined;
    onRenderLowerContent = undefined;
    onMenuOpen = undefined;
  }

  const onRenderOption: IRenderFunction<ISelectableOption> = props => {
    return <span>{props && props.text}</span>;
  };

  return (
    <ComboBox
      multiSelect
      label={label}
      options={options}
      allowFreeform
      autoComplete="off"
      text={ queryState === 'INPROGRESS' && !selectedOptions ? 'Идёт поиск...' : text }
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
        selectedOptions && styles
        ? {
          ...styles,
          root: {
            backgroundColor: '#77ff77'
          },
          input: {
            backgroundColor: '#77ff77'
          }
        }
        : styles
          ? styles
          : undefined
      }
      onChange={onChangeMulti}
      onPendingValueChanged={onPendingValueChanged}
      onRenderLowerContent={onRenderLowerContent}
      onMenuOpen={onMenuOpen}
    />
  );
};
