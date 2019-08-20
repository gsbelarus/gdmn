import React, { useState, useEffect } from "react";
import {
  Checkbox,
  TextField
} from 'office-ui-fabric-react';
import { Columns } from '../Grid';
import { IUserColumnsSettings, applyUserSettings } from "../applyUserSettings";
import { ColumnFormat } from "./ColumnFormat";
import './ParamsPanel.css';

export interface IOptionsPanelProps {
  columns: Columns;
  userSettings?: IUserColumnsSettings;  
  selectedItems: string[];
  onChanged: (userColumnsSettings: IUserColumnsSettings| undefined) => void;   
}

export interface IParamsField {
  key: string;
  fieldname: string;
  columnname: string; 
}

export const OptionsPanel = (props: IOptionsPanelProps): JSX.Element => {
  const {selectedItems, userSettings, columns, onChanged} = props;  

  //comboColumns - колонки которые отрисовываются на экране (глобальные настройки + пользовательские)
  const [comboColumns, setComboColumns] = useState(userSettings ? applyUserSettings(columns, userSettings) : columns );

  useEffect( () => {
    setComboColumns(userSettings ? applyUserSettings(columns, userSettings) : columns )
  }, [columns, userSettings]);

  
  /**
   * Получаем признак checked для выбранных колонок. Если значения будут разные, то false
   */   
  const getCheck = (): boolean => { 
    if (selectedItems.length === 0) return false;
    /** firstHidden - св-во hidden первой выделенной записи,
     * selectedColumns - массив объектов columns из выделенных записей
     * если признак hidden у всех выделенных записей одинаковый, то в checkbox указываем !hidden первой выделенной записи, иначе false 
    */
    const firstSelectedColumn = comboColumns.find(c => c.name === selectedItems[0]); 
    const firstHidden = firstSelectedColumn ? firstSelectedColumn ? firstSelectedColumn.hidden : false : false;
    const selectedColumns: Columns = comboColumns.filter(c => !!c.hidden === !!firstHidden && selectedItems.find(s => s === c.name));
    return (selectedItems.length === selectedColumns.length ? !firstHidden : false);       
  }      

  /**
   * Получаем caption для названия колонки
  */
  const getCaption = (): string | undefined => { 
    if (selectedItems.length !== 1 || !selectedItems) {
      return undefined;
    }
    const selectedColumns = comboColumns.find(c => c.name === selectedItems[0]);
    return selectedColumns 
      ? selectedColumns.caption ? selectedColumns.caption.join('; ') : (selectedColumns.fields.map(f => f.caption).join('; ') &&  selectedColumns.name) 
      : undefined
  }    

  /**
   * Получаем признак checked для выбранных колонок. Если значения будут разные, то false
   */   
  const getWidth = (): string => { 
    if (selectedItems.length === 0) return '';
    /** firstWidth - св-во width первой выделенной записи,
     * selectedColumns - массив объектов columns из выделенных записей
     * если признак width у всех выделенных записей одинаковый, то в checkbox указываем ширину первой выделенной записи, иначе '' 
    */
    const firstSelectedColumn = comboColumns.find(c => c.name === selectedItems[0]); 
    const firstWidth = firstSelectedColumn ? firstSelectedColumn ? firstSelectedColumn.width : '' : '';
    const selectedColumns: Columns = comboColumns.filter(c => !!c.width === !!firstWidth && selectedItems.find(s => s === c.name));
    return (selectedItems.length === selectedColumns.length && firstWidth ? String(firstWidth) : '');       
  }     

  const cheked = getCheck();

  return (
    <div className="Options">
      <span className="OptionsTitle">OPTIONS</span>
      <TextField 
        label="Column name:" 
        disabled={selectedItems.length !== 1}            
        value={getCaption()}
        onChange={(ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, text?: string): void => {
          let newUserColumnSettings = userSettings;
          const newCaption = text ? text : '';

          selectedItems.forEach( columnName => {        
            const selectedColumn = columns.find(c => c.name === columnName);

            if (!selectedColumn) {
              /**
               * Это какая-то ошибка в нашем коде, если мы не нашли колонку по имени
               */
              throw new Error(`Unknown column ${columnName}`);
            }

            const oldCaption = selectedColumn.caption ? selectedColumn.caption[0] : '';

            // нет настроек и ничего не надо устанавливать 
            if ((!newUserColumnSettings || !newUserColumnSettings[columnName]) && oldCaption === newCaption) {
              //
            }

            // нет настроек, но их надо установить
            else if ((!newUserColumnSettings || !newUserColumnSettings[columnName]) && oldCaption !== newCaption) {
              if (!newUserColumnSettings) {
                newUserColumnSettings = {};
              }
              newUserColumnSettings = {...newUserColumnSettings, [columnName]: { caption: [newCaption] }};
            }

            // есть настройки, но их надо изменить
            else if (newUserColumnSettings && newUserColumnSettings[columnName] && oldCaption !== newCaption) {
              newUserColumnSettings = {...newUserColumnSettings,  [columnName]: {...newUserColumnSettings[columnName], caption: [newCaption]}};
            }
            
            // есть настройки, но их можно удалять
            else if (newUserColumnSettings && newUserColumnSettings[columnName] && oldCaption === newCaption) {
              const { caption, ...noCaption } = newUserColumnSettings[columnName];
              newUserColumnSettings = {...newUserColumnSettings, [columnName]: noCaption};
            }            
          });
           if (newUserColumnSettings !== userSettings) {
            onChanged(newUserColumnSettings);
          }  
        }}
        styles={{ root: { maxWidth: '300px' }}} 
      />   
      <Checkbox
        styles={{ root: { paddingTop: 10 } }}
        checked={cheked}             
        label="Show column"
        disabled={(!selectedItems.length || selectedItems.length === comboColumns.filter(f => !f.hidden).length) && cheked}   
        onChange={ (_ev: React.FormEvent<HTMLElement> | undefined, isChecked?: boolean)  => {

          let newUserColumnSettings = userSettings;
          const newHidden = !isChecked;

          selectedItems.forEach( columnName => {        
            const selectedColumn = columns.find(c => c.name === columnName);

            if (!selectedColumn) {
              /**
               * Это какая-то ошибка в нашем коде, если мы не нашли колонку по имени
               */
              throw new Error(`Unknown column ${columnName}`);
            }

            const oldHidden = !!selectedColumn.hidden;

            // нет настроек и ничего не надо устанавливать 
            if ((!newUserColumnSettings || !newUserColumnSettings[columnName]) && oldHidden === newHidden) {
              //
            }

            // нет настроек, но их надо установить
            else if ((!newUserColumnSettings || !newUserColumnSettings[columnName]) && oldHidden !== newHidden) {
              if (!newUserColumnSettings) {
                newUserColumnSettings = {};
              }
              newUserColumnSettings = {...newUserColumnSettings, [columnName]: { hidden: newHidden }};
            }

            // есть настройки, но их надо изменить
            else if (newUserColumnSettings && newUserColumnSettings[columnName] && oldHidden !== newHidden) {
              newUserColumnSettings = {...newUserColumnSettings,  [columnName]: {...newUserColumnSettings[columnName], hidden: newHidden}};
            }
            
            // есть настройки, но их можно удалять
            else if (newUserColumnSettings && newUserColumnSettings[columnName] && oldHidden === newHidden) {
              const { hidden, ...noHidden } = newUserColumnSettings[columnName];
              newUserColumnSettings = {...newUserColumnSettings, [columnName]: noHidden};
            }            
          });
           if (newUserColumnSettings !== userSettings) {
            onChanged(newUserColumnSettings);
          }  
        }}
      />
      <ColumnFormat
        columns={columns}
        onChanged={onChanged}
        userSettings={userSettings}   
        selectedItems={selectedItems}       
      />
      <TextField 
        label="Width:"       
        disabled={selectedItems.length === 0}   
        value={getWidth()}
        onChange={(ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, text?: string): void => {
          let newUserColumnSettings = userSettings;
          const newWidth = text ? Number(text) : 0;

          selectedItems.forEach( columnName => {        
            const selectedColumn = columns.find(c => c.name === columnName);

            if (!selectedColumn) {
              /**
               * Это какая-то ошибка в нашем коде, если мы не нашли колонку по имени
               */
              throw new Error(`Unknown column ${columnName}`);
            }

            const oldWidth = selectedColumn.width ? selectedColumn.width : '';

            // нет настроек и ничего не надо устанавливать 
            if ((!newUserColumnSettings || !newUserColumnSettings[columnName]) && oldWidth === newWidth) {
              //
            }

            // нет настроек, но их надо установить
            else if ((!newUserColumnSettings || !newUserColumnSettings[columnName]) && oldWidth !== newWidth) {
              if (!newUserColumnSettings) {
                newUserColumnSettings = {};
              }
              newUserColumnSettings = {...newUserColumnSettings, [columnName]: { width: newWidth }};
            }

            // есть настройки, но их надо изменить
            else if (newUserColumnSettings && newUserColumnSettings[columnName] && oldWidth !== newWidth) {
              newUserColumnSettings = {...newUserColumnSettings,  [columnName]: {...newUserColumnSettings[columnName], width: newWidth}};
            }
            
            // есть настройки, но их можно удалять
            else if (newUserColumnSettings && newUserColumnSettings[columnName] && oldWidth === newWidth) {
              const { width, ...noWidth } = newUserColumnSettings[columnName];
              newUserColumnSettings = {...newUserColumnSettings, [columnName]: noWidth};
            }            
          });
           if (newUserColumnSettings !== userSettings) {
            onChanged(newUserColumnSettings);
          }  
        }}
        styles={{ root: { maxWidth: '300px' }}} 
      />                       
    </div>   
  )
}
