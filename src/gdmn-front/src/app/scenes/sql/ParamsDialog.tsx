import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  mergeStyleSets,
  DialogType,
  DialogFooter,
  PrimaryButton,
  getTheme,
  TextField,
  Stack,
  DefaultButton
} from 'office-ui-fabric-react';
import { TFieldType } from 'gdmn-recordset';
import { ISQLParam } from './Sql';

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
  params: ISQLParam[];
  onClose: () => void;
  onSave: (params: ISQLParam[]) => void;
}

export const ParamsDialog = (props: ISQLFormProps) => {
  const { params, onClose, onSave } = props;

  const [ paramList, setParamList ]  = useState<ISQLParam[]>([]);

  const handleChangeValue = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const inputEl = (event.target as HTMLInputElement);
    const name = inputEl.name;

    const value = (inputEl.validity.valid) ? inputEl.value : paramList.find(i => i.name === name)!.value || '';

    setParamList(paramList.map(i => i.name === name ? {...i, value: value} : i))
  };

  useEffect(() => {
    setParamList(params);
  }, [params])

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
      <Stack tokens={{ childrenGap: 10 }} styles={{ root: { width: "65vh" } }}>
        {paramList.map(i => {
          switch (i.type) {
            case TFieldType.Integer:
              return <TextField label={i.name} key={i.name} value={i.value} name={i.name} onChange={handleChangeValue} pattern="[0-9]*"/>;
            default:
              return <TextField label={i.name} key={i.name} value={i.value} name={i.name} onChange={handleChangeValue}/>;
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
