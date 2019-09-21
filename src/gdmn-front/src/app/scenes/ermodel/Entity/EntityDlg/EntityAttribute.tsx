import { IAttribute, attributeTypeNames } from "gdmn-orm";
import React from "react";
import { Stack, TextField, Dropdown, Checkbox, Label } from "office-ui-fabric-react";
import { getLName } from "gdmn-internals";

interface IEntityAttributeProps {
  createAttribute: boolean;
  attr: IAttribute;
};

export const EntityAttribute = ({ attr, createAttribute }: IEntityAttributeProps) => {
  return (
    <Stack horizontal verticalAlign="start" tokens={{ childrenGap: '0px 16px' }}>
      <TextField
        label="Name:"
        value={attr.name}
        disabled={!createAttribute}
        styles={{
          root: {
            width: '240px'
          }
        }}
      />
      <Dropdown
        label="Type:"
        selectedKey={attr.type}
        options={
          attributeTypeNames.map( n => ({ key: n, text: n }) )
        }
        disabled={!createAttribute}
        styles={{
          root: {
            width: '120px'
          }
        }}
      />
      <div>
        <Label>Required:</Label>
        <Checkbox
          checked={attr.required}
          disabled={!createAttribute}
        />
      </div>
      <TextField
        label="Sem categories:"
        value={attr.semCategories}
        disabled={!createAttribute}
        styles={{
          root: {
            width: '240px'
          }
        }}
      />
      <Stack.Item grow>
        <TextField
          label="Description:"
          value={getLName(attr.lName, ['ru'])}
          disabled={!createAttribute}
        />
      </Stack.Item>
    </Stack>
  );
};