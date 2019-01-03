import { ERModel } from 'gdmn-orm';

import { DataView, IDataViewProps, IDataViewState } from '@src/app/components/DataView';

export interface IEntityMatchParams {
  entityName: string
}

export interface IEntityDataViewProps extends IDataViewProps<IEntityMatchParams> {
  erModel?: ERModel
}

export class EntityDataView extends DataView<IEntityDataViewProps, IDataViewState, IEntityMatchParams> {
  public getViewCaption(): string {
    return this.props.match ? this.props.match.params.entityName : '';
  }
}
