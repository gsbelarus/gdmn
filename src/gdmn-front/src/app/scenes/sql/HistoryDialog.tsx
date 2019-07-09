import React, { useState, useEffect } from 'react';

import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { PrimaryButton, DefaultButton, Button } from 'office-ui-fabric-react/lib/Button';

import styles from './styles.css';
import { TextField } from 'office-ui-fabric-react';
import { GDMNGrid } from 'gdmn-grid';
import { EntityQuery, EntityLink, Entity } from 'gdmn-orm';
// import { TFieldType } from 'gdmn-recordset';

export interface IHistoryFormProps {
  onClose: () => void;
  onSelect: (expression: string) => void;
}

export const HistoryDialog = (props: IHistoryFormProps) => {
  const { onClose, onSelect } = props;
  const rs: any = null;
  const gcs: any = null;
  const [state, setState] = useState({ expression: '' });

  const handleGridSelect = () => {};

  useEffect(() => {
    const loadHistory = async () => {
      setState({ expression: 'select * from gd_user' });
      // const entity: Entity = erModel.entities[name];
      // const linkEq = new EntityQuery(entity, 'z');
    };

    loadHistory();
  }, []);

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
            {rs && gcs && <GDMNGrid {...gcs} rs={rs} onSetCursorPos={handleGridSelect} onColumnResize={() => false} />}
          </div>
          <div>
            <TextField resizable={false} multiline rows={8} value={state.expression} onChange={(_e, newValue?: string) => { if (newValue !== undefined) {setState({expression: newValue})}}} />
          </div>
        </div>
        <div className={styles['history-buttons']}>
          <PrimaryButton onClick={() => onSelect(state.expression)} text="OK" />
          <Button onClick={onClose} text="Close" />
        </div>
      </div>
    </Modal>
  );
};
