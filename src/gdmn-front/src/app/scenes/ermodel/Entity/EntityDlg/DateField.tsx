import { TextField } from "office-ui-fabric-react";
import React, { useState } from "react";

type DateFieldType = 'DATE' | 'TIME' | 'TIMESTAMP';

const date2str = (value: Date, dateFieldType: DateFieldType): string => {
  switch (dateFieldType) {
    case 'DATE':
      return `${value.getDate().toString().padStart(2, '0')}.${(value.getMonth() + 1).toString().padStart(2, '0')}.${value.getFullYear().toString()}`
    case 'TIME':
      return `${value.getHours().toString().padStart(2, '0')}:${value.getMinutes().toString().padStart(2, '0')}:${value.getSeconds().toString().padStart(2, '0')}`
    case 'TIMESTAMP':
      return `${date2str(value, 'DATE')} ${date2str(value, 'TIME')}`;
  }
};

const str2date = (value: string, dateFieldType: DateFieldType): Date => {
  switch (dateFieldType) {
    case 'DATE': {
      const parts = value.split('.').map( s => s ? parseInt(s) : 0);
      try {
        return new Date(parts[0], parts[1] - 1, parts[2] < 100 ? parts[2] + 2000 : parts[2]);
      }
      catch {
        throw new Error('Используйте формат даты dd.mm.yyyy');
      }
    }

    case 'TIME': {
      const currDate = new Date();
      const parts = value.split(':').map( s => s ? parseInt(s) : 0);
      try {
        return new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate(), parts[0], parts[1], parts[2] ? parts[2] : 0);
      }
      catch {
        throw new Error('Используйте формат времени hh:mm:ss');
      }
    }

    case 'TIMESTAMP': {
      const parts = value.split(' ').map( s => s.trim() ).filter( s => s );
      try {
        const date = str2date(parts[0], 'DATE');
        const time = str2date(parts[1], 'TIME');
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes(), time.getSeconds());
      }
      catch {
        throw new Error('Используйте формат даты и времени dd.mm.yyyy hh:mm:ss');
      }
    }
  }
};

interface IDateFieldProps {
  dateFieldType: DateFieldType;
  label: string;
  value: Date | undefined;
  errorMessage?: string;
  onChange: (newValue: Date | undefined) => void;
};

interface IDateFieldState {
  text: string;
  error?: string;
};

export const DateField = ({ dateFieldType, label, value, errorMessage, onChange }: IDateFieldProps) => {

  const [state, setState] = useState<IDateFieldState>( { text: value === undefined ? '' : date2str(value, dateFieldType) } );

  return (
    <TextField
      label={label}
      value={state.text}
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