import { RecordSet } from "gdmn-recordset";
import { Entity } from "gdmn-orm";
import { IViewTab } from "../../gdmn/types";
import { RouteComponentProps } from "react-router";
import { Dispatch } from "redux";

export type TAddViewTab = (viewTab: IViewTab) => void;

export interface IEntityDataDlgRouteProps {
  entityName: string;
  id: string;
};

export interface IEntityDataDlgContainerProps extends RouteComponentProps<any> {
  url: string;
  entityName: string;
  id: string;
};

export interface IEntityDataDlgStateProps {
  rs?: RecordSet;
  entity?: Entity;
};

export interface IEntityDataDlgProps extends RouteComponentProps<IEntityDataDlgRouteProps> {
  rs?: RecordSet;
  entity?: Entity;
  url: string;
  entityName: string;
  id: string;
  dispatch: Dispatch;
};
