import './ParamsPanel.css';
import React, { useState } from "react";
import {
  Checkbox,
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  TextField,
  Selection
} from 'office-ui-fabric-react';
import { Columns } from '.';

export interface IParamsPanelProps {
  columns: Columns;
  onToggle: (columnName: string) => void;
}

export interface IParamsField {
  fieldname: string;
  columnname: string;
}

export const ParamsPanel = (props: IParamsPanelProps): JSX.Element => {
  const {columns, onToggle} = props;

  const columnsParams = [
    {
      key: 'columnname',
      name: 'COLUMN NAME',
      fieldName: 'columnname',
      minWidth: 100,
      maxWidth: 150,
      isResizable: true,
      isMultiline: true,
      data: 'string'
    },
    {
      key: 'fieldname',
      name: 'FIELD NAME',
      fieldName: 'fieldname',
      minWidth: 100,
      maxWidth: 150,
      isResizable: true,
      isMultiline: true,
      data: 'string' 
    }    
  ];  

  const [selectedItems, setSelectedItems] = useState([] as string[]);   
  const [filterText, setFilterText] = useState('');

  const selection: Selection = new Selection({
    onSelectionChanged: () => {  
      /** Если выделены все записи, то последнюю оставляем невыбранной */
      if (selection.count === columns.length) {
        selection.setIndexSelected(selection.count - 1, false, false);
      }
      const newSelection = selection.getSelection() as IParamsField[]; 
      /** Записываем новый массив выделенных записей */
      setSelectedItems(newSelection.map(i => i.fieldname));
    }
  });  

  const isChecked = (): boolean => { 
    if (selectedItems.length === 0) return false;
    /**hidden - св-во hidden первой выделенной записи,
    selectedColumns - массив объектов columns из выделенных записей
    если признак hidden у всех выделенных записей одинаковый, то в checkbox указываем !hidden первой выделенной записи, иначе false 
    */
    const hidden = !!columns.filter(c => c.name === selectedItems[0])[0].hidden;
    const selectedColumns: Columns = []; 
    columns.forEach(c => { if (!!c.hidden === hidden && selectedItems.find(s => s === c.name)) selectedColumns.push(c) });
    return (selectedItems.length === selectedColumns.length ? !hidden : false);       
  }    
  /** Cоздаем items - массив полей для отображения в DetailsList, учитывая фильтр */
  const items: IParamsField[] = columns.map(c => (
      { columnname: c.caption ? c.caption.join('; ') : (c.fields.map(f => f.caption).join('; ') && c.name),  
        fieldname: c.name
      }
    )).filter(i => 
      filterText === '' 
      || i.fieldname.toUpperCase().indexOf(filterText.toUpperCase()) > -1 
      || i.columnname.toUpperCase().indexOf(filterText.toUpperCase()) > -1
    );    
          
  return (   
     <div>
        <div className="ColumnsPanel">
          <TextField 
            label="Filter by name:" 
            onChange={(ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, text?: string): void => {
              setFilterText(text!); 
            }} 
            styles={{ root: { maxWidth: '300px' }}} 
          />
          <div className="ColumnsList">
            <DetailsList
              selectionMode={SelectionMode.multiple}
              selectionPreservedOnEmptyClick={true}
              enterModalSelectionOnTouch={true}
              data-is-scrollable="true"
              items={items}
              selection={selection}
              columns={columnsParams}
              setKey="set"
              layoutMode={DetailsListLayoutMode.fixedColumns}
              compact={true}
              isHeaderVisible={true}  
            />
          </div>  
        </div>
        <div className="Options">
          <span className="OptionsTitle">OPTIONS</span>
          <Checkbox
            checked={isChecked()}             
            label="Show column"
            onChange={ (_ev: React.FormEvent<HTMLElement> | undefined, isChecked?: boolean)  => 
              selectedItems.forEach( i => {        
                const selectedColumns = columns.find(c => c.name === i);
                const hidden = selectedColumns && selectedColumns.hidden !== undefined ? selectedColumns.hidden : false; 
                if (hidden === isChecked) onToggle(i);
              })
            }
          />
        </div>
      </div>    
  )
}
