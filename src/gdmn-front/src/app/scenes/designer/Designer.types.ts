import { IViewTab } from "../gdmn/types";
import { ThunkDispatch } from "redux-thunk";
import { IState } from "@src/app/store/reducer";
import { GdmnAction } from "../gdmn/actions";
import { ERModel, Entity } from "gdmn-orm";
import { RecordSet } from 'gdmn-recordset';
import { IDesignerState } from './Designer';
import { IGrid, IObject } from './types';

export interface IDesignerContainerProps {
  url: string;
  entityName: string;
};

export interface IDesignerStateProps {
  viewTab?: IViewTab;
  theme: string;
  erModel?: ERModel;
  entity: Entity;
  rs?: RecordSet;
};

export interface IDesignerProps extends IDesignerContainerProps, IDesignerStateProps {
  dispatch: ThunkDispatch<IState, never, GdmnAction>;
  entityName: string;
  grid: IGrid;
  objects: IObject[];
  outDesignerMode: () => void;
  applaySetting: (settings: IDesignerState | undefined) => void;
};
