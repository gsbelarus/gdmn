import { ERModel } from 'gdmn-orm';

import { DataView, IDataViewProps } from '@src/app/components/DataView';

export interface IEntityDataViewProps extends IDataViewProps {
  erModel?: ERModel
}

export class EntityDataView extends DataView<IEntityDataViewProps, {}> {
}
