import { store } from "..";
import { IFSMFlowchart, IFSMSignal, IFSMState, IFSMStateType } from "./types";

export type FSMPlugin = (fsm: FSM, nextState: IFSMState) => boolean;
export type Plugins = Map<IFSMStateType, FSMPlugin>;

interface IFSMParams {
  flowchart: IFSMFlowchart;
  path: IFSMState[];
  state: IFSMState;
  plugins: Plugins;
};

export class FSM {
  private _params: IFSMParams;

  constructor (params: IFSMParams) {
    this._params = params;
  }

  static create(flowchart: IFSMFlowchart, plugins: Plugins) {
    const { beginRule } = flowchart.rules;

    if (!beginRule) {
      throw new Error('No entry point for a chartflow given.');
    }

    return new FSM({
      flowchart: flowchart,
      path: [],
      state: beginRule.state,
      plugins
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

  get plugins() {
    return this._params.plugins;
  }

  newInstance(newParams: Partial<IFSMParams>) {
    return new FSM({ ...this._params, ...newParams });
  }

  registerPlugin(stateType: IFSMStateType, fsmPlugin: FSMPlugin) {
    return this.newInstance({ plugins: new Map(this.plugins).set(stateType, fsmPlugin) })
  }

  isStateCompleted() {
    const state = store.getState();

    switch (this.state.type.id) {
      case 'LOGIN':
        if (!state.authState.accessToken) {
          return false;
        }
        return true;

      default:
        throw new Error(`Unknown block type ${this.state.type.id}`);
    }
  }

  processSignal(signal: IFSMSignal) {

    const rules = Object.values(this.flowchart.rules).filter( rule => rule.signal.id === signal.id && rule.state === this.state );

    if (rules.length === 1) {
      const nextState = rules[0].nextState;
      const plugin = this.plugins.get(nextState.type);

      if (plugin) {
        if (!plugin(this, nextState)) {
          return this;
        }
      }

      return this.newInstance({ state: nextState, path: [...this.path, this.state] });
    }

    return this;
  }
};
