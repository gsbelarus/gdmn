import { RecordSet, RSAction } from "gdmn-recordset";
import { GridComponentState, GridAction } from "gdmn-grid";
import { ThunkDispatch } from "redux-thunk";
import { IState } from "@src/app/store/reducer";
import { GdmnAction } from "../gdmn/actions";
import { RouteComponentProps } from "react-router";
import { IViewTab } from "../gdmn/types";
import { ERModel } from "gdmn-orm";

export interface IERModelView2ContainerProps extends RouteComponentProps<any> { };

export interface IERModelView2StateProps {
  entities?: RecordSet;
  attributes?: RecordSet;
  gcsEntities?: GridComponentState;
  gcsAttributes?: GridComponentState;
  viewTab?: IViewTab;
  erModel?: ERModel;
};

export interface IERModelView2Props extends IERModelView2ContainerProps, IERModelView2StateProps {
  dispatch: ThunkDispatch<IState, never, RSAction | GdmnAction | GridAction>;
};