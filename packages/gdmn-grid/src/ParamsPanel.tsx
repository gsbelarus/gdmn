import React, { PureComponent } from 'react';
import './ParamsPanel.css';
import {
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  Checkbox,
  Selection,   
  TextField 
} from 'office-ui-fabric-react';
import { IParamsField } from './ParamsDialog';
import { Columns } from '.';

interface IParamsPanelProps {
  columns: Columns,
  onToggle: (columnName: string) => void,
}

export interface IPanelState {
  selectionFieldName: string;
  fieldList: IParamsField[];
 }

class ParamsPanel extends PureComponent<IParamsPanelProps, IPanelState> {

  private _selection: Selection;  
  private _allItems: IParamsField[]; 

  public static columns = [
    {
      key: 'fieldname',
      name: 'NAME',
      fieldName: 'fieldname',
      minWidth: 100,
      maxWidth: 100,
      isResizable: true,
      isMultiline: true,
      data: 'string'
    }
  ];

  constructor(props: IParamsPanelProps) {
    super(props);
   
    this._allItems = this.props.columns.map( c => ({fieldname: c.name}));     
    this._selection = new Selection({
      onSelectionChanged: () => {
        if (this._selection.getSelectedCount() > 0) {
           this.setState({
                selectionFieldName: this._getSelectionDetails()
              });
          } 
         
        }
      });    
    this.state = {
        selectionFieldName: this._getSelectionDetails(),
        fieldList: this._allItems
      };  
  }  

  public render() {
    const { columns, onToggle } = this.props;
    const { fieldList, selectionFieldName } = this.state;
    const curColumn = columns.find((c) => c.name === selectionFieldName);
    return (
      <div >
        <TextField
          label="Filter by name:"
          onChange={this._onFilter}
          styles={{ root: { maxWidth: '300px' } }}
        />
          <div className="ColumnsList">
            <DetailsList                
              selectionMode={SelectionMode.none}
              selectionPreservedOnEmptyClick={true}
              enterModalSelectionOnTouch={true}
              data-is-scrollable="true"
              items={fieldList}
              selection={this._selection}
              columns={ParamsPanel.columns}
              setKey="set"
              layoutMode={DetailsListLayoutMode.fixedColumns}
              compact={true}
              isHeaderVisible={true}  
            />
          </div>  
          <div className="Options"> 
            <span className="OptionsTitle">
              OPTIONS
            </span>            
            <Checkbox 
              checked={curColumn ? !curColumn.hidden : false} 
              label="Show column" 
              onChange={() => onToggle(selectionFieldName)} />
          </div>         
      </div>
    ); 
  } 

  private _getSelectionDetails(): string {
    return this._selection.getSelectedCount() > 0 
      ? (this._selection.getSelection()[0] as IParamsField).fieldname 
      : ''
  }  

  private _onFilter = (ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, text?: string): void => {
    this.setState({
        fieldList: text 
          ? this._allItems.filter(i => i.fieldname.toLowerCase().indexOf(text.toLowerCase()) > -1) 
          : this._allItems
    });
  };
}

export { ParamsPanel, IParamsPanelProps };
