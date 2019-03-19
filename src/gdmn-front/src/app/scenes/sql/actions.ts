import {createAction} from "typesafe-actions";

export const init = createAction("SQL/INIT", resolve => {
  return (url: string) => resolve({url});
});

export type Init = typeof init;

export const setExpression = createAction("SQL/SET_EXPRESSION", resolve => {
  return (expression: string) => resolve({expression});
});

export type SetExpression = typeof setExpression;

export const clear = createAction("SQL/CLEAR", resolve => {
  return () => resolve();
});

export type ClearExpression = typeof clear;
