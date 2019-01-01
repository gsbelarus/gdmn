import React from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.css';
import { IViewTab } from '@src/app/scenes/gdmn/types';
import { ViewTab } from './ViewTab';

export interface IViewTabsProps {
  viewTabs: IViewTab[];
  onClose: (url: string) => void;
}

@CSSModules(styles, { allowMultiple: true })
export class ViewTabs extends React.Component<IViewTabsProps, {}> {
  public render() {
    const { viewTabs, onClose } = this.props;

    return viewTabs.length ?
      <div styleName="ViewTabs">
        <div styleName="ViewTabSpace" />
        {viewTabs.map( vt => <ViewTab {...vt} onClose={onClose} /> )}
        <div styleName="ViewRestSpace" />
      </div>
    :
      undefined;
  }
}
