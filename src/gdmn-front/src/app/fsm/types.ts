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
};

export type Flow = ITransition[];

