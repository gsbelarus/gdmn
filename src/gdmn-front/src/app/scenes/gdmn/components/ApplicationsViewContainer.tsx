import {IApplicationInfo} from "@gdmn/server-api";
import {connectView} from "@src/app/components/connectView";
import {IState} from "@src/app/store/reducer";
import {connect} from "react-redux";
import {RouteComponentProps} from "react-router";
import {compose} from "recompose";
import {bindActionCreators} from "redux";
import {gdmnActions, gdmnActionsAsync} from "../actions";
import {ApplicationsView} from "./ApplicationsView";

export const ApplicationsViewContainer = compose<any, RouteComponentProps<any>>(
  connectView,
  connect(
    (state: IState) => {
      return {
        apps: state.gdmnState.apps,
        userName: state.authState.signInInitialValues.userName,
        password: state.authState.signInInitialValues.password
      };
    },
    dispatch => ({
      apiGetApplications: bindActionCreators(gdmnActionsAsync.apiGetApps, dispatch),
      apiCreateApplication: bindActionCreators(gdmnActionsAsync.apiCreateApp, dispatch),
      apiDeleteApplication: bindActionCreators(gdmnActionsAsync.apiDeleteApp, dispatch),
      apiSetApplication: (app: IApplicationInfo) => {
        dispatch(gdmnActions.getApps([]));
        dispatch(gdmnActions.deleteViewTab({caption: 'List application', url: '/spa/gdmn/applications'}));
        dispatch(gdmnActions.apiDisconnect());
        dispatch(gdmnActions.setApplication(app));
        dispatch(gdmnActions.apiConnect());
      },
      signIn: bindActionCreators(gdmnActionsAsync.signIn, dispatch),
      signOut: bindActionCreators(gdmnActionsAsync.signOut, dispatch)
    })
  )
)(ApplicationsView);
