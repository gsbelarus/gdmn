import { IAttribute, attributeTypeNames, IEnumAttribute, IStringAttribute, IBooleanAttribute, AttributeTypes, INumberAttribute, IDateAttribute, IEntityAttribute, ERModel, isUserDefined } from "gdmn-orm";
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
import { initAttr, ErrorLinks, getErrorMessage, stripUserPrefix, addUserPrefix } from "./utils";
import { BlobEditor } from "./BlobEditor";

type Attr = IAttribute | IEnumAttribute | IStringAttribute | IBooleanAttribute | INumberAttribute<number> | IDateAttribute | IEntityAttribute;
type OnChange<T> = (newAttr: T) => void;
type OnSelect = () => void;
type OnError = (fieldName: string, errorMessage: string) => void;
type OnClearError = (fieldName: string) => void;

export interface IAttributeEditorProps<T> {
  attr: T;
  createAttr: boolean;
  userDefined: boolean;
  errorLinks?: ErrorLinks;
  onChange: OnChange<T>;
  onError?: OnError;
  onClearError?: OnClearError;
  erModel?: ERModel;
};

type IDumbEditorProps = IAttributeEditorProps<Attr>;

const DumbEditor = (_: IDumbEditorProps) => null;

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

interface IEntityAttributeProps extends IAttributeEditorProps<Attr> {
  selected?: boolean;
  onSelect: OnSelect;
};

export const EntityAttribute = ({ attr, createAttr, userDefined, selected, errorLinks, onChange, onSelect, onError, onClearError, erModel }: IEntityAttributeProps) => {

  const AttrEditor = mapEditor[attr.type];

  return (
    <Frame border marginBottom selected={selected} onClick={onSelect} readOnly={!userDefined}>
      <Stack styles={{root: {pointerEvents: !userDefined ? 'none' : 'auto'}}}>
        <Stack horizontal verticalAlign="start" tokens={{ childrenGap: '0px 16px' }}>
          <TextField
            label="Name:"
            value={stripUserPrefix(attr.name)}
            prefix={userDefined ? 'USR$' : undefined}
            readOnly={!userDefined}
            autoFocus={selected}
            errorMessage={getErrorMessage('name', errorLinks)}
            styles={{
              root: {
                width: '240px'
              }
            }}
            onChange={ (_, name) => name !== undefined && onChange({...attr, name: userDefined ? addUserPrefix(name) : name }) }
          />
          <Dropdown
            label="Type:"
            selectedKey={attr.type}
            options={
              attributeTypeNames.map( n => ({ key: n, text: n }) )
            }
            styles={{
              root: {
                width: '120px'
              }
            }}
            onChange={
              createAttr ? (_, attrType) => attrType && attrType.key !== attr.type && onChange(initAttr(attrType.key as AttributeTypes, attr)) : undefined
            }
          />
          <Stack.Item>
            <Label>Required:</Label>
            <Checkbox
              checked={attr.required}
              styles={{
                root: {
                  width: '64px'
                }
              }}
              onChange={
                userDefined ? (_, required) => required !== undefined && onChange({...attr, required }) : undefined
              }
            />
          </Stack.Item>
          <TextField
            label="Sem categories:"
            value={attr.semCategories}
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
              onChange={
                userDefined ? (_, name) => name !== undefined && onChange({...attr, lName: { ru: { name } } }) : undefined
              }
            />
          </Stack.Item>
        </Stack>
        <AttrEditor attr={attr as any} createAttr={createAttr} userDefined={userDefined} errorLinks={errorLinks} onChange={onChange} onError={onError} onClearError={onClearError} erModel={erModel} />
      </Stack>
    </Frame>
  );
};
