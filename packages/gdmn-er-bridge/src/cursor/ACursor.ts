import {AResultSet, TExecutor, Types} from "gdmn-db";
import {Semaphore} from "gdmn-internals";

export interface IFetchResponseDataItem {
  [alias: string]: any
}

export interface IFetchResponse {
  finished: boolean;
  data: IFetchResponseDataItem[];
}

export interface IFetchResponseAliases {
  [alias: string]: {
    type: Types;
    field?: string;
    relation?: string;
  }
}

export interface ICursorResponse {
  data: IFetchResponseDataItem[];
  aliases: IFetchResponseAliases;
}

export abstract class ACursor {

  protected readonly _resultSet: AResultSet;

  private readonly _lock = new Semaphore();
  private readonly _openedLock = new Semaphore(0);

  protected constructor(resultSet: AResultSet) {
    this._resultSet = resultSet;
  }

  get closed(): boolean {
    return this._resultSet.closed;
  }

  get isLock(): boolean {
    return !!this._lock.permits;
  }

  public async fetch(count: number): Promise<IFetchResponse> {
    if (this.isLock) {
      await this.waitUnlock();
    }
    if (this.closed) {
      throw new Error("Cursor already closed");
    }
    const metadata = this._resultSet.metadata;
    const transaction = this._resultSet.statement.transaction;
    const connection = transaction.connection;

    const data: IFetchResponseDataItem[] = [];
    for (let i = 0; i < count && await this._resultSet.next(); i++) {
      const row: IFetchResponseDataItem = {};
      for (let j = 0; j < metadata.columnCount; j++) {
        // TODO binary blob support
        if (metadata.getColumnType(j) === Types.BLOB) {
          row[metadata.getColumnLabel(j)!] = this._resultSet.isNull(j)
            ? null
            : await connection.openBlobAsString(transaction, this._resultSet.getBlob(j)!);
        } else {
          row[metadata.getColumnLabel(j)!] = this._resultSet.getAny(j);
        }
      }
      data.push(row);
    }

    return {finished: await this._resultSet.isEof(), data};
  }

  public makeCursorResponse(data: any[]): ICursorResponse {
    const metadata = this._resultSet.metadata;
    const aliases: IFetchResponseAliases = {};
    for (let i = 0; i < this._resultSet.metadata.columnCount; i++) {
      aliases[metadata.getColumnLabel(i)!] = {
        type: metadata.getColumnType(i),
        field: metadata.getColumnName(i),
        relation: metadata.getColumnRelation(i)
      };
    }

    return {
      data,
      aliases
    };
  }

  public async close(): Promise<void> {
    await this._executeWithLock(async () => {
      if (this.closed) {
        throw new Error("Cursor already closed");
      }
      await this._resultSet.close();
      this._openedLock.release();
    });
  }

  public async waitForClosing(): Promise<void> {
    if (this.closed) {
      throw new Error("Cursor already closed");
    }
    if (!this._openedLock.permits) {
      await this._openedLock.acquire();
      this._openedLock.release();
    }
  }

  public async waitUnlock(): Promise<void> {
    if (!this.isLock) {
      await this._lock.acquire();
      this._lock.release();
    }
  }

  protected async _executeWithLock<R>(callback: TExecutor<void, R>): Promise<R> {
    await this._lock.acquire();
    try {
      return await callback();
    } finally {
      this._lock.release();
    }
  }
}
