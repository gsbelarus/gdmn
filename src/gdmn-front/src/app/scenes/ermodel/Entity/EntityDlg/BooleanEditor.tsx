import { IBooleanAttribute } from "gdmn-orm";
import { Checkbox, Label } from "office-ui-fabric-react";
import React from "react";

interface IBooleanEditorProps {
  attr: IBooleanAttribute;
  onChange: (newAttr: IBooleanAttribute) => void;
};

export const BooleanEditor = ({ attr, onChange }: IBooleanEditorProps) =>
  <div>
    <Label>Default value:</Label>
    <Checkbox
      checked={attr.defaultValue}
      onChange={ (_, defaultValue) => defaultValue !== undefined && onChange({ ...attr, defaultValue }) }
    />
  </div>
