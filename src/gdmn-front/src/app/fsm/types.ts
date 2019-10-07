import { LName } from "gdmn-internals";

export type ID = string;

export type ParamDataType = 'string' | 'number';

export interface IParam {
  name: string;
  dataType: ParamDataType;
  required?: boolean;
};

export interface IFSMStateType {
  id: ID;
  label?: LName;
  inParams?: IParam[];
  outParams?: IParam[];
  params?: IParam[];
};

export interface IParamsValues {
  [name: string]: any;
};

export interface IFSMState {
  id: ID;
  type: IFSMStateType;
  label?: LName;
  inParams?: IParamsValues;
  outParams?: IParamsValues;
  params?: IParamsValues;
};

export interface IFSMSignal {
  id: ID;
  label?: LName;
  params?: IParam[];
};

export interface IFSMRule {
  id: ID;
  state: IFSMState;
  signal: IFSMSignal;
  nextState: IFSMState;
};

export interface IFSMFlowchart {
  id: ID;
  label: LName;
  description: LName;
  rules: {
    [name: string]: IFSMRule;
  }
};

export interface IFSMFlowcharts {
  [name: string]: IFSMFlowchart;
};