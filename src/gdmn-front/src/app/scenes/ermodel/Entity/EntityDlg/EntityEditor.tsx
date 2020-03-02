import React, { useState } from "react";
import { IEntityAttribute } from "gdmn-orm";
import { getTheme, Stack, Icon, DefaultButton, PrimaryButton, Text, Label, IComboBoxOption} from "office-ui-fabric-react";
import { Frame } from "@src/app/scenes/gdmn/components/Frame";
import { IAttributeEditorProps } from "./EntityAttribute";
import { getErrorMessage } from "./utils";
import { LookupComboBox } from "@src/app/components/LookupComboBox/LookupComboBox";
import { NumberField } from "./NumberField";

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

export const EntityEditor = ({ attr, createAttr, onChange, erModel, errorLinks, attrIdx, onError, onClearError }: IAttributeEditorProps<IEntityAttribute>) => {
  const [state, setState] = useState<IEntityEditorState | undefined>();
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
                    key={state.entityName ? state.entityName : undefined}
                    name={state.entityName ? state.entityName : undefined}
                    preSelectedOption={state.entityName ?
                      {
                        key: state.entityName,
                        text: state.entityName
                      } : undefined}
                    onChanged={ (option:IComboBoxOption | undefined) => option && typeof option.key === 'string' && setState({ ...state, entityName: option.text }) }
                    onLookup={
                      (filter: string) =>
                        Promise.resolve( erModel ?
                          Object.keys(erModel.entities).filter(name => name.toLowerCase().indexOf(filter.toLowerCase()) > -1).map( name => ({
                              key: name,
                              text: name
                            }) ) : [])
                    }
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
      <Label styles={
          { root: {
            color: getTheme().semanticColors.errorText,
            fontSize: getTheme().fonts.small.fontSize,
            fontWeight:  getTheme().fonts.medium.fontWeight
          }}
        }>
        {errRef}
      </Label>
      <Stack horizontal tokens={{ childrenGap: '0px 16px' }}>
        <NumberField
          label="Default value:"
          onlyInteger={attr.type === 'Integer'}
          value={attr.defaultValue}
          width="180px"
          errorMessage={getErrorMessage(attrIdx, 'defaultValue', errorLinks)}
          onChange={ defaultValue => { onChange({ ...attr, defaultValue }); onClearError && onClearError('defaultValue'); } }
          onInvalidValue={ () => onError && onError('defaultValue', 'Invalid value') }
        />
      </Stack>
    </div>
  );
};
