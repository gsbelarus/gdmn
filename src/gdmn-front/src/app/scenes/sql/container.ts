import {connectView} from "@src/app/components/connectView";
import {IViewProps} from "@src/app/components/View";
import {IViewTab} from "@src/app/scenes/gdmn/types";
import {clear, init, setExpression} from "@src/app/scenes/sql/actions";
import { createQuery  } from '@src/app/scenes/sql/data/actions';
import {SqlView} from "@src/app/scenes/sql/component";
import {IState} from "@src/app/store/reducer";
import {connect} from "react-redux";
import {RouteComponentProps} from "react-router";
import {compose} from "recompose";

export const SqlViewContainer = compose<any, RouteComponentProps<any>>(
  connectView,
  connect(
    (state: IState) => ({
      expression: state.sqlState.expression
    }),
    (dispatch, ownProps: IViewProps) => ({
      addViewTab: (viewTab: IViewTab) => {  // overriding
        dispatch(init(viewTab.url));
        ownProps.addViewTab(viewTab); // call super
      },
      run: () => {
        dispatch(createQuery())
        console.log("run")
      },
      clear: () => dispatch(clear()),
      onChange: (ev: any, text?: string) => dispatch(setExpression(text || ""))
    })
  )
)(SqlView);
