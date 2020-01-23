import { IAttribute, attributeTypeNames, IEnumAttribute, IStringAttribute, IBooleanAttribute, AttributeTypes, INumberAttribute, IDateAttribute, IEntityAttribute, ISetAttribute, ERModel, isUserDefined } from "gdmn-orm";
import React, { useMemo } from "react";
import { Stack, TextField, Dropdown, Checkbox, Label } from "office-ui-fabric-react";
import { getLName } from "gdmn-internals";
import { Frame } from "@src/app/scenes/gdmn/components/Frame";
import { EnumEditor } from "./EnumEditor";
import { StringEditor } from "./StringEditor";
import { NumberEditor} from "./NumberEditor"
import { DateEditor } from "./DateEditor";
import { BooleanEditor } from "./BooleanEditor";
import { EntityEditor } from "./EntityEditor";
import { SetEditor } from "./SetEditor";
import { initAttr, ErrorLinks, getErrorMessage } from "./utils";
import { BlobEditor } from "./BlobEditor";

type Attr = IAttribute | IEnumAttribute | IStringAttribute | IBooleanAttribute | INumberAttribute<number> | IDateAttribute | IEntityAttribute | ISetAttribute;
type OnChange<T> = (newAttr: T) => void;
type OnSelect = () => void;
type OnError = (fieldName: string, errorMessage: string) => void;
type OnClearError = (fieldName: string) => void;

export interface IAttributeEditorProps<T> {
  attr: T;
  attrIdx: number;
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
 'Set': SetEditor,
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

export const EntityAttribute = ({ attr, attrIdx, createAttr, userDefined, selected, errorLinks, onChange, onSelect, onError, onClearError, erModel }: IEntityAttributeProps) => {

  const AttrEditor = mapEditor[attr.type];
  const parent = attr.type === "Entity" ? (attr as IEntityAttribute).references : null;

  return useMemo( () =>
    <Frame border marginBottom selected={selected} onClick={onSelect} readOnly={!userDefined}>
      <Stack>
        <Stack horizontal verticalAlign="start" tokens={{ childrenGap: '0px 16px' }}>
          <TextField
            label="Name:"
            value={attr.name}
            readOnly={!userDefined || !createAttr}
            autoFocus={selected}
            errorMessage={getErrorMessage(attrIdx, 'name', errorLinks)}
            styles={{
              root: {
                width: '240px'
              },
              field: {
                textTransform: 'uppercase'
              }
            }}
            onChange={
              (_, newValue) => {
                if (newValue !== undefined) {
                  let name = newValue.toUpperCase();

                  if (userDefined && !isUserDefined(name)) {
                    return;
                  }

                  onChange({
                    ...attr,
                    name
                  });
                }
              }
            }
          />
          <Dropdown
            label="Type:"
            selectedKey={attr.type}
            disabled={!userDefined || !createAttr}
            options={
              attributeTypeNames.map(n => ({ key: n, text: n }))
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
            <Label
              disabled={!userDefined || !createAttr}
            >
              Required:
            </Label>
            <Checkbox
              disabled={!userDefined || !createAttr}
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
            disabled={!userDefined}
            value={attr.semCategories}
            styles={{
              root: {
                width: '240px'
              }
            }}
            onChange={ (_, semCategories) => semCategories !== undefined && onChange({...attr, semCategories }) }
          />
          <TextField
            label="Label:"
            disabled={!userDefined}
            value={getLName(attr.lName, ['ru'])}
            styles={{
              root: {
                width: '240px'
              }
            }}
            onChange={ (_, name) => name !== undefined && attr.lName.ru && onChange({...attr, lName: { ru: { ...attr.lName.ru, name } } }) }
          />
          <Stack.Item grow>
            <TextField
              label="Description:"
              disabled={!userDefined}
              value={getLName(attr.lName, ['ru'], true)}
              onChange={ (_, fullName) => fullName !== undefined && attr.lName.ru && onChange({...attr, lName: { ru: { ...attr.lName.ru, fullName } } }) }
            />
          </Stack.Item>
        </Stack>
        <AttrEditor
          attr={attr as any}
          attrIdx={attrIdx}
          createAttr={createAttr}
          userDefined={userDefined}
          errorLinks={errorLinks}
          onChange={onChange}
          onError={onError}
          onClearError={onClearError}
          erModel={erModel}
        />
      </Stack>
    </Frame>
  , [attr, attrIdx, selected, errorLinks, erModel, parent]);
};
