import React from 'react';
import './ColumnSelector.css';

interface IProps {
  isChecked: boolean;
  name: string;
  onToggle: () => void;
}

export class ColumnSelector extends React.PureComponent<IProps> {
  public render() {
    return (
      <div className="ColumnSelector">
        <input
          id={this.props.name}
          name="checkedfield"
          type="checkbox"
          checked={this.props.isChecked}
          onChange={this.props.onToggle}
        />
        <label htmlFor={this.props.name}>
          {this.props.name}
        </label>
      </div>
    )
  }
}