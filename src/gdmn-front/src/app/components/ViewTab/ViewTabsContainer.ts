import { connect } from 'react-redux';
import { IState } from '@src/app/store/reducer';
import { IViewTab } from '@src/app/scenes/gdmn/types';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { IViewTabsProps, ViewTabs } from './ViewTabs';
import { gdmnActions } from '@src/app/scenes/gdmn/actions';
import { loadRSActions } from '@src/app/store/loadRSActions';

export const ViewTabsContainer = connect(
  (state: IState) => ({
    recordSet: state.recordSet,
    rsMeta: state.rsMeta,
    viewTabs: state.gdmnState.viewTabs
  }),
  dispatch => ({
    dispatch
  }),
  (stateProps, dispatchProps, ownProps: RouteComponentProps<any>): IViewTabsProps => ({
    ...stateProps,
    onClose: async (vt: IViewTab) => {
      const {history, location} = ownProps;
      const {viewTabs} = stateProps;
      const {dispatch} = dispatchProps;

      const foundIdx = viewTabs.findIndex(t => t === vt);

      if (foundIdx === -1) return;

      let nextPath = "";

      if (location.pathname === vt.url) {
        if (viewTabs.length === 1) {
          nextPath = "/spa/gdmn";
        } else {
          nextPath = foundIdx > 0 ? viewTabs[foundIdx - 1].url : viewTabs[foundIdx + 1].url;
        }
      }

      if (nextPath) {
        history.push(nextPath);
      }

      dispatch(gdmnActions.deleteViewTab(vt));

      if (vt.rs) {
        vt.rs
          .filter( name => !viewTabs.find( t => t !== vt && !!t.rs && !!t.rs.find( n => n === name ) ) )
          .forEach( name => dispatch(loadRSActions.deleteRS({ name })) );
      }
    }
  })
)(withRouter(ViewTabs));
