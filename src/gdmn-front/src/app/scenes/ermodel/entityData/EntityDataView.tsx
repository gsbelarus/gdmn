import React from 'react';
import { DataView, IDataViewProps } from '@src/app/components/DataView';
import { ICommandBarItemProps, TextField, DefaultButton } from 'office-ui-fabric-react';
import { SQLForm } from '@src/app/components/SQLForm';
import { IPhraseForQuery } from '../../gdmn/reducer';
import { Semaphore } from 'gdmn-internals';
import { getMutex } from '../../../components/dataViewMutexes';

export interface IEntityMatchParams {
  entityName: string
}

export interface IEntityDataViewProps extends IDataViewProps<IEntityMatchParams> {
  phrasesForQuery: IPhraseForQuery[];
  onEdit: (url: string) => void;
  onDelete: () => void;
  onChange: (text: string) => void;
  onDeletePhrase: () => void;
  onAddPhrase: () => void;
  attachRs: (mutex?: Semaphore) => void;
}

export interface IEntityDataViewState {
  showSQL: boolean
  phrase: string;
}

export class EntityDataView extends DataView<IEntityDataViewProps, IEntityDataViewState, IEntityMatchParams> {
  public state: IEntityDataViewState = {
    showSQL: false,
    phrase: ''
  }

  public componentWillMount() {
    this.props.onAddPhrase();
    const entityName = this.props.match ? this.props.match.params.entityName : '';
    entityName ? this.setState({phrase: `покажи все ${entityName}`}) : undefined
  }

  public componentWillUnmount() {
    this.props.onDeletePhrase();
  }

  private onCloseSQL = () => {
    this.setState({ showSQL: false });
  }

  public getDataViewKey() {
    return this.getRecordSetList()[0];
  }

  public getRecordSetList() {
    const entityName = this.props.match ? this.props.match.params.entityName : '';

    if (!entityName) {
      throw new Error('Invalid entity name');
    }

    return [entityName];
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

    const edit = items.find((item) => item.key === 'edit');
    if (edit) {
      edit.commandBarButtonAs = undefined;
      edit.onClick = () => {
        this.props.onEdit(`${this.props.match.url}/edit/${data.rs.pk2s.join('-')}`)
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
    const { data, onChange, attachRs } = this.props;
    return(
      <>
        <div className="GridPhraseForQuery">
          <TextField
            label="Phrase for query:"
            value={this.state.phrase}
            onChange={ (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
              this.setState({phrase: newValue ? newValue : ''})
            }}
          />
          <DefaultButton text="Получить" onClick={() => {onChange(this.state.phrase); attachRs(getMutex(this.getDataViewKey()))}} />
        </div>
        {super.renderSettings(data!.rs!)}
      </>
    )
  }
}
