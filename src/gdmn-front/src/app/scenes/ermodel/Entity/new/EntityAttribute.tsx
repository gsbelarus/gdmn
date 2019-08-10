import React, {useRef, useState} from "react";
import CSSModules from 'react-css-modules';
import styles from './styles.css';
import {Checkbox, ComboBox, DefaultButton, IComboBox, IComboBoxOption, TextField} from "office-ui-fabric-react";
import {getFieldType, listType} from "@src/app/scenes/ermodel/Entity/new/utils";
import {IEntityAttributeProps} from "@src/app/scenes/ermodel/Entity/new/EntityAttribute.types";
import {AttributeTypes, IAttribute, IEntityAttribute, ISetAttribute} from "gdmn-orm";


export const EntityAttribute = CSSModules((props: IEntityAttributeProps): JSX.Element => {
  const {erModel, useAttributeData, deleteAttributeData, attributeDataRow, idRow} = props;
  const changed = useRef( attributeDataRow  ? attributeDataRow :{} as IAttribute | ISetAttribute | IEntityAttribute);
  const [hiddenFormat, setHiddenFormat] = useState(attributeDataRow  && attributeDataRow  ? getFieldType(attributeDataRow.type) : {}  as {fieldType: string});

  const onChangedType = (event: React.FormEvent<IComboBox>, option?: IComboBoxOption, index?: number, value?: string) => {
    if (option && option.text) {
      changed.current["type"] = option!.key as AttributeTypes;
      useAttributeData(changed.current, idRow);
      switch (option!.key) {
        case 'Parent':
        case 'Entity':
        case 'Set':
          setHiddenFormat({fieldType: "link"});
          break;
        case 'Integer':
        case 'Numeric':
        case 'Float':
          setHiddenFormat({fieldType: "number"});
          break;
        case 'Date':
        case 'Time':
        case 'TimeStamp':
          setHiddenFormat({fieldType: "date"});
          break;
        case 'Boolean':
          setHiddenFormat({fieldType: "boolean"});
          break;
        default:
          setHiddenFormat({fieldType: ""});
          //changed.current["linkName"] = '';
          useAttributeData(changed.current, idRow);
      }
    }
  };

  return (
    <div>
      <div styleName="containerBorder">
        <div styleName="container">
          <div styleName="item">
            {idRow + '.'}
          </div>
          <div styleName="item">
            <TextField
              label="Name"
              onChange={(e, value) => {
                changed.current["name"] = value as string;
                useAttributeData(changed.current, idRow)
              }}
              defaultValue={ attributeDataRow ? attributeDataRow.name : ''}
            />
          </div>
          <div styleName="item">
            <TextField
              label="lName"
              onChange={(e, value) => {
                changed.current["lName"] = {ru: {name: value ? value as string : ''}};
                useAttributeData(changed.current, idRow);
              }}
              defaultValue={ attributeDataRow ? attributeDataRow.lName as string : '' }
            />
          </div>
          <div styleName="item">
            <ComboBox
              selectedKey={attributeDataRow
                ? attributeDataRow.type! : undefined}
              label="Type"
              autoComplete="on"
              options={listType.map(arr => ({key: arr.key, text: arr.text}))}
              onChange={onChangedType}
            />
          </div>
          <div styleName="item">
            {attributeDataRow && hiddenFormat.fieldType === "link" ?
              <ComboBox
                selectedKey={attributeDataRow
                  ?  ((attributeDataRow as IEntityAttribute).references
                    || (attributeDataRow as IEntityAttribute).references) : undefined}
                label="Entity"
                autoComplete="on"
                options={Object.keys(erModel!.entities).map(key => ({key, text: key}))}
                onChange={(event: React.FormEvent<IComboBox>, option?: IComboBoxOption, index?: number, value?: string) => {
                  if (option && option.key) {
                    switch (attributeDataRow.type) {
                      case 'Set':
                        const setAttribute = changed.current as ISetAttribute
                        setAttribute["references"] = [option!.key as string];
                        setAttribute["attributes"] = [];
                        break;
                      default:
                        const entityAttribute = changed.current as IEntityAttribute
                        entityAttribute["references"] = [option!.key as string];
                    }
                    useAttributeData(changed.current, idRow)
                  }
                }}
              />
              : undefined
            }
          </div>
        </div>
        <div styleName="container">
          {/*<div styleName="item">*/}
          {/*  <ChoiceGroup*/}
          {/*    defaultSelectedKey={attributeData.length ? attributeData[numberRow] && attributeData[numberRow].alignment! : undefined}*/}
          {/*    options={alignmentlist.map(arr => ({key: arr.key, text: arr.text}))}*/}
          {/*    onChange={(_ev: React.FormEvent<HTMLElement> | undefined, option?: IChoiceGroupOption): void => {*/}
          {/*      if (option && option.text) {*/}
          {/*        changed.current["alignment"] = option!.key as string;*/}
          {/*        useAttributeData(changed.current, numberRow);*/}
          {/*      }*/}
          {/*    }}*/}
          {/*    label="alignment"*/}
          {/*    required={true}*/}
          {/*  />*/}
          {/*</div>*/}
          {/*<div styleName="item">*/}
          {/*  {attributeData.length && attributeData[numberRow] && hiddenFormat.fieldType === "date" ?*/}
          {/*    <ComboBox*/}
          {/*      selectedKey={attributeData.length*/}
          {/*        ? attributeData[numberRow] && attributeData[numberRow].formatDate! : undefined}*/}
          {/*      label="format date"*/}
          {/*      autoComplete="on"*/}
          {/*      options={dateFormats.map(key => ({key, text: key}))}*/}
          {/*      onChange={(event: React.FormEvent<IComboBox>, option?: IComboBoxOption, index?: number, value?: string) => {*/}
          {/*        if (option && option.text) {*/}
          {/*          changed.current["formatDate"] = option!.key as string;*/}
          {/*          useAttributeData(changed.current, numberRow)*/}
          {/*        }*/}
          {/*      }}*/}

          {/*    /> : undefined*/}
          {/*  }*/}
          {/*</div>*/}
          {/*<div styleName="item">*/}
          {/*  {attributeData.length && attributeData[numberRow] && hiddenFormat.fieldType === "number" ?*/}
          {/*    <ComboBox*/}
          {/*      selectedKey={attributeData.length*/}
          {/*        ? attributeData[numberRow] && attributeData[numberRow].format! : undefined}*/}
          {/*      label="format"*/}
          {/*      autoComplete="on"*/}
          {/*      options={numberFormats.map(key => ({key: key.name, text: key.name}))}*/}
          {/*      onChange={(event: React.FormEvent<IComboBox>, option?: IComboBoxOption, index?: number, value?: string) => {*/}
          {/*        if (option && option.text) {*/}
          {/*          changed.current["format"] = option!.key as string;*/}
          {/*          useAttributeData(changed.current, numberRow)*/}
          {/*        }*/}
          {/*      }}*/}
          {/*    /> : undefined*/}
          {/*  }*/}
          {/*</div>*/}
          {/*<div styleName="item">*/}
          {/*  {attributeData.length && attributeData[numberRow] && hiddenFormat.fieldType === "boolean" ?*/}
          {/*    <ComboBox*/}
          {/*      selectedKey={attributeData.length*/}
          {/*        ? attributeData[numberRow] && attributeData[numberRow].formatBoolean! : undefined}*/}
          {/*      label="format"*/}
          {/*      autoComplete="on"*/}
          {/*      options={BooleanFormats.map(key => ({key, text: key}))}*/}
          {/*      onChange={(event: React.FormEvent<IComboBox>, option?: IComboBoxOption, index?: number, value?: string) => {*/}
          {/*        if (option && option.text) {*/}
          {/*          changed.current["formatBoolean"] = option!.key as string;*/}
          {/*          useAttributeData(changed.current, numberRow)*/}
          {/*        }*/}
          {/*      }}*/}
          {/*    /> : undefined*/}
          {/*  }*/}
          {/*</div>*/}
          <div styleName="item">
            <Checkbox
              key={'required'}
              disabled={false}
              label={`required`}
              defaultChecked={
                attributeDataRow
                  ? attributeDataRow.required
                  : false}
              styles={{root: {marginTop: '10px'}}}
              onChange={(_ev?: React.FormEvent<HTMLElement>, isChecked?: boolean) => {
                if (isChecked !== undefined) {
                  changed.current["required"] = isChecked;
                  useAttributeData(changed.current, idRow)
                }
              }}
            />
          </div>
          {/*<div styleName="item">*/}
          {/*  <Checkbox*/}
          {/*    key={'hidden'}*/}
          {/*    disabled={false}*/}
          {/*    label={`hidden`}*/}
          {/*    defaultChecked={*/}
          {/*      attributeData.length*/}
          {/*        ? attributeData[numberRow] && attributeData[numberRow].hidden*/}
          {/*        : false}*/}
          {/*    styles={{root: {marginTop: '10px'}}}*/}
          {/*    onChange={(_ev?: React.FormEvent<HTMLElement>, isChecked?: boolean) => {*/}
          {/*      if (isChecked !== undefined) {*/}
          {/*        changed.current["hidden"] = isChecked;*/}
          {/*        useAttributeData(changed.current, numberRow)*/}
          {/*      }*/}
          {/*    }}*/}
          {/*  />*/}
          {/*</div>*/}
          <div styleName="item">
            <TextField
              label="semCategories"
              onChange={(e, value) => {
                changed.current["semCategories"] = value as string;
                useAttributeData(changed.current, idRow)
              }
              }
              defaultValue={
                attributeDataRow
                  ? attributeDataRow.semCategories
                  : ''
              }
            />
          </div>
          {/*<div styleName="item">*/}
          {/*  <TextField*/}
          {/*    label="mask"*/}
          {/*    onChange={(e, value) => {*/}
          {/*      changed.current["mask"] = value as string;*/}
          {/*      useAttributeData(changed.current, numberRow)*/}
          {/*    }*/}
          {/*    }*/}
          {/*    defaultValue={*/}
          {/*      attributeData.length*/}
          {/*        ? attributeData[numberRow] && attributeData[numberRow].mask*/}
          {/*        : ''*/}
          {/*    }*/}
          {/*  />*/}
          {/*</div>*/}
        </div>
        <div styleName="container">
          <div styleName="item">
            <DefaultButton
              onClick={() => {
                changed.current = {} as IAttribute;
                deleteAttributeData(idRow)
              }}
              text="Delete"/>
          </div>
        </div>
      </div>
    </div>
  );
}, styles, {allowMultiple: true});
