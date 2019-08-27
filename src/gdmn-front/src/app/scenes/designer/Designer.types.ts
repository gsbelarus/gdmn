import { IViewTab } from "../gdmn/types";
import { ThunkDispatch } from "redux-thunk";
import { IState } from "@src/app/store/reducer";
import { GdmnAction } from "../gdmn/actions";
import { ERModel } from "gdmn-orm";

export interface IDesignerContainerProps {
  url: string;
};

export interface IDesignerStateProps {
  viewTab?: IViewTab;
  theme: string;
  erModel?: ERModel;
};

export interface IDesignerProps extends IDesignerContainerProps, IDesignerStateProps {
  dispatch: ThunkDispatch<IState, never, GdmnAction>;
  entityName: string,
};
