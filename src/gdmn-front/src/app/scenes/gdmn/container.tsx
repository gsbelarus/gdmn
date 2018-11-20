import { compose, lifecycle, withProps } from 'recompose';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
// import { RefObject } from 'react';
import withBreadcrumbs from 'react-router-breadcrumbs-hoc';
// import { getDataStoresContainer } from '@src/app/scenes/datastores/container';
import { GdmnView, IGdmnViewProps, TGdmnViewStateProps } from '@src/app/scenes/gdmn/component';
import { authActions } from '@src/app/scenes/auth/actions';
import { IState } from '@src/app/store/reducer';
// import { selectDataStoresState } from '@src/app/store/selectors';
// import { getDatastoreContainer } from '@src/app/scenes/datastore/container';
// import { dataStoresActions } from '@src/app/scenes/datastores/actions';
// import { IDatastoreViewProps } from '@src/app/scenes/datastore/component';
// import { getDemosContainer } from '@src/app/scenes/demos/container';
// import { IDemosViewProps } from '@src/app/scenes/demos/component';
import { GdmnPubSubApi } from '@src/app/services/GdmnPubSubApi';
import { TTaskActionNames } from '@gdmn/server-api';
import { gdmnActions } from '@src/app/scenes/gdmn/actions';

const getGdmnContainer = (apiService: GdmnPubSubApi) =>
  compose<IGdmnViewProps, IGdmnViewProps>(
    connect(
      (state: IState, ownProps: IGdmnViewProps): TGdmnViewStateProps => ({
        // ...selectDataStoresState(state)
      }),
      dispatch => ({
        signOut: bindActionCreators(authActions.signOut, dispatch),
        apiConnect() {
          dispatch(gdmnActions.apiConnect());
        },
        apiDisconnect() {
          dispatch(gdmnActions.apiDisconnect());
        },
        apiPing(cmd: any) {
          dispatch(gdmnActions.apiPing(cmd));
        },
        apiDeleteAccount() {
          dispatch(gdmnActions.apiDeleteAccount())
        }
        // loadDataStores() {
        //   dispatch(dataStoresActions.loadDataStores());
        // }
      })
    ),
    withProps<any, IGdmnViewProps>({
      // renderDataStoresViewContainer: getDataStoresContainer(apiService),
      // renderDatastoreViewContainer: getDatastoreContainer(apiService),
      // getDemosContainer: (appBarPortalTargetRef: RefObject<HTMLDivElement>) =>
      //   withProps<any, IDemosViewProps>({ appBarPortalTargetRef })(getDemosContainer(apiService)),
      // getDatastoreViewContainer: (appBarPortalTargetRef: RefObject<HTMLDivElement>) =>
      //   withProps<any, IDatastoreViewProps>({ appBarPortalTargetRef })(getDatastoreContainer(apiService))
    }),
    lifecycle<IGdmnViewProps, any>({
      componentWillMount() {
        this.props.apiConnect();
      },
      componentDidMount() {
        // this.props.loadDataStores();
      },
      componentWillUnmount() {
        // this.props.apiDisconnect();
      }
    }),
    // TODO tmp
    withBreadcrumbs<IGdmnViewProps>([{ path: '/spa/gdmn/datastores/:appId', breadcrumb: '❖' }], {
      excludePaths: ['/', '/spa']
    })
  )(GdmnView);

export { getGdmnContainer };
