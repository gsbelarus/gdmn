import React, { Fragment } from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.css';
import { Link } from 'react-router-dom';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react';

export interface IViewTabProps {
  caption: string;
  url: string;
  error: boolean;
  loading: boolean;
  onClose: () => void;
}

export const ViewTab = CSSModules(
  (props: IViewTabProps) => {
    const { caption, url, loading, error, onClose } = props;
    const viewTabStyle = error ? 'ViewTab ViewTabError': 'ViewTab ViewTabNormal';

    return url === location.pathname ? (
      <Fragment key={url}>
        <div styleName={viewTabStyle} onMouseDown={event => event.button === 1 ? onClose() : undefined}>
          <div styleName={error ? "ViewActiveColorError" : "ViewActiveColorNormal"} />
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
        <div styleName={viewTabStyle} onMouseDown={event => event.button === 1 ? onClose() : undefined}>
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
}, styles, { allowMultiple: true });
