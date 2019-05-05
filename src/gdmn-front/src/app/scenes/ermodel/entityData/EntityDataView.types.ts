import { IDataViewProps } from "@src/app/components/DataView";
import { IPhraseForQuery } from "../../gdmn/reducer";

export interface IEntityMatchParams {
  entityName: string
};

export interface IEntityDataViewProps extends IDataViewProps<IEntityMatchParams> {
  phrasesForQuery: IPhraseForQuery[];
  onEdit: (url: string) => void;
  onDelete: () => void;
  onChange: (text: string) => void;
  onDeletePhrase: () => void;
  onAddPhrase: () => void;
};