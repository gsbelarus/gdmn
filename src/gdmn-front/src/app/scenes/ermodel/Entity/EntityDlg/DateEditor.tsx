import { Stack, TextField, ComboBox } from "office-ui-fabric-react";
import React, { useState } from "react";
import { getErrorMessage, ErrorLinks } from "./utils";
import { IDateAttribute } from "gdmn-orm/dist/definitions/serialize";
import { ContextVariables } from "gdmn-orm";
import { DateField } from "./DateField";

interface IDateEditorProps {
  attr: IDateAttribute,
  createAttribute: boolean,
  errorLinks?: ErrorLinks;
  onChange: (newAttr: IDateAttribute) => void
};

export const DateEditor = ({ attr, errorLinks, onChange }: IDateEditorProps) => {

  const options = [{key: "VALUE", text: "Enter value..." }, {key: "CURRENT_DATE", text: "CURRENT_DATE"}];
  const [selectedOption, setSelectedOption] = useState("VALUE" as string | undefined)

  return (
    <Stack horizontal verticalAlign="start" tokens={{ childrenGap: '0px 16px' }}>
      <DateField
        dateFieldType="DATE"
        label="Min value:"
        value={attr.minValue as Date}
        errorMessage={getErrorMessage('minValue', errorLinks)}
        onChange={ newValue => onChange({ ...attr, minValue: newValue}) }
      />
      <DateField
        dateFieldType="DATE"
        label="Max value:"
        value={attr.maxValue as Date}
        errorMessage={getErrorMessage('maxValue', errorLinks)}
        onChange={ newValue => onChange({ ...attr, maxValue: newValue}) }
      />
      <ComboBox
        label="Type of value"
        selectedKey={selectedOption}
        options={options}
        onChange={ (e, option) => {
          setSelectedOption(option ? option.key as string : undefined);
          onChange({ ...attr, defaultValue: option && option.key !== "VALUE" ? option.text as ContextVariables : undefined})
        }}
      />
      { selectedOption === 'VALUE'
        ?
        <DateField
          dateFieldType="DATE"
          label="Default value:"
          value={attr.defaultValue as Date}
          errorMessage={getErrorMessage('defaultValue', errorLinks)}
          onChange={ newValue => onChange({ ...attr, defaultValue: newValue}) }
        />
        :
        <TextField
          label="Default value:"
          value={attr.defaultValue ? attr.defaultValue.toString() : undefined}
          disabled={true}
          styles={{
            root: {
              width: '180px'
            }
          }}
        />
      }
    </Stack>
  );
};
