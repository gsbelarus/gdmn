import {AConnection, AResultSet, ATransaction} from "gdmn-db";
import {Semaphore} from "gdmn-internals";
import {EntityQuery, IEntityQueryResponse, IEntityQueryResponseFieldAliases} from "gdmn-orm";
import {Select} from "./crud/query/Select";

export class EQueryCursor {

  private _connection: AConnection;
  private _transaction: ATransaction;
  private _query: EntityQuery;
  private _select: Select;
  private _resultSet: AResultSet;

  private _lock = new Semaphore();

  constructor(connection: AConnection, transaction: ATransaction, query: EntityQuery, select: Select, resultSet: AResultSet) {
    this._connection = connection;
    this._transaction = transaction;
    this._query = query;
    this._select = select;
    this._resultSet = resultSet;
  }

  get closed(): boolean {
    return this._resultSet.closed;
  }

  public static async open(connection: AConnection, transaction: ATransaction, query: EntityQuery): Promise<EQueryCursor> {
    const select = new Select(query);

    const resultSet = await connection.executeQuery(transaction, select.sql, select.params);
    const cursor = new EQueryCursor(connection, transaction, query, select, resultSet);
    await cursor._lock.acquire();
    return cursor;
  }

  public async fetch(count: number): Promise<{ finished: boolean, data: any[] }> {
    const data = [];
    for (let i = 0; i < count && await this._resultSet.next(); i++) {
      const row: { [key: string]: any } = {};
      for (let j = 0; j < this._resultSet.metadata.columnCount; j++) {
        // TODO binary blob support
        row[this._resultSet.metadata.getColumnLabel(j)] = await this._resultSet.getAny(j);
      }
      data.push(row);
    }
    return {finished: await this._resultSet.isEof(), data};
  }

  public async close(): Promise<void> {
    await this._resultSet.close();
    this._lock.release();
  }

  public async waitClose(): Promise<void> {
    if (!this._lock.permits) {
      await this._lock.acquire();
      this._lock.release();
    }
  }

  public makeEntityQueryResponse(data: any[]): IEntityQueryResponse {
    return {
      data,
      aliases: Array.from(this._select.fieldAliases).reduce((aliases, [field, values]) => (
        Array.from(values).reduce((map, [attribute, fieldAlias]) => {
            const link = this._query.link.deepFindLink(field);
            if (!link) {
              throw new Error("Field not found");
            }
            return {
              ...aliases,
              [fieldAlias]: {
                linkAlias: link.alias,
                attribute: field.attribute.name,
                setAttribute: field.attribute.type === "Set" && field.attribute !== attribute
                  ? attribute.name : undefined
              }
            };
          }, aliases
        )
      ), {} as IEntityQueryResponseFieldAliases),
      info: {
        select: this._select.sql,
        params: this._select.params
      }
    };
  }
}
