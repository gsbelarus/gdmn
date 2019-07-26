import React, {useRef, useState} from "react";
import CSSModules from 'react-css-modules';
import styles from './styles.css';
import {ComboBox, IComboBox, IComboBoxOption, TextField,} from "office-ui-fabric-react";
import {listType} from "@src/app/scenes/ermodel/Entity/new/utils";
import {IEntityAttributeProps} from "@src/app/scenes/ermodel/Entity/new/EntityAttribute.types";
import {IAttributeData} from "@src/app/scenes/ermodel/utils";


export const EntityAttribute = CSSModules((props: IEntityAttributeProps): JSX.Element => {
  const {erModel, useAttributeData, attributeData, numberRow} = props;
  const changed = useRef({} as IAttributeData);
  const [hiddenLink, setHiddenLink] = useState(false);

  const onChangedType = (event: React.FormEvent<IComboBox>, option?: IComboBoxOption, index?: number, value?: string) => {
    if (option && option.text) {
      changed.current["type"] = option!.text;
      useAttributeData(changed.current, numberRow);
      if (option!.text === 'Parent' || option!.text === 'Entity' || option!.text === 'Set') {
        setHiddenLink(true)
      } else {
        setHiddenLink(false)
        changed.current["linkName"] = '';
        useAttributeData(changed.current, numberRow);
      }
    }
  };

  return (
    <div styleName= "container" >
      <div styleName="item">
        <TextField
          label="Name attribute"
          onChange={ (e, value) => {
            changed.current["fieldName"] = value as string; useAttributeData(changed.current, numberRow)}}
          defaultValue={
            attributeData.length && (attributeData.length < numberRow || numberRow < attributeData.length)
              ? attributeData[numberRow].fieldName
              : ''
          }
         />
      </div>
      <div styleName="item">
        <ComboBox
          selectedKey={attributeData.length && (attributeData.length < numberRow || numberRow < attributeData.length)
            ? attributeData[numberRow].type! : undefined}
          label="choose type attribute"
          autoComplete="on"
          options={listType.map(arr => ({key: arr.key, text: arr.text}))}
          onChange={onChangedType}
        />
      </div>
      <div styleName="item">
        {attributeData.length && attributeData[numberRow] && attributeData[numberRow].hasOwnProperty('type')
        && (attributeData[numberRow].type === 'Entity' || attributeData[numberRow].type === 'Parent'
          || attributeData[numberRow].type === 'Set')?
          <ComboBox
            selectedKey={attributeData.length && (attributeData.length < numberRow || numberRow < attributeData.length)
              ? attributeData[numberRow].linkName! : undefined}
            label="choose link"
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
      {/*<div styleName="item">*/}
      {/*  <DefaultButton*/}
      {/*    onClick={() => { console.log(changed); useAttributeData(changed.current)}}*/}
      {/*    text="Save" />*/}
      {/*</div>*/}
    </div>
  );
}, styles, { allowMultiple: true });
