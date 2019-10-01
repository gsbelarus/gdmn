import { Stack, TextField, ComboBox, Dropdown } from "office-ui-fabric-react";
import React, { useState } from "react";
import { getErrorMessage, ErrorLinks } from "./utils";
import { IDateAttribute } from "gdmn-orm/dist/definitions/serialize";
import { ContextVariables, AttributeTypes } from "gdmn-orm";
import { DateField } from "./DateField";

interface IDateEditorProps {
  attr: IDateAttribute,
  createAttribute: boolean,
  errorLinks?: ErrorLinks;
  onChange: (newAttr: IDateAttribute) => void
};

const getOptions = (type: AttributeTypes) => {
  switch (type) {
    case 'Date':
      return [{key: "VALUE", text: "Enter value..." }, {key: "CURRENT_DATE", text: "CURRENT_DATE"}];
    case 'Time':
      return [{key: "VALUE", text: "Enter value..." }, {key: "CURRENT_TIME", text: "CURRENT_TIME"}];
    case 'TimeStamp':
      return [{key: "VALUE", text: "Enter value..." }, {key: "CURRENT_TIMESTAMP", text: "CURRENT_TIMESTAMP"}, {key: "CURRENT_TIMESTAMP(0)", text: "CURRENT_TIMESTAMP(0)"}];
    default:
      return []
  }
}

export const DateEditor = ({ attr, errorLinks, onChange }: IDateEditorProps) => {

  const options = getOptions(attr.type);
  const [selectedOption, setSelectedOption] = useState("VALUE" as string | undefined);

  return (
    <Stack horizontal verticalAlign="start" tokens={{ childrenGap: '0px 16px' }}>
      <DateField
        dateFieldType={attr.type as any}
        label="Min value:"
        value={attr.minValue as Date}
        errorMessage={getErrorMessage('minValue', errorLinks)}
        onChange={ newValue => onChange({ ...attr, minValue: newValue}) }
      />
      <DateField
        dateFieldType={attr.type as any}
        label="Max value:"
        value={attr.maxValue as Date}
        errorMessage={getErrorMessage('maxValue', errorLinks)}
        onChange={ newValue => onChange({ ...attr, maxValue: newValue}) }
      />
      <Dropdown
        label="Type of value"
        selectedKey={selectedOption}
        options={options}
        onChanged={ newValue => {
          setSelectedOption(newValue ? newValue.key as string : undefined);
          onChange({ ...attr, defaultValue: newValue && newValue.key !== "VALUE" ? newValue.text as ContextVariables : undefined})
        }}
        styles={{
          root: {
            width: '180px'
          }
        }}
      />
      { selectedOption === 'VALUE'
        ?
        <DateField
          dateFieldType={attr.type as any}
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
