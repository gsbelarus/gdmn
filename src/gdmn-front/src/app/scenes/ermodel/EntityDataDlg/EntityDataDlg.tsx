import { IEntityDataDlgProps } from "./EntityDataDlg.types";
import React, { useEffect, useState, useCallback, useRef } from "react";
import CSSModules from 'react-css-modules';
import styles from './styles.css';
import { CommandBar, ICommandBarItemProps, TextField, ITextField } from "office-ui-fabric-react";
import { gdmnActions } from "../../gdmn/actions";
import { rsActions, RecordSet, IDataRow, TCommitResult, TRowState } from "gdmn-recordset";
import { prepareDefaultEntityQuery, attr2fd } from "../entityData/utils";
import { apiService } from "@src/app/services/apiService";
import { List } from "immutable";
import { sessionData } from "@src/app/services/sessionData";

interface ILastEdited {
  fieldName: string;
  value: string;
};

export const EntityDataDlg = CSSModules( (props: IEntityDataDlgProps): JSX.Element => {

  const { url, entityName, id, rs, entity, dispatch, history, srcRs } = props;
  const locked = rs ? rs.locked : false;
  const rsName = url;

  const getSavedLastEdit = (): ILastEdited | undefined => {
    const savedData = sessionData.getItem(url);

    if (savedData && savedData.lastEdited) {
      return savedData.lastEdited as ILastEdited;
    }

    return undefined;
  }

  const getSavedLastFocused = (): string | undefined =>  {
    const savedData = sessionData.getItem(url);
    return savedData && typeof savedData.lastFocused === 'string' ? savedData.lastFocused : undefined;
  }

  const lastEdited = useRef(getSavedLastEdit());
  const lastFocused = useRef(getSavedLastFocused());
  const [changed, setChanged] = useState(!!((rs && rs.changed) || lastEdited.current));
  const needFocus = useRef<ITextField | undefined>();

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
      const changedRS = rs.setString(fieldName, value);
      dispatch(rsActions.setRecordSet({
        name: rsName,
        rs: changedRS
      }));
      lastEdited.current = undefined;
    }
  };

  const postChanges = useCallback( async () => {
    if (rs && changed) {
      let tempRS = rs;

      if (lastEdited.current) {
        const { fieldName, value } = lastEdited.current;
        tempRS = rs.setString(fieldName, value);
        lastEdited.current = undefined;
      }

      const commitFunc = (_row: IDataRow) => {
        return new Promise( resolve => setTimeout( () => resolve(), 2000 ))
          .then( () => TCommitResult.Success );
      }

      tempRS = tempRS.setLocked(true);
      dispatch(rsActions.setRecordSet({ name: rsName, rs: tempRS }));
      tempRS = await tempRS.post(commitFunc, true);
      dispatch(rsActions.setRecordSet({ name: rsName, rs: tempRS }));
      setChanged(false);

      if (srcRs && !srcRs.locked) {
        const foundRows = srcRs.locate(tempRS.getObject(tempRS.pk.map( fd => fd.fieldName )), true);
        if (foundRows.length && srcRs.getRowState(foundRows[0]) === TRowState.Normal) {
          const updatedRs = srcRs.set(tempRS.getObject(), foundRows[0]);
          dispatch(rsActions.setRecordSet({ name: updatedRs.name, rs: updatedRs }));
        }
      }
    }
  }, [rs, changed]);

  useEffect( () => {
    addViewTab(rs);

    if (needFocus.current) {
      needFocus.current.focus();
    }

    return () => {
      if (lastEdited.current || lastFocused.current) {
        sessionData.setItem(url, {
          lastEdited: lastEdited.current,
          lastFocused: lastFocused.current
        });
      } else {
        sessionData.removeItem(url);
      }
    };
  }, []);

  useEffect( () => {
    if (!rs && entity) {
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

  const commandBarItems: ICommandBarItemProps[] = !rs ? [] : [
    {
      key: 'saveAndClose',
      disabled: locked || !changed,
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
      disabled: locked,
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
      disabled: locked || !changed,
      text: 'Применить',
      iconProps: {
        iconName: 'Save'
      },
      onClick: postChanges
    },
    {
      key: 'revert',
      disabled: locked || !changed,
      text: 'Вернуть',
      iconProps: {
        iconName: 'Undo'
      },
      onClick: () => {
        lastEdited.current = undefined;
        if (rs.changed) {
          dispatch(rsActions.cancel({ name: rsName }));
        }
        setChanged(false);
      }
    },
    {
      key: 'create',
      disabled: locked || changed,
      text: 'Создать',
      iconProps: {
        iconName: 'PageAdd'
      },
      onClick: () => {}
    },
    {
      key: 'delete',
      disabled: locked,
      text: 'Удалить',
      iconProps: {
        iconName: 'Delete'
      },
      onClick: () => {}
    },
    {
      key: 'prev',
      disabled: locked || changed || !srcRs || !srcRs.currentRow,
      text: 'Предыдущая',
      iconProps: {
        iconName: 'Previous'
      },
      onClick: () => {}
    },
    {
      key: 'next',
      disabled: locked || changed || !srcRs || srcRs.currentRow === (srcRs.size - 1),
      text: 'Следующая',
      iconProps: {
        iconName: 'Next'
      },
      /*
      onClick: () => {
        const nextRow = srcRs!.moveBy(1);
        dispatch(rsActions.setRecordSet({ name: nextRow.name, rs: nextRow }));
        history.push(`/spa/gdmn/entity/${entityName}/edit/${nextRow.pk2s().join('-')}`);
        deleteViewTab(false);
      }
      */
    },
  ];

  return (
    <div styleName="ScrollableDlg">
      <CommandBar items={commandBarItems} />
      <div styleName="FieldsColumn">
        {
          rs.fieldDefs.map( fd =>
            <TextField
              key={fd.fieldName}
              disabled={locked}
              label={fd.caption}
              value={lastEdited.current && lastEdited.current.fieldName === fd.fieldName ? lastEdited.current.value : rs.getString(fd.fieldName)}
              onChange={
                (_e, newValue?: string) => {
                  if (newValue !== undefined) {
                    lastEdited.current = {
                      fieldName: fd.fieldName,
                      value: newValue
                    };
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
      </div>

      {rs.eq &&
        <pre>
          {rs.eq.serialize()}
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
  );
}, styles, { allowMultiple: true });