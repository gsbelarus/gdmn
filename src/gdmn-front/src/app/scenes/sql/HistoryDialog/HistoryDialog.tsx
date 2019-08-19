import {
  GDMNGrid,
  createGrid,
  TSetCursorPosEvent,
  setCursorCol,
  resizeColumn,
  TColumnResizeEvent,
  Columns,
  deleteGrid
} from 'gdmn-grid';
import { rsActions, RecordSet, TFieldType } from 'gdmn-recordset';
import { TextField, Stack } from 'office-ui-fabric-react';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import React, { useEffect, useState } from 'react';

import { prepareDefaultEntityQuery } from '../../ermodel/EntityDataView/utils';
import styles from './styles.css';
import { IHistoryProps } from './HistoryDialog.types';
import { loadRSActions } from '@src/app/store/loadRSActions';

export const HistoryDialog = (props: IHistoryProps) => {
  const { rs, gcs, onClose, onSelect, erModel, dispatch, id } = props;

  const [state, setState] = useState({ expression: '' });

  useEffect(() => {
    if (rs) {
      // в textarea подставляем sql из активной записи
      const sqlField = rs.fieldDefs.find(i => i.caption === 'SQL_TEXT');
      sqlField && setState({ expression: rs.getString(sqlField.fieldName) });

      dispatch(
        resizeColumn({
          name: rs.name,
          columnIndex: 1,
          newWidth: 500
        })
      );
    }
  }, [rs]);

  useEffect(() => {
    const loadHistory = async () => {
      const eq = await prepareDefaultEntityQuery(erModel.entity('TgdcSQLHistory'), undefined, undefined, [
        { name: 'EDITIONDATE', order: 'DESC' }
      ]);
      eq && dispatch(loadRSActions.attachRS({ name: id, eq }));
    };

    if (!rs && id) {
      loadHistory();
    }
  }, [rs, id]);

  useEffect(() => {
    // При закрытии диалога удаляем RS и Грид
    return () => {
      dispatch(deleteGrid({ name: id }));
      dispatch(loadRSActions.deleteRS({ name: id }));
    };
  }, []);

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
      <Stack className={styles['history-container']}>
        <div className={styles['history-header']}>
          <span id="historySQLTitleID">SQL History</span>
        </div>
        <div className={styles['history-body']} id="historySQLSubTitleID">
          <div>
            {rs && gcs && (
              <GDMNGrid
                {...gcs}
                columns={gcs.columns.filter(c => ['SQL_TEXT', 'EDITIONDATE'].includes(c.caption!.join(',')))}
                rs={rs}
                onSetCursorPos={handleGridSelect}
                onColumnResize={handleColumnResize}
              />
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
      </Stack>
    </Modal>
  );
};