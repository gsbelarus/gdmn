import { compose, withProps } from 'recompose';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { hot } from 'react-hot-loader';
import { Snackbar } from '@material-ui/core';

import { selectRootState } from '@src/app/store/selectors';
import { IState } from '@src/app/store/reducer';
import { Root } from '@src/app/scenes/root/component';
import { rootActions } from '@src/app/scenes/root/actions';

const staticSnackbarProps = {
  style: { alignItems: 'flex-end', height: 'auto' },
  anchorOrigin: { vertical: 'bottom', horizontal: 'center' }
};

const SnackbarContainer = connect(
  (state: IState) => ({
    message: selectRootState(state).snackbarMessage,
    open: !!selectRootState(state).snackbarMessage,
    ...staticSnackbarProps
  }),
  dispatch => ({
    onClose: bindActionCreators(rootActions.hideMessage, dispatch)
  })
)(Snackbar as any); // fixme: type

const RootContainer = compose(
  hot(module),
  withProps({
    renderSnackbarContainer: SnackbarContainer
  })
)(Root as any); // fixme: type

export { RootContainer };
