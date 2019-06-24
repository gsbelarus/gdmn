import { IViewTab } from "../gdmn/types";
import { GdmnAction } from "../gdmn/actions";
import { IState } from "@src/app/store/reducer";
import { ThunkDispatch } from "redux-thunk";
import { IFieldDef } from 'gdmn-recordset';

export interface IDesignerContainerProps {
  url: string;
};

export interface IDesignerStateProps {
  viewTab?: IViewTab;
};

export interface IDesignerProps {
  url: string;
  dispatch: ThunkDispatch<IState, never, GdmnAction>;
  viewTab?: IViewTab;
  fields?: IFieldDef[];
};
