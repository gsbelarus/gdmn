import { IFlowchart, Transition, IBlock } from "./types";

export class FSM {
  private _block: IBlock;

  constructor (
    readonly flowChart: IFlowchart,
    readonly path: IBlock[]
  ) {
    const transition = flowChart.flow['begin'];

    if (!transition) {
      throw new Error('No entry point for a chartflow given.');
    }

    this._block = transition.from;
  }
};
