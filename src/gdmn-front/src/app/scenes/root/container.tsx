import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { branch, compose, renderNothing, withProps } from 'recompose';
import { DefaultButton, IMessageBarProps, MessageBar, MessageBarType } from 'office-ui-fabric-react';

import { IRootProps, Root } from '@src/app/scenes/root/component';
import { IState } from '@src/app/store/reducer';
import { selectRootState } from '@src/app/store/selectors';
import { rootActions } from '@src/app/scenes/root/actions';
import { StompLogPanel } from '@src/app/scenes/root/components/StompLogPanel';
import { LostConnectWarnMsgBar } from '@src/app/scenes/root/components/LostConnectWarnMsgBar';

const LostConnectWarnMsgContainer = connect(
  (state: IState) => ({
    opened: selectRootState(state).lostConnectWarnOpened
  }),
  dispatch => ({
    onDismiss: () => dispatch(rootActions.setLostConnectWarnOpened(false)),
    onYesAction: () => dispatch(rootActions.abortNetReconnect())
  })
)(LostConnectWarnMsgBar);

const staticMessageBarProps: IMessageBarProps = {
  isMultiline: true,
  dismissButtonAriaLabel: 'Close',
  messageBarType: MessageBarType.error
};

const ErrorMsgBarContainer = compose(
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

const StompLogPanelContainer = connect((state: IState) => ({
  logItems: selectRootState(state).logItems
}))(StompLogPanel);

const ConnectBtnContainer = connect((state: IState) => ({
  disabled: false, // TODO !selectRootState(state).disconnectedMode,
  iconProps: { iconName: 'Sync' },
  text: 'connect to server'
}), dispatch => ({
  onClick: bindActionCreators(rootActions.netReconnect, dispatch)
}))(DefaultButton);

const RootContainer = compose<IRootProps, IRootProps>(
  withProps({
    renderLostConnectWarnMsgContainer: LostConnectWarnMsgContainer,
    renderErrorMsgBarContainer: ErrorMsgBarContainer,
    renderStompLogPanelContainer: StompLogPanelContainer,
    renderConnectBtnContainer: ConnectBtnContainer
  })
)(Root);

export { RootContainer };
