import { connect } from 'react-redux';
import { IState } from '@src/app/store/reducer';
import { connectView } from '@src/app/components/connectView';
import { compose } from 'recompose';
import { Internals } from './component';
import { StompLogPanel } from './components/StompLogPanel';
import { rootActions } from '../root/actions';
import { DefaultButton } from 'office-ui-fabric-react';

export const StompLogPanelContainer = connect((state: IState) => ({
  logItems: state.rootState.logItems
}))(StompLogPanel);

export const ConnectBtnContainer = connect(
  () => ({
    disabled: false, // TODO !selectRootState(state).disconnectedMode,
    iconProps: { iconName: 'Sync' },
    text: 'connect to server'
  }),
  dispatch => ({
    onClick: () => dispatch(rootActions.netReconnect())
  })
)(DefaultButton);

export const InternalsContainer = compose<any, any>(
  connect(
    (state: IState) => {
      return {
        erModel: state.gdmnState.erModel,
        recordSet: state.recordSet,
        rsMeta: state.rsMeta,
        viewTabs: state.gdmnState.viewTabs
      }
    }
  ),
  connectView
)(Internals);