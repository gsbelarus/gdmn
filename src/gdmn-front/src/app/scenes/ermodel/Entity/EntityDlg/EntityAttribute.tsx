import { IAttribute, attributeTypeNames, IEnumAttribute, IEnumValue, IStringAttribute, AttributeTypes } from "gdmn-orm";
import React from "react";
import { Stack, TextField, Dropdown, Checkbox, Label, getTheme } from "office-ui-fabric-react";
import { getLName } from "gdmn-internals";
import { Frame } from "@src/app/scenes/gdmn/components/Frame";

type Attr = IAttribute | IEnumAttribute | IStringAttribute;
type OnChange = (newAttr: Attr) => void;
type OnSelect = () => void;

const EnumValue = ({ v }: { v: IEnumValue }) =>
  <div
    style={{
      backgroundColor: getTheme().semanticColors.primaryButtonBackground,
      color: getTheme().semanticColors.primaryButtonText,
      borderRadius: '2px',
      padding: '4px'
    }}
  >
    {v.value}
    {v.lName ? ('=' + getLName(v.lName, ['ru'])) : null }
  </div>

const EnumEditor = ({ attr }: { attr: IEnumAttribute, createAttribute: boolean }) =>
  <Frame border marginTop subTitle="Enum values">
    <Stack horizontal tokens={{ childrenGap: '8px' }}>
      {
        attr.values && attr.values.map( v => <EnumValue v={v}/> )
      }
    </Stack>
  </Frame>

const StringEditor = ({ attr, createAttribute }: { attr: IStringAttribute, createAttribute: boolean }) =>
  <Stack horizontal tokens={{ childrenGap: '0px 16px' }}>
    <TextField
      label="Min length:"
      value={attr.minLength === undefined ? '' : attr.minLength.toString()}
      styles={{
        root: {
          width: '180px'
        }
      }}
    />
    <TextField
      label="Max length:"
      value={attr.maxLength === undefined ? '' : attr.maxLength.toString()}
      styles={{
        root: {
          width: '180px'
        }
      }}
    />
    <div>
      <Label>Auto trim:</Label>
      <Checkbox
        checked={attr.autoTrim}
        styles={{
          root: {
            width: '64px'
          }
        }}
      />
    </div>
    <TextField
      label="Mask:"
      value={attr.mask ? attr.mask.source : ''}
      styles={{
        root: {
          width: '240px'
        }
      }}
    />
    <Stack.Item grow={1}>
      <TextField
        label="Default value:"
        value={attr.defaultValue}
      />
    </Stack.Item>
  </Stack>

const DumbEditor = ({ attr, createAttribute }: { attr: IAttribute, createAttribute: boolean }) => null;

const mapEditor = {
 'Entity': DumbEditor,
 'String': StringEditor,
 'Set': DumbEditor,
 'Parent': DumbEditor,
 'Detail': DumbEditor,
 'Sequence': DumbEditor,
 'Integer': DumbEditor,
 'Numeric': DumbEditor,
 'Float': DumbEditor,
 'Boolean': DumbEditor,
 'Date': DumbEditor,
 'TimeStamp': DumbEditor,
 'Time': DumbEditor,
 'Blob': DumbEditor,
 'Enum': EnumEditor
};

interface IEntityAttributeProps {
  attr: Attr;
  selected?: boolean;
  createAttribute: boolean;
  onChange: OnChange;
  onSelect: OnSelect;
};

export const EntityAttribute = ({ attr, createAttribute, selected, onChange, onSelect }: IEntityAttributeProps) => {

  const AttrEditor = mapEditor[attr.type];

  return (
    <Frame border marginBottom selected={selected} onClick={onSelect} >
      <Stack>
        <Stack horizontal verticalAlign="start" tokens={{ childrenGap: '0px 16px' }}>
          <TextField
            label="Name:"
            value={attr.name}
            disabled={!createAttribute}
            autoFocus
            styles={{
              root: {
                width: '240px'
              }
            }}
            onChange={ (_, newValue) => newValue !== undefined && onChange({...attr, name: newValue }) }
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
            onChange={ (_, newValue) => newValue && onChange({...attr, type: newValue.key as AttributeTypes}) }
          />
          <div>
            <Label>Required:</Label>
            <Checkbox
              checked={attr.required}
              disabled={!createAttribute}
              styles={{
                root: {
                  width: '64px'
                }
              }}
              onChange={ (_, newValue) => newValue !== undefined && onChange({...attr, required: newValue }) }
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
            onChange={ (_, newValue) => newValue !== undefined && onChange({...attr, semCategories: newValue }) }
          />
          <Stack.Item grow>
            <TextField
              label="Description:"
              value={getLName(attr.lName, ['ru'])}
              disabled={!createAttribute}
              onChange={ (_, newValue) => newValue !== undefined && onChange({...attr, lName: { ru: { name: newValue } } }) }
            />
          </Stack.Item>
        </Stack>
        <AttrEditor attr={attr as any} createAttribute={createAttribute} />
      </Stack>
    </Frame>
  );
};