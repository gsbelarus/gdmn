import { INumberAttribute } from "gdmn-orm";
import { Stack, TextField, Label, Checkbox } from "office-ui-fabric-react";
import React from "react";
import { getErrorMessage, ErrorLinks } from "./utils";
import { NumberField, NumberFieldError } from "./NumberField";

interface IIntegerEditorProps {
  attr:  INumberAttribute<number>,
  createAttribute: boolean,
  errorLinks?: ErrorLinks;
  onChange: (newAttr: INumberAttribute<number>) => void
};

export const IntegerEditor = ({ attr, errorLinks, onChange }: IIntegerEditorProps) =>
  <Stack horizontal tokens={{ childrenGap: '0px 16px' }}>
    <NumberField
      label="Min value:"
      value={attr.minValue}
      onlyInteger = {true}
      noNegative = {false}
      onError={ (error: NumberFieldError) => { if (error === 'INVALID')  getErrorMessage('minValue', errorLinks) } }
      // styles={{
      //   root: {
      //     width: '180px'
      //   }
      // }}
      onChanged={ (minValue) => {
        if (minValue !== undefined) {
          onChange({ ...attr, minValue: minValue });
        } else {
          onChange({ ...attr, minValue: undefined });
        }  
      }   
      } 
    />
    <TextField
      label="Max value:"
      value={attr.maxValue === undefined ? '' : attr.maxValue.toString()}
      errorMessage={getErrorMessage('maxValue', errorLinks)}
      styles={{
        root: {
          width: '180px'
        }
      }}
      onChange={ (_, maxValue) => {
        if (maxValue !== undefined) {
          if (!maxValue.trim()) {
            onChange({ ...attr,maxValue: undefined });
          } else {
            const parsedValue = parseInt(maxValue);
            if (!isNaN(parsedValue)) {
              onChange({ ...attr, maxValue: parsedValue });
            }
          }
        }
      } }
    />
   
    <Stack.Item grow={1}>
      <TextField
        label="Default value:"
        value={attr.defaultValue === undefined? '' : attr.defaultValue.toString()}
        onChange={ (_, defaultValue) => {
          if (defaultValue !== undefined){
            if (!defaultValue.trim()) {
                onChange({ ...attr,defaultValue: undefined });
                } else {
                  if (defaultValue === parseInt(defaultValue).toString()) {
                     onChange({ ...attr, defaultValue: parseInt(defaultValue) });
                  }
                }
              }  
          } 
        }
      />
    </Stack.Item>
</Stack>
