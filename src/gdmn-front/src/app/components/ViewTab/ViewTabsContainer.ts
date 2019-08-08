import { connect } from 'react-redux';
import { IState } from '@src/app/store/reducer';
import { IViewTab } from '@src/app/scenes/gdmn/types';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { ViewTabs } from './ViewTabs';
import { gdmnActions } from '@src/app/scenes/gdmn/actions';

export const ViewTabsContainer = connect(
  (state: IState) => ({
    recordSet: state.recordSet,
    rsMeta: state.rsMeta,
    viewTabs: state.gdmnState.viewTabs,
    theme: state.gdmnState.theme
  }),
  (dispatch, ownProps: RouteComponentProps<any>) => ({
    onClose: (viewTab: IViewTab) => {
      const { history } = ownProps;
      dispatch(gdmnActions.deleteViewTab({
        viewTabURL: viewTab.url,
        locationPath: location.pathname,
        historyPush: history.push
      }));
    }
  }),
)(withRouter(ViewTabs));
