import { bindActionCreators } from "redux";
import { RouteComponentProps } from "react-router";
import { connectView } from "@src/app/components/connectView";
import { connect } from "react-redux";
import { gdmnActionsAsync } from "../actions";
import { compose } from "recompose";
import { AccountView } from "./AccountView";

export const AccountViewContainer = compose<any, RouteComponentProps<any>>(
  connectView,
  connect(
    undefined,
    dispatch => ({
      apiDeleteAccount: bindActionCreators(gdmnActionsAsync.apiDeleteAccount, dispatch),
    })
  )
)(AccountView);