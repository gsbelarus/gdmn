import { IViewTab } from "../gdmn/types";
import { GdmnAction } from "../gdmn/actions";
import { IState } from "@src/app/store/reducer";
import { ThunkDispatch } from "redux-thunk";

export interface ISqlContainerProps {
  url: string;
};

export interface ISqlStateProps {
  viewTab?: IViewTab;
};

export interface ISqlProps {
  url: string;
  dispatch: ThunkDispatch<IState, never, GdmnAction>;
  viewTab?: IViewTab;
};
