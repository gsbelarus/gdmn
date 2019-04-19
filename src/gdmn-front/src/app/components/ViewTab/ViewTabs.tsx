import React from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.css';
import { IViewTab } from '@src/app/scenes/gdmn/types';
import { ViewTab } from './ViewTab';
import { RouteComponentProps } from 'react-router-dom';
import { RecordSetReducerState, TStatus } from 'gdmn-recordset';
import { IRsMetaState } from '@src/app/store/rsmeta';

export interface IViewTabsProps {
  viewTabs: IViewTab[];
  recordSet: RecordSetReducerState;
  rsMeta: IRsMetaState;
  onClose: (vt: IViewTab) => void;
}

export const ViewTabs = CSSModules(
  (props: IViewTabsProps & RouteComponentProps<any>) => {
    const { viewTabs, onClose, recordSet, rsMeta } = props;

    return viewTabs.length ?
      <div styleName="ViewTabs">
        <div styleName="ViewTabSpace" />
        {
          viewTabs.map( vt => {
            const loading = !!vt.rs && vt.rs.reduce(
              (p, name) => {
                if (!recordSet[name] || recordSet[name].status === TStatus.LOADING) {
                  return true;
                }
                return p;
              }, false
            );
            const error = !!rsMeta[name] && !!rsMeta[name].error;

            return (<ViewTab key={vt.url} {...vt} loading={loading} error={error} onClose={ () => onClose(vt) } /> );
          })
        }
        <div styleName="ViewRestSpace" />
      </div>
    :
      null;
  }, styles, { allowMultiple: true });
