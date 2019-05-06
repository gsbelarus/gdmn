import { IDataViewProps } from "@src/app/components/DataView";
import { Semaphore } from "gdmn-internals";

export interface IEntityMatchParams {
  entityName: string
};

export interface IEntityDataViewProps extends IDataViewProps<IEntityMatchParams> {
  attachRs: (mutex?: Semaphore, queryPhrase?: string) => void;
  onEdit: (url: string) => void;
  onDelete: () => void;
};