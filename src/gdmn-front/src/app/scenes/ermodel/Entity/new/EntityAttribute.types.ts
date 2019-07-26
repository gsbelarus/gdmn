import {ERModel} from "gdmn-orm";
import {IAttributeData} from "@src/app/scenes/ermodel/utils";

export interface IEntityAttributeStateProps {
   erModel: ERModel;
}

export interface IEntityAttributeProps extends IEntityAttributeStateProps {
  useAttributeData: (value: IAttributeData, numberRow: number) => void
  attributeData: IAttributeData[]
  numberRow: number
}
