import { RecordSet, TFieldType, getSumAggregator, getAvgAggregator } from "gdmn-recordset";
import { List } from "immutable";
import { INBRBCurrency } from "../types";
import nbrbCurrencies from '../../util/nbrbcurrencies.json';
import { RSCreateFunc } from "./types";

export function loadNBRBCurrencies(name: string, rscf: RSCreateFunc) {
    const fieldDefs = [
      {
        fieldName: 'Cur_Abbreviation',
        dataType: TFieldType.String,
        caption: 'Буквенный код',
        required: true,
        size: 3
      },
      {
        fieldName: 'Cur_Name',
        dataType: TFieldType.String,
        caption: 'Наименование',
        required: true,
        size: 60
      },
      {
        fieldName: 'Cur_ID',
        dataType: TFieldType.Integer,
        caption: 'Внутренний код',
        required: true,
        aggregator: getSumAggregator()
      },
      {
        fieldName: 'Cur_ParentID',
        dataType: TFieldType.Integer,
        caption: 'Внутренний код для связи',
        required: true,
        aggregator: getAvgAggregator()
      },
      {
        fieldName: 'Cur_Code',
        dataType: TFieldType.String,
        caption: 'Цифровой код',
        required: true,
        size: 3
      },
      {
        fieldName: 'Cur_Name_Bel',
        dataType: TFieldType.String,
        caption: 'Назва',
        required: true,
        size: 60
      },
      {
        fieldName: 'Cur_Name_Eng',
        dataType: TFieldType.String,
        caption: 'Name',
        required: true,
        size: 60
      },
      {
        fieldName: 'Cur_QuotName',
        dataType: TFieldType.String,
        required: true,
        size: 60
      },
      {
        fieldName: 'Cur_QuotName_Bel',
        dataType: TFieldType.String,
        required: true,
        size: 60
      },
      {
        fieldName: 'Cur_QuotName_Eng',
        dataType: TFieldType.String,
        required: true,
        size: 60
      },
      {
        fieldName: 'Cur_NameMulti',
        dataType: TFieldType.String,
        required: true,
        size: 60
      },
      {
        fieldName: 'Cur_Name_BelMulti',
        dataType: TFieldType.String,
        required: true,
        size: 60
      },
      {
        fieldName: 'Cur_Name_EngMulti',
        dataType: TFieldType.String,
        required: true,
        size: 60
      },
      {
        fieldName: 'Cur_Scale',
        dataType: TFieldType.Integer,
        caption: 'Количество единиц',
        required: true
      },
      {
        fieldName: 'Cur_Periodicity',
        dataType: TFieldType.Integer,
        caption: 'Периодичность выставления курса',
        required: true
      },
      {
        fieldName: 'Cur_DateStart',
        dataType: TFieldType.Date,
        caption: 'Дата включения в перечень валют',
        required: true
      },
      {
        fieldName: 'Cur_DateEnd',
        dataType: TFieldType.Date,
        caption: 'Дата исключения из перечня валют',
        required: true
      },
    ];

    const data = List<INBRBCurrency>(nbrbCurrencies as any);

    rscf(RecordSet.createWithData(name, fieldDefs, data));
  };