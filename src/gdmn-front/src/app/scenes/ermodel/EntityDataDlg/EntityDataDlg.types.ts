import { RecordSet, RSAction } from "gdmn-recordset";
import { Entity, ERModel } from "gdmn-orm";
import { IViewTab } from "../../gdmn/types";
import { RouteComponentProps } from "react-router";
import { ThunkDispatch } from "redux-thunk";
import { IState } from "@src/app/store/reducer";
import { GdmnAction } from "../../gdmn/actions";

export interface IEntityDataDlgRouteProps {
  entityName: string;
  id: string;
};

export interface IEntityDataDlgContainerProps extends RouteComponentProps<IEntityDataDlgRouteProps> {
  url: string;
  entityName: string;
  id: string;
  newRecord: boolean;
};

export interface IEntityDataDlgStateProps {
  rs?: RecordSet;
  entity?: Entity;
  srcRs?: RecordSet;
  viewTab?: IViewTab;
  erModel: ERModel;
};

export interface IEntityDataDlgProps extends RouteComponentProps<IEntityDataDlgRouteProps> {
  rs?: RecordSet;
  entity?: Entity;
  url: string;
  entityName: string;
  id: string;
  dispatch: ThunkDispatch<IState, never, RSAction | GdmnAction>;
  srcRs?: RecordSet;
  viewTab?: IViewTab;
  erModel: ERModel;
  newRecord: boolean;
};
