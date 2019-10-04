import { IBlobAttribute, BlobSubTypes } from "gdmn-orm";
import { ChoiceGroup, IChoiceGroupOption } from "office-ui-fabric-react";
import React, { useState }  from "react";

interface IBlobEditorProps {
    attr: IBlobAttribute;
    onChange: (newAttr: IBlobAttribute) => void;
  };
  
  export const BlobEditor = ({ attr, onChange }: IBlobEditorProps) => {

    const [selectedOption, setSelectedOption] = useState("Binary" as string);
    return ( 
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
        onChanged = { (newValue) => {
          setSelectedOption(newValue.key as string);
          onChange({ ...attr, subType: newValue.text as BlobSubTypes}); 
        }  }
        label = "Blob type:"
      />
    ) 
  }