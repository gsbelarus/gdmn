import {createAction} from "typesafe-actions";

export const createQuery = createAction("SQL/CREATE_QUERY", resolve => {
  return (expression: string, id: string) => resolve({expression, id});
});

export type CreateQuery = typeof createQuery;
