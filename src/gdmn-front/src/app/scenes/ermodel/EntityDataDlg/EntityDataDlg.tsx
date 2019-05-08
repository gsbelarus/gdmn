import { IEntityDataDlgProps } from "./EntityDataDlg.types";
import React, { useEffect, useRef, useMemo } from "react";
import CSSModules from 'react-css-modules';
import styles from './styles.css';
import { TextField, CommandBar, ICommandBarItemProps, safeRequestAnimationFrame } from "office-ui-fabric-react";

interface ICurrentEdit {
  fieldName: string;
  value: string;
};

export const EntityDataDlg = CSSModules( (props: IEntityDataDlgProps): JSX.Element => {

  const { addViewTab, url, entityName, id, rs, entity, setFieldValue } = props;
  const rsName = rs ? rs.name : '';
  const refCurrentEdit = useRef<ICurrentEdit | null>(null);

  useEffect(
    () => {
      addViewTab({
        url,
        caption: `${entityName}-${id}`,
        canClose: false,
        rs: rsName ? [rsName] : undefined
      });
    },
    [url, entityName, id, rsName]
  );

  const commandBarItems = useMemo( (): ICommandBarItemProps[] => {
    if (!rs) {
      return [];
    }

    const changed = !!rs.changed || !!refCurrentEdit.current;
    const cbItemsSaveClose: ICommandBarItemProps[] = changed
      ? [
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
          onClick: () => {}
        }
      ]
      : [
        {
          key: 'cancelAndClose',
          text: 'Закрыть',
          iconProps: {
            iconName: 'Cancel'
          },
          onClick: () => {}
        }
      ];

    return [
      ...cbItemsSaveClose,
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
        onClick: () => {}
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
  }, [rs, refCurrentEdit.current]);

  if (!entity) {
    return <div>ERModel isn't loaded or unknown entity {entityName}</div>;
  }

  if (!rs) {
    return <div>Loading...</div>;
  }

  const applyFieldChange = () => {
    if (refCurrentEdit.current) {
      const { fieldName, value } = refCurrentEdit.current;
      setFieldValue(fieldName, value);
    }
  };

  return (
    <div styleName="ScrollableDlg">
      <CommandBar items={commandBarItems} />
      <div styleName="FieldsColumn">
        {
          rs.fieldDefs.map( fd =>
            <TextField
              key={fd.fieldName}
              label={fd.caption}
              defaultValue={rs.getString(fd.fieldName)}
              onChange={ (_, value) => { if (value) refCurrentEdit.current = { fieldName: fd.fieldName, value }; } }
              onBlur={applyFieldChange}
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