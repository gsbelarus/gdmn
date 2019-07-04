import React, { useEffect, useReducer, useRef } from 'react';
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

export interface IDesignerState {
  grid: IGridSize;
  activeCell: ICoord;
  entityName: string;
  selection?: IRectangle;
  areas: IArea[];
  activeArea?: number;
  setGridSize?: boolean;
  showAreaExplorer?: boolean;
  previewMode?: boolean;
  changed: boolean;
};

type Action = { type: 'SET_ACTIVE_CELL', activeCell: ICoord, shiftKey: boolean }
  | { type: 'SET_ACTIVE_AREA', activeArea: number }
  | { type: 'SET_COLUMN_SIZE', column: number, size: ISize }
  | { type: 'SET_ROW_SIZE', row: number, size: ISize }
  | { type: 'AREA_FIELD', fieldName: string, include: boolean }
  | { type: 'CONFIGURE_AREA', rect?: IRectangle, direction?: TDirection }
  | { type: 'PREVIEW_MODE' }
  | { type: 'TOGGLE_SET_GRID_SIZE' }
  | { type: 'TOGGLE_SHOW_AREA_EXPLORER' }
  | { type: 'ADD_COLUMN' }
  | { type: 'ADD_ROW' }
  | { type: 'DELETE_COLUMN' }
  | { type: 'DELETE_ROW' }
  | { type: 'CREATE_AREA' }
  | { type: 'DELETE_AREA' }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'CANCEL_CHANGES', entityName: string }
  | { type: 'SAVE_CHANGES' };

function reducer(state: IDesignerState, action: Action): IDesignerState {
  switch (action.type) {
    case 'SET_ACTIVE_CELL': {
      const { activeCell, shiftKey } = action;
      const { selection, activeCell: prevActiveCell } = state;

      if (!shiftKey) {
        return {
          ...state,
          activeCell,
          selection: undefined,
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
          },
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
          },
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
        }
      } else {
        return {
          ...state,
          activeArea: undefined,
        }
      }
    }

    case 'CONFIGURE_AREA': {
      const { direction, rect } = action;
      const { areas, activeArea, grid } = state;

      if (activeArea !== undefined && activeArea >= 0 && activeArea <= (areas.length - 1)) {
        const newAreas = [...areas];

        newAreas[activeArea] = { ...newAreas[activeArea] };

        if (rect
          && rect.left <= rect.right
          && rect.top <= rect.bottom
          && rect.left >= 0
          && rect.right < grid.columns.length
          && rect.top >= 0
          && rect.bottom < grid.rows.length) {
          newAreas[activeArea].rect = rect;
        }

        if (direction) {
          newAreas[activeArea].direction = direction;
        }

        return {
          ...state,
          areas: newAreas,
          changed: true
        }
      } else {
        return state;
      }
    }

    case 'CLEAR_SELECTION': {
      return {
        ...state,
        selection: undefined,
        changed: true
      };
    }

    case 'PREVIEW_MODE': {
      const { previewMode } = state;

      if (previewMode) {
        return {
          ...state,
          previewMode: false,
          changed: true
        }
      } else {
        return {
          ...state,
          previewMode: true,
          setGridSize: false,
          showAreaExplorer: false,
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

      if (include && !areas[activeArea].fields.find(f => f === fieldName)) {
        newAreas[activeArea] = {
          ...newAreas[activeArea],
          fields: [...newAreas[activeArea].fields, fieldName]
        };
      }

      if (!include && !!areas[activeArea].fields.find(f => f === fieldName)) {
        newAreas[activeArea] = {
          ...newAreas[activeArea],
          fields: newAreas[activeArea].fields.filter(f => f !== fieldName)
        };
      }

      return {
        ...state,
        areas: newAreas,
        changed: true
      };
    }

    case 'CREATE_AREA': {
      const { selection, areas, activeCell: { x, y } } = state;
      if (selection) {
        if (areas.some(area => intersect(area.rect, selection))) {
          return state;
        } else {
          return {
            ...state,
            areas: [...areas, { rect: selection, fields: [], direction: 'row' }],
            activeArea: state.areas.length,
            selection: undefined,
            showAreaExplorer: true,
            setGridSize: false,
            changed: true
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
            fields: [],
            direction: 'row'
          }],
          activeArea: state.areas.length,
          showAreaExplorer: true,
          setGridSize: false,
          changed: true
        };
      }
    }

    case 'DELETE_AREA': {
      const { areas, activeArea } = state;

      if (!areas.length || activeArea === undefined) {
        return state;
      }

      return {
        ...state,
        areas: areas.slice(0, activeArea).concat(areas.slice(activeArea + 1)),
        activeArea: undefined,
        showAreaExplorer: false,
        changed: true
      };
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
        },
        changed: true
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
        },
        changed: true
      }
    }

    case 'TOGGLE_SET_GRID_SIZE': {
      return {
        ...state,
        setGridSize: !state.setGridSize,
        showAreaExplorer: !state.setGridSize ? undefined : state.showAreaExplorer,
        changed: true
      }
    }

    case 'TOGGLE_SHOW_AREA_EXPLORER': {
      return {
        ...state,
        setGridSize: !state.showAreaExplorer ? undefined : state.setGridSize,
        showAreaExplorer: !state.showAreaExplorer,
        changed: true
      }
    }

    case 'ADD_COLUMN': {
      const { grid, activeCell: { x } } = state;
      return {
        ...state,
        grid: {
          ...grid,
          columns: [...grid.columns.slice(0, x + 1), { unit: 'FR', value: 1 }, ...grid.columns.slice(x + 1)]
        },
        changed: true
      }
    }

    case 'ADD_ROW': {
      const { grid, activeCell: { y } } = state;
      return {
        ...state,
        grid: {
          ...grid,
          rows: [...grid.rows.slice(0, y + 1), { unit: 'FR', value: 1 }, ...grid.rows.slice(y + 1)]
        },
        changed: true
      }
    }

    case 'DELETE_COLUMN': {
      const { grid, selection, areas, activeArea, activeCell: { x, y } } = state;

      if (grid.columns.length === 1 || selection) {
        return state;
      }

      const newAreas = areas
        .filter(area => area.rect.left < x || area.rect.right > x)
        .map(area => area.rect.right > x ? { ...area, rect: { ...area.rect, right: area.rect.right - 1 } } : area)
        .map(area => area.rect.left > x ? { ...area, rect: { ...area.rect, left: area.rect.left - 1 } } : area);

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
            : undefined,
        changed: true
      }
    }

    case 'DELETE_ROW': {
      const { grid, selection, areas, activeArea, activeCell: { x, y } } = state;

      if (grid.rows.length === 1 || selection) {
        return state;
      }

      const newAreas = areas
        .filter(area => area.rect.top < y || area.rect.bottom > y)
        .map(area => area.rect.bottom > y ? { ...area, rect: { ...area.rect, bottom: area.rect.bottom - 1 } } : area)
        .map(area => area.rect.top > y ? { ...area, rect: { ...area.rect, top: area.rect.top - 1 } } : area);

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
            : undefined,
        changed: true
      }
    }

    case 'CANCEL_CHANGES': {
      const { entityName } = action;
      const localState = localStorage.getItem(entityName) === null ? undefined : JSON.parse(localStorage.getItem(entityName)!);
      if (localState) {
        return {
          ...state,
          grid: localState.grid,
          entityName: localState.entityName,
          areas: localState.areas,
          setGridSize: localState.setGridSize,
          showAreaExplorer: localState.showAreaExplorer,
          previewMode: localState.previewMode,
          changed: false
        }
      } else {
        return state;
      }
    }

    case 'SAVE_CHANGES': {
      return {
        ...state,
        changed: false
      }
    }
  }
};

export const Designer = CSSModules((props: IDesignerProps): JSX.Element => {

  const { entityName, viewTab, fields } = props;
  
  const getSavedLastEdit = (): IDesignerState | undefined => {
    if (viewTab && viewTab.sessionData && viewTab.sessionData.changesDesigner instanceof Object) {
      return viewTab.sessionData.changesDesigner as IDesignerState;
    }
    return undefined;
  };

  const changes = useRef(getSavedLastEdit());

  const localState = localStorage.getItem(`des-${entityName}`) === null ? undefined : JSON.parse(localStorage.getItem(`des-${entityName}`)!);
  const [{ grid, activeCell, selection, setGridSize, areas, activeArea, showAreaExplorer, previewMode, changed }, designerDispatch] = useReducer(reducer, changes.current !== undefined ? changes.current : localState !== undefined ? localState as IDesignerState : {
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
    }],
    entityName: entityName,
    changed: false
  });

  const getGridStyle = (): React.CSSProperties => ({
    display: 'grid',
    width: '100%',
    gridTemplateColumns: grid.columns.map(c => c.unit === 'AUTO' ? 'auto' : `${c.value ? c.value : 1}${c.unit}`).join(' '),
    gridTemplateRows: grid.rows.map(r => r.unit === 'AUTO' ? 'auto' : `${r.value ? r.value : 1}${r.unit}`).join(' '),
    overflow: 'auto',
  });

  const getCellStyle = (x: number, y: number): React.CSSProperties => ({
    gridArea: `${y + 1} / ${x + 1} / ${y + 2} / ${x + 2}`
  });

  const inSelection = (x: number, y: number): boolean => !!selection && x >= selection.left && x <= selection.right && y >= selection.top && y <= selection.bottom;

  const commandBarItems: ICommandBarItemProps[][] = [
    [
      {
        key: 'addColumn',
        disabled: previewMode,
        text: 'Добавить колонку',
        iconProps: {
          iconName: 'DoubleColumn'
        },
        onClick: () => {
          designerDispatch({ type: 'ADD_COLUMN' });
          changes.current = { grid, activeCell, selection, setGridSize, areas, activeArea, showAreaExplorer, previewMode } as IDesignerState;
        }
      },
      {
        key: 'deleteColumn',
        disabled: previewMode || grid.columns.length <= 1 || !!selection || areas.some(area => inRectangle(activeCell, area.rect)),
        text: 'Удалить колонку',
        iconProps: {
          iconName: 'DoubleColumn'
        },
        onClick: () => {
          designerDispatch({ type: 'DELETE_COLUMN' });
          changes.current = { grid, activeCell, selection, setGridSize, areas, activeArea, showAreaExplorer, previewMode } as IDesignerState;
        }
      },
      {
        key: 'addRow',
        disabled: previewMode,
        text: 'Добавить строку',
        iconProps: {
          iconName: 'DoubleColumn'
        },
        onClick: () => {
          designerDispatch({ type: 'ADD_ROW' });
          changes.current = { grid, activeCell, selection, setGridSize, areas, activeArea, showAreaExplorer, previewMode } as IDesignerState;
        }
      },
      {
        key: 'deleteRow',
        disabled: previewMode || grid.rows.length <= 1 || !!selection || areas.some(area => inRectangle(activeCell, area.rect)),
        text: 'Удалить строку',
        iconProps: {
          iconName: 'DoubleColumn'
        },
        onClick: () => {
          designerDispatch({ type: 'DELETE_ROW' });
          changes.current = { grid, activeCell, selection, setGridSize, areas, activeArea, showAreaExplorer, previewMode } as IDesignerState;
        }

      },
      {
        key: 'createArea',
        disabled: previewMode || areas.some(area => inRectangle(activeCell, area.rect)),
        text: 'Создать область',
        iconProps: {
          iconName: 'DoubleColumn'
        },
        onClick: () => {
          designerDispatch({ type: 'CREATE_AREA' });
          changes.current = { grid, activeCell, selection, setGridSize, areas, activeArea, showAreaExplorer, previewMode } as IDesignerState;
        }
      },
      {
        key: 'deleteArea',
        disabled: previewMode || activeArea === undefined,
        text: 'Удалить область',
        iconProps: {
          iconName: 'DoubleColumn'
        },
        onClick: () => {
          designerDispatch({ type: 'DELETE_AREA' });
          changes.current = { grid, activeCell, selection, setGridSize, areas, activeArea, showAreaExplorer, previewMode } as IDesignerState;
        }
      },
      {
        key: 'toggleSetGridSize',
        disabled: previewMode,
        checked: !!setGridSize,
        text: 'Установить размер',
        iconProps: {
          iconName: 'DoubleColumn'
        },
        onClick: () => {
          designerDispatch({ type: 'TOGGLE_SET_GRID_SIZE' });
          changes.current = { grid, activeCell, selection, setGridSize, areas, activeArea, showAreaExplorer, previewMode } as IDesignerState;
        }
      },
      {
        key: 'toggleShowAreaExplorer',
        disabled: previewMode || activeArea === undefined,
        checked: !!showAreaExplorer,
        text: 'Настройка',
        iconProps: {
          iconName: 'DoubleColumn'
        },
        onClick: () => {
          designerDispatch({ type: 'TOGGLE_SHOW_AREA_EXPLORER' });
          changes.current = { grid, activeCell, selection, setGridSize, areas, activeArea, showAreaExplorer, previewMode } as IDesignerState;
        }
      },
      {
        key: 'previewMode',
        disabled: !areas.length,
        checked: !!previewMode,
        text: 'Просмотр',
        iconProps: {
          iconName: 'DoubleColumn'
        },
        onClick: () => {
          designerDispatch({ type: 'PREVIEW_MODE' });
          changes.current = { grid, activeCell, selection, setGridSize, areas, activeArea, showAreaExplorer, previewMode } as IDesignerState;
        }
      }
    ],
    [
      {
        key: 'saveAndClose',
        disabled: !changed,
        text: 'Сохранить',
        iconProps: {
          iconName: 'CheckMark'
        },
        onClick: () => {
          changes.current = undefined;
          localStorage.setItem(`des-${entityName}`, JSON.stringify({ grid, activeCell, selection, setGridSize, areas, activeArea, showAreaExplorer, previewMode }));
          designerDispatch({ type: 'SAVE_CHANGES' });
          props.outDesigner();
        }
      },
      {
        key: 'cancelAndClose',
        text: changed ? 'Отменить' : 'Закрыть',
        iconProps: {
          iconName: 'Cancel'
        },
        onClick: () => {
          changes.current = undefined;
          designerDispatch({ type: 'CANCEL_CHANGES', entityName: `des-${entityName}` });
          props.outDesigner();
        }
      },
      {
        key: 'apply',
        disabled: !changed,
        text: 'Применить',
        iconProps: {
          iconName: 'Save'
        },
        onClick: () => {
          changes.current = undefined;
          localStorage.setItem(`des-${entityName}`, JSON.stringify({ grid, activeCell, selection, setGridSize, areas, activeArea, showAreaExplorer, previewMode }));
          designerDispatch({ type: 'SAVE_CHANGES' });
        }
      },
      {
        key: 'revert',
        disabled: !changed,
        text: 'Вернуть',
        iconProps: {
          iconName: 'Undo'
        },
        onClick: () => {
          changes.current = undefined;
          designerDispatch({ type: 'CANCEL_CHANGES', entityName: `des-${entityName}` });
        }
      }
    ]
  ];

  const getOnMouseDown = (x: number, y: number) => (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    e.preventDefault();
    designerDispatch({ type: 'SET_ACTIVE_CELL', activeCell: { x, y }, shiftKey: e.shiftKey });
    changes.current = { grid, activeCell, selection, setGridSize, areas, activeArea, showAreaExplorer, previewMode } as IDesignerState;
  };

  useEffect( () => {
    props.componentRef({ grid, activeCell, selection, setGridSize, areas, activeArea, showAreaExplorer, previewMode } as IDesignerState);
  });

  const WithToolPanel = (props: { children: JSX.Element, toolPanel: JSX.Element }): JSX.Element => {
    return (
      <div style={{
        display: 'grid',
        width: '100%',
        height: '100vh',
        /*height: '650px',*/
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

  const WithAreaExplorer = CSSModules((props: { children: JSX.Element }): JSX.Element => {
    if (!showAreaExplorer || activeArea === undefined) {
      return props.children;
    }

    const area = areas[activeArea];

    return !showAreaExplorer || activeArea === undefined ? props.children :
      <WithToolPanel
        {...props}
        toolPanel={
          <>
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
                    designerDispatch({ type: 'CONFIGURE_AREA', rect: { ...area.rect, left: parseInt(newValue) } });
                    changes.current = { grid, activeCell, selection, setGridSize, areas, activeArea, showAreaExplorer, previewMode } as IDesignerState;
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
                    designerDispatch({ type: 'CONFIGURE_AREA', rect: { ...area.rect, top: parseInt(newValue) } });
                    changes.current = { grid, activeCell, selection, setGridSize, areas, activeArea, showAreaExplorer, previewMode } as IDesignerState;
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
                    designerDispatch({ type: 'CONFIGURE_AREA', rect: { ...area.rect, right: parseInt(newValue) } });
                    changes.current = { grid, activeCell, selection, setGridSize, areas, activeArea, showAreaExplorer, previewMode } as IDesignerState;
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
                    designerDispatch({ type: 'CONFIGURE_AREA', rect: { ...area.rect, bottom: parseInt(newValue) } });
                    changes.current = { grid, activeCell, selection, setGridSize, areas, activeArea, showAreaExplorer, previewMode } as IDesignerState;
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
              onChange={(_, option) => option && designerDispatch({ type: 'CONFIGURE_AREA', direction: option.key as TDirection }) && (changes.current = { grid, activeCell, selection, setGridSize, areas, activeArea, showAreaExplorer, previewMode } as IDesignerState)}
            />

            <Label>
              Show fields:
            </Label>
            {
              fields!.map(field =>
                <Checkbox
                  styles={{
                    root: {
                      paddingBottom: '4px'
                    }
                  }}
                  key={`${field.caption}-${field.fieldName}-${field.eqfa!.attribute}`}
                  label={`${field.caption}-${field.fieldName}-${field.eqfa!.attribute}`}
                  checked={!!areas[activeArea].fields.find(areaF => areaF === `${field.caption}-${field.fieldName}-${field.eqfa!.attribute}`)}
                  onChange={(_, isChecked) => {
                    designerDispatch({ type: 'AREA_FIELD', fieldName: `${field.caption}-${field.fieldName}-${field.eqfa!.attribute}`, include: !!isChecked });
                    changes.current = { grid, activeCell, selection, setGridSize, areas, activeArea, showAreaExplorer, previewMode } as IDesignerState;
                  }}
                />
              )
            }
          </>
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
          onChange={(_, option) => option && onChange({ unit: option.key as TUnit, value: size.value })}
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
              onIncrement={getOnChangeColumnSpin(1)}
              onDecrement={getOnChangeColumnSpin(-1)}
              onValidate={getOnChangeColumnSpin()}
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
            {props.children}
            {
              grid.columns.map((c, idx) =>
                <OneSize key={`c${idx}`} label={`Column ${idx}`} size={c} onChange={(size: ISize) => {
                  designerDispatch({ type: 'SET_COLUMN_SIZE', column: idx, size });
                  changes.current = { grid, activeCell, selection, setGridSize, areas, activeArea, showAreaExplorer, previewMode } as IDesignerState;
                }} />
              )
            }
            {
              grid.rows.map((r, idx) =>
                <OneSize key={`r${idx}`} label={`Row ${idx}`} size={r} onChange={(size: ISize) => {
                  designerDispatch({ type: 'SET_ROW_SIZE', row: idx, size });
                  changes.current = { grid, activeCell, selection, setGridSize, areas, activeArea, showAreaExplorer, previewMode } as IDesignerState;
                }} />
              )
            }
          </>
        }
      />
  };

  return (
    <>
      <CommandBar items={commandBarItems[0]} />
      <CommandBar items={commandBarItems[1]} />
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
                grid.columns.map((c, x) => grid.rows.map((r, y) => {
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
                  onClick={() => {
                    designerDispatch({ type: 'CLEAR_SELECTION' });
                    changes.current = { grid, activeCell, selection, setGridSize, areas, activeArea, showAreaExplorer, previewMode } as IDesignerState;
                  }}
                >
                  selection
                </div>
            }
            {
              areas.length
                ? areas.map((area, idx) => (
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
                    onClick={previewMode || activeArea === idx ? undefined : () => {
                      designerDispatch({ type: 'SET_ACTIVE_AREA', activeArea: idx });
                      changes.current = { grid, activeCell, selection, setGridSize, areas, activeArea, showAreaExplorer, previewMode } as IDesignerState;
                    }}
                  >
                    {
                      area.fields.map(f =>
                        <TextField
                          styles={area.direction === 'row'
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
                (areas.length && areas.some(area => inRectangle(activeCell, area.rect)))
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
