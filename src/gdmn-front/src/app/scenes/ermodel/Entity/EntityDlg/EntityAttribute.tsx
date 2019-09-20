import { IAttribute, attributeTypeNames } from "gdmn-orm";
import React from "react";
import { Stack, TextField, Dropdown, Checkbox } from "office-ui-fabric-react";
import { getLName } from "gdmn-internals";

interface IEntityAttributeProps {
  createAttribute: boolean;
  attr: IAttribute;
};

export const EntityAttribute = ({ attr, createAttribute }: IEntityAttributeProps) => {
  return (
    <Stack horizontal>
      <TextField
        label="Name:"
        value={attr.name}
        disabled={!createAttribute}
      />
      <Dropdown
        label="Type:"
        selectedKey={attr.type}
        options={
          attributeTypeNames.map( n => ({ key: n, text: n }) )
        }
        disabled={!createAttribute}
      />
      <Checkbox
        label="Required:"
        checked={attr.required}
        disabled={!createAttribute}
        boxSide="end"
      />
      <TextField
        label="Description:"
        value={getLName(attr.lName)}
        disabled={!createAttribute}
      />
      <TextField
        label="Sem categories:"
        value={attr.semCategories}
        disabled={!createAttribute}
      />
    </Stack>
  );
};