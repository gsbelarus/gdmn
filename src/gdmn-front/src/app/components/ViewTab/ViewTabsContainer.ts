import { connect } from 'react-redux';
import { selectGdmnState } from '@src/app/store/selectors';
import { IState } from '@src/app/store/reducer';
import { IViewTab } from '@src/app/scenes/gdmn/types';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { IViewTabsProps, ViewTabs } from './ViewTabs';
import { gdmnActions } from '@src/app/scenes/gdmn/actions';
import { deleteRecordSet } from 'gdmn-recordset';

export const ViewTabsContainer = connect(
  (state: IState) => ({
    recordSet: state.recordSet,
    viewTabs: selectGdmnState(state).viewTabs,
  }),
  dispatch => ({
    dispatch
  }),
  (stateProps, dispatchProps, ownProps: RouteComponentProps<any>): IViewTabsProps => ({
    ...stateProps,
    ...dispatchProps,
    onClose: (url: string) => {
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
)(withRouter(ViewTabs));
