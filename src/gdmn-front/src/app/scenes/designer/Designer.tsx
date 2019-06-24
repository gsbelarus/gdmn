import React, { useEffect, useReducer } from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.css';
import { IDesignerProps } from './Designer.types';
import { gdmnActions } from '../gdmn/actions';
import { CommandBar, ICommandBarItemProps, ComboBox, SpinButton, Checkbox, TextField, ChoiceGroup, Label } from 'office-ui-fabric-react';

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

type TDirection = 'row' | 'column';

interface IArea {
  rect: IRectangle;
  fields: string[];
  direction: TDirection;
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

type Action = { type: 'SET_ACTIVE_CELL', activeCell: ICoord, shiftKey: boolean, url: string }
  | { type: 'SET_ACTIVE_AREA', activeArea: number, url: string }
  | { type: 'SET_COLUMN_SIZE', column: number, size: ISize, url: string }
  | { type: 'SET_ROW_SIZE', row: number, size: ISize, url: string }
  | { type: 'AREA_FIELD', fieldName: string, include: boolean, url: string }
  | { type: 'CONFIGURE_AREA', rect?: IRectangle, direction?: TDirection, url: string }
  | { type: 'PREVIEW_MODE', url: string }
  | { type: 'TOGGLE_SET_GRID_SIZE', url: string }
  | { type: 'TOGGLE_SHOW_AREA_EXPLORER', url: string }
  | { type: 'ADD_COLUMN', url: string }
  | { type: 'ADD_ROW', url: string }
  | { type: 'DELETE_COLUMN', url: string }
  | { type: 'DELETE_ROW', url: string }
  | { type: 'CREATE_AREA', url: string }
  | { type: 'DELETE_AREA', url: string }
  | { type: 'CLEAR_SELECTION', url: string };

function reducer(state: IDesignerState, action: Action): IDesignerState {
  switch (action.type) {
    case 'SET_ACTIVE_CELL': {
      const { activeCell, shiftKey, url } = action;
      const { selection, activeCell: prevActiveCell } = state;

      if (!shiftKey) {
        localStorage.setItem(`des-${url}`, JSON.stringify({
          ...state,
          activeCell,
          selection: undefined
        }));
        return {
          ...state,
          activeCell,
          selection: undefined
        };
      }

      if (!selection) {
        localStorage.setItem(`des-${url}`, JSON.stringify({
          ...state,
          activeCell,
          selection: {
            left: Math.min(prevActiveCell.x, activeCell.x),
            top: Math.min(prevActiveCell.y, activeCell.y),
            right: Math.max(prevActiveCell.x, activeCell.x),
            bottom: Math.max(prevActiveCell.y, activeCell.y),
          }
        }));
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
        localStorage.setItem(`des-${url}`, JSON.stringify({
          ...state,
          activeCell,
          selection: {
            left: Math.min(selection.left, activeCell.x),
            top: Math.min(selection.top, activeCell.y),
            right: Math.max(selection.right, activeCell.x),
            bottom: Math.max(selection.bottom, activeCell.y),
          }
        }));
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
      const { activeArea, url } = action;
      const { areas } = state;

      if (activeArea >= 0 && activeArea <= (areas.length - 1)) {
        localStorage.setItem(`des-${url}`, JSON.stringify({
          ...state,
          activeArea
        }));
        return {
          ...state,
          activeArea
        }
      } else {
        localStorage.setItem(`des-${url}`, JSON.stringify({
          ...state,
          activeArea: undefined
        }));
        return {
          ...state,
          activeArea: undefined
        }
      }
    }

    case 'CONFIGURE_AREA': {
      const { direction, rect, url } = action;
      const { areas, activeArea, grid } = state;

      if (activeArea !== undefined && activeArea >= 0 && activeArea <= (areas.length - 1)) {
        const newAreas = [...areas];

        newAreas[activeArea] = {...newAreas[activeArea]};

        if (rect
          && rect.left <= rect.right
          && rect.top <= rect.bottom
          && rect.left >= 0
          && rect.right < grid.columns.length
          && rect.top >= 0
          && rect.bottom < grid.rows.length)
        {
          newAreas[activeArea].rect = rect;
        }

        if (direction) {
          newAreas[activeArea].direction = direction;
        }

        localStorage.setItem(`des-${url}`, JSON.stringify({
          ...state,
          areas: newAreas
        }));

        return {
          ...state,
          areas: newAreas
        }
      } else {
        localStorage.setItem(`des-${url}`, JSON.stringify(state));
        return state;
      }
    }

    case 'CLEAR_SELECTION': {
      const {url} = action;
      localStorage.setItem(`des-${url}`, JSON.stringify({
        ...state,
        selection: undefined
      }));
      return {
        ...state,
        selection: undefined
      };
    }

    case 'PREVIEW_MODE': {
      const {url} = action;
      const { previewMode } = state;

      if (previewMode) {
        localStorage.setItem(`des-${url}`, JSON.stringify({
          ...state,
          previewMode: false
        }));
        return {
          ...state,
          previewMode: false
        }
      } else {
        localStorage.setItem(`des-${url}`, JSON.stringify({
          ...state,
          previewMode: true,
          setGridSize: false,
          showAreaExplorer: false
        }));
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
      const { fieldName, include, url } = action;

      if (activeArea === undefined) {
        localStorage.setItem(`des-${url}`, JSON.stringify(state));
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

      localStorage.setItem(`des-${url}`, JSON.stringify({
        ...state,
        areas: newAreas
      }));
      return {
        ...state,
        areas: newAreas
      };
    }

    case 'CREATE_AREA': {
      const { selection, areas, activeCell: {x, y} } = state;
      const {url} = action;
      if (selection) {
        if (areas.some( area => intersect(area.rect, selection) )) {
          localStorage.setItem(`des-${url}`, JSON.stringify(state));
          return state;
        } else {
          localStorage.setItem(`des-${url}`, JSON.stringify({
            ...state,
            areas: [...areas, { rect: selection, fields: [], direction: 'row' }],
            activeArea: state.areas.length,
            selection: undefined,
            showAreaExplorer: true,
            setGridSize: false
          }));
          return {
            ...state,
            areas: [...areas, { rect: selection, fields: [], direction: 'row' }],
            activeArea: state.areas.length,
            selection: undefined,
            showAreaExplorer: true,
            setGridSize: false
          };
        }
      }
      else {
        localStorage.setItem(`des-${url}`, JSON.stringify({
          ...state,
          areas: [...areas, {
            rect: {
              left: x,
              top: y,
              right: x,
              bottom: y
            },
            fields: [],
            direction: 'row'
          }],
          activeArea: state.areas.length,
          showAreaExplorer: true,
          setGridSize: false
        }));
        return {
          ...state,
          areas: [...areas, {
            rect: {
              left: x,
              top: y,
              right: x,
              bottom: y
            },
            fields: [],
            direction: 'row'
          }],
          activeArea: state.areas.length,
          showAreaExplorer: true,
          setGridSize: false
        };
      }
    }

    case 'DELETE_AREA': {
      const { areas, activeArea } = state;
      const {url} = action;

      if (!areas.length || activeArea === undefined) {
        localStorage.setItem(`des-${url}`, JSON.stringify(state));
        return state;
      }

      localStorage.setItem(`des-${url}`, JSON.stringify({
        ...state,
        areas: areas.slice(0, activeArea).concat(areas.slice(activeArea + 1)),
        activeArea: undefined,
        showAreaExplorer: false
      }));
      return {
        ...state,
        areas: areas.slice(0, activeArea).concat(areas.slice(activeArea + 1)),
        activeArea: undefined,
        showAreaExplorer: false
      };
    }

    case 'SET_COLUMN_SIZE': {
      const { grid } = state;
      const { column, size, url } = action;

      if (column >= grid.columns.length) {
        localStorage.setItem(`des-${url}`, JSON.stringify(state));
        return state;
      }

      const newColumns = [...grid.columns];
      newColumns[column] = size;
      localStorage.setItem(`des-${url}`, JSON.stringify({
        ...state,
        grid: {
          ...grid,
          columns: newColumns
        }
      }));
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
      const { row, size, url } = action;

      if (row >= grid.rows.length) {
        localStorage.setItem(`des-${url}`, JSON.stringify(state));
        return state;
      }

      const newRows = [...grid.rows];
      newRows[row] = size;
      localStorage.setItem(`des-${url}`, JSON.stringify({
        ...state,
        grid: {
          ...grid,
          rows: newRows
        }
      }));
      return {
        ...state,
        grid: {
          ...grid,
          rows: newRows
        }
      }
    }

    case 'TOGGLE_SET_GRID_SIZE': {
      const {url} = action;
      localStorage.setItem(`des-${url}`, JSON.stringify({
        ...state,
        setGridSize: !state.setGridSize,
        showAreaExplorer: !state.setGridSize ? undefined : state.showAreaExplorer
      }));
      return {
        ...state,
        setGridSize: !state.setGridSize,
        showAreaExplorer: !state.setGridSize ? undefined : state.showAreaExplorer
      }
    }

    case 'TOGGLE_SHOW_AREA_EXPLORER': {
      const {url} = action;
      localStorage.setItem(`des-${url}`, JSON.stringify({
        ...state,
        setGridSize: !state.showAreaExplorer ? undefined : state.setGridSize,
        showAreaExplorer: !state.showAreaExplorer
      }));
      return {
        ...state,
        setGridSize: !state.showAreaExplorer ? undefined : state.setGridSize,
        showAreaExplorer: !state.showAreaExplorer
      }
    }

    case 'ADD_COLUMN': {
      const { grid, activeCell: { x } } = state;
      const {url} = action;
      localStorage.setItem(`des-${url}`, JSON.stringify({
        ...state,
        grid: {
          ...grid,
          columns: [...grid.columns.slice(0, x + 1), { unit: 'FR', value: 1}, ...grid.columns.slice(x + 1)]
        }
      }));
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
      const {url} = action;
      localStorage.setItem(`des-${url}`, JSON.stringify({
        ...state,
        grid: {
          ...grid,
          rows: [...grid.rows.slice(0, y + 1), { unit: 'FR', value: 1}, ...grid.rows.slice(y + 1)]
        }
      }));
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
      const {url} = action;

      if (grid.columns.length === 1 || selection) {
        localStorage.setItem(`des-${url}`, JSON.stringify(state));
        return state;
      }

      const newAreas = areas
        .filter( area => area.rect.left < x || area.rect.right > x )
        .map( area => area.rect.right > x ? {...area, rect: {...area.rect, right: area.rect.right - 1}} : area )
        .map( area => area.rect.left > x ? {...area, rect: {...area.rect, left: area.rect.left - 1}} : area );

      localStorage.setItem(`des-${url}`, JSON.stringify({
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
      }));
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
      const {url} = action;

      if (grid.rows.length === 1 || selection) {
        localStorage.setItem(`des-${url}`, JSON.stringify(state));
        return state;
      }

      const newAreas = areas
        .filter( area => area.rect.top < y || area.rect.bottom > y )
        .map( area => area.rect.bottom > y ? {...area, rect: {...area.rect, bottom: area.rect.bottom - 1}} : area )
        .map( area => area.rect.top > y ? {...area, rect: {...area.rect, top: area.rect.top - 1}} : area );

      localStorage.setItem(`des-${url}`, JSON.stringify({
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
      }));
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

  const { url, viewTab, dispatch, fields } = props;
  const localState = localStorage.getItem(`des-${url}`) === null ? undefined : JSON.parse(localStorage.getItem(`des-${url}`)!);
  const [{ grid, activeCell, selection, setGridSize, areas, activeArea, showAreaExplorer, previewMode }, designerDispatch] = useReducer(reducer, localState !== undefined ? localState as IDesignerState :  {
    grid: {
      columns: [{ unit: 'PX', value: 350 }, { unit: 'AUTO', value: 1 }],
      rows: [{ unit: 'FR', value: 1 }],
    },
    activeCell: {
      x: 0,
      y: 0
    },
    areas: [{
      rect: {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
      },
      fields:
        fields!.map(field => {
          return `${field.caption}-${field.fieldName}-${field.eqfa!.attribute}`
        }),
      direction: 'column'
    }]
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
      onClick: () => designerDispatch({ type: 'ADD_COLUMN', url })
    },
    {
      key: 'deleteColumn',
      disabled: previewMode || grid.columns.length <= 1 || !!selection || areas.some( area => inRectangle(activeCell, area.rect) ),
      text: 'Удалить колонку',
      iconProps: {
        iconName: 'DoubleColumn'
      },
      onClick: () => designerDispatch({ type: 'DELETE_COLUMN', url })
    },
    {
      key: 'addRow',
      disabled: previewMode,
      text: 'Добавить строку',
      iconProps: {
        iconName: 'DoubleColumn'
      },
      onClick: () => designerDispatch({ type: 'ADD_ROW', url })
    },
    {
      key: 'deleteRow',
      disabled: previewMode || grid.rows.length <= 1 || !!selection || areas.some( area => inRectangle(activeCell, area.rect) ),
      text: 'Удалить строку',
      iconProps: {
        iconName: 'DoubleColumn'
      },
      onClick: () => designerDispatch({ type: 'DELETE_ROW', url })
    },
    {
      key: 'createArea',
      disabled: previewMode || areas.some( area => inRectangle(activeCell, area.rect) ),
      text: 'Создать область',
      iconProps: {
        iconName: 'DoubleColumn'
      },
      onClick: () => designerDispatch({ type: 'CREATE_AREA', url })
    },
    {
      key: 'deleteArea',
      disabled: previewMode || activeArea === undefined,
      text: 'Удалить область',
      iconProps: {
        iconName: 'DoubleColumn'
      },
      onClick: () => designerDispatch({ type: 'DELETE_AREA', url })
    },
    {
      key: 'toggleSetGridSize',
      disabled: previewMode,
      checked: !!setGridSize,
      text: 'Установить размер',
      iconProps: {
        iconName: 'DoubleColumn'
      },
      onClick: () => designerDispatch({ type: 'TOGGLE_SET_GRID_SIZE', url })
    },
    {
      key: 'toggleShowAreaExplorer',
      disabled: previewMode || activeArea === undefined,
      checked: !!showAreaExplorer,
      text: 'Настройка',
      iconProps: {
        iconName: 'DoubleColumn'
      },
      onClick: () => designerDispatch({ type: 'TOGGLE_SHOW_AREA_EXPLORER', url })
    },
    {
      key: 'previewMode',
      disabled: !areas.length,
      checked: !!previewMode,
      text: 'Просмотр',
      iconProps: {
        iconName: 'DoubleColumn'
      },
      onClick: () => designerDispatch({ type: 'PREVIEW_MODE', url })
    }
  ];

  const getOnMouseDown = (x: number, y: number) => (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    e.preventDefault();
    designerDispatch({ type: 'SET_ACTIVE_CELL', activeCell: { x, y }, shiftKey: e.shiftKey, url });
  };

  const WithToolPanel = (props: { children: JSX.Element, toolPanel: JSX.Element }): JSX.Element => {
    return (
      <div style={{
        display: 'grid',
        width: '100%',
        height: '100%',
        gridTemplateColumns: 'auto 240px',
        gridTemplateRows: 'auto',
        gridAutoFlow: 'column',
        overflow: 'auto'
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

  const WithAreaExplorer =  CSSModules( (props: { children: JSX.Element }): JSX.Element => {
    if (!showAreaExplorer || activeArea === undefined) {
      return props.children;
    }

    const area = areas[activeArea];

    return !showAreaExplorer || activeArea === undefined ? props.children :
      <WithToolPanel
        {...props}
        toolPanel={
          <div
            style={{
              height: '100%',
              width: '100%',
              overflow: 'auto'
            }}
          >
            <Label>
              Selected area #{activeArea}
            </Label>

            <TextField
              label='Left'
              value={area.rect.left.toString()}
              mask='9'
              onChange={
                (_, newValue) => {
                  if (newValue && Number(newValue) !== area.rect.left) {
                    designerDispatch({ type: 'CONFIGURE_AREA', rect: {...area.rect, left: parseInt(newValue) }, url });
                  }
                }
              }
            />

            <TextField
              label='Top'
              value={area.rect.top.toString()}
              mask='9'
              onChange={
                (_, newValue) => {
                  if (newValue && Number(newValue) !== area.rect.top) {
                    designerDispatch({ type: 'CONFIGURE_AREA', rect: {...area.rect, top: parseInt(newValue) }, url });
                  }
                }
              }
            />

            <TextField
              label='Right'
              value={area.rect.right.toString()}
              mask='9'
              onChange={
                (_, newValue) => {
                  if (newValue && Number(newValue) !== area.rect.right) {
                    designerDispatch({ type: 'CONFIGURE_AREA', rect: {...area.rect, right: parseInt(newValue) }, url });
                  }
                }
              }
            />

            <TextField
              label='Bottom'
              value={area.rect.bottom.toString()}
              mask='9'
              onChange={
                (_, newValue) => {
                  if (newValue && Number(newValue) !== area.rect.bottom) {
                    designerDispatch({ type: 'CONFIGURE_AREA', rect: {...area.rect, bottom: parseInt(newValue) }, url });
                  }
                }
              }
            />

            <ChoiceGroup
              styles={{
                root: {
                  paddingBottom: '8px'
                },
                flexContainer: {
                  display: 'flex'
                }
              }}
              options={[
                {
                  key: 'column',
                  text: 'column',
                  styles: {
                    root: {
                      paddingRight: '8px'
                    }
                  }
                },
                {
                  key: 'row',
                  text: 'row'
                }
              ]}
              selectedKey={area.direction}
              label='Direction'
              onChange={ (_, option) => option && designerDispatch({ type: 'CONFIGURE_AREA', direction: option.key as TDirection, url }) }
            />

            <Label>
              Show fields:
            </Label>
              {
                fields!.map( field =>
                  <Checkbox
                    styles={{
                      root: {
                        paddingBottom: '4px'
                      }
                    }}
                    key={`${field.caption}-${field.fieldName}-${field.eqfa!.attribute}`}
                    label={`${field.caption}-${field.fieldName}-${field.eqfa!.attribute}`}
                    checked={!!areas[activeArea].fields.find( areaF => areaF === `${field.caption}-${field.fieldName}-${field.eqfa!.attribute}` )}
                    onChange={ (_, isChecked) => designerDispatch({ type: 'AREA_FIELD', fieldName: `${field.caption}-${field.fieldName}-${field.eqfa!.attribute}`, include: !!isChecked, url }) }
                  />
                )
              }
          </div>
        }
      />
  }, styles, { allowMultiple: true });

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
          onChange={ (_, option) => option && onChange({ unit: option.key as TUnit, value: size.value }) }
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
                <OneSize key={`c${idx}`} label={`Column ${idx}`} size={c} onChange={ (size: ISize) => designerDispatch({ type: 'SET_COLUMN_SIZE', column: idx, size, url }) } />
              )
            }
            {
              grid.rows.map( (r, idx) =>
                <OneSize key={`r${idx}`} label={`Row ${idx}`} size={r} onChange={ (size: ISize) => designerDispatch({ type: 'SET_ROW_SIZE', row: idx, size, url }) } />
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
                  onClick={ () => designerDispatch({ type: 'CLEAR_SELECTION', url }) }
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
                      gridArea: `${area.rect.top + 1} / ${area.rect.left + 1} / ${area.rect.bottom + 2} / ${area.rect.right + 2}`,
                      display: 'flex',
                      flexDirection: area.direction,
                      justifyContent: 'flex-start'
                    }}
                    onClick={ previewMode || activeArea === idx ? undefined : () => designerDispatch({ type: 'SET_ACTIVE_AREA', activeArea: idx, url }) }
                  >
                    {
                      area.fields.map( f =>
                        <TextField
                          styles={ area.direction === 'row'
                            ? {
                              root: {
                                flexGrow: 1
                              }
                            }
                            : {
                              root: {
                                flexGrow: 0
                              }
                            }
                          }
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