import {createAction} from "typesafe-actions";

export const createQuery = createAction("SQL/CREATE_QUERY", resolve => {
  return () => resolve();
});

export type CreateQuery = typeof createQuery;
