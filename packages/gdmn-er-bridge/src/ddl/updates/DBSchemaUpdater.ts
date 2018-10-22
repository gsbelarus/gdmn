import {AConnection} from "gdmn-db";
import {BaseUpdate} from "./BaseUpdate";
import {Update1} from "./Update1";
import {Update2} from "./Update2";
import {Update3} from "./Update3";
import {Update4} from "./Update4";
import {Update5} from "./Update5";
import {Update6} from "./Update6";

const CURRENT_DATABASE_VERSION = 6;

const UPDATES_LIST: UpdateConstructor[] = [
  Update6,
  Update5,
  Update4,
  Update3,
  Update2,
  Update1
];

export type UpdateConstructor = new (connection: AConnection) => BaseUpdate;

export class DBSchemaUpdater extends BaseUpdate {

  protected readonly _version: number = CURRENT_DATABASE_VERSION;
  protected readonly _description: string = "Обновление структуры базы данных";

  public async run(): Promise<void> {
    const updates = UPDATES_LIST.map((UpdateConstructor) => new UpdateConstructor(this._connection));

    this._sort(updates);
    this._verifyAmount(updates);

    const version = await this._executeTransaction((transaction) => this._getDatabaseVersion(transaction));

    const newUpdates = updates.filter((item) => item.version > version);
    console.log(this._description + "...");
    console.time(this._description);
    for (const update of newUpdates) {
      console.log(update.description + "...");
      console.time(update.description);
      await update.run();
      console.timeEnd(update.description);
    }
    console.timeEnd(this._description);
  }

  private _sort(updates: BaseUpdate[]): void {
    updates.sort((a, b) => {
      if (a.version === b.version) throw new Error("Two identical versions of BaseUpdate");
      return a.version < b.version ? -1 : 1;
    });
  }

  private _verifyAmount(updates: BaseUpdate[]): void {
    const lastVersion = updates.reduce((prev, cur) => {
      if (cur.version - prev !== 1) {
        throw new Error("missing update");
      }
      return cur.version;
    }, 0);
    if (lastVersion < this._version) {
      throw new Error("missing update");
    }
    if (lastVersion > this._version) {
      throw new Error("extra update");
    }
  }
}
