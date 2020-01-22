import { IStringAttribute } from "gdmn-orm";
import { Stack, TextField, Label, Checkbox } from "office-ui-fabric-react";
import React from "react";
import { getErrorMessage } from "./utils";
import { NumberField } from "./NumberField";
import { IAttributeEditorProps } from "./EntityAttribute";

export const StringEditor = ({ attr, attrIdx, errorLinks, userDefined, onChange, createAttr, onError, onClearError }: IAttributeEditorProps<IStringAttribute>) =>
  <Stack horizontal tokens={{ childrenGap: '0px 16px' }}>
    <NumberField
      label="Min length:"
      onlyInteger
      noNegative
      value={attr.minLength}
      disabled={!userDefined}
      errorMessage={getErrorMessage(attrIdx, 'minLength', errorLinks)}
      width="180px"
      onChange={ minLength => { onChange({ ...attr, minLength }); onClearError && onClearError('minLength'); } }
      onInvalidValue={ () => onError && onError('minLength', 'Invalid value') }
    />
    <NumberField
      label="Max length:"
      onlyInteger
      noNegative
      value={attr.maxLength}
      disabled={!userDefined}
      errorMessage={getErrorMessage(attrIdx, 'maxLength', errorLinks)}
      width="180px"
      onChange={ maxLength => { onChange({ ...attr, maxLength }); onClearError && onClearError('maxLength'); } }
      onInvalidValue={ () => onError && onError('maxLength', 'Invalid value') }
    />
    <Stack.Item>
      <Label>Auto trim:</Label>
      <Checkbox
        checked={attr.autoTrim}
        disabled={!createAttr}
        styles={{
          root: {
            width: '64px'
          }
        }}
        onChange={
          userDefined ? (_, autoTrim) => autoTrim !== undefined && onChange({ ...attr, autoTrim }) : undefined
        }
      />
    </Stack.Item>
    <TextField
      label="Mask:"
      value={attr.mask ? attr.mask.source : ''}
      disabled={!userDefined}
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
        disabled={!userDefined}
        onChange={ (_, defaultValue) => defaultValue !== undefined && onChange({ ...attr, defaultValue }) }
      />
    </Stack.Item>
  </Stack>
