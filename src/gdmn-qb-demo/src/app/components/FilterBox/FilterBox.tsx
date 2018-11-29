import React from 'react';

import './index.css';

interface IProps {
  attribute?: string;
  // list :  | undefined;
  // onDeleteEntity: (id: string) => void;
  // onUnselectEntity: (id: string, checked: boolean) => void;
}

export class FilterBox extends React.PureComponent<IProps> {
  /*   private handleChange = (id: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    return this.props.onSelectEntity(id, false);
  };
   */

  /*   private getListItemNode = (item: IEntity) => (
    <Entity {...item} key={item.id} onClickDelete={this.props.onDeleteEntity} />
    <EntityBlock {...item} onSelectEntity={this.handleChange(item.id!)} key={item.id} />
  ); */

  public render() {
    return (
      <div className="center-box-container">
        {/*    {this.props.list.map((item: IEntity) => (
          <Entity {...item} key={item.id} onClickDelete={() => this.props.onUnselectEntity(item.id!, false)} />
        ))} */}
      </div>
    );
  }
}
