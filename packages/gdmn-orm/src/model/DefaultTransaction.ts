import {ITransaction} from "../types";

export class DefaultTransaction implements ITransaction {

  private _finished: boolean = false;

  get finished(): boolean {
    return this._finished;
  }

  public async commit(): Promise<void> {
    this._finished = true;
  }

  public async rollback(): Promise<void> {
    this._finished = true;
  }
}
