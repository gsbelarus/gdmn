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

describe('olap', () => {

  it('olap - 1 cell', () => {

    const data = List<any>(demoData.slice(0, 1));
    let rs = RecordSet.create({name: 'olap', fieldDefs, data});

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
            return v;
          }
        }
      ]
    );

    expect(rs.size).toEqual(1);
    expect(rs.fieldDefs.length).toEqual(2);
    expect(rs.getString('company', 0)).toEqual('Company A');
    expect(rs.getFloat('[sumCost][2018]', 0)).toEqual(3);
  });

  it('olap - 1 row, 2 columns', () => {

    const data = List<any>(demoData.slice(0, 2));
    let rs = RecordSet.create({name: 'olap', fieldDefs, data});

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
            return v;
          }
        }
      ]
    );

    expect(rs.size).toEqual(1);
    expect(rs.fieldDefs.length).toEqual(3);
    expect(rs.getString('company')).toEqual('Company A');
    expect(rs.getFloat('[sumCost][2018]')).toEqual(3);
    expect(rs.getFloat('[sumCost][2017]')).toEqual(12);
  });

  it('olap - 2 rows, 4 columns', () => {

    const data = List<any>(demoData.slice(0, 3));
    let rs = RecordSet.create({name: 'olap', fieldDefs, data});

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
            return v;
          }
        }
      ]
    );

    expect(rs.size).toEqual(2);
    expect(rs.fieldDefs.length).toEqual(4);
    expect(rs.getString('company', 0)).toEqual('Company B');
    expect(rs.getString('company', 1)).toEqual('Company A');
    expect(rs.getFloat('[sumCost][2016]', 0)).toEqual(20);
    expect(rs.getFloat('[sumCost][2017]', 0, 0)).toEqual(0);
    expect(rs.getFloat('[sumCost][2018]', 0, 0)).toEqual(0);
    expect(rs.getFloat('[sumCost][2016]', 1, 0)).toEqual(0);
    expect(rs.getFloat('[sumCost][2017]', 1, 0)).toEqual(12);
    expect(rs.getFloat('[sumCost][2018]', 1, 0)).toEqual(3);
  });

  it('olap - 3 rows, 5 columns', () => {

    const data = List<any>(demoData.slice(0, 4));
    let rs = RecordSet.create({name:'olap', fieldDefs, data});

    rs = rs.sort([
        {
          fieldName: 'company'
        },
        {
          fieldName: 'good'
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
            return v;
          }
        }
      ]
    );

    expect(rs.size).toEqual(3);
    expect(rs.fieldDefs.length).toEqual(5);
    expect(rs.getString('company', 0)).toEqual('Company B');
    expect(rs.getString('company', 1)).toEqual('Company A');
    expect(rs.getString('company', 2)).toEqual('Company A');
    expect(rs.getFloat('[sumCost][2016]', 0)).toEqual(20);
    expect(rs.getFloat('[sumCost][2017]', 0, 0)).toEqual(0);
    expect(rs.getFloat('[sumCost][2018]', 0, 0)).toEqual(0);
    expect(rs.getFloat('[sumCost][2016]', 1, 0)).toEqual(0);
    expect(rs.getFloat('[sumCost][2017]', 1, 0)).toEqual(0);
    expect(rs.getFloat('[sumCost][2018]', 1)).toEqual(132);
    expect(rs.getFloat('[sumCost][2016]', 2, 0)).toEqual(0);
    expect(rs.getFloat('[sumCost][2017]', 2, 0)).toEqual(12);
    expect(rs.getFloat('[sumCost][2018]', 2, 0)).toEqual(3);
  });

  it('olap - 3 rows, 10 columns', () => {

    const data = List<any>(demoData.slice(0, 5));
    let rs = RecordSet.create({name: 'olap', fieldDefs, data});

    rs = rs.sort([
        {
          fieldName: 'company'
        },
        {
          fieldName: 'good'
        }
      ],
      [
        {
          fieldName: 'year'
        },
        {
          fieldName: 'month'
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
            return v;
          }
        }
      ]
    );

    expect(rs.size).toEqual(3);
    expect(rs.fieldDefs.length).toEqual(10);
    expect(rs.getString('company', 0)).toEqual('Company B');
    expect(rs.getString('company', 1)).toEqual('Company A');
    expect(rs.getString('company', 2)).toEqual('Company A');
    expect(rs.getString('good', 0)).toEqual('Good A');
    expect(rs.getString('good', 1)).toEqual('Good B');
    expect(rs.getString('good', 2)).toEqual('Good A');
    expect(rs.getFloat('[sumCost][2016]', 0)).toEqual(20);
    expect(rs.getFloat('[sumCost][2016][7]', 0)).toEqual(20);
    expect(rs.getFloat('[sumCost][2017]', 0, 0)).toEqual(0);
    expect(rs.getFloat('[sumCost][2018]', 0, 0)).toEqual(0);
    expect(rs.getFloat('[sumCost][2016]', 1, 0)).toEqual(0);
    expect(rs.getFloat('[sumCost][2017]', 1, 0)).toEqual(0);
    expect(rs.getFloat('[sumCost][2018]', 1)).toEqual(159.5);
    expect(rs.getFloat('[sumCost][2018][6]', 1)).toEqual(132);
    expect(rs.getFloat('[sumCost][2018][11]', 1)).toEqual(27.5);
    expect(rs.getFloat('[sumCost][2016]', 2, 0)).toEqual(0);
    expect(rs.getFloat('[sumCost][2017]', 2, 0)).toEqual(12);
    expect(rs.getFloat('[sumCost][2017][2]', 2, 0)).toEqual(12);
    expect(rs.getFloat('[sumCost][2018]', 2, 0)).toEqual(3);
    expect(rs.getFloat('[sumCost][2018][2]', 2, 0)).toEqual(3);
  });
});
