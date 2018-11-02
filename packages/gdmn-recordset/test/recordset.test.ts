import { RecordSet } from '../src';
import { List } from 'immutable';

describe('recordset', () => {

  it('test', () => {

    const rs = new RecordSet(
      'test',
      [],
      List([]),
      0,
      [],
      false,
      [],
      undefined
    );

    expect(rs.data.size).toEqual(0);
  });

});
