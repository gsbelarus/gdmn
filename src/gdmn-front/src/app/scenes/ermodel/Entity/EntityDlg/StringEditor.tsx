import { IStringAttribute } from "gdmn-orm";
import { Stack, TextField, Label, Checkbox } from "office-ui-fabric-react";
import React from "react";

interface IStringEditorProps {
  attr: IStringAttribute,
  createAttribute: boolean,
  onChange: (newAttr: IStringAttribute) => void
};

export const StringEditor = ({ attr, onChange }: IStringEditorProps) =>
  <Stack horizontal tokens={{ childrenGap: '0px 16px' }}>
    <TextField
      label="Min length:"
      value={attr.minLength === undefined ? '' : attr.minLength.toString()}
      styles={{
        root: {
          width: '180px'
        }
      }}
      onChange={ (_, minLength) => {
        if (minLength !== undefined) {
          if (!minLength.trim()) {
            onChange({ ...attr, minLength: undefined });
          } else {
            if (parseInt(minLength) >= 0) {
              onChange({ ...attr, minLength: parseInt(minLength) });
            }
          }
        }
      } }
    />
    <TextField
      label="Max length:"
      value={attr.maxLength === undefined ? '' : attr.maxLength.toString()}
      styles={{
        root: {
          width: '180px'
        }
      }}
      onChange={ (_, maxLength) => {
        if (maxLength !== undefined) {
          if (!maxLength.trim()) {
            onChange({ ...attr, maxLength: undefined });
          } else {
            if (parseInt(maxLength) >= 0) {
              onChange({ ...attr, maxLength: parseInt(maxLength) });
            }
          }
        }
      } }
    />
    <Stack.Item>
      <Label>Auto trim:</Label>
      <Checkbox
        checked={attr.autoTrim}
        styles={{
          root: {
            width: '64px'
          }
        }}
        onChange={ (_, autoTrim) => autoTrim !== undefined && onChange({ ...attr, autoTrim }) }
      />
    </Stack.Item>
    <TextField
      label="Mask:"
      value={attr.mask ? attr.mask.source : ''}
      styles={{
        root: {
          width: '240px'
        }
      }}
      onChange={ (_, mask) => mask !== undefined && onChange({ ...attr, mask: new RegExp(mask) }) }
    />
    <Stack.Item grow={1}>
      <TextField
        label="Default value:"
        value={attr.defaultValue}
        onChange={ (_, defaultValue) => defaultValue !== undefined && onChange({ ...attr, defaultValue }) }
      />
    </Stack.Item>
  </Stack>
