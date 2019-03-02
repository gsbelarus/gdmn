import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { compose, withProps } from 'recompose';
import { DefaultButton } from 'office-ui-fabric-react';

import { IRootProps, Root } from '@src/app/scenes/root/component';
import { IState } from '@src/app/store/reducer';
import { selectRootState } from '@src/app/store/selectors';
import { rootActions } from '@src/app/scenes/root/actions';
import { StompLogPanel } from '@src/app/scenes/root/components/StompLogPanel';

const StompLogPanelContainer = connect((state: IState) => ({
  logItems: selectRootState(state).logItems
}))(StompLogPanel);

const ConnectBtnContainer = connect(
  () => ({
    disabled: false, // TODO !selectRootState(state).disconnectedMode,
    iconProps: { iconName: 'Sync' },
    text: 'connect to server'
  }),
  dispatch => ({
    onClick: bindActionCreators(rootActions.netReconnect, dispatch)
  })
)(DefaultButton);

export const RootContainer = compose<IRootProps, IRootProps>(
  withProps({
    renderStompLogPanelContainer: StompLogPanelContainer,
    renderConnectBtnContainer: ConnectBtnContainer
  })
)(Root);

