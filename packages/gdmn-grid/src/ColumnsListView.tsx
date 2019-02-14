import React from 'react';
import './ColumnsListView.css';
import { ColumnSelector } from './ColumnSelector';
import { Columns } from './Grid';

interface IProps {
  columnsList: Columns;
  onToggle: (columnName: string) => void;
}

export class ColumnsListView extends React.PureComponent<IProps, {}> {
  public render() {
    if (this.props.columnsList) {
      return (
        <div className="Container">
          <div className="FlexContainer">
            {this.props.columnsList.map(c => (
              <ColumnSelector
                key={c.name}
                isChecked={!c.hidden}
                name={c.name}
                onToggle={() => this.props.onToggle(c.name)}
              />
            ))}
          </div>
        </div>
      );
    } else {
      return <div>Loading...</div>;
    }
  }
}
