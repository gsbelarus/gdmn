import { IViewTab } from "../gdmn/types";
import { ThunkDispatch } from "redux-thunk";
import { IState } from "@src/app/store/reducer";
import { GdmnAction } from "../gdmn/actions";
import { ERModel, Entity } from "gdmn-orm";
import { RecordSet } from 'gdmn-recordset';
import { IGrid, IObject, Objects } from './types';

/**
 * Объект, с настройками дизайнера, который будет хранится
 * в локальном хранилище или на сервере.
 */
export interface IDesignerSetting {
  grid: IGrid;
  objects: Objects;
};

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
  setting?: IDesignerSetting;
  onSaveSetting: (setting: IDesignerSetting) => void;
  onDeleteSetting: () => void;
  onExit: () => void;
};
