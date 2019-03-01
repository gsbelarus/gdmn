import React from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.css';
import { IViewTab } from '@src/app/scenes/gdmn/types';
import { ViewTab } from './ViewTab';
import { RouteComponentProps } from 'react-router-dom';
import { RecordSetReducerState } from 'gdmn-recordset';

export interface IViewTabsProps {
  viewTabs: IViewTab[];
  recordSet: RecordSetReducerState;
  onClose: (vt: IViewTab) => void;
}

@CSSModules(styles, { allowMultiple: true })
export class ViewTabs extends React.Component<IViewTabsProps & RouteComponentProps<any>, {}> {
  public render() {
    const { viewTabs, onClose, recordSet } = this.props;

    return viewTabs.length ?
      <div styleName="ViewTabs">
        <div styleName="ViewTabSpace" />
        {viewTabs.map( vt => <ViewTab key={vt.url} {...vt} loading={ !!vt.rs && !recordSet[vt.rs[0]] } onClose={ () => onClose(vt) } /> )}
        <div styleName="ViewRestSpace" />
      </div>
    :
      undefined;
  }
}
