import { TextField } from "office-ui-fabric-react";
import React, { useState, useEffect } from "react";

interface INumberFieldProps {
  label: string;
  value: number | undefined;
  onChange: (newValue: number | undefined) => void;
};

interface INumberFieldState {
  text: string;
  error?: string;
};

export const NumberField = ({ label, value, onChange }: INumberFieldProps) => {

  const [state, setState] = useState<INumberFieldState>( { text: value === undefined ? '' : value.toString() } );

  useEffect( () => {
    const { text } = state;
    const trimmedText = text.trim();

    if (trimmedText === '') {
      if (value !== undefined) {
        onChange(undefined);
      }
      if (state.error) {
        setState({ ...state, error: undefined });
      }
    }
    else if (trimmedText !== '-') {
      const parsedValue = parseInt(trimmedText);

      if (isNaN(parsedValue)) {
        if (!state.error) {
          setState({ ...state, error: 'Введите число!' });
        }
      } else {
        if (parsedValue !== value) {
          onChange(parsedValue);
        }

        if (state.error) {
          setState({ ...state, error: undefined });
        }
      }

    }
  }, [value, state]);

  return (
    <TextField
      label={label}
      value={state.text}
      errorMessage={state.error}
      styles={{
        root: {
          width: '180px'
        }
      }}
      onChange={ (_, newValue) => newValue !== undefined && setState({ ...state, text: newValue }) }
    />
  );
};