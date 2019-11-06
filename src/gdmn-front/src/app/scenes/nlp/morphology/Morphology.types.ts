import { RouteComponentProps } from "react-router";
import { IViewTab } from "../../gdmn/types";
import { ThunkDispatch } from "redux-thunk";
import { IState } from "@src/app/store/reducer";
import { GdmnAction } from "../../gdmn/actions";

export interface IMorphologyRouteProps {
  word?: string;
};

export interface IMorphologyContainerProps extends RouteComponentProps<IMorphologyRouteProps> {
  word?: string;
  url: string;
};

export interface IMorphologyStateProps {
  viewTab?: IViewTab;
  theme: string;
};

export interface IMorphologyProps extends IMorphologyContainerProps, IMorphologyStateProps {
  dispatch: ThunkDispatch<IState, never, GdmnAction>;
};