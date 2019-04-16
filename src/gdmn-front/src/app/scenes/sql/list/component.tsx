import React from 'react';
import { ICommandBarItemProps } from 'office-ui-fabric-react';
import { DataView, IDataViewProps } from '@src/app/components/DataView';
// import { IViewProps, View } from '@src/app/components/View';

export interface ISqlListProps extends IDataViewProps<any>
{
  add: () => void;
  edit: () => void;
  delete: () => void;
  view: () => void;
}

export interface ISqlListState {}


export class SqlList extends DataView<ISqlListProps, ISqlListState> {
  public getDataViewKey(): string {
    return this.getRecordSetList()[0];
  }

  public getRecordSetList() {
    return ['sql'];
  }

  public getViewCaption(): string {
    return 'SQL';
  }

  public getCommandBarItems(): ICommandBarItemProps[] {
    const items = [{
      key: 'add',
      text: 'Add',
      iconProps: {
        iconName: 'Add'
      },
      onClick: () => {
        this.props.add();
      }
    },
    {
      key: 'edit',
      text: 'Edit',
      iconProps: {
        iconName: 'Edit'
      },
      onClick: () => {
        this.props.edit();
      }
    },
    {
      key: 'delete',
      text: 'Delete',
      iconProps: {
        iconName: 'Delete'
      },
      onClick: () => {
        this.props.delete();
      }
    },
    {
      key: 'view',
      text: 'View',
      iconProps: {
        iconName: 'LargeGrid'
      },
      onClick: () => {
        this.props.view();
      }
    },]

    return items;
  }

  public renderModal() {
    return super.renderModal();
  }
}
