import { IViewTab } from "../gdmn/types";
import { GdmnAction } from "../gdmn/actions";
import { IState } from "@src/app/store/reducer";
import { ThunkDispatch } from "redux-thunk";
import { IFieldDef } from 'gdmn-recordset';
import { IDesignerState } from './Designer';

export interface IDesignerStateProps {
  viewTab?: IViewTab;
};

export interface IDesignerProps {
  entityName: string;
  outDesigner: () => void;
  viewTab?: IViewTab;
  fields?: IFieldDef[];
  componentRef: (ref: IDesignerState | undefined) => void;
};
