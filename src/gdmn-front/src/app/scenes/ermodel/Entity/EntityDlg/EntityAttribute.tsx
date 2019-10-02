import { IAttribute, attributeTypeNames, IEnumAttribute, IStringAttribute, IBooleanAttribute, AttributeTypes, INumberAttribute, IDateAttribute, IEntityAttribute, ERModel } from "gdmn-orm";
import React from "react";
import { Stack, TextField, Dropdown, Checkbox, Label } from "office-ui-fabric-react";
import { getLName } from "gdmn-internals";
import { Frame } from "@src/app/scenes/gdmn/components/Frame";
import { EnumEditor } from "./EnumEditor";
import { StringEditor } from "./StringEditor";
import { NumberEditor} from "./NumberEditor"
import { DateEditor } from "./DateEditor";
import { BooleanEditor } from "./BooleanEditor";
import { EntityEditor } from "./EntityEditor";
import { initAttr, ErrorLinks, getErrorMessage } from "./utils";
import { BlobEditor } from "./BlobEditor";

type Attr = IAttribute | IEnumAttribute | IStringAttribute | IBooleanAttribute | INumberAttribute<number> | IDateAttribute | IEntityAttribute;
type OnChange = (newAttr: Attr) => void;
type OnSelect = () => void;
type OnError = (fieldName: string, errorMessage: string) => void;
type OnClearError = (fieldName: string) => void;

interface IDumbEditorProps {
  attr: IAttribute;
  createAttribute: boolean;
  onChange: OnChange;
  onError?: OnError;
  onClearError?: OnClearError;
  erModel?: ERModel;
};

const DumbEditor = ({ attr, createAttribute, onChange, erModel }: IDumbEditorProps) => null;

const mapEditor = {
 'Entity': EntityEditor,
 'String': StringEditor,
 'Set': DumbEditor,
 'Parent': DumbEditor,
 'Detail': DumbEditor,
 'Sequence': DumbEditor,
 'Integer': NumberEditor,
 'Numeric': NumberEditor,
 'Float': NumberEditor,
 'Boolean': BooleanEditor,
 'Date': DateEditor,
 'TimeStamp': DateEditor,
 'Time': DateEditor,
 'Blob': BlobEditor,
 'Enum': EnumEditor
};

interface IEntityAttributeProps {
  attr: Attr;
  selected?: boolean;
  createAttribute: boolean;
  errorLinks?: ErrorLinks;
  onChange: OnChange;
  onSelect: OnSelect;
  onError?: OnError;
  onClearError?: OnClearError;
  erModel?: ERModel;
};

export const EntityAttribute = ({ attr, createAttribute, selected, errorLinks, onChange, onSelect, onError, onClearError, erModel }: IEntityAttributeProps) => {

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
        <AttrEditor attr={attr as any} createAttribute={createAttribute} errorLinks={errorLinks} onChange={onChange} onError={onError} onClearError={onClearError} erModel={erModel} />
      </Stack>
    </Frame>
  );
};
