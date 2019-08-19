import { ISize, TUnit } from "./types";
import { Stack, Dropdown, TextField } from "office-ui-fabric-react";
import React, { useState, useEffect } from "react";

interface ISizeLineProps {
  label: string;
  idx: number;
  size?: ISize;
  onSetUnit: (unit: TUnit) => void;
  onSetValue: (value: number) => void;
};

export const SizeLine = ({ label, idx, size, onSetUnit, onSetValue }: ISizeLineProps) => {

  const [value, setValue] = useState(size && size.value !== undefined ? size.value.toString() : '1');

  useEffect( () => {
    const parsed = parseFloat(value);
    if (size && size.value !== undefined && !isNaN(parsed) && parsed !== size.value && parsed >= 0) {
      onSetValue(parsed);
    }
  }, [value, size]);

  return (
    <Stack horizontal tokens={{ childrenGap: 10 }}>
      <Stack.Item align="end">
        <Dropdown
          label={`${label} ${idx + 1}:`}
          options={[
            { key: 'AUTO', text: 'AUTO' },
            { key: 'FR', text: 'FR' },
            { key: 'PX', text: 'PX' }
          ]}
          selectedKey={size ? size.unit : undefined}
          onChange={ (_e, option) => option && onSetUnit(option.key as TUnit) }
          styles={{
            root: {
              width: '96px'
            }
          }}
        />
      </Stack.Item>
      {
        size && size.unit !== 'AUTO'
        ?
          <Stack.Item align="end">
            <TextField
              value={value}
              onChange={
                (e, newValue) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (newValue !== undefined) {
                    setValue(newValue);
                  }
                }
              }
            />
          </Stack.Item>
        : null
      }
    </Stack>
  );
};