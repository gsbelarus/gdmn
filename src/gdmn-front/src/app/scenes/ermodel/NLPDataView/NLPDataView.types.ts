import { RouteComponentProps } from "react-router";
import { RecordSet, RSAction } from "gdmn-recordset";
import { ERModel } from "gdmn-orm";
import { IViewTab } from "../../gdmn/types";
import { ThunkDispatch } from "redux-thunk";
import { IState } from "@src/app/store/reducer";
import { GdmnAction } from "../../gdmn/actions";
import { LoadRSActions } from "@src/app/store/loadRSActions";
import { GridComponentState, GridAction, IGridColors } from "gdmn-grid";

export interface INLPDataViewRouteProps {
  viewID: string;
};

export interface INLPDataViewContainerProps extends RouteComponentProps<INLPDataViewRouteProps> {
  url: string;
  rsName: string;
  entityName?: string;
};

export interface INLPDataViewStateProps {
  rs?: RecordSet;
  masterRs?: RecordSet;
  viewTab?: IViewTab;
  erModel?: ERModel;
  gcs?: GridComponentState;
  gcsMaster?: GridComponentState;
  gridColors: IGridColors;
};

export interface INLPDataViewProps extends INLPDataViewContainerProps, INLPDataViewStateProps {
  dispatch: ThunkDispatch<IState, never, RSAction | GdmnAction | LoadRSActions | GridAction>;
};