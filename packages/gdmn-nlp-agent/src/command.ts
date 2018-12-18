import { EntityQuery } from "gdmn-orm";

export type Action = 'QUERY' | 'DELETE';

export interface ICommand {
  action: Action;
  payload: EntityQuery; 
};
