import { IFlowchart, IBlock, Transition } from "./types";
import { blockTypes } from "./blockTypes";
import { store } from "..";
import { ITransaction } from "@stomp/stompjs";

interface IFSMParams {
  flowchart: IFlowchart;
  path: IBlock[];
  transition: Transition;
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
      transition
    });
  }

  get flowchart() {
    return this._params.flowchart;
  }

  get transition() {
    return this._params.transition;
  }

  get block() {
    return this._params.transition.from;
  }

  run() {
    const state = store.getState();

    switch (this.block.type) {
      case blockTypes.login:
        if (!state.authState.accessToken) {
          throw new Error('Not logged in');
        }
        return;

      default:
        throw new Error(`Unknown block type ${this.block.type.id}`);
    }
  }
};
