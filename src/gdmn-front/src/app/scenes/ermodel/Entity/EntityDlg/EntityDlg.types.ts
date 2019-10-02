import { RouteComponentProps } from "react-router";
import { IViewTab } from "@src/app/scenes/gdmn/types";
import { ThunkDispatch } from "redux-thunk";
import { IState } from "@src/app/store/reducer";
import { GdmnAction } from "@src/app/scenes/gdmn/actions";
import { ERModel } from "gdmn-orm";
import {RecordSet, RSAction} from "gdmn-recordset";

export interface IEntityDlgRouteProps {
  entityName: string;
  uniqueID: string;
};

export interface IEntityDlgContainerProps extends RouteComponentProps<IEntityDlgRouteProps> {
  url: string;
  createEntity?: boolean;
  entityName?: string;
};

export interface IEntityDlgStateProps {
  erModel?: ERModel;
  viewTab?: IViewTab;
  entities?: RecordSet;
};

export interface IEntityDlgProps extends RouteComponentProps<IEntityDlgRouteProps>, IEntityDlgStateProps {
  dispatch: ThunkDispatch<IState, never, RSAction | GdmnAction>;
  url: string;
  viewTab?: IViewTab;
  entityName?: string;
  createEntity?: boolean;
  uniqueID?: string;
};
