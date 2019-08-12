import {RecordSet, RSAction} from "gdmn-recordset";
import { RouteComponentProps } from "react-router";
import {ThunkDispatch} from "redux-thunk";
import {IState} from "@src/app/store/reducer";
import {GdmnAction} from "@src/app/scenes/gdmn/actions";
import {IViewTab} from "@src/app/scenes/gdmn/types";
import {ERModel} from "gdmn-orm";
import {GridComponentState} from "gdmn-grid";

export interface INewEntityRouteProps {
  entityName: string;
  id: string;
};

export interface INewEntityContainerProps extends RouteComponentProps<INewEntityRouteProps> {
  newRecord: boolean;
  url: string;
};

export interface INewEntityStateProps {
  erModel?: ERModel;
  viewTab?: IViewTab;
  gcsEntities?: GridComponentState;
};

export interface INewEntityProps extends RouteComponentProps<INewEntityRouteProps>, INewEntityStateProps {
  rs?: RecordSet;
  dispatch: ThunkDispatch<IState, never, RSAction | GdmnAction>;
  url: string;
  viewTab?: IViewTab;
};
