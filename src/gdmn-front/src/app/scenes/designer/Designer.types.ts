import { IViewTab } from "../gdmn/types";
import { IFieldDef, RecordSet } from 'gdmn-recordset';
import { Entity } from 'gdmn-orm';

export interface IDesignerStateProps {
  viewTab?: IViewTab;
};

export interface IDesignerProps {
  entityName: string;
  outDesigner: () => void;
  viewTab?: IViewTab;
  fields?: IFieldDef[];
  entity?: Entity;
  rs?: RecordSet;
};
