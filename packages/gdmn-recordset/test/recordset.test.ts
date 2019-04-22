import { RecordSet, TFieldType } from '../src';
import { List } from 'immutable';
import { nbrbCurrencies, INBRBCurrency } from './nbrbcurrencies';

describe('recordset', () => {

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

    rs = rs.setCurrentRow(10);
    expect(rs.currentRow).toEqual(10);

    rs = rs.removeRows([9, 10]);
    expect(rs.currentRow).toEqual(9);
    expect(rs.size).toEqual(222);

    rs = rs.removeRows([]);
    expect(rs.size).toEqual(222);

    rs = rs.removeRows([221]);
    expect(rs.size).toEqual(221);

    /**
     * Тестируем редактирование данных.
     */
    const d = new Date();

    rs = rs.setCurrentRow(0);
    rs = rs.edit();
    rs = rs.setDate('Cur_DateStart', d);
    rs = rs.post();
    expect(rs.getDate('Cur_DateStart')).toEqual(d);

    const t = () => rs = rs.setDate('Cur_DateStart', d);
    expect(t).toThrow(Error);
  });

});
