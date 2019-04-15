import React from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.css';
import { IViewTab } from '@src/app/scenes/gdmn/types';
import { ViewTab } from './ViewTab';
import { RouteComponentProps } from 'react-router-dom';
import { RecordSetReducerState } from 'gdmn-recordset';
import { IRsMetaState } from '@src/app/store/reducer';

export interface IViewTabsProps {
  viewTabs: IViewTab[];
  recordSet: RecordSetReducerState;
  rsMeta: IRsMetaState;
  onClose: (vt: IViewTab) => void;
}

export const ViewTabs = CSSModules(
  (props: IViewTabsProps & RouteComponentProps<any>) => {
    const { viewTabs, onClose, recordSet } = props;

    return viewTabs.length ?
      <div styleName="ViewTabs">
        <div styleName="ViewTabSpace" />
        {viewTabs.map( vt => <ViewTab key={vt.url} {...vt} loading={ !!vt.rs && !recordSet[vt.rs[0]] } onClose={ () => onClose(vt) } /> )}
        <div styleName="ViewRestSpace" />
      </div>
    :
      null;
  }, styles, { allowMultiple: true });
