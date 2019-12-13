import './ParamsPanel.css';
import React, { useState, useRef } from "react";
import {
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  TextField,
  Selection
} from 'office-ui-fabric-react';
import { OptionsPanel } from "./OptionsPanel";
import { Columns } from '../Grid';
import { IUserColumnsSettings } from '../types';

export interface IParamsPanelProps {
  columns: Columns;
  onChanged: (userColumnsSettings: IUserColumnsSettings| undefined) => void;
  userSettings?: IUserColumnsSettings;
  initialColumnsWidth: number;
}

export interface IParamsField {
  key: string;
  fieldname: string;
  columnname: string;
}

export const ParamsPanel = (props: IParamsPanelProps): JSX.Element => {
  const {columns, userSettings, onChanged, initialColumnsWidth} = props;

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

  const selection = useRef(new Selection({
    onSelectionChanged: () => {
      const newSelection = selection.current.getSelection().map( s => s.key ).filter( s => typeof s === 'string' ) as typeof selectedItems;
      setSelectedItems(newSelection);
    }
  }));

  /**
   * Cоздаем items - массив полей для отображения в DetailsList, учитывая фильтр
  */
  const items: IParamsField[] = columns
    ? columns.map(c => {
        const columnname = c.caption ? c.caption.join('; ') : (c.fields.map(f => f.caption).join('; ') && c.name);
        return {
          key: c.name,
          columnname,
          fieldname: c.name
        };
      })
      .filter(i =>
        filterText === ''
          || i.fieldname.toUpperCase().indexOf(filterText.toUpperCase()) > -1
          || i.columnname.toUpperCase().indexOf(filterText.toUpperCase()) > -1
      )
    : [];

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
            getKey={ (item: IParamsField | undefined) => item ? item.fieldname : '' }
            selection={selection.current}
            columns={columnsParams}
            setKey="set"
            checkboxVisibility={1}
            layoutMode={DetailsListLayoutMode.fixedColumns}
            compact={true}
            isHeaderVisible={true}
          />
        </div>
      </div>
      <OptionsPanel
        columns={columns}
        onChanged={onChanged}
        userSettings={userSettings}
        selectedItems={selectedItems}
        initialColumnsWidth={initialColumnsWidth}
      />
    </div>
  )
}
