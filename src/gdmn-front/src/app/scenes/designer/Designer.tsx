import React, { useEffect, useReducer } from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.css';
import { IDesignerProps } from './Designer.types';
import { gdmnActions } from '../gdmn/actions';
import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react';

type TUnit = 'AUTO' | 'FR' | 'PX';

interface ISize {
  unit: TUnit;
  value?: number;
};

interface IGridSize {
  columns: ISize[];
  rows: ISize[];
};

interface ICoord {
  x: number;
  y: number;
};

type TSelection = ICoord[];

interface IDesignerState {
  grid: IGridSize;
  activeCell: ICoord;
};

type Action = { type: 'SET_ACTIVE_CELL', activeCell: ICoord }
  | { type: 'ADD_COLUMN' }
  | { type: 'ADD_ROW' }
  | { type: 'DELETE_COLUMN' }
  | { type: 'DELETE_ROW' };

function reducer(state: IDesignerState, action: Action): IDesignerState {
  switch (action.type) {
    case 'SET_ACTIVE_CELL': {
      const { activeCell } = action;
      return {
        ...state,
        activeCell
      };
    }

    case 'ADD_COLUMN': {
      const { grid, activeCell: { x } } = state;
      return {
        ...state,
        grid: {
          ...grid,
          columns: [...grid.columns.slice(0, x + 1), { unit: 'FR', value: 1}, ...grid.columns.slice(x + 1)]
        }
      }
    }

    case 'ADD_ROW': {
      const { grid, activeCell: { y } } = state;
      return {
        ...state,
        grid: {
          ...grid,
          rows: [...grid.rows.slice(0, y + 1), { unit: 'FR', value: 1}, ...grid.rows.slice(y + 1)]
        }
      }
    }

    case 'DELETE_COLUMN': {
      const { grid, activeCell: { x, y } } = state;

      if (grid.columns.length === 1) {
        return state;
      }

      return {
        ...state,
        grid: {
          ...grid,
          columns: [...grid.columns.slice(0, x), ...grid.columns.slice(x + 1)]
        },
        activeCell: {
          x: x > 0 && x >= (grid.columns.length - 1) ? x - 1 : x,
          y
        }
      }
    }

    case 'DELETE_ROW': {
      const { grid, activeCell: { x, y } } = state;

      if (grid.rows.length === 1) {
        return state;
      }

      return {
        ...state,
        grid: {
          ...grid,
          rows: [...grid.rows.slice(0, y), ...grid.rows.slice(y + 1)]
        },
        activeCell: {
          x,
          y: y > 0 && y >= (grid.rows.length - 1) ? y - 1 : y
        }
      }
    }
  }
};

export const Designer = CSSModules( (props: IDesignerProps): JSX.Element => {

  const { url, viewTab, dispatch } = props;
  const [{ grid, activeCell }, designerDispatch] = useReducer(reducer, {
    grid: {
      columns: [{ unit: 'FR', value: 1 }],
      rows: [{ unit: 'FR', value: 1 }],
    },
    activeCell: {
      x: 0,
      y: 0
    }
  });

  useEffect( () => {
    if (!viewTab) {
      dispatch(gdmnActions.addViewTab({
        url,
        caption: 'Designer',
        canClose: true
      }));
    }
  }, []);

  const getGridStyle = (): React.CSSProperties => ({
    display: 'grid',
    width: '100%',
    gridTemplateColumns: grid.columns.map( c => c.unit === 'AUTO' ? 'auto' : `${c.value ? c.value : 1}${c.unit}` ).join(' '),
    gridTemplateRows: grid.rows.map( r => r.unit === 'AUTO' ? 'auto' : `${r.value ? r.value : 1}${r.unit}` ).join(' '),
  });

  const getCellStyle = (x: number, y: number): React.CSSProperties => ({
    gridArea: `${y + 1} / ${x + 1} / ${y + 2} / ${x + 2}`
  });

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'addColumn',
      text: 'Добавить колонку',
      iconProps: {
        iconName: 'DoubleColumn'
      },
      onClick: () => designerDispatch({ type: 'ADD_COLUMN' })
    },
    {
      key: 'deleteColumn',
      disabled: grid.columns.length <= 1,
      text: 'Удалить колонку',
      iconProps: {
        iconName: 'DoubleColumn'
      },
      onClick: () => designerDispatch({ type: 'DELETE_COLUMN' })
    },
    {
      key: 'addRow',
      text: 'Добавить строку',
      iconProps: {
        iconName: 'DoubleColumn'
      },
      onClick: () => designerDispatch({ type: 'ADD_ROW' })
    },
    {
      key: 'deleteRow',
      disabled: grid.rows.length <= 1,
      text: 'Удалить строку',
      iconProps: {
        iconName: 'DoubleColumn'
      },
      onClick: () => designerDispatch({ type: 'DELETE_ROW' })
    }
  ];

  return (
    <>
      <CommandBar items={commandBarItems} />
      <div style={getGridStyle()}>
        {
          grid.columns.map( (c, x) => grid.rows.map( (r, y) => {
            if (x === activeCell.x && y === activeCell.y) {
              return (
                <div
                  key={x * 1000 + y}
                  styleName="activeCell"
                  style={getCellStyle(x, y)}
                  onClick={ () => designerDispatch({ type: 'SET_ACTIVE_CELL', activeCell: { x, y }}) }
                >
                  {x}, {y}
                </div>
              )
            } else {
              return (
                <div
                  key={x * 1000 + y}
                  styleName="cell"
                  style={getCellStyle(x, y)}
                  onClick={ () => designerDispatch({ type: 'SET_ACTIVE_CELL', activeCell: { x, y }}) }
                >
                  {x}, {y}
                </div>
              )
            }
          }))
        }
      </div>
    </>
  );
}, styles, { allowMultiple: true });