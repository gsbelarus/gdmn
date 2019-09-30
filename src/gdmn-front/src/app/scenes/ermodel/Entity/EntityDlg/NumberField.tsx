import { TextField } from "office-ui-fabric-react";
import React, { useState } from "react";

interface INumberFieldProps {
  label: string;
  value: number | undefined;
  errorMessage?: string;
  noNegative?: boolean;
  onlyInteger? : boolean;
  width?: string;
  onChange: (newValue: number | undefined) => void;
  onInvalidValue: () => void;
};

export const NumberField = ({ label, value, errorMessage, width, onChange, onlyInteger, noNegative, onInvalidValue }: INumberFieldProps) => {

  const [text, setText] = useState( value === undefined ? '' : value.toString() );

  return (
    <TextField
      label={label}
      value={text}
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