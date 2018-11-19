import { TFieldType, getSumAggregator, IDataRow, FieldDefs, RecordSet } from "gdmn-recordset";
import { List } from "immutable";
import { RSCreateFunc } from "./types";

const demoData = [
  {
    company: 'Company A',
    good: 'Good A',
    date: new Date(2018, 1, 1),
    qty: 2,
    price: 1.5
  }
];

export function loadDemoData(name: string, rscf: RSCreateFunc) {
  const fieldDefs: FieldDefs = [
    {
      fieldName: 'company',
      dataType: TFieldType.String,
      caption: 'Компания',
      required: true
    },
    {
      fieldName: 'good',
      dataType: TFieldType.String,
      caption: 'товар',
      required: true
    },
    {
      fieldName: 'date',
      dataType: TFieldType.Date,
      caption: 'Дата',
      required: true
    },
    {
      fieldName: 'qty',
      dataType: TFieldType.Currency,
      caption: 'Количество',
      required: true
    },
    {
      fieldName: 'price',
      dataType: TFieldType.Currency,
      caption: 'Цена',
      required: true,
    },
    {
      fieldName: 'cost',
      dataType: TFieldType.Currency,
      caption: 'Стоимость',
      calcFunc: (row: IDataRow) => (row['qty'] as number) * (row['price'] as number),
      aggregator: getSumAggregator()
    },
    {
      fieldName: 'year',
      dataType: TFieldType.Integer,
      caption: 'Год',
      calcFunc: (row: IDataRow) => (row['date'] as Date).getFullYear()
    },
    {
      fieldName: 'month',
      dataType: TFieldType.Integer,
      caption: 'Месяц',
      calcFunc: (row: IDataRow) => (row['date'] as Date).getMonth() + 1
    },
    {
      fieldName: 'sdate',
      dataType: TFieldType.String,
      caption: 'Дата строкой',
      calcFunc: (row: IDataRow) => { const d = row['date'] as Date; return `${d.getFullYear()}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getDay().toString().padStart(2, '0')}`; }
    }
  ];

  const data = List<any>(demoData);
  rscf(RecordSet.createWithData(name, fieldDefs, data));
};