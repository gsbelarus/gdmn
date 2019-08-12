import { IFlowchart, IBlock } from "./types";

interface IFSMParams {
  flowchart: IFlowchart;
  path: IBlock[];
  block: IBlock;
};

export class FSM {
  private _params: IFSMParams;

  constructor (params: IFSMParams) {
    this._params = params;
  }

  static create(flowchart: IFlowchart) {
    const transition = flowchart.flow['begin'];

    if (!transition) {
      throw new Error('No entry point for a chartflow given.');
    }

    return new FSM({
      flowchart: flowchart,
      path: [],
      block: transition.from
    });
  }

  get flowchart() {
    return this._params.flowchart;
  }

  get block() {
    return this._params.block;
  }
};
