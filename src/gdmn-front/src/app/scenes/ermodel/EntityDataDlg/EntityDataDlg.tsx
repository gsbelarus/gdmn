import { IEntityDataDlgProps } from "./EntityDataDlg.types";
import React, { useEffect, useState, useCallback, useRef, FormEvent } from "react";
import CSSModules from 'react-css-modules';
import styles from './styles.css';
import { CommandBar, ICommandBarItemProps, TextField, ITextField, IComboBoxOption, IComboBox, MessageBar, MessageBarType, Checkbox, ICheckbox, getTheme, Stack, ITextFieldStyles, Label, ComboBox, DefaultButton } from "office-ui-fabric-react";
import { gdmnActions } from "../../gdmn/actions";
import { rsActions, RecordSet, IDataRow, TCommitResult, TRowState, IFieldDef, TFieldType } from "gdmn-recordset";
import { apiService } from "@src/app/services/apiService";
import { List } from "immutable";
import {
  EntityQuery,
  EntityLink,
  EntityQueryOptions,
  IEntityUpdateFieldInspector,
  SetAttribute,
  EntityAttribute,
  EntityLinkField,
  IEntityQueryResponse,
  prepareDefaultEntityQuery,
  prepareDefaultEntityQuerySetAttr,
  EnumAttribute
} from "gdmn-orm";
import { ISessionData } from "../../gdmn/types";
import { DatepickerJSX } from '@src/app/components/Datepicker/Datepicker';
import { SetLookupComboBox } from "@src/app/components/SetLookupComboBox/SetLookupComboBox";
import { DesignerContainer } from '../../designer/DesignerContainer';
import { IDesignerState } from '../../designer/Designer';
import { object2style, object2ILabelStyles, object2ITextFieldStyles, getFields, getFieldDefByFieldName, getSetFields } from '../../designer/utils';
import { getAreas, isWindow, IWindow, IGrid, Object, Objects, IArea, isFrame } from '../../designer/types';
import { getLName } from 'gdmn-internals';
import { useSettings } from '@src/app/hooks/useSettings';
import { IDesignerSetting } from '../../designer/Designer.types';
import { LookupComboBox } from "@src/app/components/LookupComboBox/LookupComboBox";
import { Frame } from "../../gdmn/components/Frame";
import { attr2fd, validateEntityDataValues, getEntityDataErrorMessage, clearEntityDataErrorMessage } from "../utils";
import { NumberField } from "../Entity/EntityDlg/NumberField";

interface ILastEdited {
  fieldName: string;
  value: string | boolean ;
};

interface IEntityDataError {
  field: string;
  message: string;
};

export type EntityDataErrors = IEntityDataError[];

/**
 * Поскольку в RecordSet у нас не хранятся данные множеств мы должны
 * получить их с сервера и сохранить в стэйте диалогового окна, для того,
 * чтобы потом использовать их при рендере компонентов.
 */
interface ISetComboBoxData {
  [setAttrName: string]: IComboBoxOption[];
};

interface IChangedFields {
  [fieldName: string]: boolean;
};

export const EntityDataDlg = CSSModules((props: IEntityDataDlgProps): JSX.Element => {
  const {url, entityName, id, rs, entity, dispatch, history, srcRs, viewTab, newRecord} = props;
  const locked = rs ? rs.locked : false;
  const rsName = url;
  const error = viewTab ? viewTab.error : undefined;

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

  const getSavedLastFocused = (): string | undefined =>  {
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

  const getSavedIsDesigner = (): boolean => {
    if (viewTab && viewTab.sessionData && typeof(viewTab.sessionData.isDesigner) === 'boolean') {
      return viewTab.sessionData.isDesigner as boolean;
    }
    return false;
  };

  const getSavedChangesDesigner = (): IDesignerState | undefined => {
    if (viewTab && viewTab.sessionData && viewTab.sessionData.isDesigner instanceof Object) {
      return viewTab.sessionData.isDesigner as IDesignerState;
    }
    return undefined;
  };

  const lastEdited = useRef(getSavedLastEdit());
  const lastFocused = useRef(getSavedLastFocused());
  const controlsData = useRef(getSavedControlsData());
  const changedFields = useRef(getSavedChangedFields());
  const nextUrl = useRef(url);
  const isDesigner = useRef(getSavedIsDesigner());
  const changesDesigner = useRef(getSavedChangesDesigner());
  const [designer, setDesigner] = useState(isDesigner.current);
  const needFocus = useRef<ITextField | IComboBox | ICheckbox | undefined>();
  const [changed, setChanged] = useState(!!((rs && rs.changed) || lastEdited.current || newRecord));
  const [setComboBoxData, setSetComboBoxData] = useState({} as ISetComboBoxData);

  const [valueErrors, setValueErrors] = useState<EntityDataErrors | undefined>([]);

  const addViewTab = (recordSet: RecordSet | undefined) => {
    let lName = entityName;

    if (entity && rs) {
      const presAttr = entity.presentAttribute().name;
      if (rs.findFieldDef(presAttr)) {
        lName = rs.getString(presAttr);
      }
    }

    dispatch(gdmnActions.addViewTab({
      url,
      caption: newRecord ? `Создание: ${lName}` : `Редактирование: ${lName}`,
      canClose: false,
      rs: recordSet ? [recordSet.name] : undefined
    }));
  };

  const deleteViewTab = (changePath: boolean) => dispatch(gdmnActions.deleteViewTab({
    viewTabURL: url,
    locationPath: changePath ? location.pathname : undefined,
    historyPush: changePath ? history.push : undefined
  }));

  const applyLastEdited = () => {
    if (rs && lastEdited.current) {
      const { fieldName, value } = lastEdited.current;
      const def = rs.getFieldDef(fieldName);
      let tempRs = rs;
      // у нас контролы для редактирования полей сейчас
      // это либо текстовые поля, либо чекбоксы
      // поэтому здесь мы и храним в value или строку
      // или булевское значений.
      // по идее, значение от DatePicker должно храниться/передаваться
      // как Date, но это пока не сделано
      if (typeof value === "string") {
        if (value === '' && def.dataType !== TFieldType.String && !def.required) {
          tempRs = tempRs.setNull(fieldName);
        } else {
          tempRs = tempRs.setString(fieldName, value);
        }
      } else {
        tempRs = tempRs.setBoolean(fieldName, value);
      }
      dispatch(rsActions.setRecordSet(tempRs));
      lastEdited.current = undefined;
    }
  };

  const postChanges = useCallback( (close: boolean) => {
    if (rs && changed && entity) {

      applyLastEdited();

      //Если есть хотя бы одна ошибка, выходим из функции post без сохранения записи
      const newErrors = validateEntityDataValues(rs, entity, setComboBoxData, valueErrors);
      setValueErrors(newErrors);
      if (newErrors?.length) {
        return;
      }

      let tempRs = rs;
      const fields: IEntityUpdateFieldInspector[] = Object.keys(changedFields.current).map( fieldName => {
        const attr = entity.attributes[fieldName] as EntityAttribute;

        if (attr instanceof SetAttribute) {
          return {
            attribute: fieldName,
            value: [{
                pkValues: setComboBoxData[fieldName].filter(s => s.selected).map( d => d.key )
              }]
          }
        }

        const eqfa = tempRs.getFieldDef(fieldName).eqfa!;
        if (eqfa.linkAlias === rs.eq!.link.alias) {
          return {
            attribute: eqfa.attribute,
            value: tempRs.getValue(fieldName)
          }
        } else {
          return {
            attribute: eqfa.linkAlias,
            value: tempRs.getValue(fieldName)
          }
        }
      });

      if (!fields.length) {
        throw new Error('Empty list of changed fields');
      }

      const srcRsName = srcRs ? srcRs.name : undefined;

      dispatch(async (dispatch, getState) => {
        dispatch(rsActions.setRecordSet(tempRs = tempRs.setLocked(true)));

        if (newRecord) {
          const insertResponse = await apiService.insert({
            insert: {
              entity: entityName,
              fields
            }
          });
          if (insertResponse.error) {
            dispatch(gdmnActions.updateViewTab({url, viewTab: {error: insertResponse.error.message}}));
            dispatch(rsActions.setRecordSet(tempRs.setLocked(false)));
            return;
          }
        } else {
          const updateResponse = await apiService.update({
            update: {
              entity: entityName,
              fields,
              pkValues: [parseInt(id)]
            }
          });

          if (updateResponse.error) {
            dispatch(gdmnActions.updateViewTab({url, viewTab: {error: updateResponse.error.message}}));
            dispatch(rsActions.setRecordSet(tempRs.setLocked(false)));
            return;
          }
        }
        const srcRs = srcRsName ? getState().recordSet[srcRsName] : undefined;

        /**
         * Перечитывать изменения с сервера имеет смысл если мы остаемся в окне
         * или есть мастер рекорд сет.
         */
        if ((srcRs && !srcRs.locked) || !close) {
          const eq = rs.eq!;
          const reReadResponse = await apiService.query({ query: eq.inspect() });

          if (reReadResponse.error) {
            dispatch(gdmnActions.updateViewTab({ url, viewTab: { error: reReadResponse.error.message } }));
            dispatch(rsActions.setRecordSet(tempRs.setLocked(false)));
            return;
          }

          const result = reReadResponse.payload.result!;
          const resultData = result.data as IDataRow[];

          if (resultData.length) {
            tempRs = tempRs.setLocked(false).set(mapData(result, rs.fieldDefs));
          } else {
            tempRs = await tempRs.post( _ => Promise.resolve(TCommitResult.Success), true );
          }

          /**
           * TODO: Перенос изменений в мастер рекорд сет будет работать только
           * при идентичной структуре двух рекорд сетов. Надо думать что
           * делать в том случае, когда в форме просмотра отображается один РС,
           * а в диалоговом окне он имеет другую структуру (другие поля).
           */
          const srcRs = srcRsName ? getState().recordSet[srcRsName] : undefined;

          if (srcRs && !srcRs.locked) {
            const foundRows = srcRs.locate(tempRs.getObject(tempRs.pk.map( fd => fd.fieldName )), true);
            if (foundRows.length && srcRs.getRowState(foundRows[0]) === TRowState.Normal) {
              dispatch(rsActions.setRecordSet(srcRs.set(tempRs.getObject(), foundRows[0])));
            }
          }
        }

        dispatch(rsActions.setRecordSet(tempRs.setLocked(false)));

        changedFields.current = {};
        setChanged(false);

        if (close) {
          deleteViewTab(true);
        }
      });
    }
  }, [rs, changed, setComboBoxData]);

  const deleteRecord = useCallback( () => {
    if (rs) {
      dispatch( async (dispatch, getState) => {
        let tempRs = rs;

        dispatch(rsActions.setRecordSet(tempRs = tempRs.setLocked(true)));

        const result = await apiService.delete({
          delete: {
            entity: entityName,
            pkValues: [id]
          }
        });

        if (result.error) {
          dispatch(gdmnActions.updateViewTab({ url, viewTab: { error: result.error.message } }));
          dispatch(rsActions.setRecordSet(tempRs.setLocked(false)));
        } else {
          if (srcRs) {
            const tempSrcRs = getState().recordSet[srcRs.name];
            if (tempSrcRs && !tempSrcRs.locked) {
              dispatch(rsActions.setRecordSet(
                tempSrcRs.delete(true, tempSrcRs.locate(rs.pkValue()))
              ));
            }
          }
          dispatch(rsActions.setRecordSet(tempRs.setLocked(false)));
          deleteViewTab(true);
        }
      });
    }
  }, [rsName, viewTab]);

  const addRecord = () => {
    if (entityName) {

      const f = async () => {
        const result = await apiService.getNextID({withError: false});
        const newID = result.payload.result!.id;

        if (newID) {
          nextUrl.current = `/spa/gdmn/entity/${entityName}/add/${newID}`;
          history.push(nextUrl.current);
        }
      };

      f();
    }
  };

  const [setting, setSetting] = useSettings<IDesignerSetting | undefined>({ type: 'DESIGNER', objectID: entityName });

  useEffect( () => {
    return () => {
      dispatch(gdmnActions.saveSessionData({
        viewTabURL: url,
        sessionData: {
          lastEdited: lastEdited.current,
          lastFocused: lastFocused.current,
          controls: controlsData.current,
          changedFields: changedFields.current,
          isDesigner: isDesigner.current,
          changesDesigner: changesDesigner.current
        }
      }));
    };
  }, []);

  useEffect( () => {
   if (needFocus.current) {
     needFocus.current.focus();
     needFocus.current = undefined;
    }
  }, [setting]);

  const mapData = (result: IEntityQueryResponse, fieldDefs: IFieldDef[]): IDataRow => Object.entries(result.aliases).reduce(
    (p, [resultAlias, eqrfa]) => {
      const fieldDef = fieldDefs.find( fd => fd.eqfa!.linkAlias === eqrfa.linkAlias && fd.eqfa!.attribute === eqrfa.attribute );
      if (fieldDef) {
        p[fieldDef.fieldName] = result.data[0][resultAlias];
      } else {
        console.log(`Can't find a field def for a result field ${resultAlias}-${eqrfa.linkAlias}-${eqrfa.attribute}`);
      }
      return p;
    }, {} as IDataRow
  );

  useEffect( () => {

    if (!rs && entity) {
      const f = async () => {
        addViewTab(undefined);
        const eq = prepareDefaultEntityQuery(entity, [id]);

        let fieldIdx = 1;

        const recScan = (fields: EntityLinkField[], linkAlias: string): IFieldDef[] =>
          fields.flatMap(
            f => f.links && f.links.length
              ? f.links.flatMap( fl => recScan(fl.fields, fl.alias) )
              : attr2fd(eq, `F\$${fieldIdx++}`, linkAlias, f.attribute.name)
          );

        const fieldDefs = recScan(eq.link.fields, eq.link.alias);

        let rs = RecordSet.create({
          name: rsName,
          fieldDefs,
          data: List([] as IDataRow[]),
          eq
        });

        if (newRecord) {
          rs = rs.set(fieldDefs.reduce(
            (p, fd) => {
              if (fd.eqfa!.linkAlias === eq.link.alias && fd.eqfa!.attribute === entity.pk[0].name) {
                changedFields.current[fd.fieldName] = true;
                return {...p, [fd.fieldName]: id};
              } else {
                return {...p, [fd.fieldName]: null};
              }
            }, {} as IDataRow
          ), undefined, true);
        } else {
          /**
           * Мы создаем рекордсет еще до обращения к серверу.
           * Поэтому нам приходится самостоятельно конструировать объекты
           * алиасы для полей, которые мы именуем 'F$1', 'F$2'....
           * После того, как мы выполним запрос на сервере для получения
           * данных записи (когда форма находится в режиме редактирования),
           * присланные нам данные могут содержать другие алиасы.
           * Нам приходится устанавливать соответствие сопоставляя
           * по linkAlias и имени атрибута.
           *
           * В будущем, хотелось бы чтобы имена алиасов присваивались
           * одинаково и в клиентской части и в серверной. Модель же данных
           * у нас идентична.
           *
           */
          const response = await apiService.query({query: eq.inspect()});

          const result = response.payload.result!;
          rs = rs.set(mapData(result, fieldDefs));
        }

        dispatch(rsActions.createRecordSet({name: rsName, rs}));
        addViewTab(rs);
      };

      f();
    }
  }, [rs, entity]);

  /**
   * Подгружаем все атрибуты-множества.
   */
  useEffect( () => {
    if (entity) {
      Promise.all(
        Object.values(entity.attributes)
          .filter( attr => attr instanceof SetAttribute )
          .map( async attr => {
           const eqSet = prepareDefaultEntityQuerySetAttr(entity, attr.name, [id]);
            return apiService.querySet({querySet: eqSet.inspect()})
              .then(response => {
                const result = response.payload.result;
                if (result) {
                  const attrSet = entity.attributes[attr.name] as EntityAttribute;
                  const linkEntity = attrSet.entities[0];
                  const presentField = linkEntity.presentAttribute();
                  const idAlias = Object.entries(result.aliases).find(([, data]) => data.linkAlias === attr.name && data.attribute === "ID")![0];
                  const nameAlias = Object.entries(result.aliases).find(([, data]) => data.linkAlias === attr.name
                    && (data.attribute === presentField!.name))![0];

                  return {
                    [attr.name]: result.data.map(r => ({
                      key: r[idAlias],
                      text: r[nameAlias],
                      selected: true
                    }))
                  } as ISetComboBoxData;
                } else {
                  return undefined;
                }
              })
          })
      )
      .then(
        res =>
          res.reduce<ISetComboBoxData>( (p, s) => {
            if (s) {
              return {
                ...p,
                ...s
              }
            }

            return p;
          }, {} as ISetComboBoxData)
      )
      .then(
        setSetComboBoxData
      )
    }
  }, [entity]);

  if (!entity) {
    return <div>ERModel isn't loaded or unknown entity {entityName}</div>;
  }

  if (!rs) {
    return <div>Loading...</div>;
  }

  const getNavigationAction = (delta: number) => (
    srcRs && (() => {
      deleteViewTab(false);
      const newRow = srcRs.moveBy(delta);
      dispatch(rsActions.setRecordSet(newRow));
      nextUrl.current = `/spa/gdmn/entity/${entityName}/edit/${newRow.pk2s().join('-')}`;
      history.push(nextUrl.current);
    })
  );

  const commandBarItems: ICommandBarItemProps[] = !rs ? [] : [
    {
      key: 'saveAndClose',
      disabled: !changed,
      text: 'Сохранить',
      iconProps: {
        iconName: 'Save'
      },
      onClick: () => {
        postChanges(true)
      }
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
          dispatch(rsActions.cancel({ name: rsName }));
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
        iconName: 'CheckMark'
      },
      onClick: () => postChanges(false)
    },
    {
      key: 'revert',
      disabled: !changed,
      text: 'Вернуть',
      iconProps: {
        iconName: 'Undo'
      },
      onClick: () => {
        lastEdited.current = undefined;
        if (rs.changed) {
          dispatch(rsActions.cancel({ name: rsName }));
          changedFields.current = {};
        }
        setChanged(false);
      }
    },
    {
      key: 'create',
      disabled: changed,
      text: 'Создать',
      iconProps: {
        iconName: 'PageAdd'
      },
      onClick: addRecord
    },
    {
      key: 'delete',
      text: 'Удалить',
      iconProps: {
        iconName: 'Delete'
      },
      onClick: deleteRecord
    },
    {
      key: 'prev',
      disabled: changed || !srcRs || !srcRs.currentRow,
      text: 'Предыдущая',
      iconProps: {
        iconName: 'Previous'
      },
      onClick: getNavigationAction(-1)
    },
    {
      key: 'next',
      disabled: changed || !srcRs || srcRs.currentRow === (srcRs.size - 1),
      text: 'Следующая',
      iconProps: {
        iconName: 'Next'
      },
      onClick: getNavigationAction(+1)
    },
    {
      key: 'designer',
      //disabled: changed,
      text: 'Дизайнер',
      iconProps: {
        iconName: 'Design'
      },
      onClick: () => {
        setDesigner(true);
        isDesigner.current = true;
      }
    },
  ].map( i => (locked || error) ? {...i, disabled: true} : i );

  const internalControl = ({ object, objects }: { object: Object, objects: Objects }): JSX.Element | undefined => {

    switch (object.type) {
      case 'LABEL':
        return (
          <Label
            key={object.name}
            styles={object2ILabelStyles(object, objects)}
          >
            {object.text}
          </Label>
        );

      case 'FIELD':
        const style = object2ITextFieldStyles(object, objects)
        return (
          <div key={object.name}>
            {
              field({styles: style, label: object.label, fieldName: object.fieldName})
            }
          </div>
        )

      case 'IMAGE':
        return (
          <div key={object.name}>
            <img
              src={object.url}
              alt={object.alt}
              style={object2style(object, objects)}
            />
          </div>
        )

      case 'FRAME':
        return (
          <div key={object.name}>
            {frameBox({frame: object, objects})}
          </div>
        )

      case 'BUTTON':
        return (
          <DefaultButton
            key={object.name}
            text={object.caption}
          />
        )

      default:
        return undefined;
    }
  };

  const frameBox = ({ frame, objects }: { frame: Object, objects: Objects }): JSX.Element | undefined => {
    if (isFrame(frame))
      return (
        <Frame
          key={frame.name}
          caption={frame.caption}
          border={frame.border}
          marginTop={frame.marginTop}
          marginRight={frame.marginRight}
          marginBottom={frame.marginBottom}
          marginLeft={frame.marginLeft}
          height={`${frame.height}px`}
          scroll={frame.scroll}
        >
          <Stack>
            {
              objects
                .filter( object => object.parent === frame.name )
                .map( object =>
                  internalControl({object, objects})
                )
            }
          </Stack>
        </Frame>
      )
    else
      return undefined;
  }

  const field = (props: { styles: Partial<ITextFieldStyles>, label: string, fieldName: string }): JSX.Element | undefined => {
    const fieldName = props.fieldName;
    const label = props.label;
    //Множество
    const data = setComboBoxData[fieldName];
    if (data) {
      const attrEntity = entity.attributes[fieldName] as EntityAttribute;
      const linkEntity = attrEntity.entities[0];
      return (
        <SetLookupComboBox
          key={fieldName}
          name={fieldName}
          label={label}
          preSelectedOption={data}
          getSessionData={
            () => {
              if (!controlsData.current) {
                controlsData.current = {};
              }
              return controlsData.current;
            }
          }
          onChanged={
            (option: IComboBoxOption[] | undefined) => {
              if (option) {
                setSetComboBoxData( {...setComboBoxData,
                  [fieldName]: option
                });
                setChanged(true);
                changedFields.current[fieldName] = true;
              };
              setValueErrors(clearEntityDataErrorMessage(fieldName, valueErrors));
            }
          }
          onLookup={
            async (filter: string, limit: number) => {
              const linkFields = linkEntity.pk.map( pk => new EntityLinkField(pk));
              const presentField = linkEntity.presentAttribute();
              if (presentField) {
                linkFields.push(new EntityLinkField(presentField));
              }

              const linkEq = new EntityQuery(
                new EntityLink(linkEntity, 'z', linkFields),
                new EntityQueryOptions(
                  limit + 1,
                  undefined,
                  filter ?
                    [{
                      contains: [
                        {
                          alias: 'z',
                          attribute: presentField!,
                          value: filter!
                        }
                      ]
                    }]
                  : undefined
                )
              );

              const response = await apiService.query({ query: linkEq.inspect() });
              const result = (response.payload.result!);
              const idAlias = Object.entries(result.aliases).find(([, data]) => data.linkAlias === 'z' && data.attribute === 'ID')![0];
              const nameAlias = Object.entries(result.aliases).find(([, data]) => data.linkAlias === 'z'
                && (data.attribute === presentField!.name))![0];
              return result.data.map((r): IComboBoxOption => ({
                key: r[idAlias],
                text: r[nameAlias]
              }));
            }
          }
          componentRef={
            ref => {
              if (ref && lastFocused.current === fieldName) {
                needFocus.current = ref;
              }
            }
          }
          onFocus={
            () => {
              lastFocused.current = fieldName;
              if (lastEdited.current && lastEdited.current.fieldName !== fieldName) {
                applyLastEdited();
              }
            }
          }
          styles={props.styles}
          errorMessage={getEntityDataErrorMessage(fieldName, valueErrors)}
        />
      )
    }

    const fd = getFieldDefByFieldName(fieldName, rs);

    if (!fd?.eqfa) {
      return undefined;
    }

    //Перечисление
    const attrEnum = entity.attributes[fd.eqfa.attribute] as EnumAttribute;
    if (attrEnum instanceof EnumAttribute) {
      const caption = attrEnum.values.find(e => e.value === rs.getString(fd.fieldName));
      return (
        <ComboBox
          label={label}
          key={fd.fieldName}
          options={attrEnum.values.map( (r): IComboBoxOption => ({
            key: r.value,
            text: r.lName ? getLName(r.lName, ['by', 'ru', 'en']) : r.value.toString()
          }))}
          text={caption && caption.lName
            ? getLName(caption.lName , ['by', 'ru', 'en'])
            : rs.getString(fd.fieldName)}
          allowFreeform
          autoComplete="on"
          componentRef={
            ref => {
              if (ref && lastFocused.current === fd.fieldName) {
                needFocus.current = ref;
              }
            }
          }
          onChange={ (_event: FormEvent<IComboBox>, option?: IComboBoxOption, _index?: number, _value?: string) => {
            lastEdited.current = {
              fieldName: fd.fieldName,
              value: option ? option.key.toString() : ''
            };
            changedFields.current[fd.fieldName] = true;
            setChanged(true);
            applyLastEdited();
            setValueErrors(clearEntityDataErrorMessage(fd.fieldName, valueErrors));
          }
        }
        onFocus={
          () => {
            lastFocused.current = fd.fieldName;
            if (lastEdited.current && lastEdited.current.fieldName !== fd.fieldName) {
              applyLastEdited();
            }
          }
        }
        errorMessage={getEntityDataErrorMessage(fd.fieldName, valueErrors)}
        />
      )
    }
    //Ссылка
    if (fd.eqfa.linkAlias !== rs.eq!.link.alias) {
      const fkFieldName = fd.eqfa.linkAlias;
      const refIdFieldAlias = fd.fieldName;
      const refNameFieldDef = rs.fieldDefs.find( fd2 => fd2.eqfa && fd2.eqfa.linkAlias === fd.eqfa!.linkAlias && fd2.eqfa.attribute !== 'ID');
      const refNameFieldAlias = refNameFieldDef ? refNameFieldDef.fieldName : '';
      const attr = entity.attributes[fkFieldName] as EntityAttribute;
      const linkEntity = attr.entities[0];
      if (attr instanceof EntityAttribute) {
        if (fd.eqfa.attribute === 'ID') {
          return (
            <LookupComboBox
              key={fd.fieldName}
              name={fd.fieldName}
              label={label}
              preSelectedOption={ rs.isNull(refIdFieldAlias)
                ? undefined
                : {
                  key: rs.getString(refIdFieldAlias),
                  text: refNameFieldAlias ? rs.getString(refNameFieldAlias) : rs.getString(refIdFieldAlias)
                }
              }
              getSessionData={
                () => {
                  if (!controlsData.current) {
                    controlsData.current = {};
                  }
                  return controlsData.current;
                }
              }
              onChanged={
                (option: IComboBoxOption | undefined) => {
                  if (!rs.isNull(refIdFieldAlias) || option) {
                    //При изменении поля-ссылки не меняется поле для отображения!
                    lastEdited.current = {
                      fieldName: refIdFieldAlias,
                      value: option ? option.key.toString() : ''
                    };
                    setChanged(true);
                    changedFields.current[refIdFieldAlias] = true;
                  };
                  setValueErrors(clearEntityDataErrorMessage(fd.fieldName, valueErrors));
                }
              }
              onFocus={
                () => {
                  lastFocused.current = fd.fieldName;
                  if (lastEdited.current && lastEdited.current.fieldName !== fd.fieldName) {
                    applyLastEdited();
                  }
                }
              }
              onLookup={
                async (filter: string, limit: number) => {
                  const linkFields = linkEntity.pk.map( pk => new EntityLinkField(pk));
                  const presentField = linkEntity.presentAttribute();
                  if (presentField) {
                    linkFields.push(new EntityLinkField(presentField));
                  }
                  const linkEq = new EntityQuery(
                    new EntityLink(linkEntity, 'z', linkFields),
                    new EntityQueryOptions(
                      limit + 1,
                      undefined,
                      filter ?
                        [{
                          contains: [
                            {
                              alias: 'z',
                              attribute: presentField!,
                              value: filter!
                            }
                          ]
                        }]
                      : undefined
                    )
                  );
                  const response = await apiService.query({ query: linkEq.inspect() });
                  const result = (response.payload.result!);
                  const idAlias = Object.entries(result.aliases).find(([, data]) => data.linkAlias === 'z' && data.attribute === 'ID')![0];
                  const nameAlias = Object.entries(result.aliases).find(([, data]) => data.linkAlias === 'z'
                    && (data.attribute === presentField!.name))![0];
                  return result.data.map((r): IComboBoxOption => ({
                    key: r[idAlias],
                    text: r[nameAlias]
                  }));
                }
              }
              componentRef={
                ref => {
                  if (ref && lastFocused.current === fd.fieldName) {
                    needFocus.current = ref;
                  }
                }
              }
              styles={props.styles}
              errorMessage={getEntityDataErrorMessage(fd.fieldName, valueErrors)}
            />
          );
        } else {
           //Текстовое
          return (
            <TextField
              key={fd.fieldName}
              disabled={locked}
              readOnly={true}
              label={label}
              defaultValue={
                lastEdited.current && lastEdited.current.fieldName === fd.fieldName && typeof lastEdited.current.value === 'string'
                ? lastEdited.current.value
                : rs.getString(fd.fieldName)
              }
              styles={props.styles}
            />
          )
        }
      }
    }

    if (fd.eqfa.linkAlias !== rs.eq!.link.alias) {
      return undefined;
    }
    //Дата
    if (fd.dataType === TFieldType.Date) {
      return (
        <DatepickerJSX
          key={`${fd.fieldName}`}
          label={label}
          fieldName={`${fd.fieldName}`}
          value={lastEdited.current && lastEdited.current.fieldName === fd.fieldName ? String(lastEdited.current.value) : rs.getString(fd.fieldName)}
          onChange={
            (newValue?: string) => {
              if (newValue !== undefined) {
                lastEdited.current = {
                  fieldName: fd.fieldName,
                  value: newValue
                };
                changedFields.current[fd.fieldName] = true;
                setChanged(true);
              };
              setValueErrors(clearEntityDataErrorMessage(fd.fieldName, valueErrors));
            }
          }
          onFocus={
            () => {
              lastFocused.current = fd.fieldName;
              if (lastEdited.current && lastEdited.current.fieldName !== fd.fieldName) {
                applyLastEdited();
              }
            }
          }
          componentRef={
            ref => {
              if (ref && lastFocused.current === fd.fieldName) {
                needFocus.current = ref;
              }
            }
          }
          styles={props.styles}
          errorMessage={getEntityDataErrorMessage(fd.fieldName, valueErrors)}
        />
      );
    } else if (fd.dataType === TFieldType.Boolean) {
      const subComponentStyle = {
        root: {marginTop: '10px'},
        borderWidth: '1px'
      };
      //Логическое
      return (
        <Checkbox
          key={fd.fieldName}
          disabled={locked}
          label={label}
          defaultChecked={lastEdited.current && lastEdited.current.fieldName === fd.fieldName ? !!lastEdited.current.value : rs.getBoolean(fd.fieldName)}
          onChange={  (_ev?: React.FormEvent<HTMLElement>, isChecked?: boolean) => {
            if (isChecked !== undefined) {
              lastEdited.current = {
                fieldName: fd.fieldName,
                value: isChecked
              };
              changedFields.current[fd.fieldName] = true;
              setChanged(true);
            };
          }}
          onFocus={
            () => {
              lastFocused.current = fd.fieldName;
              if (lastEdited.current && lastEdited.current.fieldName !== fd.fieldName) {
                applyLastEdited();
              }
            }
          }
          componentRef={
            ref => {
              if (ref && lastFocused.current === fd.fieldName) {
                needFocus.current = ref;
              }
            }
          }
          styles={subComponentStyle}
        />
      )
    } else if (fd.dataType === TFieldType.String) {
      //Текстовое
      return (
        <TextField
          key={fd.fieldName}
          disabled={locked}
          label={label}
          defaultValue={
            lastEdited.current && lastEdited.current.fieldName === fd.fieldName && typeof lastEdited.current.value === 'string'
            ? lastEdited.current.value
            : rs.getString(fd.fieldName)
          }
          onChange={
            (_e, newValue?: string) => {
              if (newValue !== undefined) {
                lastEdited.current = {
                  fieldName: fd.fieldName,
                  value: newValue
                };
                changedFields.current[fd.fieldName] = true;
                setChanged(true);
              };
              setValueErrors(clearEntityDataErrorMessage(fd.fieldName, valueErrors));
            }
          }
          onFocus={
            () => {
              lastFocused.current = fd.fieldName;
              if (lastEdited.current && lastEdited.current.fieldName !== fd.fieldName) {
                applyLastEdited();
              }
            }
          }
          componentRef={
            ref => {
              if (ref && lastFocused.current === fd.fieldName) {
                needFocus.current = ref;
              }
            }
          }
          styles={props.styles}
          errorMessage={getEntityDataErrorMessage(fd.fieldName, valueErrors)}
        />
      )
    } else {
      //Числовое
      return (
        <NumberField
          key={fd.fieldName}
          label={label}
          onlyInteger={fd.dataType === TFieldType.Integer}
          value={
            lastEdited.current && lastEdited.current.fieldName === fd.fieldName && typeof lastEdited.current.value === 'number'
            ? lastEdited.current.value
            : rs.getValue(fd.fieldName) === null ? undefined : rs.getValue(fd.fieldName) as number
         }
          errorMessage={getEntityDataErrorMessage(fd.fieldName, valueErrors)}
          styles={props.styles}
          onChange={ newValue => {
            if (newValue !== undefined) {
              lastEdited.current = {
                fieldName: fd.fieldName,
                value: newValue.toString()
              };
              changedFields.current[fd.fieldName] = true;
              setChanged(true);
            };
            setValueErrors(clearEntityDataErrorMessage(fd.fieldName, valueErrors));
          }}
          onFocus={
            () => {
              lastFocused.current = fd.fieldName;
              if (lastEdited.current && lastEdited.current.fieldName !== fd.fieldName) {
                applyLastEdited();
              }
            }
          }
          componentRef={
            ref => {
              if (ref && lastFocused.current === fd.fieldName) {
                needFocus.current = ref;
              }
            }
          }
          onInvalidValue={() => {
            const errs = clearEntityDataErrorMessage(fd.fieldName, valueErrors);
            setValueErrors(errs ? [...errs, {field: fd.fieldName, message: 'Invalid value'}] : [{field: fd.fieldName, message: 'Invalid value'}])}
          }
        />
      )
    }
  }

  const grid: IGrid = setting ? setting.grid : {
    columns: [{ unit: 'PX', value: 320 }],
    rows: [{ unit: 'FR', value: 1 }],
  };

  const fields: Objects = getFields(rs, entity);

  const setFields: Objects = getSetFields(setComboBoxData, entity);

  const area1: IArea[] = !setting ? [{
    name: 'Area1',
    type: 'AREA',
    parent: 'Window',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0
  }]
  : getAreas(setting.objects).sort();

  const window: IWindow = setting
    ? setting.objects.find(obj => isWindow(obj)) as IWindow
    : {
        name: 'Window',
        type: 'WINDOW'
      };

  const objects: Objects = setting ? setting.objects : [window, ...area1, ...fields, ...setFields];

  return (
    <>
      {
        designer
          ? <DesignerContainer
              url={url}
              entityName={entityName}
              setting={setting}
              setComboBoxData={setComboBoxData}
              onSaveSetting={ setting => setSetting(setting) }
              onDeleteSetting={ () => setSetting(undefined) }
              onExit={ () => setDesigner(false) }
            />
          : <>
            <CommandBar items={commandBarItems} />
            {
              error
              &&
              <MessageBar
                messageBarType={MessageBarType.error}
                isMultiline={false}
                onDismiss={ () => viewTab && dispatch(gdmnActions.updateViewTab({ url, viewTab: { error: undefined } })) }
                dismissButtonAriaLabel="Close"
              >
                {error}
              </MessageBar>
            }
            <div styleName="ScrollableDlg" style={{ backgroundColor: getTheme().semanticColors.bodyBackground, height: 'calc(100% - 44px)' }}>
              <div
                style = {{
                  display: 'grid',
                  width: '100%',
                  height: '100%',
                  gridTemplateColumns: '1fr',
                  gridTemplateRows: '1fr',
                  ...object2style(window, objects)
                }}
              >
                  <div
                    style={{
                      display: 'grid',
                      width: '100%',
                      paddingLeft: '4px',
                      paddingRight: '4px',
                      paddingBottom: '4px',
                      gridTemplateColumns: grid.columns.map(c => c.unit === 'AUTO' ? 'auto' : `${c.value ? c.value : 1}${c.unit}`).join(' '),
                      gridTemplateRows: grid.rows.map(r => r.unit === 'AUTO' ? 'auto' : `${r.value ? r.value : 1}${r.unit}`).join(' '),
                    }}
                  >
                    {
                      getAreas(objects).map( area =>
                        <div
                          key={area.name}
                          style={{
                            ...object2style(area, objects),
                            gridArea: `${area.top + 1} / ${area.left + 1} / ${area.bottom + 2} / ${area.right + 2}`,
                            padding: '4px',
                            borderRadius: '4px'
                          }}
                        >
                          <Stack horizontal={area.horizontal}>
                            {
                              objects
                                .filter( object => object.parent === area.name )
                                .map( object =>
                                  internalControl({object, objects})
                                )
                            }
                          </Stack>
                        </div>
                      )
                    }
                  </div>
                </div>
            </div>
          </>
      }
    </>
  );
}, styles, { allowMultiple: true });
