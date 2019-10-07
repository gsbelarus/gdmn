import React, { useState } from "react";
import { IEntityAttribute, ERModel } from "gdmn-orm";
import { getTheme, Stack, Icon, DefaultButton, PrimaryButton, Dropdown, Text } from "office-ui-fabric-react";
import { Frame } from "@src/app/scenes/gdmn/components/Frame";
import { IAttributeEditorProps } from "./EntityAttribute";

interface IEntityValueProps {
  entityName: string;
  onDelete?: () => void;
};

const EntityValue = ({ entityName, onDelete }: IEntityValueProps) =>
  <div
    style={{
      backgroundColor: getTheme().semanticColors.primaryButtonBackground,
      border: '1px solid ' + getTheme().semanticColors.primaryButtonBorder,
      color: getTheme().semanticColors.primaryButtonText,
      borderRadius: '2px',
      padding: '6px',
      cursor: 'default'
    }}
  >
    <Stack horizontal verticalAlign="center" tokens={{ childrenGap: '6px' }}>
      <Text>
        {entityName}
      </Text>
      {
        onDelete
        ?
          <Icon
            iconName='Cancel'
            styles={{
              root: {
                marginBottom: -3,
                borderRadius: '50%',
                border: '1px solid ' + getTheme().semanticColors.primaryButtonText,
                padding: '2px',
                fontSize: '6px'
              }
            }}
            onClick={onDelete}
          />
        :
          null
      }
    </Stack>
  </div>

interface IEntityEditorState {
  idx: number;
  entityName: string;
};

export const EntityEditor = ({ attr, createAttr, onChange, erModel }: IAttributeEditorProps<IEntityAttribute>) => {
  const [state, setState] = useState<IEntityEditorState | undefined>();

  return (
    <Frame border marginTop>
      {
        <Stack horizontal verticalAlign="end" tokens={{ childrenGap: '8px' }}>
          {
            state
            ?
              <>
                <Dropdown
                  label="Entity:"
                  selectedKey={state.entityName ? state.entityName : undefined}
                  onChange={ (_, option) => option && typeof option.key === 'string' && setState({ ...state, entityName: option.text }) }
                  options={erModel ? Object.keys(erModel.entities).map( name => ({ key: name, text: name }) ) : []}
                  styles={{
                    dropdown: {
                      width: 300
                    }
                  }}
                />
                <PrimaryButton
                  text="Save"
                  disabled={!state.entityName || !!attr.references.find( (entityName, idx) => idx !== state.idx && entityName === state.entityName )}
                  onClick={ () => {
                    if (state.idx >= attr.references.length) {
                      onChange({ ...attr, references: [...attr.references, state.entityName] });
                    } else {
                      const values = [...attr.references];
                      values[state.idx] = state.entityName;
                      onChange({ ...attr, references: values });
                    }
                    setState(undefined);
                  } }
                />
                <DefaultButton
                  text="Cancel"
                  onClick={ () => setState(undefined) }
                />
              </>
            :
              <>
                {attr.references && attr.references.map(
                  entityName =>
                    <EntityValue
                      key={entityName}
                      entityName={entityName}
                      onDelete={
                        createAttr ?
                        () => onChange({
                            ...attr,
                            references: attr.references.filter( fv => fv !== entityName )
                          })
                        : undefined
                      }
                    />
                )}
                {
                  createAttr ?
                    <DefaultButton
                      text="Add entity"
                      onClick={ () => setState({ idx: attr.references.length, entityName: '' }) }
                    />
                  :
                    null
                }
              </>
          }
        </Stack>
      }
    </Frame>
  );
};