import { IBooleanAttribute } from "gdmn-orm";
import { Checkbox, Label } from "office-ui-fabric-react";
import React from "react";
import { IAttributeEditorProps } from "./EntityAttribute";

export const BooleanEditor = ({ attr, userDefined, onChange }: IAttributeEditorProps<IBooleanAttribute>) =>
  <div>
    <Label
      disabled={!userDefined}
    >
      Default value:
    </Label>
    <Checkbox
      checked={attr.defaultValue}
      disabled={!userDefined}
      onChange={
        userDefined
        ? (_, defaultValue) => defaultValue !== undefined && onChange({ ...attr, defaultValue })
        : undefined
      }
    />
  </div>
