import { IViewTab } from "../gdmn/types";
import { GdmnAction } from "../gdmn/actions";
import { IState } from "@src/app/store/reducer";
import { ThunkDispatch } from "redux-thunk";

export interface IBPContainerProps {
  url: string;
};

export interface IBPStateProps {
  viewTab?: IViewTab;
};

export interface IBPProps {
  url: string;
  dispatch: ThunkDispatch<IState, never, GdmnAction>;
  viewTab?: IViewTab;
};
