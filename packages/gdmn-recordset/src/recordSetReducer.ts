import * as actions from './recordSetActions';
import { ActionType, getType } from 'typesafe-actions';
import { RecordSet } from './recordSet';

export type RecordSetAction = ActionType<typeof actions>;

export interface RecordSetReducerState {
  [name: string]: RecordSet;
};

export const recordSetReducer = (state: RecordSetReducerState = {}, action: RecordSetAction): RecordSetReducerState => {

  if (typeof action.type !== 'string' || !action.type.startsWith('RECORDSET/')) {
    return state;
  }

  const { name } = action.payload;

  if (action.type === getType(actions.createRecordSet)) {
    const { rs } = action.payload;

    if (state[name]) {
      throw new Error(`Duplicate recordset name ${name}`);
    }

    return {...state, [name]: rs};
  }

  if (!state[name]) {
    throw new Error(`Unknown recordset name ${name}`);
  }

  if (action.type === getType(actions.deleteRecordSet)) {
    const newState = {...state};
    delete newState[name];
    return newState;
  }

  const rs = state[name];

  const newState = (newRS: RecordSet) => {
    return {...state, [name]: newRS};
  }

  switch (action.type) {
    case getType(actions.sortRecordSet): {
      const { sortFields } = action.payload;
      return newState(rs.sort(sortFields));
    }

    case getType(actions.setCurrentRow): {
      const { currentRow } = action.payload;
      return newState(rs.setCurrentRow(currentRow));
    }

    case getType(actions.setAllRowsSelected): {
      const { value } = action.payload;
      return newState(rs.setAllRowsSelected(value));
    }

    case getType(actions.selectRow): {
      const { idx, selected } = action.payload;
      return newState(rs.selectRow(idx, selected));
    }

    case getType(actions.setFilter): {
      const { filter } = action.payload;
      return newState(rs.setFilter(filter));
    }

    case getType(actions.doSearch): {
      const { re } = action.payload;
      return newState(rs.search(re));
    }

    default:
      return state;
  }
};
