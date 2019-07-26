import {INewEntityProps} from "./NewEntity.types";
import React, {useCallback, useEffect, useRef, useState} from "react";
import CSSModules from 'react-css-modules';
import styles from './styles.css';
import {
  Checkbox, ComboBox,
  CommandBar,
  ICheckbox,
  IComboBox,
  IComboBoxOption,
  ICommandBarItemProps,
  IconButton,
  ITextField,
  TextField
} from "office-ui-fabric-react";
import {RecordSet} from "gdmn-recordset";
import {gdmnActions} from "@src/app/scenes/gdmn/actions";
import {IAttributeData, IChangedFields, IEntityName, ILastEdited} from "@src/app/scenes/ermodel/utils";
import {ISessionData} from "@src/app/scenes/gdmn/types";
import {apiService} from "@src/app/services/apiService";
import {IAttribute} from "gdmn-orm";
import {EntityAttributeContainer} from "@src/app/scenes/ermodel/Entity/new/EntityAttributeContainer";

export const NewEntity = CSSModules((props: INewEntityProps): JSX.Element => {
  const {rs, history, dispatch, url, viewTab, erModel, gcsEntities} = props;
  const getSavedControlsData = (): ISessionData | undefined => {
    if (viewTab && viewTab.sessionData && viewTab.sessionData.controls instanceof Object) {
      return viewTab.sessionData.controls as ISessionData;
    }
    return undefined;
  };

  const getSavedLastEdit = (): ILastEdited | undefined => {
    if (viewTab && viewTab.sessionData && viewTab.sessionData.lastEdited) {
      return viewTab.sessionData.lastEdited as ILastEdited;
    }
    return undefined;
  };

  const getSavedLastFocused = (): string | undefined => {
    if (viewTab && viewTab.sessionData && typeof viewTab.sessionData.lastFocused === 'string') {
      return viewTab.sessionData.lastFocused;
    }
    return undefined;
  };

  const getSavedChangedFields = (): IChangedFields => {
    if (viewTab && viewTab.sessionData && viewTab.sessionData.changedFields instanceof Object) {
      return viewTab.sessionData.changedFields as IChangedFields;
    }
    return {};
  };

  const getCountEntityAttributes = (): number[] => {
    if (viewTab && viewTab.sessionData) {
      return viewTab.sessionData.countEntityAttributes;
    }
    return [];
  };

  const getAttributeData = (): IAttributeData[] => {
    if (viewTab && viewTab.sessionData && viewTab.sessionData.attributeData) {
      return viewTab.sessionData.attributeData as IAttributeData[];
    }
    return [];
  };

  const getEntityName = (): IEntityName | undefined => {
    if (viewTab && viewTab.sessionData && viewTab.sessionData.entityName) {
      return viewTab.sessionData.entityName as IEntityName;
    }
    return undefined;
  };

  const getParentName = (): IEntityName | undefined => {
    if (viewTab && viewTab.sessionData && viewTab.sessionData.parentName) {

      return viewTab.sessionData.parentName as IEntityName;
    }
    return undefined;
  };

  const getValueHiddenParent = (): boolean  => {
    if (viewTab && viewTab.sessionData && viewTab.sessionData.valueHiddenParent) {
      return viewTab.sessionData.valueHiddenParent;
    }
    return false;
  };

  const lastEdited = useRef(getSavedLastEdit());
  const lastFocused = useRef(getSavedLastFocused());
  const controlsData = useRef(getSavedControlsData());
  const changedFields = useRef(getSavedChangedFields());
  const countEntityAttributes = useRef(getCountEntityAttributes());
  const valueHiddenParent = useRef(getValueHiddenParent());

  const attributeData = useRef(getAttributeData());
  const entityName = useRef(getEntityName());
  const parentName = useRef(getParentName());
  const needFocus = useRef<ITextField | IComboBox | ICheckbox | undefined>();
  const [changedCountEntityAttributes, setCountEntityAttributes] = useState(countEntityAttributes.current);
  const [changed, setChanged] = useState(!!(lastEdited.current));
  const [hiddenParent, setHiddenParent] = useState(valueHiddenParent.current);


  const useAttributeData = (value: IAttributeData, numberRow: number) => {
    attributeData.current[numberRow]={
      fieldName: value.fieldName,
      type: value.type,
      linkName: value.linkName && value.linkName
    };
  };

  const postChanges = useCallback((close: boolean) => {
    const name = entityName.current;

    if (!name) {
      throw new Error('"Name" field is required')
    }
    const parent = parentName.current;

    const attributes = attributeData.current
      .map(obj => {
        if(obj.type === "Set") {
          return {
            name: obj.fieldName,
            type: obj.type,
            lName: obj.fieldName,
            required: false,
            semCategories: '',
            references: [`${obj.linkName}`],
            attributes: [],
            presLen: 1
          } as IAttribute;
        } else if (obj.type === "Entity") {
          return {
            name: obj.fieldName,
            type: obj.type,
            lName: obj.fieldName,
            required: false,
            semCategories: '',
            adapter: { relation: `${name.value.toUpperCase()}`, field: `${obj.fieldName.toUpperCase()}` },
            references: [`${obj.linkName}`]
          } as IAttribute;
        }else if (obj.type === "Parent") {
          return {
            name: obj.fieldName,
            type: obj.type,
            lName: obj.fieldName,
            required: false,
            semCategories: '',
            references: [`${obj.linkName}`]
          } as IAttribute;
        } else {
          return {
            name: obj.fieldName,
            type: obj.type,
            lName: obj.fieldName,
            required: false,
            semCategories: ''
          } as IAttribute;
        }
      });

    dispatch(async (dispatch, getState) => {
      if (parent) {
        await apiService.AddEntity({entityName: name.value.toUpperCase(), parentName: parent.value.toUpperCase(), attributes});
      } else {
        await apiService.AddEntity({entityName: name.value.toUpperCase(), attributes});
      }
    });

    changedFields.current = {};
    setChanged(false);

    if (close) {
      deleteViewTab(true);
    }
  }, [rs, changed]);

  const addViewTab = (recordSet: RecordSet | undefined) => {
    dispatch(gdmnActions.addViewTab({
      url,
      caption: 'Add entity',
      canClose: true,
    }));
  };

  const deleteViewTab = (changePath: boolean) => dispatch(gdmnActions.deleteViewTab({
    viewTabURL: url,
    locationPath: changePath ? location.pathname : undefined,
    historyPush: changePath ? history.push : undefined
  }));
  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'saveAndClose',
      disabled: !changed,
      text: 'Сохранить',
      iconProps: {
        iconName: 'CheckMark'
      },
      onClick: () => postChanges(true)
    },
    {
      key: 'cancelAndClose',
      text: changed ? 'Отменить' : 'Закрыть',
      iconProps: {
        iconName: 'Cancel'
      },
      onClick: () => {
        if (changed) {
          lastEdited.current = undefined;
          setChanged(false);
        }
        deleteViewTab(true);
      }
    },
    {
      key: 'apply',
      disabled: !changed,
      text: 'Применить',
      iconProps: {
        iconName: 'Save'
      },
      onClick: () => postChanges(false)
    }
  ].map(i => i);

  useEffect(() => {
    if (!rs) {
      const f = async () => {
        addViewTab(undefined);
      };

      f();
    }
  }, [rs]);

  useEffect(() => {
    return () => {
      dispatch(gdmnActions.saveSessionData({
        viewTabURL: url,
        sessionData: {
          lastEdited: lastEdited.current,
          lastFocused: lastFocused.current,
          controls: controlsData.current,
          changedFields: changedFields.current,
          countEntityAttributes: countEntityAttributes.current,
          entityName: entityName.current,
          parentName: parentName.current,
          attributeData: attributeData.current,
          valueHiddenParent: valueHiddenParent.current,
        }
      }));
    };
  }, []);

  return (

    <div>
      <CommandBar items={commandBarItems}/>
      <div styleName="FieldsColumn">
        <TextField
          label="Entity Name"
          defaultValue={
            entityName.current
              ? entityName.current.value
              : ''
          }
          onChange={
            (_e, newValue?: string) => {
              if (newValue !== undefined) {
                lastEdited.current = {
                  fieldName: "EntityName",
                  value: newValue
                };
                entityName.current = {
                  fieldName: "EntityName",
                  value: newValue
                };
                changedFields.current["EntityName"] = true;
                setChanged(true);
              }
            }
          }
          onFocus={
            () => {
              lastFocused.current = "EntityName";
            }
          }
          componentRef={
            ref => {
              if (ref && lastFocused.current === "EntityName") {
                needFocus.current = ref;
              }
            }
          }
        />
        <div styleName="container">
          <div styleName="item">
            <Checkbox
              key={'hasParent'}
              disabled={false}
              label={`has parent`}
              defaultChecked={valueHiddenParent.current}
              styles={{root: {marginTop: '10px'}}}
              onChange={(_ev?: React.FormEvent<HTMLElement>, isChecked?: boolean) => {
                if (isChecked !== undefined) {
                  lastEdited.current = {
                    fieldName: "hasParent",
                    value: isChecked
                  };
                  changedFields.current["hasParent"] = true;
                  setChanged(true);
                  if (isChecked) {
                    setHiddenParent(true);
                    valueHiddenParent.current = true;
                  } else {
                    setHiddenParent(false);
                    valueHiddenParent.current = false;
                  }
                }
              }}
              onFocus={
                () => {
                  lastFocused.current = "hasParent";
                }
              }
              componentRef={
                ref => {
                  if (ref && lastFocused.current === "hasParent") {
                    needFocus.current = ref;
                  }
                }
              }
            />
          </div>
          <div styleName="item">
            {hiddenParent ?
              <ComboBox
                selectedKey={parentName.current ? parentName.current.value : undefined}
                label="choose parent"
                autoComplete="on"
                options={Object.keys(erModel!.entities).map(key => ({key, text: key}))}
                onChange={(event: React.FormEvent<IComboBox>, option?: IComboBoxOption, index?: number, value?: string) => {
                  if (option && option.text) {
                    lastEdited.current = {
                      fieldName: "Parent",
                      value: option.text
                    };
                    parentName.current = {
                      fieldName: "Parent",
                      value: option.text
                    };
                    changedFields.current["Parent"] = true;
                    setChanged(true);
                  }
                }}
              />: undefined}
          </div>
        </div>
      </div>
      <div styleName="Child">
        <IconButton
          disabled={false}
          checked={false}
          iconProps={{iconName: 'AddTo'}}
          title="Emoji" ariaLabel="Emoji"
          onClick={() => {
            const newArr = changedCountEntityAttributes.slice();
            newArr.push(changedCountEntityAttributes.length + 1)
            setCountEntityAttributes(newArr);
            countEntityAttributes.current = newArr.slice();
          }}/>

      </div>
      <div styleName="Child"> add attribute</div>
      <div>
        <ul>
          {changedCountEntityAttributes.map((number) =>
            <li key={number-1}><EntityAttributeContainer
              useAttributeData={useAttributeData}
              attributeData = {attributeData.current}
              numberRow = {number-1}/></li>
          )}
        </ul>
      </div>
      <div>

      </div>
    </div>
  );
}, styles, {allowMultiple: true});
