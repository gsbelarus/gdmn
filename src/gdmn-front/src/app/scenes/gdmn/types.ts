import {AppAction, ICmd} from "@gdmn/server-api";
import { ERTranslatorRU2 } from "gdmn-nlp-agent";

export interface ISessionData {
  [name: string]: any;
};

export interface IViewTab {
  caption: string;
  url: string;
  canClose: boolean;
  translator?: ERTranslatorRU2;
  rs?: string[];
  error?: string;
  sessionData?: ISessionData;
};

export interface ISessionInfo {
  database: string;
  id: string;
  user: number;
  transactions?: number;
  sql?: string;
  usesConnections?: number[];
  tasks?: ITask[];
};

export interface ITask {
  id: string;
  status: TTaskStatus;
  command?: ICmd<AppAction, any>;
};

export const enum TTaskStatus {
  RUNNING = 1,
  PAUSED = 2,
  INTERRUPTED = 3,
  FAILED = 4,
  SUCCESS = 5
};
