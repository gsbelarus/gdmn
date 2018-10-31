import { Attribute, Entity } from "gdmn-orm";

export type Action = 'SHOW' | 'DELETE';

export enum Determiner {
  All = 0
};

export type Operator = 'EQ' | 'HASROOT';

export interface IAttrCondition {
  attr: Attribute;
  op: Operator;
  value: string;
};

export interface ICommandObject {
  determiner: Determiner;
  entity: Entity;
  conditions: IAttrCondition[];
};

export interface ICommand {
  action: Action;
  objects?: ICommandObject[];
};