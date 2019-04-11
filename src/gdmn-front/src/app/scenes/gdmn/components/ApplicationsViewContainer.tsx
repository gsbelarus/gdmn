import {connectView} from "@src/app/components/connectView";
import {IState} from "@src/app/store/reducer";
import {connect} from "react-redux";
import {RouteComponentProps} from "react-router";
import {compose} from "recompose";
import {bindActionCreators} from "redux";
import {gdmnActionsAsync} from "../actions";
import {ApplicationsView} from "./ApplicationsView";

export const ApplicationsViewContainer = compose<any, RouteComponentProps<any>>(
  connectView,
  connect(
    (state: IState) => ({
      apps: state.gdmnState.apps
    }),
    dispatch => ({
      apiGetApplications: bindActionCreators(gdmnActionsAsync.apiGetApps, dispatch),
      apiCreateApplication: bindActionCreators(gdmnActionsAsync.apiCreateApp, dispatch),
      apiDeleteApplication: bindActionCreators(gdmnActionsAsync.apiDeleteApp, dispatch),
      apiSetApplication: bindActionCreators(gdmnActionsAsync.reconnectToApp, dispatch),
      signIn: bindActionCreators(gdmnActionsAsync.signIn, dispatch),
      signOut: bindActionCreators(gdmnActionsAsync.signOut, dispatch)
    })
  )
)(ApplicationsView);
