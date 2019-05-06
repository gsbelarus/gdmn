import { RecordSet } from "gdmn-recordset";
import { Entity, ERModel } from "gdmn-orm";
import { IViewTab } from "../../gdmn/types";

export type TAddViewTab = (viewTab: IViewTab) => void;

export interface IEntityDataDlgRouteProps {
  entityName: string;
  id: string;
};

export interface IEntityDataDlgContainerProps {
  url: string;
  entityName: string;
  id: string;
};

export interface IEntityDataDlgStateProps {
  rs?: RecordSet;
  entity?: Entity;
  erModel: ERModel;
};

export interface IEntityDataDlgProps {
  rs?: RecordSet;
  entity?: Entity;
  erModel: ERModel;
  url: string;
  entityName: string;
  id: string;
  addViewTab: TAddViewTab;
  loadRS: (name: string, entity: Entity, id: string) => void;
};
