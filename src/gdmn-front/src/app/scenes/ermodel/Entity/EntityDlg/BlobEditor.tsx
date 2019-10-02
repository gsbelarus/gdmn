import { IAttribute } from "gdmn-orm";
import { ChoiceGroup, IChoiceGroupOption } from "office-ui-fabric-react";
import React from "react";

interface IBlobEditorProps {
    attr: IAttribute;
    onChange: (newAttr: IAttribute) => void;
  };
  
  export const BlobEditor = ({ attr, onChange }: IBlobEditorProps) => 
    <ChoiceGroup
      defaultSelectedKey = 'Text'
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
      onChanged = { () => onChange(attr) }
      label = "Blob type:"
    />