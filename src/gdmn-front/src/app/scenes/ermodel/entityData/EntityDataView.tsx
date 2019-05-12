import React from 'react';
import { DataView } from '@src/app/components/DataView';
import { ICommandBarItemProps, TextField, DefaultButton } from 'office-ui-fabric-react';
import { SQLForm } from '@src/app/components/SQLForm';
import { getMutex } from '../../../components/dataViewMutexes';
import { IEntityDataViewProps, IEntityMatchParams } from './EntityDataView.types';
import { RouteComponentProps } from 'react-router';

interface IEntityDataViewState {
  showSQL: boolean
  phrase: string;
};

export class EntityDataView extends DataView<IEntityDataViewProps, IEntityDataViewState, IEntityMatchParams> {
  public state: IEntityDataViewState;
  public entityName: string;

  constructor (props: IEntityDataViewProps) {
    super(props);
    this.entityName = EntityDataView.getEntityNameFromProps(props);

    if (!this.entityName) {
      throw new Error('Invalid entity name');
    }

    this.state = {
      showSQL: false,
      phrase: this.props.data && this.props.data.rs && this.props.data.rs.queryPhrase
        ? this.props.data.rs.queryPhrase
        : this.entityName
        ? `покажи все ${this.entityName}`
        : ''
    }
  }

  static getEntityNameFromProps(props: RouteComponentProps<IEntityMatchParams>) {
    return props.match ? props.match.params.entityName : '';
  }

  private onCloseSQL = () => {
    this.setState({ showSQL: false });
  }

  public getDataViewKey() {
    return this.entityName;
  }

  public getRecordSetList() {
    return [this.entityName];
  }

  public getCommandBarItems(): ICommandBarItemProps[] {
    const items = super.getCommandBarItems();

    if (!items.length) {
      return items;
    }

    const { data, history } = this.props;

    if (!data || !data.rs || !data.rs.sql) {
      return items;
    }

    const edit = items.find((item) => item.key === 'edit');
    if (edit) {
      edit.commandBarButtonAs = undefined;
      edit.onClick = () => {
        history.push(`${this.props.match.url}/edit/${data.rs.pk2s().join('-')}`);
        //this.props.onEdit(`${this.props.match.url}/edit/${data.rs.pk2s().join('-')}`)
      }
    }
    const deleteItem = items.find((item) => item.key === 'delete');
    if (deleteItem) {
      deleteItem.onClick = this.props.onDelete;
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
    return this.getDataViewKey();
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

  public renderSettings() {
    const { data, attachRs } = this.props;
    const { phrase } = this.state;
    return(
      <>
        <div className="GridPhraseForQuery">
          <TextField
            label="Phrase for query:"
            value={phrase}
            onChange={ (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
              this.setState({ phrase: newValue ? newValue : '' })
            }}
          />
          <DefaultButton
            text="Получить"
            onClick={ () => { attachRs(getMutex(this.getDataViewKey()), phrase); } }
          />
        </div>
        {super.renderSettings(data!.rs!)}
      </>
    )
  }
}
