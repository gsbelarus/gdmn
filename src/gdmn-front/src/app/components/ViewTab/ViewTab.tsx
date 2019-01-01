import React, { Fragment } from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.css';
import { Link } from 'react-router-dom';

export interface IViewTabProps {
  caption: string;
  url: string;
  loading: boolean;
  onClose: (url: string) => void;
}

@CSSModules(styles, { allowMultiple: true })
export class ViewTab extends React.Component<IViewTabProps, {}> {
  public render() {
    const { caption, url, loading, onClose } = this.props;
    const capt = loading ? 'Loading...' : caption;

    return url === location.pathname ? (
      <Fragment key={url}>
        <div styleName="ViewTab">
          <div styleName="ViewActiveColor" />
            <div styleName="ViewTabText ViewActiveTab">
              <Link to={url}>
                {capt}
              </Link>
              <span styleName="ViewTabCross" onClick={ () => onClose(url) }>x</span>
            </div>
        </div>
        <div styleName="ViewTabSpace" />
      </Fragment>
    ) : (
      <Fragment key={url}>
        <div styleName="ViewTab">
          <div styleName="ViewTabText ViewInactiveTab">
            <Link to={url}>
              {capt}
            </Link>
            <span styleName="ViewTabCross" onClick={ () => onClose(url) }>x</span>
          </div>
          <div styleName="ViewInactiveShadow" />
        </div>
        <div styleName="ViewTabSpace" />
      </Fragment>
    );
  }
}
