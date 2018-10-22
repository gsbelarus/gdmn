import {AConnection, AStatement, ATransaction} from "gdmn-db";
import {Constants} from "../Constants";

export class DDLUniqueGenerator {

  private _nextUnique: AStatement | undefined;

  public get prepared(): boolean {
    return !!this._nextUnique && !this._nextUnique.disposed;
  }

  public async prepare(connection: AConnection, transaction: ATransaction): Promise<void> {
    this._nextUnique = await connection.prepare(transaction,
      `SELECT NEXT VALUE FOR ${Constants.GLOBAL_DDL_GENERATOR} FROM RDB$DATABASE`);
  }

  public async dispose(): Promise<void> {
    await this.getNextUnique().dispose();
    this._nextUnique = undefined;
  }

  public async next(): Promise<number> {
    const result = await this.getNextUnique().executeReturning();
    return (await result.getAll())[0];
  }

  private getNextUnique(): AStatement {
    if (this._nextUnique) {
      return this._nextUnique;
    }
    throw new Error("should call prepare");
  }
}
