import React, { useState } from "react";
import { IEnumValue, IEnumAttribute } from "gdmn-orm";
import { getTheme, TextField, Stack, Icon, Checkbox, Label, DefaultButton, PrimaryButton } from "office-ui-fabric-react";
import { getLName } from "gdmn-internals";
import { Frame } from "@src/app/scenes/gdmn/components/Frame";

interface IEnumValueProps {
  v: IEnumValue,
  isDefault: boolean,
  onEdit: () => void,
  onDelete: () => void
};

const EnumValue = ({ v, isDefault, onEdit, onDelete }: IEnumValueProps) =>
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
        isDefault ?
          <Icon
            iconName='SkypeCircleCheck'
            styles={{
              root: {
                marginBottom: -3,
              }
            }}
          />
        : null
      }
      <span onClick={onEdit}>
        {v.value}
        {v.lName ? ('=' + getLName(v.lName, ['ru'])) : null }
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

interface IEnumEditorProps {
  attr: IEnumAttribute,
  createAttribute: boolean,
  onChange: (newAttr: IEnumAttribute) => void
};

interface IEnumEditorState {
  idx: number;
  value: string;
  caption: string;
  isDefault: boolean;
};

export const EnumEditor = ({ attr, onChange }: IEnumEditorProps) => {
  const [state, setState] = useState<IEnumEditorState | undefined>();

  return (
    <Frame border marginTop subTitle={state === undefined ? "Enum values:" : state.idx >= attr.values.length ? "New value:" : "Edit value:"}>
      {
        <Stack horizontal verticalAlign="end" tokens={{ childrenGap: '8px' }}>
          {
            state
            ?
              <>
                <TextField
                  label="Value:"
                  value={state.value}
                  onChange={ (_, value) => value !== undefined && setState({ ...state, value }) }
                />
                <TextField
                  label="Caption:"
                  value={state.caption}
                  onChange={ (_, caption) => caption !== undefined && setState({ ...state, caption }) }
                />
                <Stack.Item align="start">
                  <Label>Default:</Label>
                  <Checkbox
                    checked={state.isDefault}
                    onChange={ (_, isDefault) => isDefault !== undefined && setState({ ...state, isDefault }) }
                  />
                </Stack.Item>
                <PrimaryButton
                  text="Save"
                  disabled={!state.value || !!attr.values.find( (v, idx) => idx !== state.idx && v.value === state.value )}
                  onClick={ () => {
                    const v = { value: state.value, lName: state.caption ? { ru: { name: state.caption }} : undefined };
                    const defaultValue = state.isDefault ? state.value : attr.defaultValue === state.value ? undefined : attr.defaultValue;
                    if (state.idx >= attr.values.length) {
                      onChange({ ...attr, values: [...attr.values, v], defaultValue });
                    } else {
                      const values = [...attr.values];
                      values[state.idx] = v;
                      onChange({ ...attr, values, defaultValue });
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
                {attr.values && attr.values.map(
                  (v, idx) =>
                    <EnumValue
                      key={v.value}
                      v={v}
                      isDefault={attr.defaultValue === v.value}
                      onEdit={ () => setState({
                        idx,
                        value: v.value.toString(),
                        caption: v.lName ? getLName(v.lName, ['ru']) : '',
                        isDefault: v.value === attr.defaultValue
                      }) }
                      onDelete={ () => onChange({
                        ...attr,
                        values: attr.values.filter( fv => fv !== v ),
                        defaultValue: attr.defaultValue === v.value ? undefined : attr.defaultValue
                      }) }
                    />
                )}
                <DefaultButton
                  text="Add value"
                  onClick={ () => setState({ idx: attr.values.length, value: '', caption: '', isDefault: false }) }
                />
              </>
          }
        </Stack>
      }
    </Frame>
  );
};