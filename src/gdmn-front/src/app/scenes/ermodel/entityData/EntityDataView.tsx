import React from 'react';
import { DataView, IDataViewProps } from '@src/app/components/DataView';
import { ICommandBarItemProps, IModalProps } from 'office-ui-fabric-react';
import { SQLForm } from '@src/app/components/SQLForm';
declare module 'office-ui-fabric-react/lib/Modal' {
  const Modal: React.StatelessComponent<IModalProps>;
 }

export interface IEntityMatchParams {
  entityName: string
}

export interface IEntityDataViewProps extends IDataViewProps<IEntityMatchParams> { }

export interface IEntityDataViewState {
  showSQL: boolean
}

export class EntityDataView extends DataView<IEntityDataViewProps, IEntityDataViewState, IEntityMatchParams> {
  public state: IEntityDataViewState = {
    showSQL: false
  }

  private onCloseSQL = () => {
    this.setState({ showSQL: false });
  }

  public getDataViewKey() {
    const key = this.props.match ? this.props.match.params.entityName : '';

    if (!key) {
      throw new Error(`Invalid data view key`);
    }

    return key;
  }

  public getCommandBarItems(): ICommandBarItemProps[] {
    const items = super.getCommandBarItems();

    if (!items.length) {
      return items;
    }

    const { data } = this.props;

    if (!data || !data.rs || !data.rs.sql) {
      return items;
    }

    return [...items,
      {
        key: 'sql',
        text: 'Show SQL',
        iconProps: {
          iconName: 'FileCode'
        },
        onClick: () => {
          this.setState({ showSQL: true });
        }
      }
    ];
  }

  public getViewCaption(): string {
    return this.props.match ? this.props.match.params.entityName : '';
  }

  public renderModal() {
    const { showSQL } = this.state;
    const { data } = this.props;

    if (showSQL && data && data!.rs && data!.rs!.sql) {
      return (
       <SQLForm
         rs={data!.rs!}
         onCloseSQL={this.onCloseSQL}
         />
      );
    }

    return super.renderModal();
  }
}
