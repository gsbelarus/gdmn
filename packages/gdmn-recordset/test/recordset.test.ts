import { RecordSet, TFieldType, IDataRow, TCommitResult } from '../src';
import { List } from 'immutable';
import { nbrbCurrencies, INBRBCurrency } from './nbrbcurrencies';
import { TRowState } from '../src';

describe('recordset', () => {

  it('create empty recordset', () => {
    const fieldDefs = [
      {
        fieldName: 'id',
        dataType: TFieldType.Integer,
        caption: 'id',
        required: true
      }
    ];

    let rs = RecordSet.create({
      name: 'test',
      fieldDefs,
      data: List([] as IDataRow[])
    });

    expect(rs.size).toEqual(0);
    expect(rs.currentRow).toEqual(0);

    rs = rs.set({ id: 1 }, undefined, true);
    expect(rs.size).toEqual(1);
    expect(rs.currentRow).toEqual(0);
    expect(rs.getRowState() === TRowState.Inserted);
    expect(rs.getInteger('id') === 1);

    rs = rs.set({ id: 2 });
    expect(rs.size).toEqual(1);
    expect(rs.currentRow).toEqual(0);
    expect(rs.getRowState() === TRowState.Inserted);
    expect(rs.getInteger('id') === 2);

    rs = rs.set({ id: 3 }, undefined, true);
    expect(rs.size).toEqual(1);
    expect(rs.currentRow).toEqual(0);
    expect(rs.getRowState() === TRowState.Edited);
    expect(rs.getInteger('id') === 3);
  });

  it('creation', () => {

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
        required: true
      },
      {
        fieldName: 'Cur_ParentID',
        dataType: TFieldType.Integer,
        caption: 'Внутренний код для связи',
        required: true
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

    let rs = RecordSet.create({
      name: 'test',
      fieldDefs,
      data: List<INBRBCurrency>(nbrbCurrencies as any)
    });

    expect(rs.size).toEqual(224);

    /**
     * setCurrentRow
     */

    rs = rs.setCurrentRow(10);
    expect(rs.currentRow).toEqual(10);

    /**
     * remove rows
     */

    rs = rs.delete(true, [9, 10]);
    expect(rs.currentRow).toEqual(9);
    expect(rs.size).toEqual(222);

    rs = rs.delete(true, []);
    expect(rs.size).toEqual(222);

    rs = rs.delete(true, [221]);
    expect(rs.size).toEqual(221);
  });

  it('crud', async () => {
    const fieldDefs = [
      {
        fieldName: 'i',
        dataType: TFieldType.Integer,
        caption: 'Integer'
      },
      {
        fieldName: 'f',
        dataType: TFieldType.Float,
        caption: 'Float'
      },
      {
        fieldName: 'c',
        dataType: TFieldType.Currency,
        caption: 'Currency'
      },
      {
        fieldName: 'd',
        dataType: TFieldType.Date,
        caption: 'Date'
      },
      {
        fieldName: 's',
        dataType: TFieldType.String,
        caption: 'String'
      },
      {
        fieldName: 'b',
        dataType: TFieldType.Boolean,
        caption: 'Boolean'
      },
    ];

    const data = [
      {
        i: 5,
        f: 555.0123456789,
        c: 5.1234,
        d: new Date(2019, 4, 25),
        s: 'abc',
        b: true
      }
    ];

    let rs = RecordSet.create({
      name: 'test',
      fieldDefs,
      data: List<IDataRow>(data as any)
    });

    expect(rs.size).toEqual(1);

    expect(rs.changed).toEqual(0);

    /**
     * Test read type conversions
     */

    expect(rs.getInteger('i') === 5).toBeTruthy();
    expect(rs.getFloat('i') === 5).toBeTruthy();
    expect(rs.getCurrency('i') === 5).toBeTruthy();
    expect(rs.getString('i') === '5').toBeTruthy();
    expect(rs.getBoolean('i') === true).toBeTruthy();
    expect( () => rs.getDate('i') ).toThrowError();

    expect( () => rs.getInteger('f') ).toThrowError();
    expect(rs.getFloat('f') === 555.0123456789).toBeTruthy();
    expect(rs.getCurrency('f') === 555.0123456789).toBeTruthy();
    expect(rs.getString('f') === '555.0123456789').toBeTruthy();
    expect(rs.getBoolean('f') === true).toBeTruthy();
    expect( () => rs.getDate('f') ).toThrowError();

    expect( () => rs.getInteger('c') ).toThrowError();
    expect(rs.getFloat('c') === 5.1234).toBeTruthy();
    expect(rs.getCurrency('c') === 5.1234).toBeTruthy();
    expect(rs.getString('c') === '5.1234').toBeTruthy();
    expect(rs.getBoolean('c') === true).toBeTruthy();
    expect( () => rs.getDate('c') ).toThrowError();

    expect(rs.getInteger('d')).toEqual(new Date(2019, 4, 25).getTime());
    expect(rs.getFloat('d')).toEqual(new Date(2019, 4, 25).getTime());
    expect(rs.getCurrency('d')).toEqual(new Date(2019, 4, 25).getTime());
    expect(rs.getString('d')).toEqual(new Date(2019, 4, 25).toString());
    expect(rs.getBoolean('d')).toBeTruthy();
    expect(rs.getDate('d')).toEqual(new Date(2019, 4, 25));

    /**
     * Test set as integer
     */
    rs = rs.setInteger('i', 100);
    expect(rs.getInteger('i')).toEqual(100);
    expect( () => rs.setInteger('i', 100.1) ).toThrowError();
    expect(rs.getInteger('i')).toEqual(100);
    rs = rs.setInteger('f', 100);
    expect(rs.getFloat('f')).toEqual(100);
    rs = rs.setInteger('c', 100);
    expect(rs.getCurrency('c')).toEqual(100);
    rs = rs.setInteger('s', 100);
    expect(rs.getString('s')).toEqual('100');
    rs = rs.setInteger('b', 100);
    expect(rs.getBoolean('b')).toEqual(true);
    rs = rs.setInteger('d', 100);
    expect(rs.getDate('d')).toEqual(new Date(100));

    /**
     * Test set as float
     */

    expect( () => rs.setFloat('i', 222.32323232) ).toThrowError();
    rs = rs.setFloat('f', 222.32323232);
    expect(rs.getFloat('f')).toEqual(222.32323232);
    rs = rs.setFloat('c', 222.32323232);
    expect(rs.getCurrency('c')).toEqual(222.32323232);
    rs = rs.setFloat('s', 222.32323232);
    expect(rs.getString('s')).toEqual('222.32323232');
    rs = rs.setFloat('b', 222.32323232);
    expect(rs.getBoolean('b')).toEqual(true);
    rs = rs.setFloat('d', 222.32323232);
    expect(rs.getDate('d')).toEqual(new Date(222.32323232));

    /**
     * Test set as currency
     */

    expect( () => rs.setCurrency('i', -7.7777) ).toThrowError();
    rs = rs.setCurrency('f', -7.7777);
    expect(rs.getFloat('f')).toEqual(-7.7777);
    rs = rs.setCurrency('c', -7.7777);
    expect(rs.getCurrency('c')).toEqual(-7.7777);
    rs = rs.setCurrency('s', -7.7777);
    expect(rs.getString('s')).toEqual('-7.7777');
    rs = rs.setCurrency('b', -7.7777);
    expect(rs.getBoolean('b')).toEqual(true);
    rs = rs.setCurrency('d', -7.7777);
    expect(rs.getDate('d')).toEqual(new Date(-7.7777));

    /**
     * Test set as string
     */

    expect( () => rs.setString('i', '-7.7777') ).toThrowError();
    rs = rs.setString('i', '12');
    expect(rs.getInteger('i')).toEqual(12);

    expect( () => rs.setString('f', 'abc') ).toThrowError();
    expect( () => rs.setString('f', '') ).toThrowError();
    rs = rs.setString('f', '-7.7777');
    expect(rs.getFloat('f')).toEqual(-7.7777);

    rs = rs.setString('c', '-7.7777');
    expect(rs.getCurrency('c')).toEqual(-7.7777);
    rs = rs.setString('s', '-7.7777');
    expect(rs.getString('s')).toEqual('-7.7777');

    expect( () => rs.setString('b', 'abc') ).toThrowError();
    expect( () => rs.setString('b', '') ).toThrowError();
    rs = rs.setString('b', 'FALSE');
    expect(rs.getBoolean('b')).toEqual(false);

    rs = rs.setString('d', '1995-12-17');
    expect(rs.getDate('d')).toEqual(new Date('1995-12-17'));

    /**
     * Test set as boolean
     */

    rs = rs.setBoolean('i', false);
    expect(rs.getInteger('i')).toEqual(0);

    rs = rs.setBoolean('f', true);
    expect(rs.getFloat('f')).toEqual(1);

    rs = rs.setBoolean('c', true);
    expect(rs.getCurrency('c')).toEqual(1);
    rs = rs.setBoolean('s', true);
    expect(rs.getString('s')).toEqual('TRUE');

    rs = rs.setBoolean('b', false);
    expect(rs.getBoolean('b')).toEqual(false);

    expect( () => rs.setBoolean('d', false) ).toThrowError();

    /**
     * Test set as date
     */

    const tempDate = new Date('2019-02-02');
    const tempMs = tempDate.getTime();

    rs = rs.setDate('i', tempDate);
    expect(rs.getInteger('i')).toEqual(tempMs);

    rs = rs.setDate('f', tempDate);
    expect(rs.getFloat('f')).toEqual(tempMs);

    rs = rs.setDate('c', tempDate);
    expect(rs.getCurrency('c')).toEqual(tempMs);

    rs = rs.setDate('s', tempDate);
    expect(rs.getString('s')).toEqual(tempDate.toString());

    rs = rs.setDate('d', tempDate);
    expect(rs.getString('d', undefined, undefined, 'dd.mm.yy')).toEqual('02.02.19');

    rs = rs.setDate('d', tempDate);
    expect(rs.getString('d', undefined, undefined, 'dd.mm.yyyy')).toEqual('02.02.2019');

    rs = rs.setDate('b', tempDate);
    expect(rs.getBoolean('b')).toEqual(true);

    rs = rs.setDate('d', tempDate);
    expect(rs.getDate('d')).toEqual(tempDate);
    

    /**
     *
     */

    expect(rs.changed).toEqual(1);
    expect(rs.size).toEqual(1);
    expect(rs.currentRow).toEqual(0);
    expect(rs.getRowState()).toEqual(TRowState.Edited);

    expect( () => rs = rs.delete(false) ).toThrowError();
    expect(rs.changed).toEqual(1);
    expect(rs.size).toEqual(1);
    expect(rs.currentRow).toEqual(0);
    expect(rs.getRowState()).toEqual(TRowState.Edited);
    rs = rs.delete(true);
    expect(rs.changed).toEqual(0);
    expect(rs.size).toEqual(0);
    expect(rs.currentRow).toEqual(0);

    rs = rs.insert();
    expect(rs.getRowState()).toEqual(TRowState.Inserted);
    expect(rs.changed).toEqual(1);
    expect(rs.size).toEqual(1);
    rs = rs.cancelAll();
    expect(rs.changed).toEqual(0);
    expect(rs.currentRow).toEqual(0);
    expect(rs.size).toEqual(0);

    rs = rs.insert();
    expect(rs.getRowState()).toEqual(TRowState.Inserted);
    expect(rs.changed).toEqual(1);
    rs = await rs.post( () => Promise.resolve(TCommitResult.Success) );
    expect(rs.changed).toEqual(0);
    expect(rs.size).toEqual(1);

    rs = rs.insert();
    expect(rs.currentRow).toEqual(0);
    expect(rs.getRowState()).toEqual(TRowState.Inserted);
    expect(rs.changed).toEqual(1);
    expect(rs.size).toEqual(2);
    rs = rs.setBoolean('b', true);
    expect(rs.currentRow).toEqual(0);
    expect(rs.getRowState()).toEqual(TRowState.Inserted);
    expect(rs.changed).toEqual(1);
    expect(rs.size).toEqual(2);

    rs = rs.insert();
    rs = rs.insert();
    expect(rs.currentRow).toEqual(0);
    expect(rs.size).toEqual(4);
    expect(rs.changed).toEqual(3);

    expect( () => rs = rs.delete(false, [0, 1, 2]) ).toThrowError();
    expect(rs.currentRow).toEqual(0);
    expect(rs.changed).toEqual(3);
    expect(rs.size).toEqual(4);

    rs = rs.delete(true, [0, 1, 2]);
    expect(rs.changed).toEqual(0);
    expect(rs.size).toEqual(1);
    expect(rs.currentRow).toEqual(0);
  });
});
