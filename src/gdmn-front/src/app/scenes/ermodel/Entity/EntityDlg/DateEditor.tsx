import { Stack, TextField, Dropdown } from "office-ui-fabric-react";
import React from "react";
import { getErrorMessage } from "./utils";
import { IDateAttribute } from "gdmn-orm/dist/definitions/serialize";
import { AttributeDateTimeTypes, isUserDefined } from "gdmn-orm";
import { DateField } from "./DateField";
import { IAttributeEditorProps } from "./EntityAttribute";

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

export const DateEditor = ({ attr, attrIdx, userDefined, errorLinks, onChange }: IAttributeEditorProps<IDateAttribute>) => {
  return (
    <Stack horizontal verticalAlign="start" tokens={{ childrenGap: '0px 16px' }}>
      <DateField
        dateFieldType={attr.type as AttributeDateTimeTypes}
        label="Min value:"
        value={attr.minValue}
        disabled={!userDefined}
        errorMessage={getErrorMessage(attrIdx, 'minValue', errorLinks)}
        onChange={ newValue => onChange({ ...attr, minValue: newValue}) }
      />
      <DateField
        dateFieldType={attr.type as AttributeDateTimeTypes}
        label="Max value:"
        value={attr.maxValue}
        disabled={!userDefined}
        errorMessage={getErrorMessage(attrIdx, 'maxValue', errorLinks)}
        onChange={ newValue => onChange({ ...attr, maxValue: newValue}) }
      />
      <Dropdown
        label="Default value type:"
        disabled={!userDefined}
        selectedKey={typeof attr.defaultValue === 'string' ? attr.defaultValue : 'VALUE'}
        options={getOptions(attr.type as AttributeDateTimeTypes)}
        onChange={
          userDefined ? (_, newValue) => newValue && onChange({ ...attr, defaultValue: newValue.key === "VALUE" ? undefined : newValue.key as any}) : undefined
        }
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
          defaultValue={attr.defaultValue}
          disabled
          styles={{
            root: {
              width: '180px'
            }
          }}
        />
        :
        <DateField
          label="Default value:"
          dateFieldType={attr.type as AttributeDateTimeTypes}
          value={attr.defaultValue}
          disabled={!userDefined}
          errorMessage={getErrorMessage(attrIdx, 'defaultValue', errorLinks)}
          onChange={ defaultValue => onChange({ ...attr, defaultValue }) }
        />
      }
    </Stack>
  );
};
