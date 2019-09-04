import { IFSMSignal } from "./types";

const start: IFSMSignal = {
  id: 'START'
};

const finish: IFSMSignal = {
  id: 'FINISH'
};

export const fsmSignals = {
  start,
  finish
};