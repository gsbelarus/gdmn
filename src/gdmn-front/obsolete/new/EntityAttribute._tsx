import React, {useRef, useState} from "react";
import CSSModules from 'react-css-modules';
import styles from './styles.css';
import {Checkbox, ComboBox, DefaultButton, IComboBox, IComboBoxOption, TextField} from "office-ui-fabric-react";
import {getFieldType, listType} from "@src/app/scenes/ermodel/Entity/new/utils";
import {IEntityAttributeProps} from "@src/app/scenes/ermodel/Entity/new/EntityAttribute.types";
import {AttributeTypes, IAttribute, IEntityAttribute, ISetAttribute} from "gdmn-orm";


export const EntityAttribute = CSSModules((props: IEntityAttributeProps): JSX.Element => {
  const {erModel, useAttributeData, deleteAttributeData, attributeDataRow, idRow, setChangesToRowField, newRecord} = props;
  const changedData = useRef( attributeDataRow  ? attributeDataRow :{} as IAttribute | ISetAttribute | IEntityAttribute);
  const [hiddenFormat, setHiddenFormat] = useState(attributeDataRow  && attributeDataRow  ? getFieldType(attributeDataRow.type) : {}  as {fieldType: string});
  const lname = attributeDataRow && attributeDataRow.lName && attributeDataRow.lName.hasOwnProperty('ru') && attributeDataRow.lName.ru ? attributeDataRow.lName.ru.name : '';

  const onChangedType = (event: React.FormEvent<IComboBox>, option?: IComboBoxOption, index?: number, value?: string) => {
    if (option && option.text) {
      changedData.current["type"] = option!.key as AttributeTypes;
      setChangesToRowField();
      useAttributeData(changedData.current, idRow);
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
          useAttributeData(changedData.current, idRow);
      }
    }
  };

  return (
    <div>
      <div styleName="containerBorder">
        <div styleName="container">
          <div styleName="item">
          </div>
          <div styleName="item">
            <TextField
              label="Name - required"
              onChange={(e, value) => {
                changedData.current["name"] = value as string;
                useAttributeData(changedData.current, idRow);
                setChangesToRowField();
              }}
              defaultValue={ attributeDataRow ? attributeDataRow.name : ''}
            />
          </div>
          <div styleName="item">
            <TextField
              label="lName - required"
              onChange={(e, value) => {
                changedData.current["lName"] = {ru: {name: value ? value as string : ''}};
                useAttributeData(changedData.current, idRow);
                setChangesToRowField()
              }}
              defaultValue={lname}
            />
          </div>
          <div styleName="item">
            <ComboBox
              selectedKey={attributeDataRow
                ? attributeDataRow.type! : undefined}
              label="Type - required"
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
                label="Entity - required"
                autoComplete="on"
                options={Object.keys(erModel!.entities).map(key => ({key, text: key}))}
                onChange={(event: React.FormEvent<IComboBox>, option?: IComboBoxOption, index?: number, value?: string) => {
                  if (option && option.key) {
                    switch (attributeDataRow.type) {
                      case 'Set':
                        const setAttribute = changedData.current as ISetAttribute
                        setAttribute["references"] = [option!.key as string];
                        setAttribute["attributes"] = [];
                        break;
                      default:
                        const entityAttribute = changedData.current as IEntityAttribute
                        entityAttribute["references"] = [option!.key as string];
                    }
                    useAttributeData(changedData.current, idRow)
                  }
                }}
              />
              : undefined
            }
          </div>
        </div>
        <div styleName="container">
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
                  changedData.current["required"] = isChecked;
                  useAttributeData(changedData.current, idRow);
                  setChangesToRowField()
                }
              }}
            />
          </div>
          <div styleName="item">
            <TextField
              label="semCategories"
              onChange={(e, value) => {
                changedData.current["semCategories"] = value as string;
                useAttributeData(changedData.current, idRow)
                setChangesToRowField()
              }
              }
              defaultValue={
                attributeDataRow
                  ? attributeDataRow.semCategories
                  : ''
              }
            />
          </div>
        </div>
        <div styleName="container">
          <div styleName="item">
            <DefaultButton
              onClick={() => {
                changedData.current = {} as IAttribute;
                deleteAttributeData(idRow);
                setChangesToRowField();
              }}
              text="Delete"/>
          </div>
        </div>
      </div>
    </div>
  );
}, styles, {allowMultiple: true});
