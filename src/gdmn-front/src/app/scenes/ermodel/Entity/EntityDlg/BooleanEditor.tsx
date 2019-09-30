import { IBooleanAttribute } from "gdmn-orm";
import { Stack, Label, Checkbox } from "office-ui-fabric-react";
import React from "react";

interface IBooleanEditorProps {
  attr: IBooleanAttribute,
  createAttribute: boolean,
  onChange: (newAttr: IBooleanAttribute) => void
};

export const BooleanEditor = ({ attr, onChange }: IBooleanEditorProps) =>
  <Stack horizontal tokens={{ childrenGap: '0px 16px' }}>
    <Stack.Item>
      <Label>Default value:</Label>
      <Checkbox
        checked={attr.defaultValue}
        styles={{
          root: {
            width: '64px'
          }
        }}
        onChange={ (_, defaultValue) => defaultValue !== undefined && onChange({ ...attr, defaultValue }) }
      />
    </Stack.Item>
  </Stack>
