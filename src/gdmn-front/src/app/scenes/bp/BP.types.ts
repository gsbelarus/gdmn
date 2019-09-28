import { IViewTab } from "../gdmn/types";
import { GdmnAction } from "../gdmn/actions";
import { IState } from "@src/app/store/reducer";
import { ThunkDispatch } from "redux-thunk";
import { FSM } from "@src/app/fsm/fsm";
import { FSMActions } from "@src/app/fsm/actions";
import { RouteComponentProps } from "react-router";

export interface IBPContainerProps extends RouteComponentProps<any> {
  url: string;
};

export interface IBPStateProps {
  viewTab?: IViewTab;
  fsm?: FSM;
  theme: string;
};

export interface IBPProps extends IBPContainerProps, IBPStateProps {
  dispatch: ThunkDispatch<IState, never, GdmnAction | FSMActions>;
};
