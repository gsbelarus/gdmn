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
  changed: boolean;
  onClose?: () => void;
};

export const ViewTab = CSSModules(
  (props: IViewTabProps) => {
    const { caption, url, loading, changed, error, onClose } = props;
    const viewTabStyle = error ? 'ViewTab ViewTabError': 'ViewTab ViewTabNormal';

    const InnerTab = CSSModules( (props: {active?: boolean}) => (
      <Link to={url}>
        <div styleName={`ViewTabText ${props.active ? "ViewActiveTab" : "ViewInactiveTab"}`}>
          {loading ? <span styleName="ViewTabSpinner"><Spinner size={SpinnerSize.xSmall} /></span> : undefined}
            {caption}{changed ? ' *' : ''}
          {onClose && <span styleName="ViewTabCross" onClick={ e => { e.preventDefault(); onClose(); } }>x</span>}
        </div>
      </Link>
    ), styles, {allowMultiple: true });

    return url === location.pathname ? (
      <Fragment key={url}>
        <div styleName={viewTabStyle} onMouseDown={event => event.button === 1 && onClose ? onClose() : undefined}>
          <div styleName={error ? "ViewActiveColorError" : "ViewActiveColorNormal"} />
          <InnerTab active />
        </div>
        <div styleName="ViewTabSpace" />
      </Fragment>
    ) : (
      <Fragment key={url}>
        <div styleName={viewTabStyle} onMouseDown={event => event.button === 1 && onClose ? onClose() : undefined}>
          <InnerTab  />
          <div styleName="ViewInactiveShadow" />
        </div>
        <div styleName="ViewTabSpace" />
      </Fragment>
    );
}, styles, { allowMultiple: true });
