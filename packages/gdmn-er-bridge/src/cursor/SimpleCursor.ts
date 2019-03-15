import {AConnection, ATransaction, IParams} from "gdmn-db";
import {ACursor} from "./ACursor";

export class SimpleCursor extends ACursor {

  public static async open(connection: AConnection, transaction: ATransaction, sql: string, params: IParams): Promise<SimpleCursor> {
    const resultSet = await connection.executeQuery(transaction, sql, params);
    return new SimpleCursor(resultSet);
  }
}
