import { IEntityDataDlgProps } from "./EntityDataDlg.types";
import React, { useEffect, useState, useCallback, useRef } from "react";
import CSSModules from 'react-css-modules';
import styles from './styles.css';
import { CommandBar, ICommandBarItemProps, TextField, ITextField, IComboBoxOption, IComboBox, MessageBar, MessageBarType } from "office-ui-fabric-react";
import { gdmnActions } from "../../gdmn/actions";
import { rsActions, RecordSet, IDataRow, TCommitResult, TRowState } from "gdmn-recordset";
import { prepareDefaultEntityQuery, attr2fd } from "../EntityDataView/utils";
import { apiService } from "@src/app/services/apiService";
import { List } from "immutable";
import { LookupComboBox } from "@src/app/components/LookupComboBox/LookupComboBox";
import {
  EntityQuery,
  EntityLink,
  EntityLinkField,
  EntityQueryOptions,
  EntityAttribute,
  IEntityUpdateFieldInspector,
  ScalarAttribute
} from "gdmn-orm";
import { ISessionData } from "../../gdmn/types";

interface ILastEdited {
  fieldName: string;
  value: string;
};

interface IChangedFields {
  [fieldName: string]: boolean;
};

export const EntityDataDlg = CSSModules( (props: IEntityDataDlgProps): JSX.Element => {

  const { url, entityName, id, rs, entity, dispatch, history, srcRs, viewTab } = props;
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

  const lastEdited = useRef(getSavedLastEdit());
  const lastFocused = useRef(getSavedLastFocused());
  const controlsData = useRef(getSavedControlsData());
  const nextUrl = useRef(url);
  const needFocus = useRef<ITextField | IComboBox | undefined>();
  const [changed, setChanged] = useState(!!((rs && rs.changed) || lastEdited.current));
  const changedFields = useRef<IChangedFields>({});

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

  const postChanges = useCallback( async () => {
    if (rs && changed) {
      let tempRS = rs;

      if (lastEdited.current) {
        const { fieldName, value } = lastEdited.current;
        tempRS = tempRS.setString(fieldName, value);
        lastEdited.current = undefined;
      }

      tempRS = tempRS.setLocked(true);

      dispatch(rsActions.setRecordSet(tempRS));

      const fields: IEntityUpdateFieldInspector[] = Object.keys(changedFields.current).map( fieldName => ({
        attribute: tempRS.getFieldDef(fieldName).eqfa!.attribute,
        value: tempRS.getValue(fieldName)
      }));

      if (fields.length) {
        await apiService.update({
          update: {
            entity: entityName,
            fields,
            pkValues: [parseInt(id)]
          }
        });
      }

      changedFields.current = {};
      setChanged(false);

      tempRS = await tempRS.post( _ => Promise.resolve(TCommitResult.Success), true);

      dispatch(rsActions.setRecordSet(tempRS));

      if (srcRs && !srcRs.locked) {
        const foundRows = srcRs.locate(tempRS.getObject(tempRS.pk.map( fd => fd.fieldName )), true);
        if (foundRows.length && srcRs.getRowState(foundRows[0]) === TRowState.Normal) {
          dispatch(rsActions.setRecordSet(srcRs.set(tempRS.getObject(), foundRows[0])));
        }
      }
    }
  }, [rs, changed]);

  const deleteRecord = useCallback( () => {
    const srcRsName = srcRs ? srcRs.name : undefined;

    dispatch( async (dispatch, getState) => {
      const rs = getState().recordSet[rsName];

      if (!rs) {
        return;
      }

      dispatch(rsActions.setRecordSet(rs.setLocked(true)));

      if (srcRsName) {
        const srcRs = getState().recordSet[srcRsName];
        if (srcRs) {
          dispatch(rsActions.setRecordSet(srcRs.setLocked(true)));
        }
      }

      const result = await apiService.delete({
        delete: {
          entity: entityName,
          pkValues: [id]
        }
      });

      if (result.error) {
        if (srcRsName) {
          const srcRs = getState().recordSet[srcRsName];
          if (srcRs) {
            dispatch(rsActions.setRecordSet(srcRs.setLocked(false)));
          }
        }

        const rs = getState().recordSet[rsName];

        if (rs) {
          dispatch(rsActions.setRecordSet(rs.setLocked(false)));
        }

        dispatch(gdmnActions.updateViewTab({ url, viewTab: { error: result.error.message } }));
      } else {
        if (srcRsName) {
          const srcRs = getState().recordSet[srcRsName];
          if (srcRs) {
            dispatch(rsActions.setRecordSet(
              srcRs
                .setLocked(false)
                .delete(true, srcRs.locate(rs.pkValue()))
            ));
          }
        }
        deleteViewTab(true);
      }
    });
  }, [rsName, viewTab]);

  useEffect( () => {
    return () => {
      if (lastEdited.current || lastFocused.current || controlsData.current) {
        dispatch(gdmnActions.saveSessionData({
          viewTabURL: url,
          sessionData: {
            lastEdited: lastEdited.current,
            lastFocused: lastFocused.current,
            controls: controlsData.current
          }
        }));
      }
    };
  }, []);

  useEffect( () => {
    if (needFocus.current) {
      needFocus.current.focus();
      needFocus.current = undefined;
    }
  }, [rs]);

  useEffect( () => {
    if (!rs && entity) {
      addViewTab(undefined);
      const eq = prepareDefaultEntityQuery(entity, [id]);
      apiService.query({ query: eq.inspect() })
        .then( response => {
          const result = response.payload.result!;
          const fieldDefs = Object.entries(result.aliases).map( ([fieldAlias, data]) => attr2fd(eq, fieldAlias, data) );
          const rs = RecordSet.create({
            name: rsName,
            fieldDefs,
            data: List(result.data as IDataRow[]),
            eq,
            sql: result.info
          });
          dispatch(rsActions.createRecordSet({ name: rsName, rs }));
          addViewTab(rs);
        });
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
      onClick: () => {
        postChanges();
        deleteViewTab(true);
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
        iconName: 'Save'
      },
      onClick: postChanges
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
      onClick: () => {}
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
                const linkEntity = (entity.attributes[fkFieldName] as EntityAttribute).entities[0];
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
                       const linkFields:EntityLinkField[] = [
                         new EntityLinkField(linkEntity.pk[0])
                       ];
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
              }

              if (fd.eqfa.linkAlias !== rs.eq!.link.alias) {
                return null;
              }

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
            })
          }
        </div>

        {rs.eq &&
          <pre>
            {JSON.stringify(rs.eq.inspect(), undefined, 2)}
          </pre>
        }
        {rs.sql &&
          <pre>
            {rs.sql.select}
          </pre>
        }
        {
          rs.fieldDefs.map( fd =>
            <div key={fd.fieldName}>
              {fd.fieldName}
              <pre>
                {JSON.stringify(fd.eqfa, undefined, 2)}
              </pre>
              <pre>
                {JSON.stringify(fd.sqlfa, undefined, 2)}
              </pre>
            </div>
          )
        }
      </div>
    </>
  );
}, styles, { allowMultiple: true });
