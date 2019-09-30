import { INumericAttribute } from "gdmn-orm";
import { Stack, TextField, Label, Checkbox } from "office-ui-fabric-react";
import React from "react";
import { getErrorMessage, ErrorLinks } from "./utils";

interface INumericEditorProps {
  attr: INumericAttribute,
  createAttribute: boolean,
  errorLinks?: ErrorLinks;
  onChange: (newAttr: INumericAttribute) => void
};

export const NumericEditor = ({ attr, errorLinks, onChange }: INumericEditorProps) =>
  <Stack horizontal tokens={{ childrenGap: '0px 16px' }}>
  <TextField
      label="Precision:"
      value={attr.precision === undefined ? '' : attr.precision.toString()}
      errorMessage={getErrorMessage('precision', errorLinks)}
      styles={{
        root: {
          width: '80px'
        }
      }}
      onChange={ (_, precision) => {
        if (precision !== undefined) {
          if (!precision.trim()) {
            onChange({ ...attr, precision: 0 });
          } else {
            if (parseInt(precision) >= 0) {
              onChange({ ...attr, precision: parseInt(precision) });
            }
          }
        }
      } }
    />
    <TextField
      label="Scale:"
      value={attr.scale === undefined ? '' : attr.scale.toString()}
      errorMessage={getErrorMessage('scale', errorLinks)}
      styles={{
        root: {
          width: '80px'
        }
      }}
      onChange={ (_, scale) => {
        if (scale !== undefined) {
          if (!scale.trim()) {
            onChange({ ...attr, scale: 0 });
          } else {
            if (parseInt(scale) >= 0) {
              onChange({ ...attr, scale: parseInt(scale) });
            }
          }
        }
      } }
    />
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
          if (!minValue.trim()) {
            onChange({ ...attr, minValue: undefined });
          } else {
            if (parseInt(minValue) >= 0) {
              onChange({ ...attr, minValue: parseInt(minValue) });
            }
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
          if (!maxValue.trim()) {
            onChange({ ...attr, maxValue: undefined });
          } else {
            if (parseInt(maxValue) >= 0) {
              onChange({ ...attr, maxValue: parseInt(maxValue) });
            }
          }
        }
      } }
    />
    <Stack.Item grow={1}>
      <TextField
        label="Default value:"
        value={attr.defaultValue ? attr.defaultValue.toString() : ''}
        onChange={ (_, defaultValue) => defaultValue !== undefined && onChange({ ...attr, defaultValue: parseInt(defaultValue) }) }
      />
    </Stack.Item>
  </Stack>
