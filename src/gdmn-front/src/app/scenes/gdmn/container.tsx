import { compose, lifecycle } from 'recompose';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { GdmnView, TGdmnViewProps } from '@src/app/scenes/gdmn/component';
import { IState } from '@src/app/store/reducer';
import { gdmnActions } from '@src/app/scenes/gdmn/actions';
import { selectGdmnState } from '@src/app/store/selectors';

// fixme: compose<any, TGdmnViewProps>

const GdmnContainer = compose<any, TGdmnViewProps>(
  connect(
    (state: IState) => ({
      loading: selectGdmnState(state).loading,
      loadingMessage: selectGdmnState(state).loadingMessage,
    }),
    dispatch => ({
      dispatch
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

export { GdmnContainer };
