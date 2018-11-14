import { createAction } from 'typesafe-actions';

export const setSyntaxText = createAction('SYNTAX/SET_SYNTAX_TEXT', resolve => {
    return (text: string) => resolve(text);
  });

export type SetSyntaxText = typeof setSyntaxText;