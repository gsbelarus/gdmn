import React, { FormEvent, useState, useEffect } from "react";
import {
  IComboBoxOption,
  ComboBox,
  IComboBox
} from 'office-ui-fabric-react';
import { TFieldType } from 'gdmn-recordset';
import { Columns } from '../Grid';
import { applyUserSettings } from '../applyUserSettings';
import { dateFormats, numberFormats } from "gdmn-internals";
import { IColumnsSettings } from "../types";

export interface IColumnFormatProps {
  columns: Columns;
  userSettings?: IColumnsSettings;
  selectedItems: string[];
  onChanged: (userColumnsSettings: IColumnsSettings| undefined) => void;
}


export const ColumnFormat = (props: IColumnFormatProps): JSX.Element => {
  const {columns, selectedItems, userSettings, onChanged} = props;

  //comboColumns - колонки которые отрисовываются на экране (глобальные настройки + пользовательские)
  const [comboColumns, setComboColumns] = useState(userSettings ? applyUserSettings(columns, userSettings) : columns );

  useEffect( () => {
    setComboColumns(userSettings ? applyUserSettings(columns, userSettings) : columns )
  }, [columns, userSettings]);

  /**
   * Возвращает массив значений формата по типу поля
   */
  const optionsFormat = (dataType: TFieldType | undefined): IComboBoxOption[] => {
    switch (dataType) {
      case TFieldType.Float:
      case TFieldType.Integer:
      case TFieldType.Currency:
        const formats: IComboBoxOption[] = [];
        for (const key in numberFormats) {
          formats.push({key, text: key})
        };
        return formats;
      case TFieldType.Date:
        return dateFormats.map(f => ({ key: f, text: f}));
      default:
        return []
    }
  };

  /**
   * Получаем формат выбранных колонок.
   * Если выделены колонки с разным форматом, то формат неопределен
  */
  const getFormat = (dataType: TFieldType): string | undefined => {
    const firstSelectedColumn =  comboColumns.find(f => f.name === selectedItems[0]);
    const firstSelectedFields =  firstSelectedColumn ? firstSelectedColumn.fields.find(f => f.fieldName === selectedItems[0] && f.dataType === dataType) : undefined;
    switch (dataType) {
      case TFieldType.Float:
      case TFieldType.Integer:
      case TFieldType.Currency:
        const firstNumberFormat = firstSelectedFields ? firstSelectedFields.numberFormat : undefined;
        const selectedColumnsNum: Columns =
        firstNumberFormat
          ? comboColumns.filter(c =>
            selectedItems.find(s => s === c.name && c.fields.find(f => f.fieldName === s && (f.numberFormat ? f.numberFormat.name : '') === firstNumberFormat.name)))
          : [];
        return (selectedItems.length === selectedColumnsNum.length && firstNumberFormat ? firstNumberFormat.name  : undefined);

      case TFieldType.Date:
        const dateFormat = firstSelectedFields ? firstSelectedFields.dateFormat : undefined;
        const selectedColumnsDate: Columns =
        dateFormat
        ? comboColumns.filter(c =>
          selectedItems.find(s => s === c.name && c.fields.find(f => f.fieldName === s && f.dateFormat === dateFormat)))
        : [];
        return (selectedItems.length === selectedColumnsDate.length ? dateFormat : undefined);
      default:
        return;
    }
  }

  /**
   * Получаем тип выбранных колонок.
   * Если выделены колонки с разными типами, то тип неопределен
  */
  const getType = (): TFieldType | undefined => {
    if (!selectedItems) return undefined;

    const firstSelectedColumn =  comboColumns.find(f => f.name === selectedItems[0]);
    const firstSelectedFields =  firstSelectedColumn ? firstSelectedColumn.fields.find(f => f.fieldName === selectedItems[0]) : undefined;
    const firstDataType = firstSelectedFields ? firstSelectedFields.dataType : undefined;
    if (firstDataType === TFieldType.String || firstDataType === TFieldType.Boolean) return;
    if (selectedItems.length === 1) return firstDataType;

    let numberType = firstDataType;
    switch (firstDataType) {
      case TFieldType.Float:
      case TFieldType.Integer:
      case TFieldType.Currency:
      numberType = -1;
    };

    const selectedColumns = comboColumns.filter( c => selectedItems.find(s => s === c.name && c.fields.find( f => f.fieldName === s
      && ((f.dataType === TFieldType.Float || f.dataType === TFieldType.Currency || f.dataType === TFieldType.Integer) ? -1 : f.dataType)
        === numberType )));
    return (selectedItems.length === selectedColumns.length ? firstDataType : undefined);
  }

  const selectedType = getType();

  return (
    <div>
      { selectedType &&
      <ComboBox
        label="Format"
        selectedKey={getFormat(selectedType)}
        allowFreeform
        autoComplete="on"
        options={optionsFormat(selectedType)}
        onChange={
          (_ev: FormEvent<IComboBox>, option?: IComboBoxOption, _index?: number, _value?: string) => {
            let newUserColumnSettings = userSettings;
            switch (selectedType) {
              case TFieldType.Float:
              case TFieldType.Integer:
              case TFieldType.Currency:
                const newNumberFormatName = option ? option.text : '';
                selectedItems.forEach( columnName => {
                  const selectedColumn = columns.find(c => c.name === columnName);

                  if (!selectedColumn) {
                    /**
                     * Это какая-то ошибка в нашем коде, если мы не нашли колонку по имени
                     */
                    throw new Error(`Unknown column ${columnName}`);
                  }
                  const selectedFields = selectedColumn.fields.find(f => f.fieldName === columnName && f.dataType === selectedType)
                  const oldNumberFormatName = selectedFields && selectedFields.numberFormat && selectedFields.numberFormat.name ? selectedFields.numberFormat.name : '';

                  // нет настроек и ничего не надо устанавливать
                  if (!newUserColumnSettings?.columns?.[columnName] && oldNumberFormatName === newNumberFormatName) {
                    //
                  }

                  // нет настроек, но их надо установить
                  else if (!newUserColumnSettings?.columns?.[columnName] && oldNumberFormatName !== newNumberFormatName) {
                    if (!newUserColumnSettings) {
                      newUserColumnSettings = {};
                    }
                    newUserColumnSettings = {...newUserColumnSettings, columns: { ...newUserColumnSettings.columns, [columnName]: { numberFormatName: newNumberFormatName}}};
                  }

                  // есть настройки, но их надо изменить
                  else if (newUserColumnSettings?.columns?.[columnName] && oldNumberFormatName !== newNumberFormatName) {
                    newUserColumnSettings = {...newUserColumnSettings,  columns: {...newUserColumnSettings.columns, [columnName]: {...newUserColumnSettings.columns[columnName], numberFormatName: newNumberFormatName}}};
                  }

                  // есть настройки, но их можно удалять
                  else if (newUserColumnSettings?.columns?.[columnName] && oldNumberFormatName === newNumberFormatName) {
                    const { numberFormatName, ...noNumberFormatName } = newUserColumnSettings.columns[columnName];
                    newUserColumnSettings = {...newUserColumnSettings, columns: { ...newUserColumnSettings.columns, [columnName]: noNumberFormatName}};
                  }

                });
                if (newUserColumnSettings !== userSettings) {
                  onChanged(newUserColumnSettings);
                }
                break;
              case TFieldType.Date:
                const newDateFormat = option ? option.text : '';
                selectedItems.forEach( columnName => {
                  const selectedColumn = columns.find(c => c.name === columnName);
                  if (!selectedColumn) {
                    /**
                     * Это какая-то ошибка в нашем коде, если мы не нашли колонку по имени
                     */
                    throw new Error(`Unknown column ${columnName}`);
                  }
                  const selectedFields = selectedColumn.fields.find(f => f.fieldName === columnName && f.dataType === selectedType)
                  const oldDateFormat = selectedFields?.dateFormat ? selectedFields.dateFormat : '';

                  // нет настроек и ничего не надо устанавливать
                  if (!newUserColumnSettings?.columns?.[columnName] && oldDateFormat === newDateFormat) {
                    //
                  }

                  // нет настроек, но их надо установить
                  else if (!newUserColumnSettings?.columns?.[columnName] && oldDateFormat !== newDateFormat) {
                    if (!newUserColumnSettings) {
                      newUserColumnSettings = {};
                    }
                    newUserColumnSettings = {...newUserColumnSettings, columns: { ...newUserColumnSettings.columns, [columnName]: { dateFormat: newDateFormat }}};
                  }

                  // есть настройки, но их надо изменить
                  else if (newUserColumnSettings?.columns?.[columnName] && oldDateFormat !== newDateFormat) {
                    newUserColumnSettings = {...newUserColumnSettings, columns: {...newUserColumnSettings.columns, [columnName]: {...newUserColumnSettings.columns[columnName], dateFormat: newDateFormat}}};
                  }

                  // есть настройки, но их можно удалять
                  else if (newUserColumnSettings?.columns?.[columnName] && oldDateFormat === newDateFormat) {
                    const { dateFormat, ...noDateFormat } = newUserColumnSettings.columns[columnName];
                    newUserColumnSettings = {...newUserColumnSettings, columns: {[columnName]: noDateFormat}};
                  }
                });

                if (newUserColumnSettings !== userSettings) {
                  onChanged(newUserColumnSettings);
                }
                break;
            }
          }
        }
      />
      }
    </div>
  )
}
