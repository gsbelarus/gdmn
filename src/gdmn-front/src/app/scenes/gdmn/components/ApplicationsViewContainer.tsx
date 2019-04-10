import { bindActionCreators } from "redux";
import { RouteComponentProps } from "react-router";
import { connectView } from "@src/app/components/connectView";
import { connect } from "react-redux";
import { gdmnActionsAsync, gdmnActions } from "../actions";
import { compose } from "recompose";
import { ApplicationsView } from './ApplicationsView';
import { IState } from '@src/app/store/reducer';
import { IApplicationInfo } from '@gdmn/server-api';

export const ApplicationsViewContainer = compose<any, RouteComponentProps<any>>(
  connectView,
  connect(
    (state: IState) => {
      return {
        apps: state.gdmnState.apps,
        userName: state.authState.signInInitialValues.userName,
        password: state.authState.signInInitialValues.password,
      };
    },
    dispatch => ({
      apiGetApplications: bindActionCreators(gdmnActionsAsync.apiGetApps, dispatch),
      apiCreateApplication: bindActionCreators(gdmnActionsAsync.apiCreateApp, dispatch),
      apiDeleteApplication: bindActionCreators(gdmnActionsAsync.apiDeleteApp, dispatch),
      apiSetApplication: (app: IApplicationInfo) => dispatch(gdmnActions.setApplication(app)),
      signIn: bindActionCreators(gdmnActionsAsync.signIn, dispatch),
      signOut: bindActionCreators(gdmnActionsAsync.signOut, dispatch),
    })
  )
)(ApplicationsView);
