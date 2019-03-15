import {connectView} from "@src/app/components/connectView";
import {SqlView} from "@src/app/scenes/gdmn/components/sql/SqlView";
import {IState} from "@src/app/store/reducer";
import {selectGdmnState} from "@src/app/store/selectors";
import {connect} from "react-redux";
import {RouteComponentProps} from "react-router";
import {compose} from "recompose";

export const SqlViewContainer = compose<any, RouteComponentProps<any>>(
  connectView,
  connect(
    (state: IState) => ({
      erModel: selectGdmnState(state).erModel
    }),
    dispatch => ({
      run: () => console.log("run"),
      onChange: (ev: any, text?: string) => console.log(text)
    })
  )
)(SqlView);
