import { store } from "..";
import { IFSMFlowchart, IFSMState } from "./types";

interface IFSMParams {
  flowchart: IFSMFlowchart;
  path: IFSMState[];
  state: IFSMState;
};

export class FSM {
  private _params: IFSMParams;

  constructor (params: IFSMParams) {
    this._params = params;
  }

  static create(flowchart: IFSMFlowchart) {
    const { beginRule } = flowchart.rules;

    if (!beginRule) {
      throw new Error('No entry point for a chartflow given.');
    }

    return new FSM({
      flowchart: flowchart,
      path: [],
      state: beginRule.state
    });
  }

  get flowchart() {
    return this._params.flowchart;
  }

  get state() {
    return this._params.state;
  }

  get path() {
    return this._params.path;
  }

  newInstance(newParams: Partial<IFSMParams>) {
    return new FSM({ ...this._params, ...newParams });
  }

  isStateCompleted() {
    const state = store.getState();

    switch (this.state.id) {
      case 'LOGIN':
        if (!state.authState.accessToken) {
          return false;
        }
        return true;

      default:
        throw new Error(`Unknown block type ${this.state.id}`);
    }
  }

  run() {
    return this;
  }
};
