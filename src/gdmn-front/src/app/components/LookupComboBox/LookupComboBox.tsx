import React, { useState, useEffect } from 'react';
import { ComboBox, IComboBoxOption, IComboBox, ISelectableOption, IRenderFunction } from 'office-ui-fabric-react';

export type TOnLookup = (filter?: string) => Promise<IComboBoxOption[]>;

export interface ILookupComboBoxProps {
  preSelectedOption?: IComboBoxOption;
  onLookup: TOnLookup;
};

export const LookupComboBox = (props: ILookupComboBoxProps) => {

  const { preSelectedOption, onLookup } = props;
  const [options, setOptions] = useState(preSelectedOption ? [preSelectedOption] : []);
  const [query, setQuery] = useState(false);
  const [selectedOption, setSelectedOption] = useState<IComboBoxOption | undefined>(preSelectedOption);
  const ref = React.createRef<IComboBox>();
  let timerID = 0;
  let text = selectedOption && selectedOption.text ? selectedOption.text : '';
  let prevText = text;
  let lookupText = '';

  useEffect( () => {
    if (ref.current && options.length > 1) {
      ref.current.focus(true);
    }
  }, [options]);

  const onPendingValueChanged = (option?: IComboBoxOption, index?: number, value?: string) => {
    console.log(option);
    console.log(index);
    console.log(value);

    if (option && option.key && option.text) {
      text = option.text;
      prevText = text;
      setSelectedOption(option);
      return;
    }

    if (value !== undefined && value !== prevText) {
      if (timerID) {
        clearTimeout(timerID);
      }
      text = value;
      prevText = text;
      setOptions([]);
      setSelectedOption(undefined);
      timerID = (window.setTimeout( async () => {
        timerID = 0;
        if (value.length > 2) {
          setQuery(true);
          lookupText = value;
          const opt = await onLookup(value);
          setQuery(false);
          setOptions(opt);
          if (opt.length === 1) {
            text = opt[0].text;
            prevText = text;
            setSelectedOption(opt[0]);
          }
        }
      }, 4000 ));
    }
  };

  const onBlur = () => {
    if (timerID) {
      clearTimeout(timerID);
      timerID = 0;
    }
  };

  const onRenderOption: IRenderFunction<ISelectableOption> = props => {
    console.log(lookupText);
    if (lookupText) {
      const upc = props ? props.text.toUpperCase() : '';
      const parts = upc.split(lookupText.toUpperCase());
      const res = parts.reduce(
        (p, i, idx) => {
          p.push(<span>{i}</span>);
          if (idx < (parts.length - 1)) {
            p.push(<strong>{lookupText}</strong>);
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
      autoComplete="on"
      text={text}
      componentRef={ref}
      scrollSelectedToTop
      onRenderOption={onRenderOption}
      styles={
        query
        ? {
          root: {
            backgroundColor: '#b4a0ff'
          },
          input: {
            backgroundColor: '#b4a0ff'
          }
        }
        : selectedOption
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
      onPendingValueChanged={onPendingValueChanged}
    />
  );
};