import {ERModel} from "gdmn-orm";
import {IAttributeData} from "@src/app/scenes/ermodel/utils";
import {ILastFocusedRow} from "@src/app/scenes/ermodel/Entity/new/utils";

export interface IEntityAttributeStateProps {
   erModel: ERModel;
}

export interface IEntityAttributeProps extends IEntityAttributeStateProps {
  useAttributeData: (value: IAttributeData, numberRow: number) => void;
  deleteAttributeData: (numberRow: number) => void;
  attributeData: IAttributeData[];
  numberRow: number;
  useLastFocused: (value: string, numberRow: number) => void;
  lastFocusedRow?: ILastFocusedRow
}
