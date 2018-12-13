import { compose, lifecycle, withProps } from 'recompose';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import withBreadcrumbs from 'react-router-breadcrumbs-hoc';

import { GdmnView, TGdmnViewProps, TGdmnViewStateProps } from '@src/app/scenes/gdmn/component';
import { authActions } from '@src/app/scenes/auth/actions';
import { IState } from '@src/app/store/reducer';
import { GdmnPubSubApi } from '@src/app/services/GdmnPubSubApi';
import { gdmnActions } from '@src/app/scenes/gdmn/actions';
import { selectGdmnState } from '@src/app/store/selectors';

interface IDispatchToProps extends TGdmnViewProps {
  // todo GdmnActionsProps
  dispatch: Dispatch<any>; // TODO
}

// fixme: compose<any, TGdmnViewProps>

const getGdmnContainer = (apiService: GdmnPubSubApi) =>
  compose<any, TGdmnViewProps>(
    connect(
      (state: IState, ownProps: TGdmnViewProps): TGdmnViewStateProps => ({
        erModel: selectGdmnState(state).erModel
      }),
      dispatch => ({
        dispatch,
        apiPing: bindActionCreators(gdmnActions.apiPing, dispatch),
        apiDeleteAccount: bindActionCreators(gdmnActions.apiDeleteAccount, dispatch),
        apiGetData: bindActionCreators(gdmnActions.apiGetData, dispatch),
        signOut: bindActionCreators(authActions.signOut, dispatch)
      })
    ),
    lifecycle<TGdmnViewProps, TGdmnViewProps>({
      componentDidMount() {
        this.props.dispatch(gdmnActions.apiConnect());
      },
      componentWillUnmount() {
        this.props.dispatch(gdmnActions.apiDisconnect());
      }
    }),
    withBreadcrumbs<TGdmnViewProps>([{ path: '/spa/gdmn/datastores/:appId', breadcrumb: '❖' }], {
      excludePaths: ['/', '/spa']
    })
  )(GdmnView);

export { getGdmnContainer };
