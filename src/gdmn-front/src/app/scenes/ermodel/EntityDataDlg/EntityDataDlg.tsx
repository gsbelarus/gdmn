import { IEntityDataDlgProps } from "./EntityDataDlg.types";
import React, { useEffect, useState } from "react";
import CSSModules from 'react-css-modules';
import styles from './styles.css';
import { CommandBar, ICommandBarItemProps } from "office-ui-fabric-react";
import { WrappedTextField } from "./WrappedTextField";
import { gdmnActions } from "../../gdmn/actions";
import { rsActions } from "gdmn-recordset";
import { prepareDefaultEntityQuery } from "../entityData/utils";
import { loadRSActions } from "@src/app/store/loadRSActions";

type TDlgState = 'NORMAL' | 'SAVING';

export const EntityDataDlg = CSSModules( (props: IEntityDataDlgProps): JSX.Element => {

  const { url, entityName, id, rs, entity, dispatch, history } = props;
  const rsName = rs ? rs.name : '';
  const locked = rs ? rs.locked : false;
  const [changed, setChanged] = useState(false);

  useEffect(
    () => {
      if (!rs && entity) {
        const eq = prepareDefaultEntityQuery(entity, [id]);
        dispatch(loadRSActions.loadRS({ name: url, eq }));
      }
    },
    [entity]
  );

  useEffect(
    () => {
      dispatch(gdmnActions.addViewTab({
        url,
        caption: `${entityName}-${id}`,
        canClose: false,
        rs: rsName ? [rsName] : undefined
      }));
    },
    [rsName]
  );

  const commandBarItems: ICommandBarItemProps[] = !rs ? [] : [
    {
      key: 'saveAndClose',
      disabled: locked || !changed,
      text: 'Сохранить',
      iconProps: {
        iconName: 'CheckMark'
      },
      onClick: () => {}
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
          dispatch(rsActions.cancel({ name: url }));
          setChanged(false);
        }
        dispatch(gdmnActions.deleteViewTab({
          viewTabURL: url,
          locationPath: location.pathname,
          historyPush: history.push
        }));
      }
    },
    {
      key: 'apply',
      disabled: locked || !changed,
      text: 'Применить',
      iconProps: {
        iconName: 'Save'
      },
      onClick: () => {
        setChanged(false);
        dispatch(loadRSActions.postRS({ name: url }));
      }
    },
    {
      key: 'revert',
      disabled: locked || !changed,
      text: 'Вернуть',
      iconProps: {
        iconName: 'Undo'
      },
      onClick: () => {
        dispatch(rsActions.cancel({ name: url }));
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
      disabled: locked || changed,
      text: 'Предыдущая',
      iconProps: {
        iconName: 'Previous'
      },
      onClick: () => {}
    },
    {
      key: 'next',
      disabled: locked || changed,
      text: 'Следующая',
      iconProps: {
        iconName: 'Next'
      },
      onClick: () => {}
    },
  ];

  if (!entity) {
    return <div>ERModel isn't loaded or unknown entity {entityName}</div>;
  }

  if (!rs) {
    return <div>Loading...</div>;
  }

  return (
    <div styleName="ScrollableDlg">
      <CommandBar items={commandBarItems} />
      <div styleName="FieldsColumn">
        {
          rs.fieldDefs.map( fd =>
            <WrappedTextField
              key={fd.fieldName}
              disabled={locked}
              label={fd.caption}
              value={rs.getString(fd.fieldName)}
              onChanged={ () => { setChanged(true); } }
              onApplyChanges={
                (value: string) => {
                  dispatch(rsActions.setFieldValue({ name: rs.name, fieldName: fd.fieldName, value }));
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