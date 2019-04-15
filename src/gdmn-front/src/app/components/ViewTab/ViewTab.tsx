import React, { Fragment } from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.css';
import { Link } from 'react-router-dom';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react';

export interface IViewTabProps {
  caption: string;
  url: string;
  loading: boolean;
  onClose: () => void;
}

export const ViewTab = CSSModules(
  (props: IViewTabProps) => {
    const { caption, url, loading, onClose } = props;

    return url === location.pathname ? (
      <Fragment key={url}>
        <div styleName="ViewTab" onMouseDown={event => event.button === 1 ? onClose() : undefined}>
          <div styleName="ViewActiveColor" />
            <div styleName="ViewTabText ViewActiveTab">
              {loading ? <span styleName="ViewTabSpinner"><Spinner size={SpinnerSize.xSmall} /></span> : undefined}
              <Link to={url}>
                {caption}
              </Link>
              <span styleName="ViewTabCross" onClick={onClose}>x</span>
            </div>
        </div>
        <div styleName="ViewTabSpace" />
      </Fragment>
    ) : (
      <Fragment key={url}>
        <div styleName="ViewTab" onMouseDown={event => event.button === 1 ? onClose() : undefined}>
          <div styleName="ViewTabText ViewInactiveTab">
            {loading ? <span styleName="ViewTabSpinner"><Spinner size={SpinnerSize.xSmall} /></span> : undefined}
            <Link to={url}>
              {caption}
            </Link>
            <span styleName="ViewTabCross" onClick={onClose}>x</span>
          </div>
          <div styleName="ViewInactiveShadow" />
        </div>
        <div styleName="ViewTabSpace" />
      </Fragment>
    );
}, styles);
