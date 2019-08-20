import { IViewTab } from "../gdmn/types";
import { ThunkDispatch } from "redux-thunk";
import { IState } from "@src/app/store/reducer";
import { GdmnAction } from "../gdmn/actions";

export interface IDesigner2ContainerProps {
  url: string;
};

export interface IDesigner2StateProps {
  viewTab?: IViewTab;
  theme: string;
};

export interface IDesigner2Props extends IDesigner2ContainerProps, IDesigner2StateProps {
  dispatch: ThunkDispatch<IState, never, GdmnAction>;
};