import { IFlowchart, IBlock, Transition } from "./types";
import { blockTypes } from "./blockTypes";
import { store } from "..";

interface IFSMParams {
  flowchart: IFlowchart;
  path: Transition[];
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

  get path() {
    return this._params.path;
  }

  newInstance(newParams: Partial<IFSMParams>) {
    return new FSM({ ...this._params, ...newParams });
  }

  isBlockCompleted() {
    const state = store.getState();

    switch (this.block.type) {
      case blockTypes.login:
        if (!state.authState.accessToken) {
          return false;
        }
        return true;

      default:
        throw new Error(`Unknown block type ${this.block.type.id}`);
    }
  }

  run() {
    if (this.isBlockCompleted()) {

      /**
       * Найдем transition из выполненного блока в соответствии
       * с параметрами блока.
       */

      const transition = Object.values(this._params.flowchart.flow).find( tr => tr.from === this.block );

      if (transition) {
        return this.newInstance({ path: [...this.path, transition], })
      }
    }

    return this;
  }
};
