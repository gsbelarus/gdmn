import { Helpers } from '@src/app/model/temp/Helpers';

export type BaseEntityType = 'entity' | 'link';

export class BaseEntity {
  public id: string;
  public locked: boolean;

  constructor(id?: string) {
    this.id = id || Helpers.UID();
    this.locked = false;
  }

  public getID() {
    return this.id;
  }
}
