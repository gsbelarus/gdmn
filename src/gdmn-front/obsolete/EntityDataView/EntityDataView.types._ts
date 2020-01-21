import { RouteComponentProps } from "react-router";
import { RecordSet, RSAction } from "gdmn-recordset";
import { Entity, ERModel } from "gdmn-orm";
import { IViewTab } from "../../gdmn/types";
import { ThunkDispatch } from "redux-thunk";
import { IState } from "@src/app/store/reducer";
import { GdmnAction } from "../../gdmn/actions";
import { LoadRSActions } from "@src/app/store/loadRSActions";
import { GridComponentState, GridAction, IGridColors } from "gdmn-grid";

export interface IEntityDataViewRouteProps {
  entityName: string
};

export interface IEntityDataViewContainerProps extends RouteComponentProps<IEntityDataViewRouteProps> {
  url: string;
  entityName: string;
};

export interface IEntityDataViewStateProps {
  rs?: RecordSet;
  masterRs?: RecordSet;
  entity?: Entity;
  viewTab?: IViewTab;
  erModel?: ERModel;
  gcs?: GridComponentState;
  gcsMaster?: GridComponentState;
  gridColors: IGridColors;
};

export interface IEntityDataViewProps extends IEntityDataViewContainerProps, IEntityDataViewStateProps {
  dispatch: ThunkDispatch<IState, never, RSAction | GdmnAction | LoadRSActions | GridAction>;
};