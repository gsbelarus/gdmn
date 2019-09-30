import { IAttribute, attributeTypeNames, IEnumAttribute, IStringAttribute, IBooleanAttribute, AttributeTypes } from "gdmn-orm";
import React from "react";
import { Stack, TextField, Dropdown, Checkbox, Label } from "office-ui-fabric-react";
import { getLName } from "gdmn-internals";
import { Frame } from "@src/app/scenes/gdmn/components/Frame";
import { EnumEditor } from "./EnumEditor";
import { StringEditor } from "./StringEditor";
import { IntegerEditor} from "./IntegerEditor"
import { initAttr, ErrorLinks, getErrorMessage } from "./utils";
import { BooleanEditor } from "./BooleanEditor";

type Attr = IAttribute | IEnumAttribute | IStringAttribute | IBooleanAttribute;
type OnChange = (newAttr: Attr) => void;
type OnSelect = () => void;

const DumbEditor = ({ attr, createAttribute, onChange }: { attr: IAttribute, createAttribute: boolean, onChange: OnChange }) => null;

const mapEditor = {
 'Entity': DumbEditor,
 'String': StringEditor,
 'Set': DumbEditor,
 'Parent': DumbEditor,
 'Detail': DumbEditor,
 'Sequence': DumbEditor,
 'Integer': IntegerEditor,
 'Numeric': DumbEditor,
 'Float': DumbEditor,
 'Boolean': BooleanEditor,
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
  errorLinks?: ErrorLinks;
  onChange: OnChange;
  onSelect: OnSelect;
};

export const EntityAttribute = ({ attr, createAttribute, selected, errorLinks, onChange, onSelect }: IEntityAttributeProps) => {

  const AttrEditor = mapEditor[attr.type];

  return (
    <Frame border marginBottom selected={selected} onClick={onSelect} >
      <Stack>
        <Stack horizontal verticalAlign="start" tokens={{ childrenGap: '0px 16px' }}>
          <TextField
            label="Name:"
            value={attr.name}
            disabled={!createAttribute}
            errorMessage={getErrorMessage('name', errorLinks)}
            autoFocus
            styles={{
              root: {
                width: '240px'
              }
            }}
            onChange={ (_, name) => name !== undefined && onChange({...attr, name }) }
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
            onChange={ (_, attrType) => attrType && attrType.key !== attr.type && onChange(initAttr(attrType.key as AttributeTypes, attr)) }
          />
          <Stack.Item>
            <Label>Required:</Label>
            <Checkbox
              checked={attr.required}
              disabled={!createAttribute}
              styles={{
                root: {
                  width: '64px'
                }
              }}
              onChange={ (_, required) => required !== undefined && onChange({...attr, required }) }
            />
          </Stack.Item>
          <TextField
            label="Sem categories:"
            value={attr.semCategories}
            disabled={!createAttribute}
            styles={{
              root: {
                width: '240px'
              }
            }}
            onChange={ (_, semCategories) => semCategories !== undefined && onChange({...attr, semCategories }) }
          />
          <Stack.Item grow>
            <TextField
              label="Description:"
              value={getLName(attr.lName, ['ru'])}
              disabled={!createAttribute}
              onChange={ (_, name) => name !== undefined && onChange({...attr, lName: { ru: { name } } }) }
            />
          </Stack.Item>
        </Stack>
        <AttrEditor attr={attr as any} createAttribute={createAttribute} errorLinks={errorLinks} onChange={onChange} />
      </Stack>
    </Frame>
  );
};