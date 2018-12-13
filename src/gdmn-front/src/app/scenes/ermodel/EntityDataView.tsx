import { DataView, IDataViewProps } from '../components/DataView';
import { ERModel } from 'gdmn-orm';

export interface IEntityDataViewProps extends IDataViewProps {
  erModel?: ERModel
}

export class EntityDataView extends DataView<IEntityDataViewProps, {}> {
}