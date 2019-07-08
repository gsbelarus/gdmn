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
  id: string;
  url: string;
};

export interface ISQLStateProps {
  rs?: RecordSet;
  gcs: GridComponentState;
  viewTab?: IViewTab;
};

export interface ISQLProps extends ISqlContainerProps, ISQLStateProps {
  dispatch: ThunkDispatch<IState, never, RSAction | GdmnAction | GridAction | TRsMetaActions | SqlQueryActions>;
};
