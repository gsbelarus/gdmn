import { Stack, TextField, Dropdown } from "office-ui-fabric-react";
import React from "react";
import { getErrorMessage, ErrorLinks } from "./utils";
import { IDateAttribute } from "gdmn-orm/dist/definitions/serialize";
import { AttributeDateTimeTypes } from "gdmn-orm";
import { DateField } from "./DateField";

interface IDateEditorProps {
  attr: IDateAttribute,
  createAttribute: boolean,
  errorLinks?: ErrorLinks;
  onChange: (newAttr: IDateAttribute) => void
};

const getOptions = (type: AttributeDateTimeTypes) => {
  switch (type) {
    case 'Date':
      return [{key: "VALUE", text: "Enter value..." }, {key: "CURRENT_DATE", text: "CURRENT_DATE"}];
    case 'Time':
      return [{key: "VALUE", text: "Enter value..." }, {key: "CURRENT_TIME", text: "CURRENT_TIME"}];
    case 'TimeStamp':
      return [{key: "VALUE", text: "Enter value..." }, {key: "CURRENT_TIMESTAMP", text: "CURRENT_TIMESTAMP"}, {key: "CURRENT_TIMESTAMP(0)", text: "CURRENT_TIMESTAMP(0)"}];
  }
};

export const DateEditor = ({ attr, errorLinks, onChange }: IDateEditorProps) => {
  return (
    <Stack horizontal verticalAlign="start" tokens={{ childrenGap: '0px 16px' }}>
      <DateField
        dateFieldType={attr.type as AttributeDateTimeTypes}
        label="Min value:"
        value={attr.minValue}
        errorMessage={getErrorMessage('minValue', errorLinks)}
        onChange={ newValue => onChange({ ...attr, minValue: newValue}) }
      />
      <DateField
        dateFieldType={attr.type as AttributeDateTimeTypes}
        label="Max value:"
        value={attr.maxValue}
        errorMessage={getErrorMessage('maxValue', errorLinks)}
        onChange={ newValue => onChange({ ...attr, maxValue: newValue}) }
      />
      <Dropdown
        label="Default value type:"
        selectedKey={typeof attr.defaultValue === 'string' ? attr.defaultValue : 'VALUE'}
        options={getOptions(attr.type as AttributeDateTimeTypes)}
        onChanged={ newValue => newValue && onChange({ ...attr, defaultValue: newValue.key === "VALUE" ? undefined : newValue.key as any}) }
        styles={{
          root: {
            width: '180px'
          }
        }}
      />
      { typeof attr.defaultValue === 'string'
        ?
        <TextField
          label="Default value:"
          value={attr.defaultValue}
          disabled={true}
          styles={{
            root: {
              width: '180px'
            }
          }}
        />
        :
        <DateField
          dateFieldType={attr.type as AttributeDateTimeTypes}
          label="Default value:"
          value={attr.defaultValue}
          errorMessage={getErrorMessage('defaultValue', errorLinks)}
          onChange={ defaultValue => onChange({ ...attr, defaultValue }) }
        />
      }
    </Stack>
  );
};
