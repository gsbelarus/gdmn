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
  DefaultButton,
} from 'office-ui-fabric-react';
import { DatePicker, DayOfWeek, IDatePickerStrings } from 'office-ui-fabric-react/lib/DatePicker';
import { TFieldType } from 'gdmn-recordset';
import { ISQLField } from './Sql';

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

const DayPickerStrings: IDatePickerStrings = {
  months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],

  shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],

  days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],

  shortDays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],

  goToToday: 'Go to today',
  prevMonthAriaLabel: 'Go to previous month',
  nextMonthAriaLabel: 'Go to next month',
  prevYearAriaLabel: 'Go to previous year',
  nextYearAriaLabel: 'Go to next year',
  closeButtonAriaLabel: 'Close date picker',

  isRequiredErrorMessage: 'Start date is required.',

  invalidInputErrorMessage: 'Invalid date format.'
};

export interface IDatePickerInputExampleState {
  firstDayOfWeek?: DayOfWeek;
  value?: Date | null;
}

const firstDayOfWeek = DayOfWeek.Monday;

export const ParamsDialog = (props: ISQLFormProps) => {
  const { params, onClose, onSave } = props;

  const [ paramList, setParamList ]  = useState<ISQLField[]>([]);

  const handleChangeValue = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const inputEl = (event.target as HTMLInputElement);
    const name = inputEl.name;

    const value = (inputEl.validity.valid) ? inputEl.value : paramList.find(i => i.name === name)!.value || '';

    setParamList(paramList.map(i => i.name === name ? {...i, value: value} : i))
  };

  const handleSelectDate = (date: Date | null | undefined, name: string): void => {
    setParamList(paramList.map(i => i.name === name ? {...i, value: date} : i))
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
              return <TextField label={`${i.name} (${i.type})`} key={i.name} value={i.value} name={i.name} onChange={handleChangeValue} pattern="[0-9]*"/>;
              break;
            case TFieldType.Date:
              return <DatePicker
                label={i.name}
                isRequired={false}
                allowTextInput={true}
                ariaLabel={i.name}
                firstDayOfWeek={firstDayOfWeek}
                strings={DayPickerStrings}
                value={i.value}
                key={i.name}
                onSelectDate={(date) => handleSelectDate(date, i.name)}
              />
              break;
            default:
              return <TextField label={`${i.name} (${i.type})`} key={i.name} value={i.value} name={i.name} onChange={handleChangeValue}/>;
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
