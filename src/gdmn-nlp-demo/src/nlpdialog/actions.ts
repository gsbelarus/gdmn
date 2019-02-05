import { createAction } from 'typesafe-actions';

export const clearChat = createAction('CHAT/CLEAR', resolve => () => resolve() );

export type ClearChat = typeof clearChat;