import { entityTypeNames, ERModel } from "gdmn-orm";
import { Stack, Dropdown, ChoiceGroup, PrimaryButton } from "office-ui-fabric-react";
import React, { useState } from "react";


interface IEntityInitialDataProps {
  erModel: ERModel;
  createEntity?: boolean;
  onSetType: (entityType: string, parent?: string) => void;
};


export const EntityInitialData = ({createEntity, erModel, onSetType}: IEntityInitialDataProps) => {

  const [entityType, setEntityType] = useState(entityTypeNames[0]);
  const [parent, setParent] = useState();

  return (
    <Stack tokens={{ childrenGap: '16px 16px' }}>
      <ChoiceGroup
        defaultSelectedKey={entityTypeNames[0]}
        options={entityTypeNames.map(t => ({key: t, text: t}))}
        onChange={(_, newValue) => newValue && setEntityType(newValue.text)}
        label="Type:"
        required={true}
        styles={{
          root: {
            width: '180px'
          }
        }}
      />
      <Dropdown
        label="Parent:"
        isDisabled={entityType !== "Inherited"}
        options={Object.keys(erModel.entities).map( name => ({ key: name, text: name }) )}
        selectedKey={parent}
        disabled={!createEntity}
        onChange={(_, newValue) => newValue && setParent(newValue.key as string)}
        styles={{
          root: {
            width: '240px'
          }
        }}
      />
      <Stack.Item>
        <PrimaryButton
          disabled={entityType === 'Inherited' && parent === undefined}
          onClick={() => onSetType(entityType, entityType === 'Inherited' ? parent : undefined)}
          text="Generate"
        />
      </Stack.Item>
    </Stack>
  )
}
