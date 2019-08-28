import { LName } from "gdmn-internals";

export type ID = string;

export interface IFSMState {
  id: ID;
  label?: LName;
};

export interface IFSMSignal {
  id: ID;
  label?: LName;
};

export interface IFSMRule {
  id: ID;
  state: IFSMState;
  signal: IFSMSignal;
  nextState: IFSMState;
};


export type Shape = 'PROCESS' | 'START' | 'END' | 'DECISION';

export type BlockTypeParamDataType = 'string' | 'number';

export interface IBlockTypeParam {
  name: string;
  dataType: BlockTypeParamDataType;
  required?: boolean;
};


export interface IBlockType {
  id: ID;
  shape: Shape;
  label: string;
  inParams?: IBlockTypeParam[];
  outParams?: IBlockTypeParam[];
  blockParams?: IBlockTypeParam[];
};

export interface IBlockTypes {
  [id: string]: IBlockType;
};

export interface IBlockParams {
  [name: string]: any;
};

export interface IBlock {
  id: ID;
  type: IBlockType;
  label?: string;
  params?: IBlockParams;
};

export interface IBlocks {
  [id: string]: IBlock;
};

export interface ITransitionBase {
  id: ID;
  from: IBlock;
};

export interface ISimpleTransition extends ITransitionBase {
  to: IBlock;
};

export interface IXORTransition extends ITransitionBase {
  to: IBlock[];
};

export interface IDecisionTransition extends ITransitionBase {
  yes: IBlock | IBlock[];
  no: IBlock | IBlock[];
};

export function isSimpleTransition(transition: Transition): transition is ISimpleTransition {
  return (transition as ISimpleTransition).to instanceof Object;
};

export function isDecisionTransition(transition: Transition): transition is IDecisionTransition {
  return (transition as IDecisionTransition).yes !== undefined;
};

export function isXORTransition(transition: Transition): transition is IXORTransition {
  return Array.isArray((transition as IXORTransition).to);
};

export type Transition = ISimpleTransition | IXORTransition | IDecisionTransition;

export interface IFlow {
  [id: string]: Transition;
};

export interface IFlowchart {
  name: string;
  label: LName;
  description: LName;
  blocks: IBlocks;
  flow: IFlow;
};

export interface IFlowcharts {
  [name: string]: IFlowchart;
};