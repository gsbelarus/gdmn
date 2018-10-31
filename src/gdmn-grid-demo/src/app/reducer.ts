import { Action } from 'redux';

export interface State { };

const initialState: State = { };

export const reducer = (state: State = initialState, _action: Action): State => state;
