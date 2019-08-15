import { IViewTab } from "../gdmn/types";
import { GdmnAction } from "../gdmn/actions";
import { IState } from "@src/app/store/reducer";
import { ThunkDispatch } from "redux-thunk";
import { FSM } from "@src/app/fsm/fsm";
import { FSMActions } from "@src/app/fsm/actions";

export interface IBPContainerProps {
  url: string;
};

export interface IBPStateProps {
  viewTab?: IViewTab;
  fsm?: FSM;
  theme: string;
};

export interface IBPProps {
  url: string;
  dispatch: ThunkDispatch<IState, never, GdmnAction | FSMActions>;
  viewTab?: IViewTab;
  fsm?: FSM;
  theme: string;
};
