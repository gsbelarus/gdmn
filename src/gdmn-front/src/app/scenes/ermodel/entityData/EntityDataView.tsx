import { ERModel } from 'gdmn-orm';

import { DataView, IDataViewProps } from '@src/app/components/DataView';

export interface IEntityMatchParams {
  entityName: string
}

export interface IEntityDataViewProps extends IDataViewProps<IEntityMatchParams> {
  erModel?: ERModel
}

export class EntityDataView extends DataView<IEntityDataViewProps, {}, IEntityMatchParams> {
  public getDataViewKey() {
    const key = this.props.match ? this.props.match.params.entityName : '';

    if (!key) {
      throw new Error(`Invalid data view key`);
    }

    return key;
  }

  public getViewCaption(): string {
    return this.props.match ? this.props.match.params.entityName : '';
  }
}
