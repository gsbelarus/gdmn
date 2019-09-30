import { TextField } from "office-ui-fabric-react";
import React, { useState, useEffect } from "react";

export type NumberFieldError = 'EMPTY' | 'INVALID' | 'OUT_OF_RANGE';

interface INumberFieldProps {
  label: string;
  value: number | undefined;
  errorMessage?: string; 
  noNegative?: boolean;
  onlyInteger? : boolean;
  onChanged: (newValue: number | undefined) => void;
  onError: (error: NumberFieldError) => void;
};

interface INumberFieldState {
  text: string;
  error?: string;
};

export const NumberField = ({ label, value, onChanged, onlyInteger, noNegative, onError }: INumberFieldProps) => {

  const [state, setState] = useState<INumberFieldState>( { text: value === undefined ? '' : value.toString() } );

  useEffect( () => {
    const { text } = state;
    const trimmedText = text.trim();

    if (trimmedText === '') {
      if (value !== undefined) {
        onChanged(undefined);
      }
      if (state.error) {
        setState({ ...state, error: undefined });
      }
    }
    else 
      if (!trimmedText.includes('-')) {
        if (!isNaN(Number(trimmedText))) {
          if (onlyInteger && (trimmedText.includes('.') || trimmedText.includes(','))) {
            if (!state.error) {
              setState({ ...state, error: 'Введите целое число!' });
              onError('INVALID');
            }    
          } else {
            const parsedValue = onlyInteger ? parseInt(trimmedText) : parseFloat(trimmedText);
            if (parsedValue !== value) {
              onChanged(parsedValue);
            }
            if (state.error) {
              setState({ ...state, error: undefined });
            }
          } 
        } else {
          if (!state.error) {
            setState({ ...state, error: 'Введите число!' });
            onError('INVALID');
          }
        }
      } else {
        if (noNegative) {
          if (!state.error) {
            setState({ ...state, error: 'Введите положительное число!' });
            onError('INVALID');
          }
        } else {
          if (!isNaN(Number(trimmedText.slice(1)))) {
            if (onlyInteger && (trimmedText.includes('.') || trimmedText.includes(','))) {
              if (!state.error) {
                setState({ ...state, error: 'Введите целое число!' });
                onError('INVALID');
              }    
            } else {
              if (state.error) {
                setState({ ...state, error: undefined });
              }
            }
          } else {
            if (!state.error) {
              setState({ ...state, error: 'Введите число!' });
              onError('INVALID');
            }
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