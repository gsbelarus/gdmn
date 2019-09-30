import { Stack, TextField, Label, Checkbox, IComboBoxOption, ComboBox, DatePicker, DayOfWeek, MaskedTextField } from "office-ui-fabric-react";
import React, { useState } from "react";
import { getErrorMessage, ErrorLinks } from "./utils";
import { IDateAttribute } from "gdmn-orm/dist/definitions/serialize";
import { firstDayOfWeek, DayPickerStrings } from "@src/app/scenes/sql/ParamsDialog";
import { ContextVariables } from "gdmn-orm";

interface IDateEditorProps {
  attr: IDateAttribute,
  createAttribute: boolean,
  errorLinks?: ErrorLinks;
  onChange: (newAttr: IDateAttribute) => void
};

export const DateEditor = ({ attr, errorLinks, onChange }: IDateEditorProps) => {

  const options = [{key: "VALUE", text: "Enter value..." }, {key: "CURRENT_DATE", text: "CURRENT_DATE"}];
  const [selectedOption, setSelectedOption] = useState("VALUE")
  //const isContextVariable = !(attr.defaultValue instanceof Date || !attr.defaultValue);
  return (
    <Stack horizontal verticalAlign="start" tokens={{ childrenGap: '0px 16px' }}>
      <TextField
        label="Min value:"
        value={attr.minValue === undefined ? '' : attr.minValue.toString()}
        errorMessage={getErrorMessage('minLength', errorLinks)}
        styles={{
          root: {
            width: '180px'
          }
        }}
        onChange={ (_, minValue) => {
          if (minValue !== undefined) {
            if (parseInt(minValue) >= 0) {
              onChange({ ...attr, minValue: new Date(minValue) });
            }
          }
        } }
      />
      <TextField
        label="Max value:"
        value={attr.maxValue === undefined ? '' : attr.maxValue.toString()}
        errorMessage={getErrorMessage('maxLength', errorLinks)}
        styles={{
          root: {
            width: '180px'
          }
        }}
        onChange={ (_, maxValue) => {
          if (maxValue !== undefined) {
            if (parseInt(maxValue) >= 0) {
              onChange({ ...attr, maxValue: new Date(maxValue) });
            }
          }
        } }
      />
      <ComboBox
        label="Type of value"
        selectedKey={selectedOption}
        options={options}
        onChange={ (e, option) => {
          setSelectedOption(option.key);
          onChange({ ...attr, defaultValue: option && option.key !== "VALUE" ? option.text as ContextVariables : undefined})
        }}
      />
      <TextField
        label="Default value:"
        value={attr.defaultValue ? attr.defaultValue.toString() : undefined}
        disabled={attr.defaultValue && !(attr.defaultValue instanceof Date)}
         onBlur={ (e) => {
           const value = e.target.value;
           onChange({ ...attr,
             defaultValue: value && (value as any instanceof Date) ? new Date(value) : value ? value as ContextVariables : undefined}) }
          }
      />
    </Stack>
  );
};
