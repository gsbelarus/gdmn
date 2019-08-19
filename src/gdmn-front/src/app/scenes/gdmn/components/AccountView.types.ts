import { IViewTab } from "../types";
import { ThunkDispatch } from "redux-thunk";
import { IState } from "@src/app/store/reducer";
import { GdmnAction } from "../actions";

export interface IAccountViewContainerProps {
  url: string;
};

export interface IAccountViewProps {
  url: string;
  viewTab?: IViewTab;
  dispatch: ThunkDispatch<IState, never, GdmnAction>;
};

export interface IAccountViewStateProps {
  viewTab?: IViewTab;
};
