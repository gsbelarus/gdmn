import React, { useEffect, useReducer } from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.css';
import { IDesignerProps } from './Designer.types';
import { gdmnActions } from '../gdmn/actions';
import { CommandBar, ICommandBarItemProps, ComboBox, SpinButton, textAreaProperties } from 'office-ui-fabric-react';

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

interface IRectangle {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

interface IDesignerState {
  grid: IGridSize;
  activeCell: ICoord;
  selection?: IRectangle;
  areas: IRectangle[];
  activeArea?: number;
  setGridSize?: boolean;
};

type Action = { type: 'SET_ACTIVE_CELL', activeCell: ICoord, shiftKey: boolean }
  | { type: 'SET_COLUMN_SIZE_VALUE', column: number, value: number }
  | { type: 'SET_COLUMN_SIZE_UNIT', column: number, unit: TUnit }
  | { type: 'TOGGLE_SET_GRID_SIZE' }
  | { type: 'ADD_COLUMN' }
  | { type: 'ADD_ROW' }
  | { type: 'DELETE_COLUMN' }
  | { type: 'DELETE_ROW' }
  | { type: 'CREATE_AREA' };

function reducer(state: IDesignerState, action: Action): IDesignerState {
  switch (action.type) {
    case 'SET_ACTIVE_CELL': {
      const { activeCell, shiftKey } = action;
      const { selection, activeCell: prevActiveCell } = state;

      if (!shiftKey) {
        return {
          ...state,
          activeCell,
          selection: undefined
        };
      }

      if (!selection) {
        return {
          ...state,
          activeCell,
          selection: {
            left: Math.min(prevActiveCell.x, activeCell.x),
            top: Math.min(prevActiveCell.y, activeCell.y),
            right: Math.max(prevActiveCell.x, activeCell.x),
            bottom: Math.max(prevActiveCell.y, activeCell.y),
          }
        };
      }

      return state;
    }

    case 'CREATE_AREA': {
      const { selection, areas, activeCell: {x, y} } = state;
      if (selection) {
        return {
          ...state,
          areas: [...areas, selection],
          selection: undefined
        };
      } else {
        return {
          ...state,
          areas: [...areas, {
            left: x,
            top: y,
            right: x,
            bottom: y
          }]
        };
      }
    }

    case 'SET_COLUMN_SIZE_VALUE': {
      const { grid } = state;
      const newColumns = [...grid.columns];
      const { column, value } = action;
      newColumns[column] = {...newColumns[column], value};
      return {
        ...state,
        grid: {
          ...grid,
          columns: newColumns
        }
      }
    }

    case 'SET_COLUMN_SIZE_UNIT': {
      const { grid } = state;
      const newColumns = [...grid.columns];
      const { column, unit } = action;
      newColumns[column] = {...newColumns[column], unit};
      return {
        ...state,
        grid: {
          ...grid,
          columns: newColumns
        }
      }
    }

    case 'TOGGLE_SET_GRID_SIZE': {
      return {
        ...state,
        setGridSize: !state.setGridSize
      }
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
  const [{ grid, activeCell, selection, setGridSize, areas }, designerDispatch] = useReducer(reducer, {
    grid: {
      columns: [{ unit: 'FR', value: 1 }, { unit: 'FR', value: 1 }],
      rows: [{ unit: 'FR', value: 1 }, { unit: 'FR', value: 1 }],
    },
    activeCell: {
      x: 0,
      y: 0
    },
    areas: []
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

  const inSelection = (x: number, y: number): boolean => !!selection && x >= selection.left && x <= selection.right && y >= selection.top && y <= selection.bottom;

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
    },
    {
      key: 'createArea',
      text: 'Создать область',
      iconProps: {
        iconName: 'DoubleColumn'
      },
      onClick: () => designerDispatch({ type: 'CREATE_AREA' })
    },
    {
      key: 'toggleSetGridSize',
      checked: !!setGridSize,
      text: 'Установить размер',
      iconProps: {
        iconName: 'DoubleColumn'
      },
      onClick: () => designerDispatch({ type: 'TOGGLE_SET_GRID_SIZE' })
    }
  ];

  const getOnClick = (x: number, y: number) => (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    e.preventDefault();
    designerDispatch({ type: 'SET_ACTIVE_CELL', activeCell: { x, y }, shiftKey: e.shiftKey });
  };

  const WithGridSize = (props: { children: JSX.Element }): JSX.Element => {
    if (!setGridSize) {
      return props.children;
    } else {
      const getOnChangeColumnSpin = (column: number, delta: number = 0) => (value: string) => {
        if (isNaN(Number(value))) {
          return '1';
        }

        let newValue = Number(value) + delta;

        if (newValue < 1) {
          newValue = 1;
        }

        if (newValue > 8000) {
          newValue = 8000;
        }

        designerDispatch({ type: 'SET_COLUMN_SIZE_VALUE', column, value: newValue });

        return newValue.toString();
      };

      return (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'auto 240px',
          gridTemplateRows: 'auto'
        }}>
          <div style={{
            gridArea: '1 / 1 / 2 / 2'
          }}>
            {props.children}
          </div>
          <div style={{
            gridArea: '1 / 2 / 2 / 3',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {
              grid.columns.map( (c, idx) =>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-end'
                  }}
                >
                  <ComboBox
                    style={{
                      width: '86px'
                    }}
                    options={[
                      { key: 'AUTO', text: 'Auto' },
                      { key: 'FR', text: 'Fr' },
                      { key: 'PX', text: 'Px' }
                    ]}
                    selectedKey={c.unit}
                    label={`Column ${idx + 1}`}
                    onChanged={ option => option && designerDispatch({ type: 'SET_COLUMN_SIZE_UNIT', column: idx, unit: option.key as TUnit }) }
                  />
                  {
                    !c.value || c.unit === 'AUTO'
                    ? null
                    : <SpinButton
                      styles={{
                        root: {
                          width: '98px'
                        }
                      }}
                      value={c.value.toString()}
                      onIncrement={ getOnChangeColumnSpin(idx, 1) }
                      onDecrement={ getOnChangeColumnSpin(idx, -1) }
                      onValidate={ getOnChangeColumnSpin(idx) }
                    />
                  }
                </div>
              )
            }
          </div>
        </div>
      );
    }
  };

  return (
    <>
      <CommandBar items={commandBarItems} />
      <WithGridSize>
        <div style={getGridStyle()}>
          {
            grid.columns.map( (c, x) => grid.rows.map( (r, y) => {
              if ((x === activeCell.x && y === activeCell.y) || inSelection(x, y)) {
                return null;
              } else {
                return (
                  <div
                    key={x * 1000 + y}
                    styleName="cell"
                    style={getCellStyle(x, y)}
                    onClick={getOnClick(x, y)}
                  >
                    {x}, {y}
                  </div>
                )
              }
            }))
          }
          {
            selection &&
            <div
              styleName="selection"
              style={{
                gridArea: `${selection.top + 1} / ${selection.left + 1} / ${selection.bottom + 2} / ${selection.right + 2}`
              }}
            >
              selection
            </div>
          }
          {
            areas.length
            ? areas.map( (area, idx) => (
                <div
                  key={`${area.top}-${area.left}-${area.bottom}-${area.right}`}
                  styleName="area"
                  style={{
                    gridArea: `${area.top + 1} / ${area.left + 1} / ${area.bottom + 2} / ${area.right + 2}`
                  }}
                >
                  {`Area ${idx + 1}`}
                </div>
              ))
            : null
          }
          <div
            styleName="activeCell"
            style={getCellStyle(activeCell.x, activeCell.y)}
            onClick={getOnClick(activeCell.x, activeCell.y)}
          >
            {activeCell.x}, {activeCell.y}
          </div>
        </div>
      </WithGridSize>
    </>
  );
}, styles, { allowMultiple: true });