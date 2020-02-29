import { RouteComponentProps } from "react-router-dom";
import { IViewTab } from "../gdmn/types";
import { ThunkDispatch } from "redux-thunk";
import { IState } from "@src/app/store/reducer";
import { GdmnAction } from "../gdmn/actions";

export interface ICodeViewContainerProps extends RouteComponentProps<any> {
  url: string;
};

export interface ICodeViewStateProps {
  viewTab?: IViewTab;
};

export interface ICodeViewProps extends ICodeViewContainerProps, ICodeViewStateProps {
  dispatch: ThunkDispatch<IState, never, GdmnAction>;
};