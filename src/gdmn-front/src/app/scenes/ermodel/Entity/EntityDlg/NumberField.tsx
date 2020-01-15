import { TextField, IRefObject } from "office-ui-fabric-react";
import React, { useState } from "react";

interface INumberFieldProps {
  componentRef?: IRefObject<INumberField>;
  label: string;
  value: number | undefined;
  errorMessage?: string;
  noNegative?: boolean;
  onlyInteger? : boolean;
  width?: string;
  readOnly?: boolean;
  onChange: (newValue: number | undefined) => void;
  onInvalidValue: () => void;
  onFocus?: () => void;
};

export interface INumberField {
  /** Gets the current value of the input. */
  value: number | undefined;
  /** Sets focus to the input. */
  focus: () => void;
}

export const NumberField = ({ label, value, errorMessage, width, 
    onChange, onlyInteger, noNegative, onInvalidValue, readOnly }: INumberFieldProps) => {

  const [text, setText] = useState( value === undefined ? '' : value.toString() );

  return (
    <TextField
      label={label}
      value={text}
      defaultValue={text}
      readOnly={readOnly}
      errorMessage={errorMessage}
      styles={ width ? { root: { width } } : undefined }
      onChange={
        (_, newValue) => {
          if (newValue !== undefined) {
            const trimmedValue = newValue.trim();

            if (!trimmedValue) {
              onChange(undefined);
            } else {
              const v = Number(trimmedValue);

              if (isNaN(v) || (v < 0 && noNegative) || (onlyInteger && (v % 1))) {
                onInvalidValue();
              } else {
                onChange(v);
              }
            }

            setText(newValue);
          }
        }
      }
    />
  );
};