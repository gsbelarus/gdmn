import { GDMNGrid, createGrid, TSetCursorPosEvent, setCursorCol, resizeColumn, TColumnResizeEvent } from 'gdmn-grid';
import { TFieldType, rsActions } from 'gdmn-recordset';
import { TextField } from 'office-ui-fabric-react';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import React, { useEffect, useState } from 'react';

import { prepareDefaultEntityQuery } from '../../ermodel/EntityDataView/utils';
import styles from './styles.css';
import { IHistoryProps } from './HistoryDialog.types';
import { loadRSActions } from '@src/app/store/loadRSActions';
import {} from '../utils';

export const HistoryDialog = (props: IHistoryProps) => {
  const { rs, gcs, onClose, onSelect, erModel, dispatch, id } = props;

  const [state, setState] = useState({ expression: '' });

  useEffect(() => {
    // Создаём грид из RS
    if (!gcs && rs) {
      dispatch(
        createGrid({
          name: `dialog${id}`,
          columns: rs.fieldDefs.map(fd => ({
            name: fd.fieldName,
            caption: [fd.caption || fd.fieldName],
            fields: [{ ...fd }],
            width: fd.dataType === TFieldType.String && fd.size ? fd.size * 10 : undefined
          })),
          leftSideColumns: 0,
          rightSideColumns: 0,
          hideFooter: true
        })
      );
    }

    if (rs) {
      const sqlField = rs.fieldDefs.find(i => i.caption === 'SQL_TEXT');
      if (!sqlField) return;

      setState({ expression: rs.getString(sqlField.fieldName) });
    }
  }, [rs]);

  useEffect(() => {
    const loadHistory = async () => {
      const eq = await prepareDefaultEntityQuery(erModel.entity('TgdcSQLHistory'));

      if (!eq) return;

      dispatch(loadRSActions.attachRS({ name: id, eq }));
    };

    if (!rs && id) {
      loadHistory();
    }
  }, [rs, id]);

  const handleGridSelect = (event: TSetCursorPosEvent) => {
    dispatch(dispatch => {
      dispatch(rsActions.setCurrentRow({ name: id, currentRow: event.cursorRow }));
      dispatch(setCursorCol({ name: id, cursorCol: event.cursorCol }));
    });
  };

  const handleColumnResize = (event: TColumnResizeEvent) => {
    dispatch(
      resizeColumn({
        name: event.rs.name,
        columnIndex: event.columnIndex,
        newWidth: event.newWidth
      })
    );
  };

  return (
    <Modal
      containerClassName={styles['history-wrapper']}
      titleAriaId={'historySQLTitleID'}
      subtitleAriaId={'historySQLSubTitleID'}
      isOpen={true}
      onDismiss={onClose}
      isBlocking={false}
    >
      <div className={styles['history-container']}>
        <div className={styles['history-header']}>
          <span id="historySQLTitleID">SQL History</span>
        </div>
        <div className={styles['history-body']} id="historySQLSubTitleID">
          <div>
            {rs && gcs && (
              <GDMNGrid {...gcs} rs={rs} onSetCursorPos={handleGridSelect} onColumnResize={handleColumnResize} />
            )}
          </div>
          <div>
            <TextField
              resizable={false}
              multiline
              rows={8}
              value={state.expression}
              onChange={(_e, newValue?: string) => {
                if (newValue !== undefined) {
                  setState({ expression: newValue });
                }
              }}
            />
          </div>
        </div>
        <div className={styles['history-buttons']}>
          <PrimaryButton onClick={() => onSelect(state.expression)} text="OK" />
          <DefaultButton onClick={onClose} text="Close" />
        </div>
      </div>
    </Modal>
  );
};
