import { compose, lifecycle } from 'recompose';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { GdmnView, TGdmnViewProps, TGdmnViewStateProps } from '@src/app/scenes/gdmn/component';
import { authActions } from '@src/app/scenes/auth/actions';
import { IState } from '@src/app/store/reducer';
import { GdmnPubSubApi } from '@src/app/services/GdmnPubSubApi';
import { gdmnActions } from '@src/app/scenes/gdmn/actions';
import { selectGdmnState } from '@src/app/store/selectors';

// fixme: compose<any, TGdmnViewProps>

const getGdmnContainer = (apiService: GdmnPubSubApi) =>
  compose<any, TGdmnViewProps>(
    connect(
      (state: IState, ownProps: TGdmnViewProps): TGdmnViewStateProps => ({
        erModel: selectGdmnState(state).erModel,
        loading: selectGdmnState(state).loading,
        loadingMessage: selectGdmnState(state).loadingMessage
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
    })
  )(GdmnView);

export { getGdmnContainer };
