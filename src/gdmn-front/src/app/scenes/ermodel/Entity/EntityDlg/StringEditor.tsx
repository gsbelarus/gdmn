import { IStringAttribute } from "gdmn-orm";
import { Stack, TextField, Label, Checkbox } from "office-ui-fabric-react";
import React from "react";
import { getErrorMessage, ErrorLinks } from "./utils";
import { NumberField } from "./NumberField";

interface IStringEditorProps {
  attr: IStringAttribute,
  createAttribute: boolean,
  errorLinks?: ErrorLinks;
  onChange: (newAttr: IStringAttribute) => void;
  onError?: (field: string, message: string) => void;
  onClearError?: (field: string) => void;
};

export const StringEditor = ({ attr, errorLinks, onChange, onError, onClearError }: IStringEditorProps) =>
  <Stack horizontal tokens={{ childrenGap: '0px 16px' }}>
    <NumberField
      label="Min length:"
      value={attr.minLength}
      errorMessage={getErrorMessage('minLength', errorLinks)}
      width="180px"
      onlyInteger
      noNegative
      onChange={ minLength => { onChange({ ...attr, minLength }); onClearError && onClearError('minLength'); } }
      onInvalidValue={ () => onError && onError('minLength', 'Invalid value') }
    />
    <NumberField
      label="Max length:"
      value={attr.maxLength}
      errorMessage={getErrorMessage('maxLength', errorLinks)}
      width="180px"
      onlyInteger
      noNegative
      onChange={ maxLength => { onChange({ ...attr, maxLength }); onClearError && onClearError('maxLength'); } }
      onInvalidValue={ () => onError && onError('maxLength', 'Invalid value') }
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
