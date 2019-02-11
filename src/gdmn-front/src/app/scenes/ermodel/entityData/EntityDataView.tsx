import React from 'react';
import { ERModel } from 'gdmn-orm';
import { ICommandBarItemProps, IComponentAsProps } from 'office-ui-fabric-react';

import { DataView, IDataViewProps } from '@src/app/components/DataView';
import { LinkCommandBarButton } from '@src/app/components/LinkCommandBarButton';

export interface IEntityMatchParams {
  entityName: string;
}

export interface IEntityDataViewProps extends IDataViewProps<IEntityMatchParams> {
  erModel?: ERModel;
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

  public getCommandBarItems(): ICommandBarItemProps[] {
    const { data, match } = this.props;
    const btn = (link: string, supText?: string) => (props: IComponentAsProps<ICommandBarItemProps>) => {
      return <LinkCommandBarButton {...props} link={link} supText={supText} />;
    };

    return [
      {
        key: 'editEntityItem',
        text: 'Edit item',
        iconProps: {
          iconName: 'Table'
        },
        commandBarButtonAs: btn(this.isDataLoaded() ? `${match!.url}/edit/${data!.rs.currentRow}` : `${match!.url}`)
      }
    ];
  }
}
