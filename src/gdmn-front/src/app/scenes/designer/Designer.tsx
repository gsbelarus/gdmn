import React, { useEffect, useState, useReducer } from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.css';
import { IDesignerProps } from './Designer.types';
import { gdmnActions } from '../gdmn/actions';
import { CommandBar, ICommandBarItemProps, SpinButton } from 'office-ui-fabric-react';

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

interface IDesignerState {
  grid: IGridSize;
  activeCell: ICoord;
};

type Action = { type: 'SET_ACTIVE_CELL', activeCell: ICoord }
  | { type: 'ADD_COLUMN' }
  | { type: 'ADD_ROW' };

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
      const { grid, activeCell } = state;
      return {
        ...state,
        grid: {
          ...grid,
          columns: [...grid.columns.slice(0, activeCell.x + 1), { unit: 'FR', value: 1}, ...grid.columns.slice(activeCell.x + 1)]
        }
      }
    }

    case 'ADD_ROW': {
      const { grid, activeCell } = state;
      return {
        ...state,
        grid: {
          ...grid,
          rows: [...grid.rows.slice(0, activeCell.y + 1), { unit: 'FR', value: 1}, ...grid.rows.slice(activeCell.y + 1)]
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
      x: 1,
      y: 1
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
    gridTemplateColumns: grid.columns.map( c => c.unit === 'AUTO' ? 'auto' : `${c.value ? c.value : 1}${c.unit}` ).join(' '),
    gridTemplateRows: grid.rows.map( r => r.unit === 'AUTO' ? 'auto' : `${r.value ? r.value : 1}${r.unit}` ).join(' '),
  });

  const getCellStyle = (x: number, y: number): React.CSSProperties => ({
    gridArea: `${y} / ${x} / ${y + 1} / ${x + 1}`
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
      text: 'Удалить колонку',
      iconProps: {
        iconName: 'DoubleColumn'
      },
      onClick: () => {}
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
      text: 'Удалить строку',
      iconProps: {
        iconName: 'DoubleColumn'
      },
      onClick: () => {}
    }
  ];

  return (
    <>
      <CommandBar items={commandBarItems} />
      <div style={getGridStyle()}>
        {
          grid.columns.map( (c, x) => grid.rows.map( (r, y) => {
            if ((x + 1) === activeCell.x && (y + 1) === activeCell.y) {
              return (
                <div styleName="activeCell" style={getCellStyle(x, y)}>
                  active
                </div>
              )
            } else {
              return (
                <div styleName="cell" style={getCellStyle(x, y)}>
                  active
                </div>
              )
            }
          }))
        }
      </div>
    </>
  );
}, styles, { allowMultiple: true });