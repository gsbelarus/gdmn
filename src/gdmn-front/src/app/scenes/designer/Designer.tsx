import React, { useEffect, useReducer, useRef } from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.css';
import { IDesignerProps } from './Designer.types';
import { gdmnActions } from '../gdmn/actions';
import { CommandBar, ICommandBarItemProps, ComboBox, SpinButton, Checkbox, TextField } from 'office-ui-fabric-react';

const dumbFields = [
  'Field 1',
  'Field 2',
  'Field 3',
  'Field 4',
  'Field 5',
  'Field 6',
  'Field 7',
  'Field 8',
  'Field 9',
];

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

interface IArea {
  rect: IRectangle;
  fields: string[];
}

const inRectangle = (cell: ICoord, rect: IRectangle) => cell.x >= rect.left && cell.x <= rect.right && cell.y >= rect.top && cell.y <= rect.bottom;

const intersect = (r1: IRectangle, r2: IRectangle) => inRectangle({ x: r1.left, y: r1.top }, r2)
  || inRectangle({ x: r1.left, y: r1.bottom }, r2)
  || inRectangle({ x: r1.right, y: r1.top }, r2)
  || inRectangle({ x: r1.right, y: r1.bottom }, r2);

interface IDesignerState {
  grid: IGridSize;
  activeCell: ICoord;
  selection?: IRectangle;
  areas: IArea[];
  activeArea?: number;
  setGridSize?: boolean;
  showAreaExplorer?: boolean;
  previewMode?: boolean;
};

type Action = { type: 'SET_ACTIVE_CELL', activeCell: ICoord, shiftKey: boolean }
  | { type: 'SET_ACTIVE_AREA', activeArea: number }
  | { type: 'SET_COLUMN_SIZE', column: number, size: ISize }
  | { type: 'SET_ROW_SIZE', row: number, size: ISize }
  | { type: 'AREA_FIELD', fieldName: string, include: boolean }
  | { type: 'PREVIEW_MODE' }
  | { type: 'TOGGLE_SET_GRID_SIZE' }
  | { type: 'TOGGLE_SHOW_AREA_EXPLORER' }
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
          activeArea,
          activeCell: { x: areas[activeArea].rect.left, y: areas[activeArea].rect.top }
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

    case 'PREVIEW_MODE': {
      const { previewMode } = state;

      if (previewMode) {
        return {
          ...state,
          previewMode: false
        }
      } else {
        return {
          ...state,
          previewMode: true,
          setGridSize: false,
          showAreaExplorer: false
        };
      }
    }

    case 'AREA_FIELD': {
      const { activeArea, areas } = state;
      const { fieldName, include } = action;

      if (activeArea === undefined) {
        return state;
      }

      const newAreas = [...areas];

      if (include && !areas[activeArea].fields.find( f => f === fieldName )) {
        newAreas[activeArea] = {
          ...newAreas[activeArea],
          fields: [...newAreas[activeArea].fields, fieldName]
        };
      }

      if (!include && !!areas[activeArea].fields.find( f => f === fieldName )) {
        newAreas[activeArea] = {
          ...newAreas[activeArea],
          fields: newAreas[activeArea].fields.filter( f => f !== fieldName )
        };
      }

      return {
        ...state,
        areas: newAreas
      };
    }

    case 'CREATE_AREA': {
      const { selection, areas, activeCell: {x, y} } = state;
      if (selection) {
        if (areas.some( area => intersect(area.rect, selection) )) {
          return state;
        } else {
          return {
            ...state,
            areas: [...areas, { rect: selection, fields: [] }],
            activeArea: state.areas.length,
            selection: undefined
          };
        }
      }
      else {
        return {
          ...state,
          areas: [...areas, {
            rect: {
              left: x,
              top: y,
              right: x,
              bottom: y
            },
            fields: []
          }],
          activeArea: state.areas.length
        };
      }
    }

    case 'SET_COLUMN_SIZE': {
      const { grid } = state;
      const { column, size } = action;

      if (column >= grid.columns.length) {
        return state;
      }

      const newColumns = [...grid.columns];
      newColumns[column] = size;
      return {
        ...state,
        grid: {
          ...grid,
          columns: newColumns
        }
      }
    }

    case 'SET_ROW_SIZE': {
      const { grid } = state;
      const { row, size } = action;

      if (row >= grid.rows.length) {
        return state;
      }

      const newRows = [...grid.rows];
      newRows[row] = size;
      return {
        ...state,
        grid: {
          ...grid,
          rows: newRows
        }
      }
    }

    case 'TOGGLE_SET_GRID_SIZE': {
      return {
        ...state,
        setGridSize: !state.setGridSize,
        showAreaExplorer: !state.setGridSize ? undefined : state.showAreaExplorer
      }
    }

    case 'TOGGLE_SHOW_AREA_EXPLORER': {
      return {
        ...state,
        setGridSize: !state.showAreaExplorer ? undefined : state.setGridSize,
        showAreaExplorer: !state.showAreaExplorer
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
        .filter( area => area.rect.left < x || area.rect.right > x )
        .map( area => area.rect.right > x ? {...area, rect: {...area.rect, right: area.rect.right - 1}} : area )
        .map( area => area.rect.left > x ? {...area, rect: {...area.rect, left: area.rect.left - 1}} : area );

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
        .filter( area => area.rect.top < y || area.rect.bottom > y )
        .map( area => area.rect.bottom > y ? {...area, rect: {...area.rect, bottom: area.rect.bottom - 1}} : area )
        .map( area => area.rect.top > y ? {...area, rect: {...area.rect, top: area.rect.top - 1}} : area );

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
  const [{ grid, activeCell, selection, setGridSize, areas, activeArea, showAreaExplorer, previewMode }, designerDispatch] = useReducer(reducer, {
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
      disabled: previewMode,
      text: 'Добавить колонку',
      iconProps: {
        iconName: 'DoubleColumn'
      },
      onClick: () => designerDispatch({ type: 'ADD_COLUMN' })
    },
    {
      key: 'deleteColumn',
      disabled: previewMode || grid.columns.length <= 1 || !!selection || areas.some( area => inRectangle(activeCell, area.rect) ),
      text: 'Удалить колонку',
      iconProps: {
        iconName: 'DoubleColumn'
      },
      onClick: () => designerDispatch({ type: 'DELETE_COLUMN' })
    },
    {
      key: 'addRow',
      disabled: previewMode,
      text: 'Добавить строку',
      iconProps: {
        iconName: 'DoubleColumn'
      },
      onClick: () => designerDispatch({ type: 'ADD_ROW' })
    },
    {
      key: 'deleteRow',
      disabled: previewMode || grid.rows.length <= 1 || !!selection || areas.some( area => inRectangle(activeCell, area.rect) ),
      text: 'Удалить строку',
      iconProps: {
        iconName: 'DoubleColumn'
      },
      onClick: () => designerDispatch({ type: 'DELETE_ROW' })
    },
    {
      key: 'createArea',
      disabled: previewMode || areas.some( area => inRectangle(activeCell, area.rect) ),
      text: 'Создать область',
      iconProps: {
        iconName: 'DoubleColumn'
      },
      onClick: () => designerDispatch({ type: 'CREATE_AREA' })
    },
    {
      key: 'toggleSetGridSize',
      disabled: previewMode,
      checked: !!setGridSize,
      text: 'Установить размер',
      iconProps: {
        iconName: 'DoubleColumn'
      },
      onClick: () => designerDispatch({ type: 'TOGGLE_SET_GRID_SIZE' })
    },
    {
      key: 'toggleShowAreaExplorer',
      disabled: previewMode || activeArea === undefined,
      checked: !!showAreaExplorer,
      text: 'Настройка',
      iconProps: {
        iconName: 'DoubleColumn'
      },
      onClick: () => designerDispatch({ type: 'TOGGLE_SHOW_AREA_EXPLORER' })
    },
    {
      key: 'previewMode',
      disabled: !areas.length,
      checked: !!previewMode,
      text: 'Просмотр',
      iconProps: {
        iconName: 'DoubleColumn'
      },
      onClick: () => designerDispatch({ type: 'PREVIEW_MODE' })
    }
  ];

  const getOnMouseDown = (x: number, y: number) => (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    e.preventDefault();
    designerDispatch({ type: 'SET_ACTIVE_CELL', activeCell: { x, y }, shiftKey: e.shiftKey });
  };

  const WithToolPanel = (props: { children: JSX.Element, toolPanel: JSX.Element }): JSX.Element => {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'auto 240px',
        gridTemplateRows: 'auto'
      }}>
        <div style={{
          gridArea: '1 / 1 / 2 / 2',
          padding: '4px'
        }}>
          {props.children}
        </div>
        <div style={{
          gridArea: '1 / 2 / 2 / 3',
          padding: '4px',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid violet',
            borderRadius: '4px',
            padding: '8px'
          }}>
            {props.toolPanel}
          </div>
        </div>
      </div>
    );
  };

  const WithAreaExplorer = (props: { children: JSX.Element }): JSX.Element => {
    return !showAreaExplorer || activeArea === undefined ? props.children :
      <WithToolPanel
        {...props}
        toolPanel={
          <>
            <div>
              Selected area: {activeArea}
            </div>

            {
              dumbFields.map( fieldName =>
                <Checkbox
                  key={fieldName}
                  label={fieldName}
                  checked={!!areas[activeArea].fields.find( areaF => areaF === fieldName )}
                  onChange={ (_, isChecked) => designerDispatch({ type: 'AREA_FIELD', fieldName, include: !!isChecked }) }
                />
              )
            }
          </>
        }
      />
  };

  const OneSize = ({ label, size, onChange }: { label: string, size: ISize, onChange: (newSize: ISize) => void }) => {

    const getOnChangeColumnSpin = (delta: number = 0) => (value: string) => {
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

      onChange({ unit: size.unit, value: newValue });

      return newValue.toString();
    };

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-end',
          marginBottom: '4px'
        }}
      >
        <ComboBox
          style={{
            width: '86px',
            marginRight: '8px'
          }}
          options={[
            { key: 'AUTO', text: 'Auto' },
            { key: 'FR', text: 'Fr' },
            { key: 'PX', text: 'Px' }
          ]}
          selectedKey={size.unit}
          label={label}
          onChanged={ option => option && onChange({ unit: option.key as TUnit, value: size.value }) }
        />
        {
          !size.value || size.unit === 'AUTO'
          ? null
          : <SpinButton
            styles={{
              root: {
                width: '98px'
              }
            }}
            value={size.value.toString()}
            onIncrement={ getOnChangeColumnSpin(1) }
            onDecrement={ getOnChangeColumnSpin(-1) }
            onValidate={ getOnChangeColumnSpin() }
          />
        }
      </div>
    );
  };

  const WithGridSize = (props: { children: JSX.Element }): JSX.Element => {
    return !setGridSize ? props.children :
      <WithToolPanel
        {...props}
        toolPanel={
          <>
            {
              grid.columns.map( (c, idx) =>
                <OneSize label={`Column ${idx + 1}`} size={c} onChange={ (size: ISize) => designerDispatch({ type: 'SET_COLUMN_SIZE', column: idx, size }) } />
              )
            }
            {
              grid.rows.map( (r, idx) =>
                <OneSize label={`Row ${idx + 1}`} size={r} onChange={ (size: ISize) => designerDispatch({ type: 'SET_ROW_SIZE', row: idx, size }) } />
              )
            }
          </>
        }
      />
  };

  return (
    <>
      <CommandBar items={commandBarItems} />
      <WithAreaExplorer>
        <WithGridSize>
          <div
            style={getGridStyle()}
            tabIndex={0}
          >
            {
              previewMode
              ?
                null
              :
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
              previewMode || !selection
              ?
                null
              :
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
                    key={`${area.rect.top}-${area.rect.left}`}
                    styleName={
                      previewMode
                      ? "commonStyle"
                      : activeArea === idx
                      ? "commonStyle activeArea"
                      : "commonStyle area"
                    }
                    style={{
                      gridArea: `${area.rect.top + 1} / ${area.rect.left + 1} / ${area.rect.bottom + 2} / ${area.rect.right + 2}`
                    }}
                    onClick={ () => designerDispatch({ type: 'SET_ACTIVE_AREA', activeArea: idx }) }
                  >
                    {
                      areas[idx].fields.map( f =>
                        <TextField
                          key={f}
                          label={f}
                        />
                      )
                    }
                  </div>
                ))
              : null
            }
            {
              previewMode
              ||
              (selection && inRectangle(activeCell, selection))
              ||
              (areas.length && areas.some( area => inRectangle(activeCell, area.rect) ))
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
      </WithAreaExplorer>
    </>
  );
}, styles, { allowMultiple: true });