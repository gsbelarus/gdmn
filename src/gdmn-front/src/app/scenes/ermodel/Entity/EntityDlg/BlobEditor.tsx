import { IBlobAttribute, BlobSubTypes } from "gdmn-orm";
import { ChoiceGroup } from "office-ui-fabric-react";
import React  from "react";

interface IBlobEditorProps {
  attr: IBlobAttribute;
  onChange: (newAttr: IBlobAttribute) => void;
};
  
export const BlobEditor = ({ attr, onChange }: IBlobEditorProps) => 
  <ChoiceGroup
    selectedKey = {attr.subType}
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
    onChange = { (_, newValue) => newValue && onChange({ ...attr, subType: newValue.key as BlobSubTypes}) }
    label = "Blob type:"
  />