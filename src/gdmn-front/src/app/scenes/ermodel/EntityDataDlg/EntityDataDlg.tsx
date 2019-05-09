import { IEntityDataDlgProps } from "./EntityDataDlg.types";
import React, { useEffect, useState } from "react";
import CSSModules from 'react-css-modules';
import styles from './styles.css';
import { CommandBar, ICommandBarItemProps } from "office-ui-fabric-react";
import { WrappedTextField } from "./WrappedTextField";

export const EntityDataDlg = CSSModules( (props: IEntityDataDlgProps): JSX.Element => {

  const { addViewTab, url, entityName, id, rs, entity, setFieldValue, closeTab, loadRs, cancel } = props;
  const rsName = rs ? rs.name : '';
  const [changed, setChanged] = useState(false);

  useEffect(
    () => {
      if (!rs) loadRs();
    },
    [entity]
  );

  useEffect(
    () => {
      addViewTab({
        url,
        caption: `${entityName}-${id}`,
        canClose: false,
        rs: rsName ? [rsName] : undefined
      });
    },
    [rsName]
  );

  const commandBarItems: ICommandBarItemProps[] = !rs ? [] : [
    {
      key: 'saveAndClose',
      disabled: !changed,
      text: 'Сохранить и закрыть',
      iconProps: {
        iconName: 'Save'
      },
      onClick: () => {}
    },
    {
      key: 'cancelAndClose',
      text: 'Отменить и закрыть',
      iconProps: {
        iconName: 'Cancel'
      },
      onClick: () => {
        if (changed) {
          cancel();
          setChanged(false);
        }
        closeTab();
      }
    },
    {
      key: 'apply',
      disabled: !changed,
      text: 'Сохранить',
      iconProps: {
        iconName: 'Save'
      },
      onClick: () => {}
    },
    {
      key: 'revert',
      disabled: !changed,
      text: 'Отменить',
      iconProps: {
        iconName: 'Undo'
      },
      onClick: () => {
        cancel();
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
      onClick: () => {}
    },
    {
      key: 'prev',
      disabled: changed,
      text: 'Предыдущая',
      iconProps: {
        iconName: 'Previous'
      },
      onClick: () => {}
    },
    {
      key: 'next',
      disabled: changed,
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
              label={fd.caption}
              value={rs.getString(fd.fieldName)}
              onChanged={ () => { setChanged(true); } }
              onApplyChanges={ (value: string) => { setFieldValue(fd.fieldName, value); } }
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