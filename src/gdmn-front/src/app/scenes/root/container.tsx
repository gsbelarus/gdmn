import * as React from 'react';
import { withProps, compose, branch, renderNothing } from 'recompose';
import { IMessageBarProps, MessageBar, MessageBarType } from 'office-ui-fabric-react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { IRootProps, Root } from '@src/app/scenes/root/component';
import { IState } from '@src/app/store/reducer';
import { selectRootState } from '@src/app/store/selectors';
import { rootActions } from '@src/app/scenes/root/actions';

const staticMessageBarProps: IMessageBarProps = {
  isMultiline: true,
  dismissButtonAriaLabel: 'Close',
  messageBarType: MessageBarType.error
};

const MessageBarContainer = compose(
  connect(
    (state: IState) => ({
      ...staticMessageBarProps,
      children: selectRootState(state).errorMsgBarText
    }),
    dispatch => ({
      onDismiss: bindActionCreators(rootActions.hideMessage, dispatch)
    })
  ),
  branch((props: IMessageBarProps) => !props.children, renderNothing)
)(MessageBar);

const RootContainer = compose<IRootProps, IRootProps>(
  withProps({
    renderMessageBarContainer: MessageBarContainer
  })
)(Root);

export { RootContainer };
