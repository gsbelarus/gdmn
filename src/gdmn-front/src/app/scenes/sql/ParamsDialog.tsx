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

  const handleChangeValue = React.useCallback((event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const inputEl = (event.target as HTMLInputElement);
    const name = inputEl.name;
    console.log(paramList);

    const value = (inputEl.validity.valid) ? inputEl.value : paramList.find(i => i.name === name)!.value || '';
    setParamList(paramList.map(i => i.name === name ? {...i, value: value} : i));
  }, [paramList]);

  const handleNullValue = React.useCallback((event?: React.FormEvent<HTMLInputElement | HTMLElement>, checked?: boolean): void => {
    const inputEl = (event as React.FormEvent<HTMLInputElement>).currentTarget;
    const name = inputEl.name;
    setParamList(paramList.map(i => i.name === name ? {...i, isNull: checked} : i));
  }, [paramList]);

  useEffect(() => {
    setParamList(params);
  }, [params])

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case 'Enter':
          onSave(paramList);
        break;
      default:
        return;
      }
      e.preventDefault();
      e.stopPropagation();
  }, []);

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
          let component;
          switch (i.type) {
            case TFieldType.Integer:
              component =
                <TextField
                  key={i.name}
                  value={i.value}
                  name={i.name}
                  disabled={typeof(i.isNull) === 'undefined' ? true : i.isNull}
                  onChange={handleChangeValue} pattern="[0-9]*"
                />
              break;
            case TFieldType.Date:
              component =
                <DateField
                  dateFieldType={"Date"}
                  value={i.value ? new Date(i.value) : undefined}
                  key={i.name}
                  label=""
                  disabled={typeof(i.isNull) === 'undefined' ? true : i.isNull}
                  onChange={newValue => setParamList(paramList.map(el => el.name === i.name ? {...el, value: newValue} : el))}
                />
              break;
            default:
              component =
                <TextField disabled={typeof(i.isNull) === 'undefined' ? true : i.isNull} key={i.name} value={i.value} name={i.name} onChange={handleChangeValue}/>
          }
          return (
            <Stack key={i.name}>
              <Stack.Item>
                <Label>{i.name.toUpperCase()}</Label>
              </Stack.Item>
              <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 15 }}>
                <Checkbox label="NULL" name={i.name} checked={typeof(i.isNull) === 'undefined' ? true : i.isNull} onChange={handleNullValue}/>
                <Stack.Item grow>
                  {component}
                </Stack.Item>
              </Stack>
            </Stack>
          )
        })}
      </Stack>
      <DialogFooter>
        <PrimaryButton onClick={() => onSave(paramList)} text="OK" />
        <DefaultButton onClick={onClose} text="Close" />
      </DialogFooter>
    </Dialog>
  );
};
