import { IEntityDataDlgProps } from "./EntityDataDlg.types";
import React, { useEffect, useMemo, useState } from "react";
import CSSModules from 'react-css-modules';
import styles from './styles.css';
import { TextField, CommandBar, ICommandBarItemProps } from "office-ui-fabric-react";

interface ICurrentEdit {
  fieldName: string;
  value: string;
};

export const EntityDataDlg = CSSModules( (props: IEntityDataDlgProps): JSX.Element => {

  const { addViewTab, url, entityName, id, rs, entity, setFieldValue, closeTab, loadRs } = props;
  const [currentEdit, setCurrentEdit] = useState<ICurrentEdit | null>(null);

  useEffect( () => { if (!rs) loadRs(); }, []);

  useEffect(
    () => {
      addViewTab({
        url,
        caption: `${entityName}-${id}`,
        canClose: false,
        rs: rs ? [rs.name] : undefined
      });
    },
    [rs]
  );

  const commandBarItems = useMemo( (): ICommandBarItemProps[] => {
    if (!rs) {
      return [];
    }

    const changed = !!rs.changed || !!currentEdit;
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
          onClick: closeTab
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
  }, [rs, currentEdit]);

  if (!entity) {
    return <div>ERModel isn't loaded or unknown entity {entityName}</div>;
  }

  if (!rs) {
    return <div>Loading...</div>;
  }

  const applyFieldChange = () => {
    if (currentEdit) {
      const { fieldName, value } = currentEdit;
      setFieldValue(fieldName, value);
      setCurrentEdit(null);
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
              onChange={ (_, value) => { if (value) setCurrentEdit({ fieldName: fd.fieldName, value }); } }
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