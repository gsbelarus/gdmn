import { compose, lifecycle, withProps } from 'recompose';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import withBreadcrumbs from 'react-router-breadcrumbs-hoc';
import { GdmnView, TGdmnViewProps, TGdmnViewStateProps } from '@src/app/scenes/gdmn/component';
import { authActions } from '@src/app/scenes/auth/actions';
import { IState } from '@src/app/store/reducer';
import { GdmnPubSubApi } from '@src/app/services/GdmnPubSubApi';
import { gdmnActions } from '@src/app/scenes/gdmn/actions';

const getGdmnContainer = (apiService: GdmnPubSubApi) =>
  compose<TGdmnViewProps, TGdmnViewProps>(
    connect(
      (state: IState, ownProps: TGdmnViewProps): TGdmnViewStateProps => ({ erModel: state.gdmnState.erModel }),
      dispatch => ({
        apiConnect: bindActionCreators(gdmnActions.apiConnect, dispatch),
        apiDisconnect: bindActionCreators(gdmnActions.apiDisconnect, dispatch),
        apiPing: bindActionCreators(gdmnActions.apiPing, dispatch),
        apiGetSchema: bindActionCreators(gdmnActions.apiGetSchema, dispatch),
        apiDeleteAccount: bindActionCreators(gdmnActions.apiDeleteAccount, dispatch),
        signOut: bindActionCreators(authActions.signOut, dispatch)
      })
    ),
    lifecycle<TGdmnViewProps, any>({
      componentDidMount() {
        this.props.apiConnect();
      },
      componentWillUnmount() {
        this.props.apiDisconnect();
      }
    }),
    withBreadcrumbs<TGdmnViewProps>([{ path: '/spa/gdmn/datastores/:appId', breadcrumb: '❖' }], {
      excludePaths: ['/', '/spa']
    })
  )(GdmnView);

export { getGdmnContainer };
