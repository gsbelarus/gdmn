import { RouteComponentProps } from "react-router";
import { IViewTab } from "../../gdmn/types";
import { ThunkDispatch } from "redux-thunk";
import { IState } from "@src/app/store/reducer";
import { GdmnAction } from "../../gdmn/actions";
import { ERModel } from "gdmn-orm";

export interface ISyntaxRouteProps {
};

export interface ISyntaxContainerProps extends RouteComponentProps<ISyntaxRouteProps> {
  url: string;
};

export interface ISyntaxStateProps {
  viewTab?: IViewTab;
  theme: string;
  erModel: ERModel;
};

export interface ISyntaxProps extends ISyntaxContainerProps, ISyntaxStateProps {
  dispatch: ThunkDispatch<IState, never, GdmnAction>;
};