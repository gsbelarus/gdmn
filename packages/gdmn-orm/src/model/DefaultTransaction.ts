import {ITransaction} from "../types";

export class DefaultTransaction implements ITransaction {

  public finished: boolean = false;

  public async commit(): Promise<void> {
    this.finished = true;
  }

  public async rollback(): Promise<void> {
    this.finished = true;
  }
}
