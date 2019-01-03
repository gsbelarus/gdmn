import { compose, lifecycle } from 'recompose';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { GdmnView, TGdmnViewProps } from '@src/app/scenes/gdmn/component';
import { authActions } from '@src/app/scenes/auth/actions';
import { IState } from '@src/app/store/reducer';
import { gdmnActions } from '@src/app/scenes/gdmn/actions';
import { selectGdmnState } from '@src/app/store/selectors';
import { rootActions } from '@src/app/scenes/root/actions';
import { bindViewDispatch } from '@src/app/components/bindViewDispatch';
import { withRouter } from 'react-router';

// fixme: compose<any, TGdmnViewProps>

const getGdmnContainer = () =>
  compose<any, TGdmnViewProps>(
    connect(
      (state: IState) => ({
        erModel: selectGdmnState(state).erModel,
        loading: selectGdmnState(state).loading,
        loadingMessage: selectGdmnState(state).loadingMessage,
        viewTabs: selectGdmnState(state).viewTabs,
      }),
      dispatch => ({
        ...bindViewDispatch(dispatch),
        dispatch,
        apiPing: bindActionCreators(gdmnActions.apiPing, dispatch),
        apiDeleteAccount: bindActionCreators(gdmnActions.apiDeleteAccount, dispatch),
        apiGetData: bindActionCreators(gdmnActions.apiGetData, dispatch),
        signOut: bindActionCreators(authActions.signOut, dispatch),
        onError: bindActionCreators(rootActions.onError, dispatch)
      })
    ),
    lifecycle<TGdmnViewProps, TGdmnViewProps>({
      componentDidMount() {
        this.props.dispatch(gdmnActions.apiConnect());
      },
      componentWillUnmount() {
        this.props.dispatch(gdmnActions.apiDisconnect());
      }
    })
  )(withRouter(GdmnView));

export { getGdmnContainer };
