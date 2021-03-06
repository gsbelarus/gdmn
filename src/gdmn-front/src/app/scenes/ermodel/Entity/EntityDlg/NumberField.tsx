import { TextField, ITextFieldStyles, ITextField } from "office-ui-fabric-react";
import React, { useState } from "react";

interface INumberFieldProps {
  label: string;
  value: number | undefined;
  errorMessage?: string;
  noNegative?: boolean;
  onlyInteger? : boolean;
  width?: string;
  readOnly?: boolean;
  disabled?: boolean;
  onChange: (newValue: number | undefined) => void;
  onInvalidValue: () => void;
  styles?: Partial<ITextFieldStyles>;
  onFocus?: () => void;
  componentRef?: (ref: ITextField | null) => void;
};

export const NumberField = ({ label, value, errorMessage, width,
    onChange, onlyInteger, noNegative, onInvalidValue, readOnly, disabled, styles, onFocus, componentRef}: INumberFieldProps) => {

  const [text, setText] = useState( value === undefined ? '' : value.toString() );

  return (
    <TextField
      label={label}
      value={text}
      readOnly={readOnly}
      disabled={disabled}
      errorMessage={errorMessage}
      styles={ styles ? styles :  width ? { root: { width } } : undefined }
      componentRef={componentRef}
      onFocus={onFocus}
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
