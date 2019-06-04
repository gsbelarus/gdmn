import React, { useEffect, useReducer, useRef } from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.css';
import { IDesignerProps } from './Designer.types';
import { gdmnActions } from '../gdmn/actions';
import { CommandBar, ICommandBarItemProps, ComboBox, SpinButton } from 'office-ui-fabric-react';

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

const inRectangle = (cell: ICoord, rect: IRectangle) => cell.x >= rect.left && cell.x <= rect.right && cell.y >= rect.top && cell.y <= rect.bottom;

const intersect = (r1: IRectangle, r2: IRectangle) => inRectangle({ x: r1.left, y: r1.top }, r2)
  || inRectangle({ x: r1.left, y: r1.bottom }, r2)
  || inRectangle({ x: r1.right, y: r1.top }, r2)
  || inRectangle({ x: r1.right, y: r1.bottom }, r2);

interface IDesignerState {
  grid: IGridSize;
  activeCell: ICoord;
  selection?: IRectangle;
  areas: IRectangle[];
  activeArea?: number;
  setGridSize?: boolean;
};

type Action = { type: 'SET_ACTIVE_CELL', activeCell: ICoord, shiftKey: boolean }
  | { type: 'SET_ACTIVE_AREA', activeArea: number }
  | { type: 'SET_COLUMN_SIZE_VALUE', column: number, value: number }
  | { type: 'SET_COLUMN_SIZE_UNIT', column: number, unit: TUnit }
  | { type: 'TOGGLE_SET_GRID_SIZE' }
  | { type: 'ADD_COLUMN' }
  | { type: 'ADD_ROW' }
  | { type: 'DELETE_COLUMN' }
  | { type: 'DELETE_ROW' }
  | { type: 'CREATE_AREA' }
  | { type: 'CLEAR_SELECTION' };

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
      } else {
        return {
          ...state,
          activeCell,
          selection: {
            left: Math.min(selection.left, activeCell.x),
            top: Math.min(selection.top, activeCell.y),
            right: Math.max(selection.right, activeCell.x),
            bottom: Math.max(selection.bottom, activeCell.y),
          }
        };
      }
    }

    case 'SET_ACTIVE_AREA': {
      const { activeArea } = action;
      const { areas } = state;

      if (activeArea >= 0 && activeArea <= (areas.length - 1)) {
        return {
          ...state,
          activeArea
        }
      } else {
        return {
          ...state,
          activeArea: undefined
        }
      }
    }

    case 'CLEAR_SELECTION': {
      return {
        ...state,
        selection: undefined
      };
    }

    case 'CREATE_AREA': {
      const { selection, areas, activeCell: {x, y} } = state;
      if (selection) {
        if (areas.some( area => intersect(area, selection) )) {
          return state;
        } else {
          return {
            ...state,
            areas: [...areas, selection],
            activeArea: state.areas.length,
            selection: undefined
          };
        }
      }
      else {
        return {
          ...state,
          areas: [...areas, {
            left: x,
            top: y,
            right: x,
            bottom: y
          }],
          activeArea: state.areas.length
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
      const { grid, selection, areas, activeArea, activeCell: { x, y } } = state;

      if (grid.columns.length === 1 || selection) {
        return state;
      }

      const newAreas = areas
        .filter( area => area.left < x || area.right > x )
        .map( area => area.right >= x ? {...area, right: area.right - 1} : area )
        .map( area => area.left >= x ? {...area, left: area.left - 1} : area );

      return {
        ...state,
        grid: {
          ...grid,
          columns: [...grid.columns.slice(0, x), ...grid.columns.slice(x + 1)]
        },
        activeCell: {
          x: x > 0 && x >= (grid.columns.length - 1) ? x - 1 : x,
          y
        },
        areas: newAreas,
        activeArea: activeArea === undefined || !newAreas.length
          ? undefined
          : activeArea < newAreas.length
          ? activeArea
          : undefined
      }
    }

    case 'DELETE_ROW': {
      const { grid, selection, areas, activeArea, activeCell: { x, y } } = state;

      if (grid.rows.length === 1 || selection) {
        return state;
      }

      const newAreas = areas
        .filter( area => area.top < y || area.bottom > y )
        .map( area => area.bottom >= y ? {...area, bottom: area.bottom - 1} : area )
        .map( area => area.top >= y ? {...area, top: area.top - 1} : area );

      return {
        ...state,
        grid: {
          ...grid,
          rows: [...grid.rows.slice(0, y), ...grid.rows.slice(y + 1)]
        },
        activeCell: {
          x,
          y: y > 0 && y >= (grid.rows.length - 1) ? y - 1 : y
        },
        areas: newAreas,
        activeArea: activeArea === undefined || !newAreas.length
          ? undefined
          : activeArea < newAreas.length
          ? activeArea
          : undefined
      }
    }
  }
};

export const Designer = CSSModules( (props: IDesignerProps): JSX.Element => {

  const { url, viewTab, dispatch } = props;
  const [{ grid, activeCell, selection, setGridSize, areas, activeArea }, designerDispatch] = useReducer(reducer, {
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
      disabled: grid.columns.length <= 1 || !!selection || areas.some( area => inRectangle(activeCell, area) ),
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
      disabled: grid.rows.length <= 1 || !!selection || areas.some( area => inRectangle(activeCell, area) ),
      text: 'Удалить строку',
      iconProps: {
        iconName: 'DoubleColumn'
      },
      onClick: () => designerDispatch({ type: 'DELETE_ROW' })
    },
    {
      key: 'createArea',
      disabled: areas.some( area => inRectangle(activeCell, area) ),
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

  const getOnMouseDown = (x: number, y: number) => (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
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
        <div
          style={getGridStyle()}
          tabIndex={0}
        >
          {
            grid.columns.map( (c, x) => grid.rows.map( (r, y) => {
              if ((x === activeCell.x && y === activeCell.y) || inSelection(x, y)) {
                return null;
              } else {
                return (
                  <div
                    key={x * 1000 + y}
                    styleName="commonStyle cell"
                    style={getCellStyle(x, y)}
                    onMouseDown={getOnMouseDown(x, y)}
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
              styleName="commonStyle selection"
              style={{
                gridArea: `${selection.top + 1} / ${selection.left + 1} / ${selection.bottom + 2} / ${selection.right + 2}`
              }}
              onClick={ () => designerDispatch({ type: 'CLEAR_SELECTION' }) }
            >
              selection
            </div>
          }
          {
            areas.length
            ? areas.map( (area, idx) => (
                <div
                  key={`${area.top}-${area.left}-${area.bottom}-${area.right}`}
                  styleName={ activeArea === idx ? "commonStyle activeArea" : "commonStyle area"}
                  style={{
                    gridArea: `${area.top + 1} / ${area.left + 1} / ${area.bottom + 2} / ${area.right + 2}`
                  }}
                  onClick={ () => designerDispatch({ type: 'SET_ACTIVE_AREA', activeArea: idx }) }
                >
                  {`Area ${idx + 1}`}
                </div>
              ))
            : null
          }
          {
            (selection && inRectangle(activeCell, selection))
            ||
            (areas.length && areas.some( area => inRectangle(activeCell, area) ))
            ?
              null
            :
              <div
                styleName="commonStyle activeCell"
                style={getCellStyle(activeCell.x, activeCell.y)}
                onMouseDown={getOnMouseDown(activeCell.x, activeCell.y)}
              >
                {activeCell.x}, {activeCell.y}
              </div>
          }
        </div>
      </WithGridSize>
    </>
  );
}, styles, { allowMultiple: true });