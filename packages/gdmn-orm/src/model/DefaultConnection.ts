import {IConnection} from "../types";

export class DefaultConnection implements IConnection {

  private _connected: boolean = true;

  get connected(): boolean {
    return this._connected;
  }

  public async disconnect(): Promise<void> {
    this._connected = false;
  }
}
