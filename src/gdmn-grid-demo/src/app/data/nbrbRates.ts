import { RSCreateFunc } from "./types";
import { FieldDefs, TFieldType, getAvgAggregator, IDataRow, RecordSet } from "gdmn-recordset";
import { List } from "immutable";
import { INBRBRate } from "../types";
import nbrbRates from '../../util/nbrbrates.json';

export function loadNBRBRates(name: string, rscf: RSCreateFunc) {

    const fieldDefs: FieldDefs = [
      {
        fieldName: 'Cur_Abbreviation',
        dataType: TFieldType.String,
        caption: 'Буквенный код',
        required: true,
        size: 3
      },
      {
        fieldName: 'Cur_ID',
        dataType: TFieldType.Integer,
        caption: 'ИД',
        required: true
      },
      {
        fieldName: 'Date',
        dataType: TFieldType.Date,
        caption: 'Дата',
        required: true,
        dateFormat: 'dd.mm.yy'
      },
      {
        fieldName: 'Cur_Scale',
        dataType: TFieldType.Integer,
        caption: 'Количество единиц',
        required: true,
        alignment: 'RIGHT'
      },
      {
        fieldName: 'Cur_Name',
        dataType: TFieldType.String,
        caption: 'Наименование',
        required: true,
        size: 60
      },
      {
        fieldName: 'Cur_OfficialRate',
        dataType: TFieldType.Currency,
        caption: 'Курс',
        required: true,
        aggregator: getAvgAggregator(),
        alignment: 'RIGHT',
        numberFormat: {
          maxDecDigits: 4,
          minDecDigits: 4,
          useGrouping: true
        }
      },
      {
        fieldName: 'Year',
        dataType: TFieldType.Integer,
        caption: 'Год',
        calcFunc: (row: IDataRow) => (row['Date'] as Date).getFullYear(),
        alignment: 'CENTER'
      },
      {
        fieldName: 'Month',
        dataType: TFieldType.Integer,
        caption: 'Месяц',
        calcFunc: (row: IDataRow) => (row['Date'] as Date).getMonth() + 1,
        alignment: 'RIGHT'
      },
      {
        fieldName: 'DateFormat',
        dataType: TFieldType.String,
        caption: 'DateFormat',
        calcFunc: (row: IDataRow) => { const d = row['Date'] as Date; return `${d.getFullYear()}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getDay().toString().padStart(2, '0')}`; }
      }
    ];

    const typedRates: INBRBRate[] = (nbrbRates as any).map( (r: any): INBRBRate => ({...r, ['Date']: new Date(r['Date'])}) );

    const data = List<INBRBRate>(typedRates);
    rscf(RecordSet.create({name, fieldDefs, data}));
  };
