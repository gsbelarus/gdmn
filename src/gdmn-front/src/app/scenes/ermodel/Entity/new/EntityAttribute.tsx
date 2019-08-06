import React, {useEffect, useRef, useState} from "react";
import CSSModules from 'react-css-modules';
import styles from './styles.css';
import {
  Checkbox,
  ChoiceGroup,
  ComboBox,
  DefaultButton,
  ICheckbox,
  IChoiceGroupOption,
  IComboBox,
  IComboBoxOption,
  ITextField,
  TextField
} from "office-ui-fabric-react";
import {
  alignmentlist,
  BooleanFormats,
  dateFormats, getFieldType,
  listType,
  numberFormats
} from "@src/app/scenes/ermodel/Entity/new/utils";
import {IEntityAttributeProps} from "@src/app/scenes/ermodel/Entity/new/EntityAttribute.types";
import {IAttributeData} from "@src/app/scenes/ermodel/utils";

export const EntityAttribute = CSSModules((props: IEntityAttributeProps): JSX.Element => {
  const {erModel, useAttributeData, deleteAttributeData, attributeData, numberRow, useLastFocused, lastFocusedRow} = props;

  const changed = useRef(attributeData.length  && attributeData[numberRow]  ? attributeData[numberRow] : {} as IAttributeData);
  const needFocus = useRef<ITextField | IComboBox | ICheckbox | undefined>();
  const [hiddenFormat, setHiddenFormat] = useState(attributeData.length  && attributeData[numberRow]  ? getFieldType(attributeData[numberRow].type) : {}  as {fieldType: string});

  useEffect(() => {
    if (needFocus.current) {
      needFocus.current.focus();
      needFocus.current = undefined;
    }
  }, [lastFocusedRow]);

  const onChangedType = (event: React.FormEvent<IComboBox>, option?: IComboBoxOption, index?: number, value?: string) => {
    if (option && option.text) {
      changed.current["type"] = option!.key as string;
      useAttributeData(changed.current, numberRow);
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
          changed.current["linkName"] = '';
          useAttributeData(changed.current, numberRow);
      }
    }
  };
  return (
    <div>
      <div styleName="containerBorder">
        <div styleName="container">
          <div styleName="item">
            {numberRow + 1 + '.'}
          </div>
          <div styleName="item">
            <TextField
              label="Name"
              onChange={(e, value) => {
                changed.current["fieldName"] = value as string;
                useAttributeData(changed.current, numberRow)
              }}
              defaultValue={
                attributeData.length
                  ? attributeData[numberRow] && attributeData[numberRow].fieldName
                  : ''
              }
              onFocus={() => {
                useLastFocused('fieldName', numberRow)
              }}
              componentRef={
                ref => {
                  if (ref && lastFocusedRow &&
                    (lastFocusedRow['value'] === 'fieldName' && lastFocusedRow['numberRow'] === numberRow)) {
                    needFocus.current = ref;
                  }
                }
              }
            />
          </div>
          <div styleName="item">
            <TextField
              label="lName"
              onChange={(e, value) => {
                changed.current["lName"] = value as string;
                useAttributeData(changed.current, numberRow);
              }}
              defaultValue={
                attributeData.length
                  ? attributeData[numberRow] && attributeData[numberRow].lName
                  : ''
              }
              onFocus={
                () => {
                  useLastFocused('lName', numberRow)
                }
              }
              componentRef={
                ref => {
                  if (ref && lastFocusedRow &&
                    (lastFocusedRow['value'] === 'lName' && lastFocusedRow['numberRow'] === numberRow)) {
                    needFocus.current = ref;
                  }
                }
              }
            />
          </div>
          <div styleName="item">
            <ComboBox
              selectedKey={attributeData.length
                ? attributeData[numberRow] && attributeData[numberRow].type! : undefined}
              label="Type"
              autoComplete="on"
              options={listType.map(arr => ({key: arr.key, text: arr.text}))}
              onChange={onChangedType}
            />
          </div>
          <div styleName="item">
            {attributeData.length && attributeData[numberRow] && hiddenFormat.fieldType === "link" ?
              <ComboBox
                selectedKey={attributeData.length
                  ? attributeData[numberRow] && attributeData[numberRow].linkName! : undefined}
                label="Entity"
                autoComplete="on"
                options={Object.keys(erModel!.entities).map(key => ({key, text: key}))}
                onChange={(event: React.FormEvent<IComboBox>, option?: IComboBoxOption, index?: number, value?: string) => {
                  if (option && option.text) {
                    changed.current["linkName"] = option!.key as string;
                    useAttributeData(changed.current, numberRow)
                  }
                }}
              />
              : undefined
            }
          </div>
        </div>
        <div styleName="container">
          <div styleName="item">
            <ChoiceGroup
              defaultSelectedKey={attributeData.length ? attributeData[numberRow] && attributeData[numberRow].alignment! : undefined}
              options={alignmentlist.map(arr => ({key: arr.key, text: arr.text}))}
              onChange={(_ev: React.FormEvent<HTMLElement> | undefined, option?: IChoiceGroupOption): void => {
                if (option && option.text) {
                  changed.current["alignment"] = option!.key as string;
                  useAttributeData(changed.current, numberRow);
                }
              }}
              label="alignment"
              required={true}
            />
          </div>
          <div styleName="item">
            {attributeData.length && attributeData[numberRow] && hiddenFormat.fieldType === "date" ?
              <ComboBox
                selectedKey={attributeData.length
                  ? attributeData[numberRow] && attributeData[numberRow].formatDate! : undefined}
                label="format date"
                autoComplete="on"
                options={dateFormats.map(key => ({key, text: key}))}
                onChange={(event: React.FormEvent<IComboBox>, option?: IComboBoxOption, index?: number, value?: string) => {
                  if (option && option.text) {
                    changed.current["formatDate"] = option!.key as string;
                    useAttributeData(changed.current, numberRow)
                  }
                }}

              /> : undefined
            }
          </div>
          <div styleName="item">
            {attributeData.length && attributeData[numberRow] && hiddenFormat.fieldType === "number" ?
              <ComboBox
                selectedKey={attributeData.length
                  ? attributeData[numberRow] && attributeData[numberRow].format! : undefined}
                label="format"
                autoComplete="on"
                options={numberFormats.map(key => ({key: key.name, text: key.name}))}
                onChange={(event: React.FormEvent<IComboBox>, option?: IComboBoxOption, index?: number, value?: string) => {
                  if (option && option.text) {
                    changed.current["format"] = option!.key as string;
                    useAttributeData(changed.current, numberRow)
                  }
                }}
              /> : undefined
            }
          </div>
          <div styleName="item">
            {attributeData.length && attributeData[numberRow] && hiddenFormat.fieldType === "boolean" ?
              <ComboBox
                selectedKey={attributeData.length
                  ? attributeData[numberRow] && attributeData[numberRow].formatBoolean! : undefined}
                label="format"
                autoComplete="on"
                options={BooleanFormats.map(key => ({key, text: key}))}
                onChange={(event: React.FormEvent<IComboBox>, option?: IComboBoxOption, index?: number, value?: string) => {
                  if (option && option.text) {
                    changed.current["formatBoolean"] = option!.key as string;
                    useAttributeData(changed.current, numberRow)
                  }
                }}
              /> : undefined
            }
          </div>
          <div styleName="item">
            <Checkbox
              key={'required'}
              disabled={false}
              label={`required`}
              defaultChecked={
                attributeData.length
                  ? attributeData[numberRow] && attributeData[numberRow].required
                  : false}
              styles={{root: {marginTop: '10px'}}}
              onChange={(_ev?: React.FormEvent<HTMLElement>, isChecked?: boolean) => {
                if (isChecked !== undefined) {
                  changed.current["required"] = isChecked;
                  useAttributeData(changed.current, numberRow)
                }
              }}
              onFocus={
                () => {
                  useLastFocused('required', numberRow)
                }
              }
              componentRef={
                ref => {
                  if (ref && lastFocusedRow &&
                    (lastFocusedRow['value'] === 'required' && lastFocusedRow['numberRow'] === numberRow)) {
                    needFocus.current = ref;
                  }
                }
              }
            />
          </div>
          <div styleName="item">
            <Checkbox
              key={'hidden'}
              disabled={false}
              label={`hidden`}
              defaultChecked={
                attributeData.length
                  ? attributeData[numberRow] && attributeData[numberRow].hidden
                  : false}
              styles={{root: {marginTop: '10px'}}}
              onChange={(_ev?: React.FormEvent<HTMLElement>, isChecked?: boolean) => {
                if (isChecked !== undefined) {
                  changed.current["hidden"] = isChecked;
                  useAttributeData(changed.current, numberRow)
                }
              }}
              onFocus={
                () => {
                  useLastFocused('hidden', numberRow)
                }
              }
              componentRef={
                ref => {
                  if (ref && lastFocusedRow &&
                    (lastFocusedRow['value'] === 'hidden' && lastFocusedRow['numberRow'] === numberRow)) {
                    needFocus.current = ref;
                  }
                }
              }
            />
          </div>
          <div styleName="item">
            <TextField
              label="semCategories"
              onChange={(e, value) => {
                changed.current["semCategories"] = value as string;
                useAttributeData(changed.current, numberRow)
              }
              }
              defaultValue={
                attributeData.length
                  ? attributeData[numberRow] && attributeData[numberRow].semCategories
                  : ''
              }
              onFocus={() => {
                useLastFocused('semCategories', numberRow)
              }
              }
              componentRef={
                ref => {
                  if (ref && lastFocusedRow &&
                    (lastFocusedRow['value'] === 'semCategories' && lastFocusedRow['numberRow'] === numberRow)) {
                    needFocus.current = ref;
                  }
                }
              }
            />
          </div>
          <div styleName="item">
            <TextField
              label="mask"
              onChange={(e, value) => {
                changed.current["mask"] = value as string;
                useAttributeData(changed.current, numberRow)
              }
              }
              defaultValue={
                attributeData.length
                  ? attributeData[numberRow] && attributeData[numberRow].mask
                  : ''
              }
              onFocus={() => {
                useLastFocused('mask', numberRow)
              }
              }
              componentRef={
                ref => {
                  if (ref && lastFocusedRow &&
                    (lastFocusedRow['value'] === 'mask' && lastFocusedRow['numberRow'] === numberRow)) {
                    needFocus.current = ref;
                  }
                }
              }
            />
          </div>
        </div>
        <div styleName="container">
          <div styleName="item">
            <DefaultButton
              onClick={() => {
                changed.current = {} as IAttributeData;
                deleteAttributeData(numberRow)
              }}
              text="Delete"/>
          </div>
        </div>
      </div>
    </div>
  );
}, styles, {allowMultiple: true});
