import React from 'react';
import { DataView, IDataViewProps } from '@src/app/components/DataView';
import { ICommandBarItemProps, Dialog, DefaultButton, DialogFooter, PrimaryButton, DialogType } from 'office-ui-fabric-react';

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

  private _closeSQL = () => {
    this.setState({ showSQL: false });
  }

  public renderModal() {
    const { showSQL } = this.state;
    const { data } = this.props;

    if (showSQL && data && data!.rs && data!.rs!.sql) {
      return (
        <Dialog
          hidden={!showSQL}
          onDismiss={this._closeSQL}
          dialogContentProps={{
            type: DialogType.close,
            title: 'SQL'
          }}
          modalProps={{
            titleAriaId: 'showSQLTitleID',
            subtitleAriaId: 'showSQLSubTitleID',
            isBlocking: false
          }}
        >
          <pre>
            {data!.rs!.sql.select}
          </pre>
          {
            data!.rs!.sql.params?
            <pre>
              <br />
              Parameters:
              <br />
              {JSON.stringify(data!.rs!.sql.params, undefined, 2)}
            </pre>
            :
            undefined
          }
          <DialogFooter>
            <PrimaryButton onClick={this._closeSQL} text="Close" />
          </DialogFooter>
        </Dialog>
      );
    }

    return super.renderModal();
  }
}
