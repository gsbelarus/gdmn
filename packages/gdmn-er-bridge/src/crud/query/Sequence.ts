import { Sequence, 
  SequenceQuery } from "gdmn-orm";

export class GetSequence {

  public readonly query: SequenceQuery;
  public readonly sql: string = "";

  constructor(query: SequenceQuery) {
    this.query = query;
    this.sql = this._getSequence(query);
  }

  private  _getSequence(query: SequenceQuery): string {
    let sql = `SELECT`;
    if (query.increment !== undefined) {
      sql+= ' GEN_ID (' + query.inspect.name + ', ' + query.increment + ') \nFROM RDB$DATABASE';
    } else {
      sql+= ' NEXT VALUE FOR ' + query.inspect.name + '\nFROM RDB$DATABASE';
    }
    return sql;
  }
}

