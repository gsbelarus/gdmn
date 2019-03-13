import { createAction } from "typesafe-actions";

export const setSyntaxText = createAction('SYNTAX/SET_SYNTAX_TEXT', resolve => (text: string) => resolve(text) );

export type SetSyntaxText = typeof setSyntaxText;

export const clearSyntaxText = createAction('SYNTAX/CLEAR_SYNTAX_TEXT', resolve => () => resolve() );

export type ClearSyntaxText = typeof clearSyntaxText;

export const loadingQuery = createAction('SYNTAX/LOADING_QUERY', resolve => (value: boolean) => resolve(value) );

export type LoadingQuery = typeof loadingQuery;

