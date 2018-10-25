import { List } from 'immutable';

export interface INLPDialogItem {
  who: string;
  text: string;
}

export class NLPDialog {
  private _items: List<INLPDialogItem>;

  constructor () {
    this._items = List<INLPDialogItem>();
  }

  get items() {
    return this._items;
  }

  public add(who: string, text: string) {
    this._items = this._items.push({who, text});
  }
}