import React, { useState } from "react";
import { IEntityAttribute } from "gdmn-orm";
import { getTheme, Stack, Icon, DefaultButton, PrimaryButton, Dropdown } from "office-ui-fabric-react";
import { Frame } from "@src/app/scenes/gdmn/components/Frame";

interface IEntityValueProps {
    reference: string,
    onEdit: () => void,
    onDelete: () => void
  };

const EntityValue = ({reference, onEdit, onDelete}: IEntityValueProps) =>
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
      {
        <Icon
        iconName='SkypeCircleCheck'
        styles={{
            root: {
            marginBottom: -3,
            }
        }}
        />
      }
        <span onClick={onEdit}>
            {reference}
        </span>
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
    </Stack>
  </div>

interface IEntityEditorProps {
    attr: IEntityAttribute,
    createAttribute: boolean,
    entityNames?: string[],
    onChange: (newAttr: IEntityAttribute) => void
  };
  
  interface IEntityEditorState {
    idx: number;
    value: string;
  };
  
  export const EntityEditor = ({ attr, onChange, entityNames }: IEntityEditorProps) => {
    const [state, setState] = useState<IEntityEditorState | undefined>();
  
    return (
      <Frame border marginTop subTitle={state === undefined ? "Entity values:" : state.idx >= attr.references.length ? "New value:" : "Edit value:"}>
        {
          <Stack horizontal verticalAlign="end" tokens={{ childrenGap: '8px' }}>
            {
              state
              ?
                <>
                  <Dropdown
                    label="List entities"
                    selectedKey={state.value ? state.value : undefined}
                    onChange={ (_event, option) => option && typeof option.key === 'string' && setState({ ...state, value: option.text }) }
                    placeholder="Select entity"
                    options={entityNames!.map( name =>({ key: name, text: name }) )}
                    styles={{ 
                      dropdown: { 
                        width: 300 
                      } 
                    }}
                  />
                  <PrimaryButton
                    text="Save"
                    disabled={!state.value || !!attr.references.find( (reference, idx) => idx !== state.idx && reference === state.value )}
                    onClick={ () => {
                      if (state.idx >= attr.references.length) {
                        onChange({ ...attr, references: [...attr.references, state.value] });
                      } else {
                        const values = [...attr.references];
                        values[state.idx] = state.value;
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
                  (v, idx) =>
                    <EntityValue
                      key={v}
                      reference={v}
                      onEdit={ () => setState({
                        idx,
                        value: v
                      }) }
                      onDelete={ () => onChange({
                        ...attr,
                        references: attr.references.filter( fv => fv !== v )
                      }) }
                    />
                )}
                  <DefaultButton
                    text="Add value"
                    onClick={ () => setState({ idx: attr.references.length, value: '' }) }
                  />
                </>
            }
          </Stack>
        }
      </Frame>
    );
  };