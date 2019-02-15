import { ERModel } from 'gdmn-orm';

import { DataView, IDataViewProps } from '@src/app/components/DataView';
import { ICommandBarItemProps, IComponentAsProps } from 'office-ui-fabric-react';
import React from 'react';
import { LinkCommandBarButton } from '@src/app/components/LinkCommandBarButton';

export interface IEntityMatchParams {
  entityName: string
}

export interface IEntityDataViewProps extends IDataViewProps<IEntityMatchParams> {
  erModel?: ERModel,
  // deleteRecord: () => void,
  // setDlgStateInsert: () => void,
  // setDlgStateEdit: () => void
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
        key: `addRecord${data!.rs.name}`,
        text: 'Add',
        iconProps: {
          iconName: 'Add'
        },
        commandBarButtonAs: btn(this.isDataLoaded() ? `${match!.url}/add` : `${match!.url}`),
        // onClick: setDlgStateInsert
      },
      {
        key: `editRecord${data!.rs.name}${data!.rs.currentRow}`,
        text: 'Edit',
        iconProps: {
          iconName: 'Edit'
        },
        commandBarButtonAs: btn(this.isDataLoaded() ? `${match!.url}/edit/${data!.rs.currentRow}` : `${match!.url}`),
        // onClick: setDlgStateEdit
      },
      {
        key: `deleteRecord${data!.rs.name}${data!.rs.currentRow}`,
        text: 'Delete',
        iconProps: {
          iconName: 'Delete'
        },
        // onClick: deleteRecord
      }
    ];

  }

}
