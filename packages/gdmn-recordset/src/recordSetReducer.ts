import { ActionType, getType } from "typesafe-actions";

import * as actions from "./recordSetActions";
import { RecordSet } from "./recordSet";

export type RecordSetAction = ActionType<typeof actions>;

export interface RecordSetReducerState {
  [name: string]: RecordSet;
}

export const recordSetReducer = (
  state: RecordSetReducerState = {},
  action: RecordSetAction
): RecordSetReducerState => {
  if (
    typeof action.type !== "string" ||
    !action.type.startsWith("RECORDSET/")
  ) {
    return state;
  }

  const { name } = action.payload;

  if (action.type === getType(actions.createRecordSet)) {
    const { rs } = action.payload;

    if (state[name]) {
      throw new Error(`Duplicate recordset name ${name}`);
    }

    return { ...state, [name]: rs };
  }

  if (!state[name]) {
    throw new Error(`Unknown recordset name ${name}`);
  }

  if (action.type === getType(actions.deleteRecordSet)) {
    const newState = { ...state };
    delete newState[name];
    return newState;
  }

  const rs = state[name];

  const newState = (newRS: RecordSet) => {
    return { ...state, [name]: newRS };
  };

  switch (action.type) {
    case getType(actions.setRecordSet): {
      const { rs } = action.payload;
      return newState(rs);
    }

    case getType(actions.setCurrentRow): {
      const { currentRow } = action.payload;
      return newState(rs.setCurrentRow(currentRow));
    }

    case getType(actions.sortRecordSet): {
      const { sortFields } = action.payload;
      return newState(rs.sort(sortFields));
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
      const { searchStr } = action.payload;
      return newState(rs.search(searchStr));
    }

    case getType(actions.toggleGroup): {
      const { rowIdx } = action.payload;
      return newState(rs.toggleGroup(rowIdx));
    }

    case getType(actions.collapseExpandGroups): {
      const { collapse } = action.payload;
      return newState(rs.collapseExpandGroups(collapse));
    }

    case getType(actions.setData): {
      return newState(rs.setData(action.payload));
    }

    case getType(actions.loadingData): {
      return newState(rs.loadingData());
    }

    case getType(actions.addData): {
      const { records, full } = action.payload;
      return newState(rs.addData(records, full));
    }

    case getType(actions.setError): {
      const { error } = action.payload;
      return newState(rs.setError(error));
    }

    case getType(actions.setRowsState): {
      const { state, rowsIdxs } = action.payload;
      return newState(rs.setRowsState(state, rowsIdxs));
    }

    case getType(actions.removeRows): {
      const { rowsIdxs } = action.payload;
      return newState(rs.removeRows(rowsIdxs));
    }

    default:
      return state;
  }
};
