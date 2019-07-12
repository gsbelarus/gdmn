import { IViewTab } from "../gdmn/types";
import { IFieldDef } from 'gdmn-recordset';

export interface IDesignerStateProps {
  viewTab?: IViewTab;
};

export interface IDesignerProps {
  entityName: string;
  outDesigner: () => void;
  viewTab?: IViewTab;
  fields?: IFieldDef[];
};
