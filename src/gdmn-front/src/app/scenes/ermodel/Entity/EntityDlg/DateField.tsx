import { TextField } from "office-ui-fabric-react";
import React, { useState } from "react";
import { AttributeDateTimeTypes } from "gdmn-orm";

const date2str = (value: Date, dateFieldType: AttributeDateTimeTypes): string => {
  switch (dateFieldType) {
    case 'Date':
      return `${value.getDate().toString().padStart(2, '0')}.${(value.getMonth() + 1).toString().padStart(2, '0')}.${value.getFullYear().toString()}`
    case 'Time':
      return `${value.getHours().toString().padStart(2, '0')}:${value.getMinutes().toString().padStart(2, '0')}:${value.getSeconds().toString().padStart(2, '0')}`
    case 'TimeStamp':
      return `${date2str(value, 'Date')} ${date2str(value, 'Time')}`;
  }
};

const str2date = (value: string, dateFieldType: AttributeDateTimeTypes): Date => {
  switch (dateFieldType) {
    case 'Date': {
      const parts = value.split('.').map( s => s ? parseInt(s) : 0);
      if (parts.length === 3 && parts[0] >= 1 && parts[0] <= 31 && parts[1] >= 1 && parts[1] <= 12 && parts[2] > 0) {
        const d = new Date(parts[2] < 100 ? parts[2] + 2000 : parts[2], parts[1] - 1, parts[0]);
        if (!isNaN(d.getTime())) {
          return d;
        }
      }
      throw new Error('Используйте формат даты dd.mm.yyyy');
    }

    case 'Time': {
      const currDate = new Date();
      const parts = value.split(':').map( s => s ? parseInt(s) : -1);
      if (parts.length === 3 && parts[0] >= 0 && parts[0] <= 23 && parts[1] >= 0 && parts[1] <= 59 && parts[2] >= 0 && parts[2] <= 59) {
        const d = new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate(), parts[0], parts[1], parts[2]);
        if (!isNaN(d.getTime())) {
          return d;
        }
      }
      throw new Error('Используйте формат времени hh:mm:ss');
    }

    case 'TimeStamp': {
      const parts = value.split(' ').map( s => s.trim() ).filter( s => s );
      if (parts.length === 2) {
        const date = str2date(parts[0], 'Date');
        const time = str2date(parts[1], 'Time');
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes(), time.getSeconds());
      }
      throw new Error('Используйте формат даты и времени dd.mm.yyyy hh:mm:ss');
    }
  }
};

interface IDateFieldProps {
  dateFieldType: AttributeDateTimeTypes;
  label?: string;
  value: Date | undefined;
  readOnly?: boolean;
  disabled?: boolean;
  errorMessage?: string;
  onChange: (newValue: Date | undefined) => void;
};

interface IDateFieldState {
  text: string;
  error?: string;
};

export const DateField = ({ dateFieldType, label, value, errorMessage, readOnly, onChange, disabled }: IDateFieldProps) => {

  const [state, setState] = useState<IDateFieldState>( { text: value === undefined ? '' : date2str(value, dateFieldType) } );

  return (
    <TextField
      label={label}
      value={state.text}
      readOnly={readOnly}
      disabled={disabled}
      errorMessage={state.error || errorMessage}
      styles={{
        root: {
          width: '180px'
        }
      }}
      onChange={
        (_, newValue) => {
          if (newValue !== undefined) {
            try {

              const trimmedValue = newValue.trim();

              if (trimmedValue) {
                const d = str2date(trimmedValue, dateFieldType);
                if (value === undefined || date2str(d, dateFieldType) !== date2str(value, dateFieldType)) {
                  onChange(d);
                }
              } else {
                if (value !== undefined) {
                  onChange(undefined);
                }
              }

              setState({
                ...state,
                text: trimmedValue,
                error: undefined
              });
            } catch (e) {
              setState({
                ...state,
                text: newValue,
                error: e.message
              });
            }
          }
        }
      }
    />
  );
};
