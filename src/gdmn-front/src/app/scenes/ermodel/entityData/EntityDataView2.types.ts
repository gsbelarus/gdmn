import { RouteComponentProps } from "react-router";
import { RecordSet, RSAction } from "gdmn-recordset";
import { Entity, ERModel } from "gdmn-orm";
import { IViewTab } from "../../gdmn/types";
import { ThunkDispatch } from "redux-thunk";
import { IState } from "@src/app/store/reducer";
import { GdmnAction } from "../../gdmn/actions";
import { LoadRSActions } from "@src/app/store/loadRSActions";
import { GridComponentState, GridAction } from "gdmn-grid";

export interface IEntityDataView2RouteProps {
  entityName: string
};

export interface IEntityDataView2ContainerProps extends RouteComponentProps<IEntityDataView2RouteProps> {
  url: string;
  entityName: string;
};

export interface IEntityDataView2StateProps {
  rs?: RecordSet;
  entity?: Entity;
  viewTab?: IViewTab;
  erModel?: ERModel;
  gcs: GridComponentState;
};

export interface IEntityDataView2Props extends RouteComponentProps<IEntityDataView2RouteProps> {
  rs?: RecordSet;
  entity?: Entity;
  url: string;
  entityName: string;
  dispatch: ThunkDispatch<IState, never, RSAction | GdmnAction | LoadRSActions | GridAction>;
  viewTab?: IViewTab;
  erModel?: ERModel;
  gcs: GridComponentState;
};