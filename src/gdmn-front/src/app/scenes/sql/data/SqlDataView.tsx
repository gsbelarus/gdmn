import React from 'react';
import { ICommandBarItemProps } from 'office-ui-fabric-react';
import { DataView, IDataViewProps } from '@src/app/components/DataView';

export interface ISqlDataViewProps extends IDataViewProps<any>
{
  onView: (url: string) => void;
}

export interface ISqlDataViewState {}

export class SqlDataView extends DataView<ISqlDataViewProps, ISqlDataViewState> {
  public getDataViewKey(): string {
    return this.getRecordSetList()[0];
  }

  public getRecordSetList() {
    const requestID = this.props.match ?  this.props.match.params.id : "";

    return [requestID];
  }

  public getViewCaption(): string {
    return 'SQL data view';
  }

  public getCommandBarItems(): ICommandBarItemProps[] {
    const items = super.getCommandBarItems();

    if (!items.length) {
      return items;
    }

    const { data } = this.props;

    if (!data || !data.rs) {
      return items;
    }

    const excludeList = ['add', 'delete', 'edit'];
    const newItems = items.filter((i) => !excludeList.includes(i.key));

    const viewItem = {
      key: 'view',
      text: 'View',
      iconProps: {
        iconName: 'edit'
      },
      onClick: () => {
        this.props.onView(`${this.props.match.url}/view/${data.rs.currentRow}`)
      }
    }

    return [viewItem, ...newItems];
  }

  public renderModal() {
    return super.renderModal();
  }
}
