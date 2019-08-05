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
  dateFormats,
  listType,
  numberFormats
} from "@src/app/scenes/ermodel/Entity/new/utils";
import {IEntityAttributeProps} from "@src/app/scenes/ermodel/Entity/new/EntityAttribute.types";
import {IAttributeData} from "@src/app/scenes/ermodel/utils";

export const EntityAttribute = CSSModules((props: IEntityAttributeProps): JSX.Element => {
  const {erModel, useAttributeData, deleteAttributeData, attributeData, numberRow, useLastFocused, lastFocusedRow} = props;

  const changed = useRef(attributeData.length ? attributeData[numberRow] : {} as IAttributeData);
  const needFocus = useRef<ITextField | IComboBox | ICheckbox | undefined>();
  const [hiddenLink, setHiddenLink] = useState(false);
  const [hiddenFormat, setHiddenFormat] = useState(false);
  const [hiddenFormatDate, setHiddenFormatDate] = useState(false);
  const [hiddenFormatBoolean, setHiddenFormatBoolean] = useState(false);

  useEffect(() => {
    if (needFocus.current) {
      needFocus.current.focus();
      needFocus.current = undefined;
    }
  }, [lastFocusedRow]);

  const onChangedType = (event: React.FormEvent<IComboBox>, option?: IComboBoxOption, index?: number, value?: string) => {
    if (option && option.text) {
      changed.current["type"] = option!.text;
      useAttributeData(changed.current, numberRow);
      if (option!.text === 'Parent' || option!.text === 'Entity' || option!.text === 'Set') {
        setHiddenLink(true)
        setHiddenFormat(false)
        setHiddenFormatDate(false)
        setHiddenFormatBoolean(false)
      } else if (option!.text === 'Integer' || option!.text === 'Numeric' || option!.text === 'Float') {
        setHiddenFormat(true)
        setHiddenFormatDate(false)
        setHiddenLink(false)
        setHiddenFormatBoolean(false)
      } else if (option!.text === 'Date' || option!.text === 'TimeStamp') {
        setHiddenFormatDate(true)
        setHiddenLink(false)
        setHiddenFormat(false)
        setHiddenFormatBoolean(false)
      } else if (option!.text === 'Boolean') {
        setHiddenFormatBoolean(true)
        setHiddenFormatDate(false)
        setHiddenLink(false)
        setHiddenFormat(false)
      } else {
        setHiddenLink(false)
        setHiddenFormat(false)
        setHiddenFormatDate(false)
        setHiddenFormatBoolean(false)

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
            {attributeData.length && attributeData[numberRow] && attributeData[numberRow].hasOwnProperty('type')
            && (attributeData[numberRow].type === 'Entity' || attributeData[numberRow].type === 'Parent'
              || attributeData[numberRow].type === 'Set') ?
              <ComboBox
                selectedKey={attributeData.length
                  ? attributeData[numberRow] && attributeData[numberRow].linkName! : undefined}
                label="Entity"
                autoComplete="on"
                options={Object.keys(erModel!.entities).map(key => ({key, text: key}))}
                onChange={(event: React.FormEvent<IComboBox>, option?: IComboBoxOption, index?: number, value?: string) => {
                  if (option && option.text) {
                    changed.current["linkName"] = option!.text;
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
                  changed.current["alignment"] = option!.text;
                  useAttributeData(changed.current, numberRow);
                }
              }}
              label="alignment"
              required={true}
            />
          </div>
          <div styleName="item">
            {attributeData.length && attributeData[numberRow] && attributeData[numberRow].hasOwnProperty('type')
            && (attributeData[numberRow].type === 'Date') ?
              <ComboBox
                selectedKey={attributeData.length
                  ? attributeData[numberRow] && attributeData[numberRow].formatDate! : undefined}
                label="format date"
                autoComplete="on"
                options={dateFormats.map(key => ({key, text: key}))}
                onChange={(event: React.FormEvent<IComboBox>, option?: IComboBoxOption, index?: number, value?: string) => {
                  if (option && option.text) {
                    changed.current["formatDate"] = option!.text;
                    useAttributeData(changed.current, numberRow)
                  }
                }}

              /> : undefined
            }
          </div>
          <div styleName="item">
            {attributeData.length && attributeData[numberRow] && attributeData[numberRow].hasOwnProperty('type')
            && (attributeData[numberRow].type === 'Integer' ||
              attributeData[numberRow].type === 'Numeric' || attributeData[numberRow].type === 'Float') ?
              <ComboBox
                selectedKey={attributeData.length
                  ? attributeData[numberRow] && attributeData[numberRow].format! : undefined}
                label="format"
                autoComplete="on"
                options={numberFormats.map(key => ({key: key.name, text: key.name}))}
                onChange={(event: React.FormEvent<IComboBox>, option?: IComboBoxOption, index?: number, value?: string) => {
                  if (option && option.text) {
                    changed.current["format"] = option!.text;
                    useAttributeData(changed.current, numberRow)
                  }
                }}
              /> : undefined
            }
          </div>
          <div styleName="item">
            {attributeData.length && attributeData[numberRow] && attributeData[numberRow].hasOwnProperty('type')
            && (attributeData[numberRow].type === 'Boolean') ?
              <ComboBox
                selectedKey={attributeData.length
                  ? attributeData[numberRow] && attributeData[numberRow].formatBoolean! : undefined}
                label="format"
                autoComplete="on"
                options={BooleanFormats.map(key => ({key, text: key}))}
                onChange={(event: React.FormEvent<IComboBox>, option?: IComboBoxOption, index?: number, value?: string) => {
                  if (option && option.text) {
                    changed.current["formatBoolean"] = option!.text;
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
