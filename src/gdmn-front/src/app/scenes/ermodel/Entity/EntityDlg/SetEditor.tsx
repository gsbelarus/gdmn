import React, { useState } from "react";
import { ISetAttribute, ERModel } from "gdmn-orm";
import { getTheme, Stack, Icon, DefaultButton, PrimaryButton, Dropdown, Text, Label, Checkbox } from "office-ui-fabric-react";
import { Frame } from "@src/app/scenes/gdmn/components/Frame";
import { IAttributeEditorProps } from "./EntityAttribute";
import { NumberField } from "./NumberField";

interface ISetValueProps {
  entityName: string;
  onDelete?: () => void;
};

const SetValue = ({ entityName, onDelete }: ISetValueProps) =>
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

interface ISetEditorState {
  idx: number;
  entityName: string;
};

export const SetEditor = ({ attr, createAttr, onChange, erModel, onError }: IAttributeEditorProps<ISetAttribute>) => {
  const [state, setState] = useState<ISetEditorState | undefined>(); 

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
                      width: 240
                    }
                  }}
                />
                <Stack.Item styles = {{root : { margin: '12px', fontWeight: '600' }}}>
                  <label>IsTextField:</label>
                  <Checkbox
                    checked={attr.isChar}
                    styles={{
                      root: {
                        marginTop: '5px', width: '80px'
                      }
                    }}
                    onChange={ (_, isChar) => { isChar !=undefined  && onChange({ ...attr, isChar}); } }
                  />
                </Stack.Item>
                <NumberField
                  label="PresLen:"
                  onlyInteger={true}
                  value={attr.presLen}
                  readOnly={!attr.isChar}
                  width="180px"
                  onInvalidValue={ () => onError }
                  onChange={ presLen => { presLen !=undefined && presLen > 0 && onChange({ ...attr, presLen}); } }
                />
                <PrimaryButton
                  text="Save"
                  disabled={!state.entityName || !!attr.references.find( (entityName, idx) => idx !== state.idx && entityName === state.entityName )}
                  onClick={ () => {
                    if (state.idx >= attr.references.length) {
                      onChange({...attr, references: [...attr.references, state.entityName]});
                    } else {
                      const values = [...attr.references];
                      values[state.idx] = state.entityName;
                      onChange({...attr, references: values});
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
                    <SetValue
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
                  !attr.references.length ?
                    <DefaultButton
                      text="Add set"
                      onClick={ () => { attr.isChar = true; attr.presLen = 1; setState({ idx: attr.references.length, entityName: ''}) } }
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