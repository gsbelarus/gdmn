import { RouteComponentProps } from "react-router";
import { IViewTab } from "../../gdmn/types";
import { ThunkDispatch } from "redux-thunk";
import { IState } from "@src/app/store/reducer";
import { GdmnAction } from "../../gdmn/actions";
import { ERModel } from "gdmn-orm";

export interface ISyntax3RouteProps {
};

export interface ISyntax3ContainerProps extends RouteComponentProps<ISyntax3RouteProps> {
  url: string;
};

export interface ISyntax3StateProps {
  viewTab?: IViewTab;
  theme: string;
  erModel: ERModel;
};

export interface ISyntax3Props extends ISyntax3ContainerProps, ISyntax3StateProps {
  dispatch: ThunkDispatch<IState, never, GdmnAction>;
};