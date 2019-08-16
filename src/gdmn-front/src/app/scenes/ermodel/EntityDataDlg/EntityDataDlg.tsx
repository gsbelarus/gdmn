import { IEntityDataDlgProps } from "./EntityDataDlg.types";
import React, { useEffect, useState, useCallback, useRef } from "react";
import CSSModules from 'react-css-modules';
import styles from './styles.css';
import { CommandBar, ICommandBarItemProps, TextField, ITextField, IComboBoxOption, IComboBox, MessageBar, MessageBarType, Checkbox, ICheckbox, getTheme, Label, IconButton, Image } from "office-ui-fabric-react";
import { gdmnActions } from "../../gdmn/actions";
import { rsActions, RecordSet, IDataRow, TCommitResult, TRowState, IFieldDef, TFieldType } from "gdmn-recordset";
import {
  prepareDefaultEntityQuery,
  attr2fd,
  prepareDefaultEntityQuerySetAttr
} from "../EntityDataView/utils";
import { apiService } from "@src/app/services/apiService";
import { List } from "immutable";
import {
  EntityQuery,
  EntityLink,
  EntityQueryOptions,
  IEntityUpdateFieldInspector,
  ScalarAttribute,
  SetAttribute,
  EntityAttribute,
  EntityLinkField,
  IEntityQueryResponse
} from "gdmn-orm";
import { ISessionData } from "../../gdmn/types";
import { DatepickerJSX } from '@src/app/components/Datepicker/Datepicker';
import { SetLookupComboBox } from "@src/app/components/SetLookupComboBox/SetLookupComboBox";
import { Designer, IDesignerState, IStyleFieldsAndAreas, TDirection } from '../../designer/Designer';

interface ILastEdited {
  fieldName: string;
  value: string | boolean ;
};

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

  const addViewTab = (recordSet: RecordSet | undefined) => {
    dispatch(gdmnActions.addViewTab({
      url,
      caption: `${entityName}-${id}`,
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
      if (typeof value === "boolean") {
        dispatch(rsActions.setRecordSet(rs.setBoolean(fieldName, value)));
      } else {
        dispatch(rsActions.setRecordSet(rs.setString(fieldName, value)));
      }
      lastEdited.current = undefined;
    }
  };

  const postChanges = useCallback( (close: boolean) => {
    if (rs && changed && entity) {
      let tempRs = rs;

      if (lastEdited.current) {
        const { fieldName, value } = lastEdited.current;
        if (typeof value === "boolean") {
          tempRs = tempRs.setBoolean(fieldName, value);
        } else {
          tempRs = tempRs.setString(fieldName, value);
        }
        lastEdited.current = undefined;
      }

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
  }, [rs]);

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
                  const scalarAttrs = Object.values(linkEntity.attributes)
                    .filter((attr) => attr instanceof ScalarAttribute && attr.type !== "Blob");

                  const presentField = scalarAttrs.find((attr) => attr.name === "NAME")
                    || scalarAttrs.find((attr) => attr.name === "USR$NAME")
                    || scalarAttrs.find((attr) => attr.name === "ALIAS")
                    || scalarAttrs.find((attr) => attr.type === "String");

                  const idAlias = Object.entries(result.aliases).find(([, data]) => data.linkAlias === attr.name && data.attribute === 'ID')![0];
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
      disabled: changed,
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
  
  const localState = localStorage.getItem(`des-${entityName}`) === null ? undefined : JSON.parse(localStorage.getItem(`des-${entityName}`)!);

  const getGridStyle = (): React.CSSProperties => ({
    display: 'grid',
    width: '100%',
    gridTemplateColumns: (localState as IDesignerState).grid.columns.map( c => c.unit === 'AUTO' ? 'auto' : `${c.value ? c.value : 1}${c.unit}` ).join(' '),
    gridTemplateRows: (localState as IDesignerState).grid.rows.map( r => r.unit === 'AUTO' ? 'auto' : `${r.value ? r.value : 1}${r.unit}` ).join(' '),
    overflow: 'auto',
  });

  const field = (props: { fd: IFieldDef, field?: string, areaStyle?: IStyleFieldsAndAreas, areaDirection?: TDirection }): JSX.Element | undefined => {
      if (!props.fd.eqfa) {
        return undefined;
      }
      if (props.fd.eqfa.linkAlias !== rs.eq!.link.alias && props.fd.eqfa.attribute === 'ID') {
        const fkFieldName = props.fd.eqfa.linkAlias;
        const refIdFieldAlias = props.fd.fieldName;
        const refNameFieldDef = rs.fieldDefs.find( fd2 => !!fd2.eqfa && fd2.eqfa.linkAlias === props.fd.eqfa!.linkAlias && fd2.eqfa.attribute !== 'ID');
        const refNameFieldAlias = refNameFieldDef ? refNameFieldDef.fieldName : '';
        const attr = entity.attributes[fkFieldName] as EntityAttribute;
        const linkEntity = attr.entities[0];
        if (attr instanceof EntityAttribute) {
          return (
            <SetLookupComboBox
              key={fkFieldName}
              name={fkFieldName}
              label={`${props.fd.caption}-${props.fd.fieldName}-${props.fd.eqfa.attribute}`}
              preSelectedOption={ rs.isNull(refIdFieldAlias)
                ? undefined
                : [{
                  key: rs.getString(refIdFieldAlias),
                  text: refNameFieldAlias ? rs.getString(refNameFieldAlias) : rs.getString(refIdFieldAlias)
                }]
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
                (option: IComboBoxOption[] | undefined) => {
                  if (option) {
                    setSetComboBoxData( {...setComboBoxData,
                      [fkFieldName]: option
                    });
                    setChanged(true);
                    changedFields.current[fkFieldName] = true;
                  }
                }
              }
              onLookup={
                (filter: string, limit: number) => {
                  const linkFields = linkEntity.pk.map( pk => new EntityLinkField(pk));
                  const scalarAttrs = Object.values(linkEntity.attributes)
                    .filter((attr) => attr instanceof ScalarAttribute && attr.type !== "Blob");

                  const presentField = scalarAttrs.find((attr) => attr.name === "NAME")
                    || scalarAttrs.find((attr) => attr.name === "USR$NAME")
                    || scalarAttrs.find((attr) => attr.name === "ALIAS")
                    || scalarAttrs.find((attr) => attr.type === "String");
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
                  return apiService.query({ query: linkEq.inspect() })
                    .then( response => {
                      const result = response.payload.result!;
                      const idAlias = Object.entries(result.aliases).find( ([fieldAlias, data]) => data.linkAlias === 'z' && data.attribute === 'ID' )![0];
                      const nameAlias = Object.entries(result.aliases).find( ([fieldAlias, data]) => data.linkAlias === 'z'
                        && (data.attribute === presentField!.name))![0];
                      return result.data.map( (r): IComboBoxOption => ({
                        key: r[idAlias],
                        text: r[nameAlias]
                      }));
                    });
                }
              }
              componentRef={
                ref => {
                  if (ref && lastFocused.current === props.fd.fieldName) {
                    needFocus.current = ref;
                  }
                }
              }
              styles={props.areaStyle === undefined ? undefined : {
                  root: {
                    background: props.areaStyle!.background
                  },
                  input: {
                    background: props.areaStyle!.background
                  }
                }}
            />
          );
        }
      }

      if (props.fd.eqfa.linkAlias !== rs.eq!.link.alias) {
        return undefined;
      }

      if (props.fd.dataType === TFieldType.Date) {
        return (
          <DatepickerJSX
            key={`${props.fd.fieldName}`}
            fieldName={`${props.fd.fieldName}`}
            label={`${props.fd.caption}-${props.fd.fieldName}-${props.fd.eqfa.attribute}`}
            value={lastEdited.current && lastEdited.current.fieldName === props.fd.fieldName ? String(lastEdited.current.value) : rs.getString(props.fd.fieldName)}
            onChange={
              (newValue?: string) => {
                if (newValue !== undefined) {
                  lastEdited.current = {
                    fieldName: props.fd.fieldName,
                    value: newValue
                  };
                  changedFields.current[props.fd.fieldName] = true;
                  setChanged(true);
                }
              }
            }
            onFocus={
              () => {
                lastFocused.current = props.fd.fieldName;
                if (lastEdited.current && lastEdited.current.fieldName !== props.fd.fieldName) {
                  applyLastEdited();
                }
              }
            }
            componentRef={
              ref => {
                if (ref && lastFocused.current === props.fd.fieldName) {
                  needFocus.current = ref;
                }
              }
            }
            styles={props.areaStyle === undefined ? undefined : {
              root: {
                background: props.areaStyle!.background
              },
              fieldGroup: {
                background: props.areaStyle!.background
              }
            }}
            styleIcon={props.areaStyle === undefined ? undefined : {
              root: {
                border: '1px solid',
                borderColor: getTheme().semanticColors.inputBorder,
                borderLeft: 'none'
              },
              rootHovered: {
                border: '1px solid',
                borderColor: getTheme().semanticColors.inputBorder,
                borderLeft: 'none'
              },
              rootChecked: {
                border: '1px solid',
                borderColor: getTheme().semanticColors.inputBorder,
                borderLeft: 'none'
              },
              rootCheckedHovered: {
                border: '1px solid',
                borderColor: getTheme().semanticColors.inputBorder,
                borderLeft: 'none'
              }
            }}
        />);
      } else if (props.fd.dataType === TFieldType.Boolean) {
        const subComponentStyle = {
          root: {marginTop: '10px'},
          borderWidth: '1px'
        };
        return (
          <Checkbox
            key={props.fd.fieldName}
            disabled={locked}
            label={`${props.fd.caption}-${props.fd.fieldName}-${props.fd.eqfa.attribute}`}
            defaultChecked={lastEdited.current && lastEdited.current.fieldName === props.fd.fieldName ? !!lastEdited.current.value : rs.getBoolean(props.fd.fieldName)}
            onChange={  (_ev?: React.FormEvent<HTMLElement>, isChecked?: boolean) => {
              if (isChecked !== undefined) {
                lastEdited.current = {
                  fieldName: props.fd.fieldName,
                  value: isChecked
                };
                changedFields.current[props.fd.fieldName] = true;
                setChanged(true);
              }
            }}
            onFocus={
              () => {
                lastFocused.current = props.fd.fieldName;
                if (lastEdited.current && lastEdited.current.fieldName !== props.fd.fieldName) {
                  applyLastEdited();
                }
              }
            }
            componentRef={
              ref => {
                if (ref && lastFocused.current === props.fd.fieldName) {
                  needFocus.current = ref;
                }
              }
            }
            styles={subComponentStyle}
          />
        )
      } else {
        return (
          <TextField
            key={props.fd.fieldName}
            disabled={locked}
            label={`${props.fd.caption}-${props.fd.fieldName}-${props.fd.eqfa.attribute}`}
            styles={props.areaStyle === undefined ? undefined : {
              root: {
                background: props.areaStyle!.background
              },
              fieldGroup: {
                background: props.areaStyle!.background
              },
              field: {
                background: props.areaStyle!.background
              }
            }}
            defaultValue={
              lastEdited.current && lastEdited.current.fieldName === props.fd.fieldName && typeof lastEdited.current.value === 'string'
              ? lastEdited.current.value
              : rs.getString(props.fd.fieldName)
            }
            onChange={
              (_e, newValue?: string) => {
                if (newValue !== undefined) {
                  lastEdited.current = {
                    fieldName: props.fd.fieldName,
                    value: newValue
                  };
                  changedFields.current[props.fd.fieldName] = true;
                  setChanged(true);
                }
              }
            }
            onFocus={
              () => {
                lastFocused.current = props.fd.fieldName;
                if (lastEdited.current && lastEdited.current.fieldName !== props.fd.fieldName) {
                  applyLastEdited();
                }
              }
            }
            componentRef={
              ref => {
                if (ref && lastFocused.current === props.fd.fieldName) {
                  needFocus.current = ref;
                }
              }
            }
          />
        )
      }
    }

  return (
    <>
      {
        designer
          ? <Designer
            entityName={entityName}
            fields={rs.fieldDefs}
            outDesigner={() => { setDesigner(false); isDesigner.current = false; }}
            viewTab={viewTab}
            rs={rs}
            entity={entity}
          />
          :
          <>
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
          <div styleName="ScrollableDlg" style={{ backgroundColor: getTheme().semanticColors.bodyBackground }}>
            {
              localState !== undefined ?
              <div
                style={getGridStyle()}
                tabIndex={0}
              >
                {
              (localState as IDesignerState).areas.map( (area, idx) =>
              {
                const theme = getTheme();
                const background = Object.values(theme.palette)[Object.keys(theme.palette).findIndex(color => color === (localState as IDesignerState).areas[idx].style!.background)]
                const borderColor = Object.values(theme.palette)[Object.keys(theme.palette).findIndex(color => color === (localState as IDesignerState).areas[idx].style!.border.color)]
                const areaStyle = (localState as IDesignerState).areas[idx].style;
                return (
                <div
                  key={`${area.rect.top}-${area.rect.left}-${area.rect.bottom}-${area.rect.right}`}
                  className={
                    "commonStyle"
                  }
                  style={{
                    gridArea: `${area.rect.top + 1} / ${area.rect.left + 1} / ${area.rect.bottom + 2} / ${area.rect.right + 2}`,
                    display: 'flex',
                    flexDirection: area.direction,
                    justifyContent: 'flex-start',
                    flexWrap: 'wrap',
                    alignContent: 'flex-start',  
                    background: background,
                    margin: areaStyle && areaStyle.margin ? `${areaStyle.margin}px` : '1px',
                    padding: areaStyle && areaStyle.padding ? `${areaStyle.padding}px` : '4px',
                    border: areaStyle!.border.style === 'none'
                      ? `1px solid ${areaStyle!.background}`
                      : `${areaStyle!.border.width}px ${areaStyle!.border.style} ${borderColor}`,
                    borderRadius: areaStyle && areaStyle.border.radius ? `${areaStyle.border.radius}px` : undefined
                  }}
                >
                  {
                    area.fields.map( f =>
                      {
                        let fd = rs.fieldDefs.find(fieldDef =>
                          `${fieldDef.caption}-${fieldDef.fieldName}-${fieldDef.eqfa!.attribute}` === f
                        )
                        if (fd) {
                          return <div style={{minWidth: '64px', width: area.direction === 'row' ? undefined : '100%'}}>{field({fd: fd, field: f, areaStyle: areaStyle!, areaDirection: area.direction})}</div>
                        }
                        const additionallyObject = (localState as IDesignerState).additionallyObject!;
                        return additionallyObject!.texts && additionallyObject!.texts.find(text => text === f)
                          ? <Label key={f} style={{minWidth: '64px', width: area.direction === 'row' ? undefined : '100%'}}>{f}</Label>
                          : additionallyObject!.images && additionallyObject!.images.find(image => image === f)
                            ? <Image key={f} height={100} width={100} src={f} alt='Text' />
                            : additionallyObject!.icons && additionallyObject!.icons.find(icon => icon === f)
                              ? <IconButton key={f} iconProps={{ iconName: f }} />
                              : undefined
                      }
                    )
                  }
                </div>
                )})
                }
              </div>
            :
              <div styleName="FieldsColumn" style={{top: '0px'}}>
                {Object.entries(setComboBoxData).map( ([setAttrName, data], idx) => {
                  const attr = entity.attributes[setAttrName] as EntityAttribute;
                  const linkEntity = attr.entities[0];
                  return (
                    <SetLookupComboBox
                      key={setAttrName}
                      name={setAttrName}
                      label={setAttrName}
                      preSelectedOption={data ? data : undefined}
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
                              [setAttrName]: option
                            });
                            setChanged(true);
                            changedFields.current[setAttrName] = true;
                          }
                        }
                      }
                      onLookup={
                        (filter: string, limit: number) => {
                          const linkFields = linkEntity.pk.map( pk => new EntityLinkField(pk));
                          const scalarAttrs = Object.values(linkEntity.attributes)
                            .filter((attr) => attr instanceof ScalarAttribute && attr.type !== "Blob");

                          const presentField = scalarAttrs.find((attr) => attr.name === "NAME")
                            || scalarAttrs.find((attr) => attr.name === "USR$NAME")
                            || scalarAttrs.find((attr) => attr.name === "ALIAS")
                            || scalarAttrs.find((attr) => attr.type === "String");
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
                          return apiService.query({ query: linkEq.inspect() })
                            .then( response => {
                              const result = response.payload.result!;
                              const idAlias = Object.entries(result.aliases).find( ([fieldAlias, data]) => data.linkAlias === 'z' && data.attribute === 'ID' )![0];
                              const nameAlias = Object.entries(result.aliases).find( ([fieldAlias, data]) => data.linkAlias === 'z'
                                && (data.attribute === presentField!.name))![0];
                              return result.data.map( (r): IComboBoxOption => ({
                                key: r[idAlias],
                                text: r[nameAlias]
                              }));
                            });
                        }
                      }
                      componentRef={
                        ref => {
                          if (ref && lastFocused.current === linkEntity.name) {
                            needFocus.current = ref;
                          }
                        }
                      }
                    />
                  )

                })}
                {
                  rs.fieldDefs.map( fd => {
                    return field({fd})
                  })
                }
              </div>
              }
            </div>
          </>
      }
    </>
  );
}, styles, { allowMultiple: true });
