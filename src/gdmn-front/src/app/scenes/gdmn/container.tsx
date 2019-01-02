import { compose, lifecycle } from 'recompose';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { GdmnView, TGdmnViewProps, TGdmnViewStateProps } from '@src/app/scenes/gdmn/component';
import { authActions } from '@src/app/scenes/auth/actions';
import { IState } from '@src/app/store/reducer';
import { GdmnPubSubApi } from '@src/app/services/GdmnPubSubApi';
import { gdmnActions } from '@src/app/scenes/gdmn/actions';
import { selectGdmnState } from '@src/app/store/selectors';
import { rootActions } from '@src/app/scenes/root/actions';
import { bindViewDispatch } from '@src/app/components/bindViewDispatch';
import { withRouter, RouteComponentProps } from 'react-router';
import { deleteRecordSet } from 'gdmn-recordset';
import { IViewTab } from './types';

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
      }),
      (stateProps, dispatchProps, ownProps: RouteComponentProps<any>): TGdmnViewStateProps => ({
        ...stateProps,
        ...dispatchProps,
        onCloseTab: (url: string) => {
          const { match, history } = ownProps;
          const { viewTabs } = stateProps;
          const { dispatch } = dispatchProps;
          let tabToDelete: IViewTab | undefined = undefined;

          if (match && viewTabs.length) {
            if (viewTabs.length === 1) {
              history.push(match.path);
              tabToDelete = viewTabs[0];
            } else {
              const foundIdx = viewTabs.findIndex( vt => vt.url === url );
              if (foundIdx >= 0) {
                history.push(foundIdx > 0 ? viewTabs[foundIdx - 1].url : viewTabs[foundIdx + 1].url);
                tabToDelete = viewTabs[foundIdx];
              }
            }
          }

          if (tabToDelete) {
            dispatch(gdmnActions.deleteViewTab(tabToDelete));
            if (tabToDelete.rs) {
              tabToDelete.rs.forEach( name => dispatch(deleteRecordSet({ name })) );
            }
          }
        }
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
