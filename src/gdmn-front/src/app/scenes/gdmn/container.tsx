import { compose, lifecycle } from 'recompose';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router';
import { GdmnView, IGdmnViewProps } from '@src/app/scenes/gdmn/component';
import { IState } from '@src/app/store/reducer';
import { gdmnActions } from '@src/app/scenes/gdmn/actions';
import { selectGdmnState } from '@src/app/store/selectors';

export const GdmnContainer = compose<IGdmnViewProps, RouteComponentProps<any>>(
  withRouter,
  connect(
    (state: IState) => ({
      loading: selectGdmnState(state).loading,
      loadingMessage: selectGdmnState(state).loadingMessage,
      errorMessage: state.rootState.errorMsgBarText,
      lostConnectWarnOpened: state.rootState.lostConnectWarnOpened
    }),
    dispatch => ({
      dispatch
    })
  ),
  lifecycle<IGdmnViewProps, IGdmnViewProps>({
    componentDidMount() {
      this.props.dispatch(gdmnActions.apiConnect());
    },
    componentWillUnmount() {
      this.props.dispatch(gdmnActions.apiDisconnect());
    }
  })
)(GdmnView);