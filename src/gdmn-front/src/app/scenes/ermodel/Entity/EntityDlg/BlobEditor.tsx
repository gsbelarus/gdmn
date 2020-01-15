import { IBlobAttribute, BlobSubTypes } from "gdmn-orm";
import { ChoiceGroup } from "office-ui-fabric-react";
import React from "react";
import { IAttributeEditorProps } from "./EntityAttribute";

// тип БЛОБ поля можно менять только при его создании

export const BlobEditor = ({ attr, createAttr, onChange }: IAttributeEditorProps<IBlobAttribute>) =>
  <ChoiceGroup
    label = "Blob type:"
    selectedKey = {attr.subType}
    defaultSelectedKey = 'Binary'
    options = {[
      {
          key: 'Binary',
          text: 'Binary'
      },
      {
          key: 'Text',
          text: 'Text'
      },
    ]}
    onChange = {
      createAttr
      ? (_, newValue) => newValue && onChange({ ...attr, subType: newValue.key as BlobSubTypes })
      : undefined
    }
  />