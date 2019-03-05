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
  },
  {
    company: 'Company A',
    good: 'Good A',
    date: new Date(2017, 1, 1),
    qty: 4,
    price: 3
  },
  {
    company: 'Company B',
    good: 'Good A',
    date: new Date(2016, 6, 1),
    qty: 0.1,
    price: 200
  },
  {
    company: 'Company A',
    good: 'Good B',
    date: new Date(2018, 5, 5),
    qty: 11,
    price: 12
  },
  {
    company: 'Company A',
    good: 'Good B',
    date: new Date(2018, 10, 10),
    qty: 5,
    price: 5.5
  },
];

describe('group', () => {

  it('group 1 level without aggregates', () => {

    const data = List<any>(demoData.slice(0, 5));
    let rs = RecordSet.create({name: 'group', fieldDefs, data, srcEoF: true});

    rs = rs.sort([
        {
          fieldName: 'company',
          asc: true,
          groupBy: true
        },
      ],
    );

    expect(rs.size).toEqual(7);
    expect(rs.fieldDefs.length).toEqual(9);
    expect(rs.getString(0, 'company')).toEqual('Company A');
    expect(rs.getString(1, 'company')).toEqual('Company A');
    expect(rs.getString(2, 'company')).toEqual('Company A');
    expect(rs.getString(3, 'company')).toEqual('Company A');
    expect(rs.getString(4, 'company')).toEqual('Company A');
    expect(rs.getString(5, 'company')).toEqual('Company B');
    expect(rs.getString(6, 'company')).toEqual('Company B');
  });

  it('group 1 level with aggregates', () => {

    const data = List<any>(demoData.slice(0, 5));
    let rs = RecordSet.create({name: 'group', fieldDefs, data, srcEoF: true});

    rs = rs.sort([
        {
          fieldName: 'company',
          asc: true,
          groupBy: true,
          calcAggregates: true
        },
      ],
    );

    expect(rs.size).toEqual(9);
    expect(rs.fieldDefs.length).toEqual(9);
    expect(rs.getString(0, 'company')).toEqual('Company A');
    expect(rs.getString(1, 'company')).toEqual('Company A');
    expect(rs.getString(2, 'company')).toEqual('Company A');
    expect(rs.getString(3, 'company')).toEqual('Company A');
    expect(rs.getString(4, 'company')).toEqual('Company A');
    expect(rs.getString(5, 'company', '')).toEqual('');
    expect(rs.getString(6, 'company')).toEqual('Company B');
    expect(rs.getString(7, 'company')).toEqual('Company B');
    expect(rs.getString(8, 'company', '')).toEqual('');
    expect(rs.getNumber(5, 'cost')).toEqual(174.5);
    expect(rs.getNumber(8, 'cost')).toEqual(20);
  });

  it('group 2 levels without aggregates', () => {

    const data = List<any>(demoData.slice(0, 5));
    let rs = RecordSet.create({name: 'group', fieldDefs, data, srcEoF: true});

    rs = rs.sort([
        {
          fieldName: 'company',
          asc: true,
          groupBy: true
        },
        {
          fieldName: 'good',
          asc: true,
          groupBy: true
        },
      ],
    );

    expect(rs.size).toEqual(10);
    expect(rs.fieldDefs.length).toEqual(9);
    expect(rs.getString(0, 'company')).toEqual('Company A');
    expect(rs.getString(1, 'company', '')).toEqual('');
    expect(rs.getString(2, 'company')).toEqual('Company A');
    expect(rs.getString(3, 'company')).toEqual('Company A');
    expect(rs.getString(4, 'company', '')).toEqual('');
    expect(rs.getString(5, 'company')).toEqual('Company A');
    expect(rs.getString(6, 'company')).toEqual('Company A');
    expect(rs.getString(7, 'company')).toEqual('Company B');
    expect(rs.getString(8, 'company', '')).toEqual('');
    expect(rs.getString(9, 'company')).toEqual('Company B');
  });

  it('group 2 levels with aggregates', () => {

    const data = List<any>(demoData.slice(0, 5));
    let rs = RecordSet.create({name: 'group', fieldDefs, data, srcEoF: true});

    rs = rs.sort([
        {
          fieldName: 'company',
          asc: true,
          groupBy: true,
          calcAggregates: false
        },
        {
          fieldName: 'good',
          asc: true,
          groupBy: true,
          calcAggregates: true
        },
      ],
    );

    expect(rs.size).toEqual(13);
    expect(rs.fieldDefs.length).toEqual(9);
    expect(rs.getString(0, 'company')).toEqual('Company A');
    expect(rs.getString(1, 'company', '')).toEqual('');
    expect(rs.getString(2, 'company')).toEqual('Company A');
    expect(rs.getString(3, 'company')).toEqual('Company A');
    expect(rs.getString(4, 'company', '')).toEqual('');
    expect(rs.getString(5, 'company', '')).toEqual('');
    expect(rs.getString(6, 'company')).toEqual('Company A');
    expect(rs.getString(7, 'company')).toEqual('Company A');
    expect(rs.getString(8, 'company', '')).toEqual('');
    expect(rs.getString(9, 'company')).toEqual('Company B');
    expect(rs.getString(10, 'company', '')).toEqual('');
    expect(rs.getString(11, 'company')).toEqual('Company B');
    expect(rs.getString(12, 'company', '')).toEqual('');
    expect(rs.getNumber(4, 'cost')).toEqual(15);
    expect(rs.getNumber(8, 'cost')).toEqual(159.5);
    expect(rs.getNumber(12, 'cost')).toEqual(20);
  });
});
