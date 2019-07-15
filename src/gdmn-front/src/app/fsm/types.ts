import { LName } from "gdmn-internals";

/**
 * Based on ideas from typesafe actions by Piotrek Witek
 * https://github.com/piotrwitek/typesafe-actions
 */

export type StateType<T extends string = string> = {
  type: T;
};

type StateTypeCreator<T extends string = string> = (
  ...args: any[]
) => StateType<T>;

type StateWithData<T extends string, D> = { type: T; data: D };

function stateType<
  T extends string,
  D = undefined
>(type: T, data?: D) {
  return { type, data } as any;
};

export interface TypeMeta<T extends string> {
  getType: () => T;
};

export function createStateType<
  T extends string,
  STC extends StateTypeCreator<T> = () => { type: T }
>(
  type: T,
  createHandler?: (
    stateCallback: <D>(
      data: D
    ) => StateWithData<T, D>
  ) => STC
): STC & TypeMeta<T> {
  const stateTypeCreator: STC =
    createHandler == null
      ? ((() => ({ type })) as STC)
      : createHandler(stateType.bind(null, type) as Parameters<
          typeof createHandler
        >[0]);

  return Object.assign(stateTypeCreator, {
    getType: () => type
  });
};

export interface ITransition {
  fromState: string;
  toState: string;
  returning?: boolean;
};

export interface IFork {
  fromState: string;
  condition: string;
  thenState: string;
  elseState: string;
};

export function isTransition(t: ITransition | IFork): t is ITransition {
  return (t as ITransition).toState !== undefined;
};

export function isFork(f: ITransition | IFork): f is IFork {
  return (f as IFork).condition !== undefined;
};

export type Flow = (ITransition | IFork)[];

export interface INode {
  id: string;
};

export interface IBusinessProcess {
  caption: LName;
  description: LName;
  nodes: INode[];
  flow: Flow;
};

export interface IBusinessProcesses {
  [name: string]: IBusinessProcess;
};
