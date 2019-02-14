import { Columns, visibleToIndex } from '.';
import { ActionType, getType } from 'typesafe-actions';
import * as actions from './gridActions';

export type GridAction = ActionType<typeof actions>;

export interface GridComponentState {
  columns: Columns;
  leftSideColumns: number;
  rightSideColumns: number;
  currentCol: number;
  selectRows: boolean;
  hideHeader: boolean;
  hideFooter: boolean;
  sortDialog: boolean;
  paramsDialog: boolean;
  searchIdx: number;
}

export interface GridReducerState {
  [name: string]: GridComponentState;
}

export const gridReducer = (state: GridReducerState = {}, action: GridAction): GridReducerState => {
  if (typeof action.type !== 'string' || !action.type.startsWith('GRID/')) {
    return state;
  }

  const componentName = action.payload.name;

  if (action.type === getType(actions.createGrid)) {
    if (state[componentName]) {
      throw new Error(`Duplicate grid component name ${componentName}`);
    }

    const { columns, leftSideColumns, rightSideColumns, hideFooter } = action.payload;

    return {
      ...state,
      [componentName]: {
        columns,
        leftSideColumns,
        rightSideColumns,
        currentCol: -1,
        selectRows: false,
        hideHeader: false,
        hideFooter,
        sortDialog: false,
        paramsDialog: false,
        searchIdx: 0
      }
    };
  }

  if (!state[componentName]) {
    throw new Error(`Unknown grid component name ${componentName}`);
  }

  if (action.type === getType(actions.deleteGrid)) {
    const newState = { ...state };
    delete newState[componentName];
    return newState;
  }

  const componentState = state[componentName];

  switch (action.type) {
    case getType(actions.showSortDialog):
      return { ...state, [componentName]: { ...componentState, sortDialog: true } };

    case getType(actions.showParamsDialog):
      return { ...state, [componentName]: { ...componentState, paramsDialog: true } };

    case getType(actions.cancelParamsDialog):
      return { ...state, [componentName]: { ...componentState, paramsDialog: false } };

    case getType(actions.cancelSortDialog):
      return { ...state, [componentName]: { ...componentState, sortDialog: false } };

    case getType(actions.applySortDialog): {
      const { sortFields } = action.payload;
      const groupFields = sortFields.filter(sf => sf.groupBy);

      if (groupFields.length) {
        let newColumns = [...componentState.columns];
        let newCurrentCol = componentState.currentCol;
        let insertIdx = 0;
        groupFields.forEach(gf => {
          const found = newColumns.findIndex(c => c.fields.some(f => f.fieldName === gf.fieldName));
          if (found >= 0) {
            if (found !== insertIdx) {
              newColumns.splice(insertIdx, 0, newColumns.splice(found, 1)[0]);
              if (newCurrentCol === found) {
                newCurrentCol = insertIdx;
              } else if (newCurrentCol < found) {
                newCurrentCol++;
              }
            }
            insertIdx++;
          }
        });
        return {
          ...state,
          [componentName]: { ...componentState, columns: newColumns, currentCol: newCurrentCol, sortDialog: false }
        };
      } else {
        return { ...state, [componentName]: { ...componentState, sortDialog: false } };
      }
    }

    case getType(actions.setFixedColumns): {
      const { leftSideColumns } = action.payload;
      const { columns, rightSideColumns } = componentState;
      const countVisibleColumns =
        columns.reduce((prev, c) => prev + (c.hidden ? 0 : 1), 0) - rightSideColumns - leftSideColumns;
      if (leftSideColumns >= 0 && countVisibleColumns > 0) {
        return {
          ...state,
          [componentName]: {
            ...componentState,
            leftSideColumns,
            currentCol: leftSideColumns
          }
        };
      } else {
        return state;
      }
    }

    case getType(actions.setFixedTailColumns): {
      const { rightSideColumns } = action.payload;
      const { columns, leftSideColumns } = componentState;
      const countVisibleColumns =
        columns.reduce((prev, c) => prev + (c.hidden ? 0 : 1), 0) - leftSideColumns - rightSideColumns;
      if (rightSideColumns >= 0 && countVisibleColumns > 0) {
        return {
          ...state,
          [componentName]: {
            ...componentState,
            rightSideColumns,
            currentCol: leftSideColumns
          }
        };
      } else {
        return state;
      }
    }

    case getType(actions.resizeColumn): {
      const { columns } = componentState;
      const { columnIndex, newWidth } = action.payload;
      const newColumns = [...columns];
      const adjustedIndex = visibleToIndex(newColumns, columnIndex);
      newColumns[adjustedIndex] = { ...newColumns[adjustedIndex], width: newWidth };
      return {
        ...state,
        [componentName]: {
          ...componentState,
          columns: newColumns
        }
      };
    }

    case getType(actions.columnMove): {
      const { columns, currentCol } = componentState;

      const oldIndex = visibleToIndex(columns, action.payload.oldIndex);
      const newIndex = visibleToIndex(columns, action.payload.newIndex);

      if (newIndex !== oldIndex) {
        const newColumns = [...columns];
        const temp = newColumns[oldIndex];
        newColumns[oldIndex] = newColumns[newIndex];
        newColumns[newIndex] = temp;
        return {
          ...state,
          [componentName]: {
            ...componentState,
            columns: newColumns,
            currentCol: currentCol === oldIndex ? newIndex : currentCol
          }
        };
      } else {
        return state;
      }
    }

    case getType(actions.toggleColumn): {
      const { columns, leftSideColumns, rightSideColumns, currentCol } = componentState;
      const { columnName } = action.payload;

      const columnIndex = columns.findIndex(c => c.name === columnName);
      if (columnIndex < leftSideColumns) {
        return state;
      }

      const newColumns = [...columns];
      newColumns[columnIndex] = { ...newColumns[columnIndex], hidden: !newColumns[columnIndex].hidden };

      const countVisibleColumns =
        newColumns.reduce((prev, c) => prev + (c.hidden ? 0 : 1), 0) - leftSideColumns - rightSideColumns;
      if (countVisibleColumns < 1) {
        return state;
      }

      let newCurrentCol = currentCol;
      if (currentCol >= 0) {
        const currentColWithHiddenColumns = columns.findIndex(
          c => c.name === columns.filter(f => !f.hidden)[currentCol].name
        );
        if (!newColumns[columnIndex].hidden) {
          if (currentColWithHiddenColumns > columnIndex) newCurrentCol = newCurrentCol + 1;
        } else {
          if (
            currentColWithHiddenColumns + leftSideColumns > columnIndex ||
            currentCol === countVisibleColumns + rightSideColumns
          )
            newCurrentCol = newCurrentCol - 1;
        }
      }

      return {
        ...state,
        [componentName]: {
          ...componentState,
          columns: newColumns,
          currentCol: newCurrentCol
        }
      };
    }

    case getType(actions.toggleHideFooter): {
      return {
        ...state,
        [componentName]: {
          ...componentState,
          hideFooter: !componentState.hideFooter
        }
      };
    }

    case getType(actions.toggleHideHeader): {
      return {
        ...state,
        [componentName]: {
          ...componentState,
          hideHeader: !componentState.hideHeader
        }
      };
    }

    case getType(actions.setCursorCol): {
      const { columns, leftSideColumns, rightSideColumns } = componentState;
      const { cursorCol } = action.payload;
      if (cursorCol >= leftSideColumns && cursorCol < columns.filter(f => !f.hidden).length - rightSideColumns) {
        return {
          ...state,
          [componentName]: {
            ...componentState,
            currentCol: cursorCol
          }
        };
      } else {
        return state;
      }
    }

    case getType(actions.setSelectRows): {
      const { value } = action.payload;
      return { ...state, [componentName]: { ...componentState, selectRows: value } };
    }

    case getType(actions.setSearchIdx): {
      const { searchIdx } = action.payload;
      return { ...state, [componentName]: { ...componentState, searchIdx } };
    }

    default:
      return state;
  }
};
