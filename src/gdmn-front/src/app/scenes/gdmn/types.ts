import {AppAction, ICmd} from "@gdmn/server-api";

export interface IViewTab {
  caption: string;
  url: string;
  canClose: boolean;
  rs?: string[];
}

export interface ISessionInfo {
  id: string;
  user: number;
  usesConnections?: number[];
  tasks?: ITask[];
}

export interface ITask {
  id: string;
  status: TTaskStatus;
  command?: ICmd<AppAction, any>;
}

export const enum TTaskStatus {
  RUNNING = 1,
  PAUSED = 2,
  INTERRUPTED = 3,
  FAILED = 4,
  SUCCESS = 5
}
