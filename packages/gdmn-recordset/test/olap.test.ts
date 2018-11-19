import { FieldDefs, TFieldType, IDataRow, GetRowDataFunc, getSumAggregator, RecordSet } from "../src";
import { List } from "immutable";

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

const demoData = [
  {
    company: 'Company A',
    good: 'Good A',
    date: new Date(2018, 1, 1),
    qty: 2,
    price: 1.5
  }
];

describe('olap', () => {

  it('creation', () => {

    const data = List<any>(demoData);
    let rs = RecordSet.createWithData('olap', fieldDefs, data);

    rs = rs.sort([
        {
          fieldName: 'company'
        }
      ],
      [
        {
          fieldName: 'year'
        }
      ],
      [
        {
          fieldName: 'sumCost',
          measureCalcFunc: (getRowData: GetRowDataFunc, rowStart: number, count: number) => {
            if (!count) {
              return null;
            }

            let v = 0;
            for (let i = rowStart; i < rowStart + count; i++) {
              v += getRowData(i)['cost'] as number;
            }
            return v / count;
          }
        }
      ]
    );

    expect(rs.size).toEqual(1);
    expect(rs.fieldDefs.length).toEqual(2);
    expect(rs.getString(0, 'company')).toEqual('Company A');
    expect(rs.getNumber(0, '[sumCost][2018]')).toEqual(3);
  });
});