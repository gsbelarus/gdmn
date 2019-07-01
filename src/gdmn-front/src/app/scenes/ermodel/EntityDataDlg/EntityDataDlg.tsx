import { IEntityDataDlgProps } from "./EntityDataDlg.types";
import React, { useEffect, useState, useCallback, useRef } from "react";
import CSSModules from 'react-css-modules';
import styles from './styles.css';
import { CommandBar, ICommandBarItemProps, TextField, ITextField, IComboBoxOption, IComboBox, MessageBar, MessageBarType } from "office-ui-fabric-react";
import { gdmnActions } from "../../gdmn/actions";
import { rsActions, RecordSet, IDataRow, TCommitResult, TRowState, IFieldDef } from "gdmn-recordset";
import {prepareDefaultEntityQuery, attr2fd} from "../EntityDataView/utils";
import { apiService } from "@src/app/services/apiService";
import { List } from "immutable";
import { LookupComboBox } from "@src/app/components/LookupComboBox/LookupComboBox";
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

interface ILastEdited {
  fieldName: string;
  value: string;
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

  const lastEdited = useRef(getSavedLastEdit());
  const lastFocused = useRef(getSavedLastFocused());
  const controlsData = useRef(getSavedControlsData());
  const changedFields = useRef(getSavedChangedFields());
  const nextUrl = useRef(url);
  const needFocus = useRef<ITextField | IComboBox | undefined>();
  const [changed, setChanged] = useState(!!((rs && rs.changed) || lastEdited.current || newRecord));

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
      dispatch(rsActions.setRecordSet(rs.setString(fieldName, value)));
      lastEdited.current = undefined;
    }
  };

  const postChanges = useCallback( (close: boolean) => {
    if (rs && changed && entity) {
      let tempRs = rs;

      if (lastEdited.current) {
        const { fieldName, value } = lastEdited.current;
        tempRs = tempRs.setString(fieldName, value);
        lastEdited.current = undefined;
      }

      const fields: IEntityUpdateFieldInspector[] = Object.keys(changedFields.current).map( fieldName => {
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
  }, [rs, changed]);

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
          changedFields: changedFields.current
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
        iconName: 'Save'
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
  ].map( i => (locked || error) ? {...i, disabled: true} : i );

  return (
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
      <div styleName="ScrollableDlg">
        <div styleName="FieldsColumn">
          {
            rs.fieldDefs.map( fd => {
              if (!fd.eqfa) {
                return null;
              }
              if (fd.eqfa.linkAlias !== rs.eq!.link.alias && fd.eqfa.attribute === 'ID') {
                const fkFieldName = fd.eqfa.linkAlias;
                const refIdFieldAlias = fd.fieldName;
                const refNameFieldDef = rs.fieldDefs.find( fd2 => !!fd2.eqfa && fd2.eqfa.linkAlias === fd.eqfa!.linkAlias && fd2.eqfa.attribute !== 'ID');
                const refNameFieldAlias = refNameFieldDef ? refNameFieldDef.fieldName : '';
                const attr = entity.attributes[fkFieldName] as EntityAttribute;
                const linkEntity = attr.entities[0];
                if (attr instanceof SetAttribute) {
                  return (
                    <SetLookupComboBox
                      key={fkFieldName}
                      name={fkFieldName}
                      label={`${fd.caption}-${fd.fieldName}-${fd.eqfa.attribute}`}
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
                      onFocus={
                        () => {
                          lastFocused.current = fd.fieldName;
                          if (lastEdited.current && lastEdited.current.fieldName !== fd.fieldName) {
                            applyLastEdited();
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
                          if (ref && lastFocused.current === fd.fieldName) {
                            needFocus.current = ref;
                          }
                        }
                      }
                    />
                  );

                } else {
                  return (
                    <LookupComboBox
                      key={fkFieldName}
                      name={fkFieldName}
                      label={`${fd.caption}-${fd.fieldName}-${fd.eqfa.attribute}`}
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
                          let changedRs = rs;
                          if (option) {
                            changedRs = changedRs.setValue(refIdFieldAlias, option.key);
                            if (refNameFieldAlias) {
                              changedRs = changedRs.setValue(refNameFieldAlias, option.text);
                            }
                          } else {
                            changedRs = changedRs.setNull(refIdFieldAlias);
                            if (refNameFieldAlias) {
                              changedRs = changedRs.setNull(refNameFieldAlias);
                            }
                          }
                          dispatch(rsActions.setRecordSet(changedRs));
                          setChanged(true);
                          changedFields.current[refIdFieldAlias] = true;
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
                              const idAlias = Object.entries(result.aliases).find( ([, data]) => data.linkAlias === 'z' && data.attribute === 'ID' )![0];
                              const nameAlias = Object.entries(result.aliases).find( ([, data]) => data.linkAlias === 'z'
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
                          if (ref && lastFocused.current === fd.fieldName) {
                            needFocus.current = ref;
                          }
                        }
                      }
                    />
                  );
                }
              }

              if (fd.eqfa.linkAlias !== rs.eq!.link.alias) {
                return null;
              }

              if (fd.dataType === 5) {
                return (
                  <DatepickerJSX
                    key={lastEdited.current && lastEdited.current.fieldName === fd.fieldName ? lastEdited.current.value : rs.getString(fd.fieldName)}
                    fieldName={`${fd.fieldName}`}
                    label={`${fd.caption}-${fd.fieldName}-${fd.eqfa.attribute}`}
                    value={lastEdited.current && lastEdited.current.fieldName === fd.fieldName ? lastEdited.current.value : rs.getString(fd.fieldName)}
                    onChange={
                      (newValue?: string) => {
                        if (newValue !== undefined) {
                          lastEdited.current = {
                            fieldName: fd.fieldName,
                            value: newValue
                          };
                          changedFields.current[fd.fieldName] = true;
                          setChanged(true);
                        }
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
                  />
                );
              } else {
                return (
                  <TextField
                    key={fd.fieldName}
                    disabled={locked}
                    label={`${fd.caption}-${fd.fieldName}-${fd.eqfa.attribute}`}
                    value={lastEdited.current && lastEdited.current.fieldName === fd.fieldName ? lastEdited.current.value : rs.getString(fd.fieldName)}
                    onChange={
                      (_e, newValue?: string) => {
                        if (newValue !== undefined) {
                          lastEdited.current = {
                            fieldName: fd.fieldName,
                            value: newValue
                          };
                          changedFields.current[fd.fieldName] = true;
                          setChanged(true);
                        }
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
                  />
                )
              }
            })
          }
        </div>
      </div>
    </>
  );
}, styles, { allowMultiple: true });
