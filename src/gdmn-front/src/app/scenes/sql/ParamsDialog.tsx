import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import {
  Dialog,
  mergeStyleSets,
  DialogType,
  DialogFooter,
  PrimaryButton,
  getTheme,
  TextField,
  Stack,
  DefaultButton,
  Checkbox,
  Label,
} from 'office-ui-fabric-react';
import { TFieldType } from 'gdmn-recordset';
import { ISQLField } from './Sql';
import { DateField } from '../ermodel/Entity/EntityDlg/DateField';

const theme = getTheme();
const classNames = mergeStyleSets({
  wrapper: {
    overflow: 'hidden'
  },
  textContent: {
    margin: '15px 0px',
    overflow: 'auto',
    height: '50vh',
    border: '1px solid ' + theme.palette.neutralSecondary,
    padding: '0.5em',
    fontSize: '12px'
  }
});

export interface ISQLFormProps {
  params: ISQLField[];
  onClose: () => void;
  onSave: (params: ISQLField[]) => void;
}

export const ParamsDialog = (props: ISQLFormProps) => {
  const { params, onClose, onSave } = props;

  const [ paramList, setParamList ]  = useState<ISQLField[]>([]);

  const handleChangeValue = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const inputEl = (event.target as HTMLInputElement);
    const name = inputEl.name;

    const value = (inputEl.validity.valid) ? inputEl.value : paramList.find(i => i.name === name)!.value || '';

    setParamList(paramList.map(i => i.name === name ? {...i, value: value} : i))
  };

  function formatDate(date: Date) {
    return `${date.getDate()}.${date.getMonth()}.${date.getFullYear()}`
  }

  const handleSelectDate = (newDate: Date | undefined, name: string): void => {
    let date : string | undefined;
    if (newDate instanceof(Date)) {
      date = formatDate(newDate);
    } else {
      date = undefined;
    }
    setParamList(paramList.map(i => i.name === name ? {...i, value: newDate} : i))
  };

  useEffect(() => {
    setParamList(params);
  }, [params])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case 'Enter':
          onSave(paramList);
        break;
      default:
        return;
      }
      e.preventDefault();
      e.stopPropagation();
  }

  return (
    <Dialog
      minWidth="70vh"
      hidden={false}
      onDismiss={onClose}
      dialogContentProps={{
        type: DialogType.close,
        title: 'SQL params'
      }}
      modalProps={{
        className: classNames.wrapper,
        titleAriaId: 'showSQLTitleID',
        subtitleAriaId: 'showSQLSubTitleID',
        isBlocking: false
      }}
    >
      <Stack tokens={{ childrenGap: 15 }} styles={{ root: { width: "65vh" } }} onKeyDown={handleKeyDown}>
        {paramList.map(i => {
          switch (i.type) {
            case TFieldType.Integer:
              return withNull(
                i.name,
                <TextField
                  key={i.name}
                  value={i.value}
                  name={i.name}
                  onChange={handleChangeValue} pattern="[0-9]*"
                />
              );
            case TFieldType.Date:
              return withNull(
                i.name,
                <DateField
                  dateFieldType={"Date"}
                  value={i.value ? new Date(i.value) : undefined}
                  label=""
                  key={i.name}
                  onChange={newValue => handleSelectDate(newValue, i.name)}
                />
              );
            default:
                return withNull(
                  i.name,
                  <TextField key={i.name} value={i.value} name={i.name} onChange={handleChangeValue}/>
                );
          }
        })}
      </Stack>
      <DialogFooter>
        <PrimaryButton onClick={() => onSave(paramList)} text="OK" />
        <DefaultButton onClick={onClose} text="Close" />
      </DialogFooter>
    </Dialog>
  );
};

const withNull = (name: string, ch: ReactNode) => {
  return (
    <Stack>
      <Stack.Item>
        <Label>{name.toUpperCase()}</Label>
      </Stack.Item>
      <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 15 }}>
        <Checkbox label="NULL" />
        <Stack.Item grow>
          {ch}
        </Stack.Item>
      </Stack>
    </Stack>
  )
};
