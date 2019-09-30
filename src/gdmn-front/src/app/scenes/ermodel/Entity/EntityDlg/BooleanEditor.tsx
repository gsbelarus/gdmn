import { IBooleanAttribute } from "gdmn-orm";
import { Stack, Checkbox } from "office-ui-fabric-react";
import React from "react";

interface IBooleanEditorProps {
  attr: IBooleanAttribute;
  onChange: (newAttr: IBooleanAttribute) => void;
};

export const BooleanEditor = ({ attr, onChange }: IBooleanEditorProps) =>
  <Stack horizontal tokens={{ childrenGap: '0px 16px' }}>
    <Stack.Item grow={1}>
      <Checkbox
        label="Default value:"
        checked={attr.defaultValue}
        onChange={ (_, defaultValue) => defaultValue !== undefined && onChange({ ...attr, defaultValue }) }
      />
    </Stack.Item>
  </Stack>