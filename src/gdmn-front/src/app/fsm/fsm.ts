import { IFlowchart, Transition, IBlock } from "./types";

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

  static create(flowChart: IFlowchart) {
    const transition = flowChart.flow['begin'];

    if (!transition) {
      throw new Error('No entry point for a chartflow given.');
    }

    return new FSM({
      flowchart: flowChart,
      path: [],
      block: transition.from
    });
  }

  get flowChart() {
    return this._params.flowchart;
  }
};
