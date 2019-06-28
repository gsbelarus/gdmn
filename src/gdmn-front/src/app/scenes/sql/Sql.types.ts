import { IViewTab } from "../gdmn/types";
import { GdmnAction } from "../gdmn/actions";
import { IState } from "@src/app/store/reducer";
import { ThunkDispatch } from "redux-thunk";
import { RecordSet, RSAction } from "gdmn-recordset";
import { GridComponentState, GridAction } from "gdmn-grid";
import { TRsMetaActions } from "@src/app/store/rsmeta";
import { SqlQueryActions } from "./data/reducer";
import { RouteComponentProps } from "react-router";

export interface ISqlContainerProps extends RouteComponentProps{
  sqlName: string;
  url: string;
};

export interface ISqlStateProps {
  rs?: RecordSet;
  gcs: GridComponentState;
  viewTab?: IViewTab;
};

export interface ISqlProps extends ISqlContainerProps, ISqlStateProps {
  dispatch: ThunkDispatch<IState, never, RSAction | GdmnAction | GridAction | TRsMetaActions | SqlQueryActions>;
};
