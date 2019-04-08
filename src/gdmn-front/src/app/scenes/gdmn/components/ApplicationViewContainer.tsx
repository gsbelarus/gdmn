import { bindActionCreators } from "redux";
import { RouteComponentProps } from "react-router";
import { connectView } from "@src/app/components/connectView";
import { connect } from "react-redux";
import { gdmnActionsAsync, gdmnActions } from "../actions";
import { compose } from "recompose";
import { ApplicationView } from './ApplicationView';
import { IState } from '@src/app/store/reducer';

export const ApplicationViewContainer = compose<any, RouteComponentProps<any>>(
  connectView,
  connect(
    (state: IState) => {
      return {
        apps: state.gdmnState.apps,
        userName: state.authState.signInInitialValues.userName,
        password: state.authState.signInInitialValues.password,
        runAction: state.gdmnState.runAction,
        actionWithApplication: state.gdmnState.actionWithApplication ? state.gdmnState.actionWithApplication : undefined
      };
    },
    dispatch => ({
      apiGetApplications: bindActionCreators(gdmnActionsAsync.apiGetApps, dispatch),
      apiCreateApplication: bindActionCreators(gdmnActionsAsync.apiCreateApp, dispatch),
      apiDeleteApplication: bindActionCreators(gdmnActionsAsync.apiDeleteApp, dispatch),
      apiSetApplication: (app: Object) => dispatch(gdmnActions.setApplication(app)),
      signIn: bindActionCreators(gdmnActionsAsync.signIn, dispatch),
      signOut: bindActionCreators(gdmnActionsAsync.signOut, dispatch),
    })
  )
)(ApplicationView);
