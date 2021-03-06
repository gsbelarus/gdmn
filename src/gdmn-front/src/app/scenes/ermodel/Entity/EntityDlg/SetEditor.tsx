import React, { useState } from "react";
import { ISetAttribute, ERModel } from "gdmn-orm";
import { getTheme, Stack, Icon, DefaultButton, PrimaryButton, Dropdown, Text, Label, Checkbox, IComboBoxOption } from "office-ui-fabric-react";
import { Frame } from "@src/app/scenes/gdmn/components/Frame";
import { IAttributeEditorProps } from "./EntityAttribute";
import { NumberField } from "./NumberField";
import { getErrorMessage } from "./utils";
import { LookupComboBox } from "@src/app/components/LookupComboBox/LookupComboBox";
import { getLName } from "gdmn-internals";

interface ISetValueProps {
  entityName: string;
  disabled?: boolean;
  onDelete?: () => void;
};

const SetValue = ({ entityName, onDelete, disabled }: ISetValueProps) =>
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
        onDelete && !disabled
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
  entityLName?: string;
};

export const SetEditor = ({ attr, createAttr, onChange, erModel, onError, errorLinks, attrIdx, userDefined }: IAttributeEditorProps<ISetAttribute>) => {
  const [state, setState] = useState<ISetEditorState | undefined>();
  const errRef = getErrorMessage(attrIdx, 'references', errorLinks);

  return (
    <div>
      <Frame border marginTop attention={!!errRef}>
        {
          <Stack horizontal verticalAlign="end" tokens={{ childrenGap: '8px' }}>
            {
              state
              ?
                <>
                  <LookupComboBox
                    label="Entity:"
                    //disabled={!userDefined}
                    key={state.entityName ? state.entityName : undefined}
                    name={state.entityName ? state.entityName : undefined}
                    preSelectedOption={state.entityName ? 
                      { 
                        key: state.entityName,
                        text: state.entityName,
                        title: state.entityLName
                      } : undefined}
                    onChanged={ (option:IComboBoxOption | undefined) => option && typeof option.key === 'string' && setState({ ...state, entityName: option.text, entityLName: option.title }) }
                    onLookup={
                      (filter: string) => 
                        Promise.resolve( erModel ? 
                          Object.values(erModel.entities).filter(e => e.name.toLowerCase().indexOf(filter.toLowerCase()) > -1 ||
                          getLName(e.lName,  ['by', 'ru', 'en']).toLowerCase().indexOf(filter.toLowerCase()) > -1).map(e => ({
                            key: e.name,
                            text: e.name,
                            title: getLName(e.lName,  ['by', 'ru', 'en'])
                          })) : [] ) 
                    }
                  />
                  <Stack.Item styles = {{root : { margin: '12px', fontWeight: '600' }}}>
                    <Label
                      disabled={!userDefined}
                    >
                      IsTextField:
                    </Label>
                    <Checkbox
                      checked={attr.isChar}
                      disabled={!userDefined}
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
                    disabled={!userDefined}
                    width="180px"
                    onInvalidValue={ () => onError }
                    onChange={ presLen => { presLen !=undefined && presLen > 0 && onChange({ ...attr, presLen}); } }
                  />
                  <PrimaryButton
                    text="Save"
                    disabled={!userDefined || !state.entityName || !!attr.references.find( (entityName, idx) => idx !== state.idx && entityName === state.entityName )}
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
                    disabled={!userDefined}
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
                        disabled={!userDefined}
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
                        disabled={!userDefined}
                        onClick={ () => { attr.isChar = true; attr.presLen = 60; setState({ idx: attr.references.length, entityName: ''}) } }
                      />
                    :
                      null
                  }
                </>
            }
          </Stack>
        }
      </Frame>
      <Label styles={
          { root: {
            color: getTheme().semanticColors.errorText,
            fontSize: getTheme().fonts.small.fontSize,
            fontWeight:  getTheme().fonts.medium.fontWeight
          }}
        }>
        {errRef}
      </Label>
    </div>
  );
};
