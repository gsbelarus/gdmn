import React from 'react';
import memoize from 'memoize-one';
// import {Entity } from 'gdmn-orm';
import { Filter } from '@src/app/components/EntityInspector/Filter';

import './index.css';
import { rusPrepositions } from 'gdmn-nlp';

interface IState {
  filterText: string;
}

export interface IEnityListMessage {
  loadingData?: boolean;
  loadingText?: string;
  loadingError?: boolean;
}

interface IProps {
  list: string[];
  statusMessage: IEnityListMessage;
  onSelectEntity: (id: string, checked: boolean) => void;
  onLoadMockEntities: () => void;
  onLoadEntities: () => void;
}

export class EntityList extends React.PureComponent<IProps, IState> {
  public state: Readonly<IState> = {
    filterText: ''
  };

  private filter = memoize((list: string[], filterText: string) =>
    list.filter(item => item.toLocaleLowerCase().includes(filterText.toLocaleLowerCase()))
  );

  private handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ filterText: event.target.value });
  };

  private handleFilterClear = () => {
    this.setState({ filterText: '' });
  };

  private handleChange = (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    return this.props.onSelectEntity(name, event.target.checked);
  };

  private getListItemNode = (item: string) => (
    <EntityBlock name={item} onSelectEntity={this.handleChange(item)} key={item} />
  );

  private getStatusMessageNode = (filteredList: string[]) => (
    <div className="entity-list">
      {this.props.statusMessage.loadingData ? (
        <div className="loading-message">{this.props.statusMessage.loadingText}</div>
      ) : this.props.statusMessage.loadingError ? (
        <div className="loading-message">{this.props.statusMessage.loadingText}</div>
      ) : this.props.list === undefined ? (
        <div className="loading-message">Совпадений не найдено</div>
      ) : (
        <ul>{filteredList.map(this.getListItemNode)}</ul>
      )}
    </div>
  );

  public render() {
    let filteredList: string[];
    filteredList = this.filter(this.props.list, this.state.filterText);

    return (
      <div className="component-container">
        <div className="load-buttons-container">
          <button onClick={this.props.onLoadMockEntities}>Загрузить (тест) </button>
          <button onClick={this.props.onLoadEntities}>Загрузить</button>
        </div>
        <Filter
          value={this.state.filterText}
          onChangeFilter={this.handleFilterChange}
          onClearFilter={this.handleFilterClear}
        />
        {this.getStatusMessageNode(filteredList)}
      </div>
    );
  }
}

const getName = (name: string): string => {
  return `entity-item-${name}`;
};

interface IEntityEvent {
  onSelectEntity: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const EntityBlock = (props: { name: string } & IEntityEvent) => {
  return (
    <li className="entity-item">
      <input className="checkmark" id={getName(props.name)} type="checkbox" onChange={props.onSelectEntity} />
      <label htmlFor={getName(props.name)}>{props.name}</label>
    </li>
  );
};
