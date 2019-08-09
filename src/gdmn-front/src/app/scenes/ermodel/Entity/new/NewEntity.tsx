import {INewEntityProps} from "./NewEntity.types";
import React, {useCallback, useEffect, useRef, useState} from "react";
import CSSModules from 'react-css-modules';
import styles from './styles.css';
import {
  Checkbox,
  ComboBox,
  CommandBar,
  DefaultButton,
  ICheckbox,
  IComboBox,
  IComboBoxOption,
  ICommandBarItemProps,
  ITextField,
  TextField
} from "office-ui-fabric-react";
import {RecordSet} from "gdmn-recordset";
import {gdmnActions} from "@src/app/scenes/gdmn/actions";
import {IChangedFields, IEntityName, ILastEdited} from "@src/app/scenes/ermodel/utils";
import {ISessionData} from "@src/app/scenes/gdmn/types";
import {apiService} from "@src/app/services/apiService";
import {IAttribute, IEntityAttribute, ISetAttribute} from "gdmn-orm";
import {EntityAttributeContainer} from "@src/app/scenes/ermodel/Entity/new/EntityAttributeContainer";


export const NewEntity = CSSModules((props: INewEntityProps): JSX.Element => {
  const {history, dispatch, url, viewTab, erModel} = props;

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

  const getCountEntityAttributes = (): string[] => {
    if (viewTab && viewTab.sessionData && viewTab.sessionData.countEntityAttributes) {
      return viewTab.sessionData.countEntityAttributes;
    }
    return [];
  };

  const getRefAttribute= (): IAttribute[] | IEntityAttribute[] | ISetAttribute[] => {
    if (viewTab && viewTab.sessionData && viewTab.sessionData.refAttribute) {
      return viewTab.sessionData.refAttribute;
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

  const getValueHiddenParent = (): boolean => {
    if (viewTab && viewTab.sessionData && viewTab.sessionData.valueHiddenParent) {
      return viewTab.sessionData.valueHiddenParent;
    }
    return false;
  };

  const lastEdited = useRef(getSavedLastEdit());
  const lastFocused = useRef(getSavedLastFocused());

  const controlsData = useRef(getSavedControlsData());
  const changedFields = useRef(getSavedChangedFields());
  const refAttribute = useRef(getRefAttribute());

  const valueHiddenParent = useRef(getValueHiddenParent());
  const entityName = useRef(getEntityName());
  const parentName = useRef(getParentName());
  const countEntityAttributes = useRef(getCountEntityAttributes());

  const needFocus = useRef<ITextField | IComboBox | ICheckbox | undefined>();

  const [changedCountEntityAttributes, setCountEntityAttributes] = useState(getCountEntityAttributes());
  const [changed, setChanged] = useState(!!(lastEdited.current));
  const [hiddenParent, setHiddenParent] = useState(valueHiddenParent.current);
  const [attributeData, setAttributeData] = useState(getRefAttribute());

  const useAttributeData = (value: IAttribute | IEntityAttribute | ISetAttribute, idRow: string) => {
    const attributes = attributeData.slice();
    const findAttr =  attributes.find(fn=> idRow === fn.id);

    if (!findAttr){
      attributes.push({...value, id:idRow})
    } else{
      const ind = attributes.indexOf(findAttr, 0);
      attributes[ind] = {...value, id:idRow};
    }

    setAttributeData(attributes)
    refAttribute.current = attributes;
  };

  const deleteAttributeData = (idRow: string) => {
    const attributes = attributeData.slice();
    const newAttributes = attributes
      .filter((field, index) => field.id !== idRow)
      .map((field) => {
        return field
      });

    setAttributeData(newAttributes)

    const newArr = changedCountEntityAttributes
      .filter((field, index) => field !== idRow)
      .map((field) => {
        return field
      });

    setCountEntityAttributes(newArr);
    countEntityAttributes.current = newArr;
    refAttribute.current = newAttributes;
  };

  const postChanges = useCallback((close: boolean) => {
    const name = entityName.current;

    if (!name) {
      throw new Error('"Name" field is required')
    }
    const parent = parentName.current;

    dispatch(async () => {
      if (parent) {
        await apiService.AddEntity({
          entityName: name.value.toUpperCase(),
          parentName: parent.value.toUpperCase(),
          attributes: attributeData
        });
      } else {
        await apiService.AddEntity({entityName: name.value.toUpperCase(), attributes: attributeData});
      }
    });

    changedFields.current = {};
    setChanged(false);

    if (close) {
      deleteViewTab(true);
    }
  }, [changed]);

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
    const f = async () => {
      addViewTab(undefined);
    };
    f();
  }, []);

  useEffect(() => {
    if (needFocus.current) {
      needFocus.current.focus();
      needFocus.current = undefined;
    }
  }, [lastFocused]);

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
          refAttribute: refAttribute.current,
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
                  if (option && option.key) {
                    lastEdited.current = {
                      fieldName: "Parent",
                      value: option.key as string
                    };
                    parentName.current = {
                      fieldName: "Parent",
                      value: option.key as string
                    };
                    changedFields.current["Parent"] = true;
                    setChanged(true);
                  }
                }}
              /> : undefined}
          </div>
        </div>
      </div>

      <div styleName="item">
        <DefaultButton
          onClick={() => {
            const newArr = changedCountEntityAttributes.slice();
            newArr.push("NewAttr" + changedCountEntityAttributes.length);
            setCountEntityAttributes(newArr);
            countEntityAttributes.current = newArr.slice();
          }}
          text="Add attribute"/>
      </div>
      <div>
        <ul>
          {changedCountEntityAttributes.map((id) =>
            <li key={id}>
              <EntityAttributeContainer
                useAttributeData={useAttributeData}
                deleteAttributeData={deleteAttributeData}
                attributeDataRow={attributeData.find((fn)=> fn.id === id )}
                idRow={id}
              />
            </li>
          )}
        </ul>
      </div>
      <div>

      </div>
    </div>
  );
}, styles, {allowMultiple: true});
