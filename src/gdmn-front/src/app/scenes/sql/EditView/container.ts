import {connectView} from "@src/app/components/connectView";
import {IViewProps} from "@src/app/components/View";
import {IViewTab} from "@src/app/scenes/gdmn/types";
import {SqlActions} from "@src/app/scenes/sql/EditView/reducer";
import {init, clear, setExpression} from "@src/app/scenes/sql/EditView/actions";
import {SqlQueryActions} from '@src/app/scenes/sql/data/reducer';
import {updateQuery} from '@src/app/scenes/sql/data/actions';
import {SqlView} from "@src/app/scenes/sql/EditView/component";
import {IState} from "@src/app/store/reducer";
import {connect} from "react-redux";
import {RouteComponentProps} from "react-router";
import {compose} from "recompose";
import {ThunkDispatch} from "redux-thunk";
// import uuid from "uuid";

export const SqlViewContainer = compose<any, RouteComponentProps<any>>(
  connectView,
  connect(
    (state: IState) => ({
      expression: state.sqlState.expression,
      id: state.sqlState.id
    }),
    (thunkDispatch: ThunkDispatch<IState, never, SqlActions | SqlQueryActions>, ownProps: IViewProps) => ({
      addViewTab: (viewTab: IViewTab) => thunkDispatch((dispatch, getState) => { // overriding
        const requestID = ownProps.match ? ownProps.match.params.id : "";
        const requestRecord = getState().sqlDataViewState.requests.find(itm => itm.id === requestID);

        if (!requestRecord) throw new Error("SQL request was not found"); // temporary throw error

        dispatch(init(requestRecord.expression, requestRecord.id));

        ownProps.addViewTab(viewTab); // call super
      }),
      run: (expression: string, id: string) => thunkDispatch(async dispatch => {
        dispatch(updateQuery(expression, id))
        // console.log(ownProps.match.params);
        // console.log(ownProps.location.pathname);
        const url = ownProps.location.pathname;
        ownProps.history!.push(url.substring(0, url.search('[^/]+(?=/$|$)')-1));
      }),
      clear: () => thunkDispatch((dispatch) => {dispatch(clear())}),
      onChange: (ev: any, text?: string) => thunkDispatch((dispatch) => { dispatch(setExpression(text || ""))})
    })
  )
)(SqlView);
