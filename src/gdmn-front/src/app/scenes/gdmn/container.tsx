import { compose, lifecycle } from 'recompose';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { GdmnView, TGdmnViewProps } from '@src/app/scenes/gdmn/component';
import { authActionsAsync } from '@src/app/scenes/auth/actions';
import { IState } from '@src/app/store/reducer';
import { gdmnActions, gdmnActionsAsync } from '@src/app/scenes/gdmn/actions';
import { selectGdmnState } from '@src/app/store/selectors';
import { rootActions } from '@src/app/scenes/root/actions';
import { bindViewDispatch } from '@src/app/components/bindViewDispatch';

// fixme: compose<any, TGdmnViewProps>

const getGdmnContainer = () =>
  compose<any, TGdmnViewProps>(
    connect(
      (state: IState) => ({
        erModel: selectGdmnState(state).erModel,
        loading: selectGdmnState(state).loading,
        loadingMessage: selectGdmnState(state).loadingMessage,
        viewTabs: selectGdmnState(state).viewTabs
      }),
      dispatch => ({
        ...bindViewDispatch(dispatch),
        dispatch,
        apiPing: bindActionCreators(gdmnActionsAsync.apiPing, dispatch),
        apiDeleteAccount: bindActionCreators(gdmnActionsAsync.apiDeleteAccount, dispatch),
        apiGetData: bindActionCreators(gdmnActionsAsync.apiGetData, dispatch),
        signOut: bindActionCreators(authActionsAsync.signOut, dispatch),
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
