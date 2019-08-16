import React, { useReducer, useMemo } from "react";
import { IDesigner2Props } from "./Designer2.types";
import { useTab } from "./useTab";
import { ICommandBarItemProps, CommandBar, getTheme } from "office-ui-fabric-react";

type TUnit = 'AUTO' | 'FR' | 'PX';

interface ISize {
  unit: TUnit;
  value?: number;
};

interface IGridSize {
  columns: ISize[];
  rows: ISize[];
};

interface IRectangle {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

const inRect = (rect: IRectangle | undefined, x: number, y: number) => rect && x >= rect.left && y >= rect.top && x <= rect.right && y <= rect.bottom;

const makeRect = (rect: IRectangle, x: number, y: number) => inRect(rect, x, y)
  ?
    {
      left: rect.left,
      top: rect.top,
      right: x,
      bottom: y
    }
  :
    {
      left: Math.min(rect.left, x),
      top: Math.min(rect.top, y),
      right: Math.max(rect.right, x),
      bottom: Math.max(rect.bottom, y),
    };

type TObjectType = 'WINDOW' | 'AREA';

interface IObject {
  name: string;
  parent?: string;
  type: TObjectType;
};

interface IWindow extends IObject {
  type: 'WINDOW'
};

function isWindow(x: IObject): x is IArea {
  return x.type === 'WINDOW';
};

interface IObjectWithCoord extends IObject, IRectangle { };

interface IArea extends IObjectWithCoord {
  type: 'AREA'
};

function isArea(x: IObject): x is IArea {
  return x.type === 'AREA';
};

type Object = IWindow | IArea;

interface IDesigner2State {
  grid: IGridSize;

  /**
   * Выделенная прямоугольная группа клеток в гриде. Используется для создания области.
   * Координаты области -- это номера клеток в гриде для левого верхнего
   * и правого нижнего углов. Если выделена одна клетка грида,
   * то left === right, top === bottom -- координаты выделенной клетки.
   */
  gridSelection?: IRectangle;
  previewMode?: boolean;
  showGrid: boolean;
  objects: Object[];
};

const getDefaultState = (): IDesigner2State => ({
  grid: {
    columns: [{ unit: 'PX', value: 350 }, { unit: 'FR', value: 1 }, { unit: 'FR', value: 1 }],
    rows: [{ unit: 'FR', value: 1 }, { unit: 'FR', value: 1 }, { unit: 'FR', value: 1 }],
  },
  showGrid: true,
  objects: [
    {
      name: 'Window',
      type: 'WINDOW'
    },
    {
      name: 'Area1',
      type: 'AREA',
      left: 0,
      top: 0,
      right: 1,
      bottom: 1
    }
  ]
});

type Action = { type: 'SET_PREVIEW_MODE', enabled: boolean }
  | { type: 'SHOW_GRID', showGrid: boolean }
  | { type: 'SET_GRID_SELECTION', gridSelection?: IRectangle }
  | { type: 'ADD_COLUMN' }
  | { type: 'ADD_ROW' }
  | { type: 'DELETE_COLUMN' }
  | { type: 'DELETE_ROW' };

function reducer(state: IDesigner2State, action: Action): IDesigner2State {
  switch (action.type) {
    case 'SET_PREVIEW_MODE': {
      return {
        ...state,
        previewMode: action.enabled
      }
    }

    case 'SHOW_GRID': {
      return {
        ...state,
        showGrid: action.showGrid
      }
    }

    case 'SET_GRID_SELECTION': {
      return {
        ...state,
        gridSelection: action.gridSelection
      }
    }

    case 'ADD_COLUMN': {
      return {
        ...state,
        grid: {
          ...state.grid,
          columns: [...state.grid.columns, { unit: 'FR', value: 1 }]
        }
      }
    }

    case 'ADD_ROW': {
      return {
        ...state,
        grid: {
          ...state.grid,
          rows: [...state.grid.rows, { unit: 'FR', value: 1 }]
        }
      }
    }
  }

  return state;
};

export const Designer2 = (props: IDesigner2Props): JSX.Element => {

  const { viewTab, url, dispatch } = props;
  const [ { grid, previewMode, showGrid, gridSelection, objects }, designerDispatch ] = useReducer(reducer, getDefaultState());

  useTab(viewTab, url, 'Designer2', true, dispatch);

  const gridStyle = useMemo( (): React.CSSProperties => ({
    display: 'grid',
    width: '100%',
    gridTemplateColumns: grid.columns.map(c => c.unit === 'AUTO' ? 'auto' : `${c.value ? c.value : 1}${c.unit}`).join(' '),
    gridTemplateRows: grid.rows.map(r => r.unit === 'AUTO' ? 'auto' : `${r.value ? r.value : 1}${r.unit}`).join(' '),
    height: '87%',
    overflow: 'auto'
  }), [grid]);

  const getGridCells = () => {
    const res: JSX.Element[] = [];
    for (let x = 0; x < grid.columns.length; x++) {
      for (let y = 0; y < grid.rows.length; y++) {
        res.push(
          <div
            style={{
              gridArea: `${y + 1} / ${x + 1} / ${y + 2} / ${x + 2}`,
              borderColor: getTheme().palette.neutralTertiary,
              backgroundColor: inRect(gridSelection, x, y) ? getTheme().palette.themeLight : 'inherit',
              border: '1px dotted',
              borderRadius: '4px',
              margin: '6px',
              zIndex: 10
            }}
            onClick={ (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
              if (e.shiftKey && gridSelection) {
                designerDispatch({ type: 'SET_GRID_SELECTION', gridSelection: makeRect(gridSelection, x, y) });
              } else {
                designerDispatch({ type: 'SET_GRID_SELECTION', gridSelection: { left: x, top: y, right: x, bottom: y } });
              }
            }}
          />
        )
      }
    }
    return res;
  };

  const getAreas = () => objects
    .filter( obj => obj.type === 'AREA' )
    .map( obj => {
      const area = obj as IArea;
      return (
        <div
          style={{
            gridArea: `${area.top + 1} / ${area.left + 1} / ${area.bottom + 2} / ${area.right + 2}`,
            borderColor: getTheme().palette.redDark,
            backgroundColor: getTheme().palette.red,
            opacity: 0.5,
            border: '1px solid',
            borderRadius: '4px',
            margin: '2px',
            padding: '4px',
            zIndex: 1
          }}
        >
          {area.name}
        </div>
      )
    });

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'showGrid',
      disabled: previewMode,
      checked: showGrid,
      text: 'Show Grid',
      iconOnly: true,
      iconProps: { iconName: 'FiveTileGrid' },
      onClick: () => designerDispatch({ type: 'SHOW_GRID', showGrid: !showGrid })
    },
    {
      key: 'addColumn',
      disabled: previewMode || !showGrid,
      text: 'Add Column',
      iconOnly: true,
      iconProps: { iconName: 'TripleColumnWide' },
      onClick: () => designerDispatch({ type: 'ADD_COLUMN' })
    },
    {
      key: 'addRow',
      disabled: previewMode || !showGrid,
      text: 'Add Row',
      iconOnly: true,
      iconProps: { iconName: 'TripleColumnWide' },
      onClick: () => designerDispatch({ type: 'ADD_ROW' }),
      buttonStyles: {
        icon: {
          transform: 'rotate(90deg)'
        }
      }
    }
  ];

  return (
    <>
      <CommandBar items={commandBarItems} />
      <div style={gridStyle}>
        {
          showGrid ? getGridCells().concat(getAreas()) : getAreas()
        }
      </div>
    </>
  )
};