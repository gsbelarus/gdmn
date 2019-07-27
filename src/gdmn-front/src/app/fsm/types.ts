import { LName } from "gdmn-internals";

export type Shape = 'PROCESS' | 'START' | 'END' | 'DECISION';

export type BlockTypeParamDataType = 'string' | 'number';

export interface IBlockTypeParam {
  name: string;
  dataType: BlockTypeParamDataType;
  required?: boolean;
};

export type ID = string;

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
  from: IBlock;
};

export interface ITransition extends ITransitionBase {
  to: IBlock;
};

export interface IXORTransition extends ITransitionBase {
  to: IBlock[];
};

export interface IDecisionTransition extends ITransitionBase {
  yes: IBlock | IBlock[];
  no: IBlock | IBlock[];
};

export function isDecisionTransition(transition: Transition): transition is IDecisionTransition {
  return (transition as IDecisionTransition).yes !== undefined;
};

export function isXORTransition(transition: Transition): transition is IXORTransition {
  return Array.isArray((transition as IXORTransition).to);
};

export type Transition = ITransition | IXORTransition | IDecisionTransition;

export interface IFlowchart {
  label: LName;
  description: LName;
  blocks: IBlocks;
  flow: Transition[];
};

export interface IFlowcharts {
  [name: string]: IFlowchart;
};