import React, { useMemo } from 'react';
import { IViewTab } from '@src/app/scenes/gdmn/types';
import { ViewTab } from './ViewTab';
import { RouteComponentProps } from 'react-router-dom';
import { RecordSetReducerState, TStatus } from 'gdmn-recordset';
import { IRsMetaState } from '@src/app/store/rsmeta';
import { getViewTabStyles } from './getViewTabStyles';

export interface IViewTabsProps {
  viewTabs: IViewTab[];
  recordSet: RecordSetReducerState;
  rsMeta: IRsMetaState;
  theme: string;
  onClose: (vt: IViewTab) => void;
};

export const ViewTabs = (props: IViewTabsProps & RouteComponentProps<any>) => {
    const { viewTabs, onClose, recordSet, rsMeta, theme } = props;
    const { viewTabsBand, viewTabSpace, viewRestSpace } = useMemo( () => getViewTabStyles(theme), [theme]);

    return viewTabs.length ?
      <div style={viewTabsBand}>
        <div style={viewTabSpace} />
        {
          viewTabs.map( vt => {
            const loading = !!vt.rs && vt.rs.reduce(
              (p, name) => {
                const rs = recordSet[name];
                if (!rs || rs.status === TStatus.LOADING || rs.locked) {
                  return true;
                }
                return p;
              }, false
            );
            const changed = !!vt.rs && vt.rs.reduce(
              (p, name) => {
                if (recordSet[name] && recordSet[name].changed) {
                  return true;
                }
                return p;
              }, false
            );
            const error = !!vt.error || (!!rsMeta[name] && !!rsMeta[name].error);

            return (
              <ViewTab
                key={vt.url}
                {...vt}
                loading={loading}
                changed={changed}
                error={error}
                theme={theme}
                onClose={ vt.canClose ? () => onClose(vt) : undefined }
              />
            );
          })
        }
        <div style={viewRestSpace}/>
      </div>
    :
      null;
  };
