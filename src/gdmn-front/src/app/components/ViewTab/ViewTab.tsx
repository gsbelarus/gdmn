import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react';
import { useViewTabStyles } from './useViewTabStyles';

export interface IViewTabProps {
  caption: string;
  url: string;
  error: boolean;
  loading: boolean;
  changed: boolean;
  theme: string;
  onClose?: () => void;
};

export const ViewTab = (props: IViewTabProps) => {
    const { caption, url, loading, changed, error, onClose, theme } = props;
    const { viewTab, viewActiveColor, inactiveShadow, viewTabSpace, viewTabSpinner, viewTabCross, viewTabText, viewInactiveTab } = useViewTabStyles(theme, error);

    const InnerTab = (props: {active?: boolean}) => (
      <Link to={url}>
        <div style={props.active ? viewTabText : {...viewTabText, ...viewInactiveTab}}>
          {loading ? <span style={viewTabSpinner}><Spinner size={SpinnerSize.xSmall} /></span> : undefined}
            {caption}{changed ? ' *' : ''}
          {onClose && <span style={viewTabCross} onClick={ e => { e.preventDefault(); onClose(); } }>x</span>}
        </div>
      </Link>
    );

    return url === location.pathname ? (
      <Fragment key={url}>
        <div style={viewTab} onMouseDown={event => event.button === 1 && onClose ? onClose() : undefined}>
          <div style={viewActiveColor} />
          <InnerTab active />
        </div>
        <div style={viewTabSpace} />
      </Fragment>
    ) : (
      <Fragment key={url}>
        <div style={viewTab} onMouseDown={event => event.button === 1 && onClose ? onClose() : undefined}>
          <InnerTab  />
          <div style={inactiveShadow} />
        </div>
        <div style={viewTabSpace} />
      </Fragment>
    );
};
