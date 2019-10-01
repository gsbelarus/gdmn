import {ERModel, IAttribute, IEntityAttribute, ISetAttribute} from "gdmn-orm";

export interface IEntityAttributeStateProps {
   erModel: ERModel;
}

export interface IEntityAttributeProps extends IEntityAttributeStateProps {
  useAttributeData: (value: IAttribute | IEntityAttribute | ISetAttribute, idRow: string) => void;
  deleteAttributeData: (idRow: string) => void;
  attributeDataRow:  undefined | IAttribute | IEntityAttribute | ISetAttribute;
  idRow: string;
  setChangesToRowField: () => void;
  newRecord: boolean;
}
