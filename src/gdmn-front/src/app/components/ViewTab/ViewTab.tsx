import React, { Fragment } from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.css';
import { Link } from 'react-router-dom';

export interface IViewTabProps {
  caption: string;
  url: string;
  loading: boolean;
}

@CSSModules(styles, { allowMultiple: true })
export class ViewTab extends React.Component<IViewTabProps, {}> {
  public render() {
    const { caption, url, loading } = this.props;
    const capt = loading ? 'Loading...' : caption;

    return url === location.pathname ? (
      <Fragment key={url}>
        <div styleName="ViewTab">
          <div styleName="ViewActiveColor" />
            <Link to={url}>
              <div styleName="ViewTabText ViewActiveTab">{capt}</div>
            </Link>
        </div>
        <div styleName="ViewTabSpace" />
      </Fragment>
    ) : (
      <Fragment key={url}>
        <div styleName="ViewTab">
          <Link to={url}>
            <div styleName="ViewTabText ViewInactiveTab">{capt}</div>
          </Link>
          <div styleName="ViewInactiveShadow" />
        </div>
        <div styleName="ViewTabSpace" />
      </Fragment>
    );
  }
}
