import React, { useEffect, useReducer, useRef, Fragment } from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.css';
import { IDesignerProps } from './Designer.types';
import { CommandBar, ICommandBarItemProps, ComboBox, SpinButton, Checkbox, TextField, ChoiceGroup, Label } from 'office-ui-fabric-react';
import { IFieldDef } from 'gdmn-recordset';

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
  group: boolean;
  style: IStyleFieldsAndAreas;
}

type TStyleBorder = 'solid' | 'double' | 'groove' | 'ridge';

interface IBorder {
  width: number;
  style: TStyleBorder;
  color: string;
  radius: number;
}

interface IFont {
  size: number;
  style: string;
  family: string;
  color: string;
}

interface IStyleFieldsAndAreas {
  padding: number;
  margin: number;
  font: IFont;
  background: string;
  border: IBorder;
  align: string;
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
  changeArray: IDesignerState[];
  previewMode?: boolean;
  format?: boolean;
  activeTab: string;
};

type Action = { type: 'SET_ACTIVE_CELL', activeCell: ICoord, shiftKey: boolean }
  | { type: 'SET_ACTIVE_AREA', activeArea: number, shiftKey: boolean }
  | { type: 'SET_COLUMN_SIZE', column: number, size: ISize }
  | { type: 'SET_ROW_SIZE', row: number, size: ISize }
  | { type: 'SET_STYLE_AREA', style: IStyleFieldsAndAreas }
  | { type: 'AREA_FIELD', fieldName: string, include: boolean }
  | { type: 'CONFIGURE_AREA', rect?: IRectangle, direction?: TDirection }
  | { type: 'PREVIEW_MODE' }
  | { type: 'TOGGLE_FORMAT' }
  | { type: 'SET_ACTIVE_TAB', tab: string }
  | { type: 'TOGGLE_SET_GRID_SIZE' }
  | { type: 'TOGGLE_SHOW_AREA_EXPLORER' }
  | { type: 'ADD_COLUMN' }
  | { type: 'ADD_ROW' }
  | { type: 'DELETE_COLUMN' }
  | { type: 'DELETE_ROW' }
  | { type: 'CREATE_GROUP' }
  | { type: 'DELETE_GROUP' }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'CANCEL_CHANGES', entityName: string, fields: IFieldDef[] | undefined }
  | { type: 'RETURN_CHANGES', entityName: string, fields: IFieldDef[] | undefined }
  | { type: 'CLEAR' }
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
      const { activeArea, shiftKey } = action;
      const { areas, activeArea: prevActiveArea, selection } = state;

      if (activeArea >= 0 && activeArea <= (areas.length - 1) && prevActiveArea !== undefined) {
        const area = areas[activeArea];
        const prevArea = areas[prevActiveArea];
        if (!shiftKey) {
        return {
            ...state,
            activeArea,
            selection: undefined,
          };
        }

        if (!selection) {
          return {
            ...state,
            activeArea,
            selection: {
              left: Math.min(prevArea.rect.left, area.rect.left),
              top: Math.min(prevArea.rect.top, area.rect.top),
              right: Math.max(prevArea.rect.right, area.rect.right),
              bottom: Math.max(prevArea.rect.bottom, area.rect.bottom),
            },
          };
        } else {
          return {
            ...state,
            activeArea,
            selection: {
              left: Math.min(selection.left, area.rect.left),
              top: Math.min(selection.top, area.rect.top),
              right: Math.max(selection.right, area.rect.right),
              bottom: Math.max(selection.bottom, area.rect.bottom),
            },
          };
        }
      } else if (activeArea >= 0 && activeArea <= areas.length - 1) {
        return {
          ...state,
          activeArea
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
      const { areas, activeArea, grid, changeArray } = state;

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
          changeArray: [...changeArray!, {...state}]
      } 
    } else {
        return state;
      }
  }

    case 'CLEAR_SELECTION': {
      const { changeArray } = state;
      return {
        ...state,
        selection: undefined,
        changeArray: [...changeArray!, {...state}] 
    }
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
          format: false,
          setGridSize: false,
          showAreaExplorer: false,
        };
      }
    }

    case 'TOGGLE_FORMAT': {
      const { format } = state;
      if(format) {
        return {
          ...state,
          format: false
        }
      }
      return {
        ...state,
        format: true,
        previewMode: false,
        setGridSize: false,
        showAreaExplorer: false,
      };
    }

    case 'SET_ACTIVE_TAB': {
      const { tab } = action;
      return {
        ...state,
        activeTab: tab
      };
    }

    case 'AREA_FIELD': {
      const { activeArea, areas, changeArray } = state;
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
        changeArray: [...changeArray!, {...state}]
    }
  }

    case 'CREATE_GROUP': {
      const { selection, areas, changeArray } = state;
      if (selection) {
        const selectAreas = areas
          .filter(area =>
            !area.group
            && selection.left <= area.rect.left
            && selection.right >= area.rect.right
            && selection.top <= area.rect.top
            && selection.bottom >= area.rect.bottom
            && area.fields)
        const fields = selectAreas.reduce( (prevFields, currArea) => [...currArea.fields, ...prevFields], [] as string[])
          return {
            ...state,
            areas: [
              ...areas,
              { rect: selection,
                fields: Array.from(new Set(fields)),
                direction: selectAreas.length !== 0 ? selectAreas[0].direction : 'column',
                group: !!selection,
                style: {
                  padding: 4,
                  margin: 0,
                  font: {
                    size: 14,
                    style: 'normal',
                    family: 'Lucida Calligraphy',
                    color: '#ff0088'
                  },
                  background: '#50ff00',
                  border: {
                    width: 1,
                    style: 'double',
                    color: '#0088ff',
                    radius: 3
                  },
                  align: 'center'
                }
              }],
            activeArea: state.areas.length,
            selection: undefined,
            showAreaExplorer: true,
            setGridSize: false,
            format: false,
            changeArray: [...changeArray!, {...state}]
        }
      }
    }


    case 'DELETE_GROUP': {
      const { areas, activeArea, changeArray } = state;

      if (!areas.length || activeArea === undefined) {
        return state;
      }

      return {
        ...state,
        activeArea: areas.findIndex(area => area.rect.left === areas[activeArea].rect.left && area.rect.top === areas[activeArea].rect.top),
        areas: areas.slice(0, activeArea).concat(areas.slice(activeArea + 1)),
        changeArray: [...changeArray!, {...state}]
    }
  }

    case 'SET_COLUMN_SIZE': {
      const { grid, changeArray } = state;
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
        changeArray: [...changeArray!, {...state}]
      }
    }

    case 'SET_ROW_SIZE': {
      const { grid, changeArray } = state;
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
        changeArray: [...changeArray!, {...state}]
      }
    }

    case 'SET_STYLE_AREA': {
      const { areas, activeArea, changeArray } = state;
      const { style } = action;

      const newAreas = [...areas];
      newAreas[activeArea!] = {...newAreas[activeArea!], style}
      return {
        ...state,
        areas: newAreas,
        changeArray: [...changeArray!, {...state}]
      }
    }

    case 'TOGGLE_SET_GRID_SIZE': {
      return {
        ...state,
        setGridSize: !state.setGridSize,
        showAreaExplorer: !state.setGridSize ? undefined : state.showAreaExplorer,
      }
    }

    case 'TOGGLE_SHOW_AREA_EXPLORER': {
      return {
        ...state,
        setGridSize: !state.showAreaExplorer ? undefined : state.setGridSize,
        showAreaExplorer: !state.showAreaExplorer,
      }
    }

    case 'ADD_COLUMN': {
      const { grid, activeCell: { x }, areas, changeArray } = state;
      const newAreas = grid.rows.map((_, row) => {
        return {
          rect: {
            left: grid.columns.length,
            top: row,
            right: grid.columns.length,
            bottom: row
          },
          fields: [],
          direction: 'column',
          group: false,
          style: {
            padding: 4,
            margin: 0,
            font: {
              size: 14,
              style: 'normal',
              family: 'Lucida Calligraphy',
              color: '#ff0088'
            },
            background: '#50ff00',
            border: {
              width: 1,
              style: 'double',
              color: '#0088ff',
              radius: 3
            },
            align: 'center'
          }
        } as IArea;
      });
      return {
        ...state,
        grid: {
          ...grid,
          columns: [...grid.columns.slice(0, x + 1), { unit: 'AUTO', value: 1 }, ...grid.columns.slice(x + 1)]
        },
        areas: [...areas, ...newAreas],
        changeArray: [...changeArray!, {...state}]
      }
    }

    case 'ADD_ROW': {
      const { grid, activeCell: { y }, areas, changeArray } = state;
      const newAreas = grid.columns.map((_, column) => {
        return {
          rect: {
            left: column,
            top: grid.rows.length,
            right: column,
            bottom: grid.rows.length
          },
          fields: [],
          direction: 'column',
          group: false,
          style: {
            padding: 4,
            margin: 0,
            font: {
              size: 14,
              style: 'normal',
              family: 'Lucida Calligraphy',
              color: '#ff0088'
            },
            background: '#50ff00',
            border: {
              width: 1,
              style: 'double',
              color: '#0088ff',
              radius: 3
            },
            align: 'center'
          }
        } as IArea;
      });
      return {
        ...state,
        grid: {
          ...grid,
          rows: [...grid.rows.slice(0, y + 1), { unit: 'AUTO', value: 1 }, ...grid.rows.slice(y + 1)]
        },
      changeArray: [...changeArray!, {...state}],
      areas: [...areas, ...newAreas]
    }
  }
  


    case 'DELETE_COLUMN': {
      const { grid, selection, areas, activeArea, activeCell: { x, y }, changeArray } = state;

      if (grid.columns.length === 1 || selection) {
        return state;
      }

      const active = areas.find((_, idx) => idx === activeArea);
      const newAreas = areas
        .filter(area => activeArea !== undefined && (area.rect.left < active!.rect.left || area.rect.right > active!.rect.left))
        .map(area => area.rect.right >= active!.rect.left ? { ...area, rect: { ...area.rect, right: area.rect.right - 1 } } : area)
        .map(area => area.rect.left >= active!.rect.left ? { ...area, rect: { ...area.rect, left: area.rect.left - 1 } } : area);

      return {
        ...state,
        grid: {
          ...grid,
          columns: [...grid.columns.slice(0, active ? active.rect.left : x), ...grid.columns.slice(active ? active.rect.left + 1 : x + 1)]
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
        changeArray: [...changeArray!, {...state}]
      }
    }

    case 'DELETE_ROW': {
      const { grid, selection, areas, activeArea, activeCell: { x, y }, changeArray } = state;

      if (grid.rows.length === 1 || selection) {
        return state;
      }

      const active = areas.find((_, idx) => idx === activeArea);
      const newAreas = areas
        .filter(area => activeArea !== undefined && !(active!.rect.top === area.rect.top && area.rect.top === area.rect.bottom))
        .map(area => area.rect.bottom >= active!.rect.top ? { ...area, rect: { ...area.rect, bottom: area.rect.bottom - 1 } } : area)
        .map(area => area.rect.top >= active!.rect.top ? { ...area, rect: { ...area.rect, top: area.rect.top - 1 } } : area);

      return {
        ...state,
        grid: {
          ...grid,
          rows: [...grid.rows.slice(0, active ? active.rect.top : y), ...grid.rows.slice(active ? active.rect.top + 1 : y + 1)]
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
            changeArray: [...changeArray!, {...state}]
      }
    }

    case 'CANCEL_CHANGES': {
      const {changeArray} = state;
      const localState = changeArray[changeArray.length - 1];
      if (localState) {
        return {
          ...state,
          grid: localState.grid,
          entityName: localState.entityName,
          areas: localState.areas,
          setGridSize: localState.setGridSize,
          showAreaExplorer: localState.showAreaExplorer,
          previewMode: localState.previewMode,
          format: localState.format,
          changeArray: localState.changeArray
        }
      } else {
        return state;
      }
    }

    case 'RETURN_CHANGES': {
      const { entityName, fields } = action;
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
          format: localState.format,
          changeArray: []
        }
      } else {
        return {
          grid: {
            columns: [{ unit: 'PX', value: 350 }, { unit: 'AUTO', value: 1 }],
            rows: [{ unit: 'AUTO', value: 1 }],
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
            direction: 'column',
            group: false,
            style: {
              padding: 4,
              margin: 0,
              font: {
                size: 14,
                style: 'normal',
                family: 'Lucida Calligraphy',
                color: '#ff0088'
              },
              background: '#50ff00',
              border: {
                width: 1,
                style: 'double',
                color: '#0088ff',
                radius: 3
              },
              align: 'center'
            }
          },{
            rect: {
              left: 1,
              top: 0,
              right: 1,
              bottom: 0
            },
            fields: [],
            direction: 'column',
            group: false,
            style: {
              padding: 4,
              margin: 0,
              font: {
                size: 14,
                style: 'normal',
                family: 'Lucida Calligraphy',
                color: '#ff0088'
              },
              background: '#50ff00',
              border: {
                width: 1,
                style: 'double',
                color: '#0088ff',
                radius: 3
              },
              align: 'center'
            }
          }],
          entityName: entityName,
          changeArray: [],
          activeTab: ''
        };
      }
    }

    case 'CLEAR': {
      const { entityName, changeArray } = state;
      return {
        grid: {
          columns: [{ unit: 'AUTO', value: 1 }],
          rows: [{ unit: 'AUTO', value: 1 }],
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
          fields:[],
          direction: 'column',
          group: false,
          style: {
            padding: 4,
            margin: 0,
            font: {
              size: 14,
              style: 'normal',
              family: 'Lucida Calligraphy',
              color: '#ff0088'
            },
            background: '#50ff00',
            border: {
              width: 1,
              style: 'double',
              color: '#0088ff',
              radius: 3
            },
            align: 'center'
          }
        }],
        activeArea: 0,
        showAreaExplorer: true,
        entityName: entityName,
        changeArray: [...changeArray!, {...state}],
        activeTab: 'Настройка'
      };
    }

    case 'SAVE_CHANGES': {
      return {
        ...state,
        changeArray: []
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
  const [{ grid, activeCell, selection, setGridSize, areas, activeArea, showAreaExplorer, previewMode, format, changeArray, activeTab }, designerDispatch] =
    useReducer(reducer, changes.current !== undefined
      ? changes.current
      : localState !== undefined
        ? localState as IDesignerState
        : {
          grid: {
            columns: [{ unit: 'PX', value: 350 }, { unit: 'AUTO', value: 1 }],
            rows: [{ unit: 'AUTO', value: 1 }],
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
            direction: 'column',
            group: false,
            style: {
              padding: 4,
              margin: 0,
              font: {
                size: 14,
                style: 'normal',
                family: 'Lucida Calligraphy',
                color: '#ff0088'
              },
              background: '#50ff00',
              border: {
                width: 1,
                style: 'double',
                color: '#0088ff',
                radius: 3
              },
              align: 'center'
            }
          },{
            rect: {
              left: 1,
              top: 0,
              right: 1,
              bottom: 0
            },
            fields: [],
            direction: 'column',
            group: false,
            style: {
              padding: 4,
              margin: 0,
              font: {
                size: 14,
                style: 'normal',
                family: 'Lucida Calligraphy',
                color: '#ff0088'
              },
              background: '#50ff00',
              border: {
                width: 1,
                style: 'double',
                color: '#0088ff',
                radius: 3
              },
              align: 'center'
            }
          }],
          entityName: entityName,
          showAreaExplorer: true,
          activeArea: 0,
          changeArray: [],
          activeTab: 'Настройка'
        });

  const getGridStyle = (): React.CSSProperties => ({
    display: 'grid',
    width: '100%',
    gridTemplateColumns: grid.columns.map(c => c.unit === 'AUTO' ? 'auto' : `${c.value ? c.value : 1}${c.unit}`).join(' '),
    gridTemplateRows: grid.rows.map(r => r.unit === 'AUTO' ? 'auto' : `${r.value ? r.value : 1}${r.unit}`).join(' '),
    height: '86%',
    overflow: 'auto'
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
          iconName: 'InsertColumnsRight'
        },
        onClick: () => {
          designerDispatch({ type: 'ADD_COLUMN' });
          changes.current = { grid, activeCell, selection, setGridSize, areas, activeArea, showAreaExplorer, previewMode, format } as IDesignerState;
        }
      },
      {
        key: 'deleteColumn',
        disabled: previewMode || grid.columns.length <= 1 || !!selection,
        text: 'Удалить колонку',
        iconProps: {
          iconName: 'DeleteColumns'
        },
        onClick: () => {
          designerDispatch({ type: 'DELETE_COLUMN' });
          changes.current = { grid, activeCell, selection, setGridSize, areas, activeArea, showAreaExplorer, previewMode, format } as IDesignerState;
        }
      },
      {
        key: 'addRow',
        disabled: previewMode,
        text: 'Добавить строку',
        iconProps: {
          iconName: 'InsertRowsBelow'
        },
        onClick: () => {
          designerDispatch({ type: 'ADD_ROW' });
          changes.current = { grid, activeCell, selection, setGridSize, areas, activeArea, showAreaExplorer, previewMode, format } as IDesignerState;
        }
      },
      {
        key: 'deleteRow',
        disabled: previewMode || grid.rows.length <= 1 || !!selection,
        text: 'Удалить строку',
        iconProps: {
          iconName: 'DeleteRows'
        },
        onClick: () => {
          designerDispatch({ type: 'DELETE_ROW' });
          changes.current = { grid, activeCell, selection, setGridSize, areas, activeArea, showAreaExplorer, previewMode, format } as IDesignerState;
        }

      },
      {
        key: 'createArea',
        disabled: previewMode || !selection,
        text: 'Сгруппировать',
        iconProps: {
          iconName: 'GroupObject'
        },
        onClick: () => {
          designerDispatch({ type: 'CREATE_GROUP' });
          changes.current = { grid, activeCell, selection, setGridSize, areas, activeArea, showAreaExplorer, previewMode, format } as IDesignerState;
        }
      },
      {
        key: 'deleteArea',
        disabled: previewMode
          || (activeArea !== undefined
            && areas[activeArea].rect.bottom === areas[activeArea].rect.top
            && areas[activeArea].rect.right === areas[activeArea].rect.left),
        text: 'Разгруппировать',
        iconProps: {
          iconName: 'UngroupObject'
        },
        onClick: () => {
          designerDispatch({ type: 'DELETE_GROUP' });
          changes.current = { grid, activeCell, selection, setGridSize, areas, activeArea, showAreaExplorer, previewMode, format } as IDesignerState;
        }
      },
      {
        key: 'toggleSetGridSize',
        disabled: previewMode,
        checked: !!setGridSize,
        text: 'Установить размер',
        iconProps: {
          iconName: 'BackToWindow'
        },
        onClick: () => {
          designerDispatch({ type: 'TOGGLE_SET_GRID_SIZE' });
          changes.current = { grid, activeCell, selection, setGridSize, areas, activeArea, showAreaExplorer, previewMode, format } as IDesignerState;
        }
      },
      {
        key: 'toggleShowAreaExplorer',
        disabled: previewMode || activeArea === undefined,
        text: 'Настройка',
        iconProps: {
          iconName: 'Settings'
        },
        onClick: () => {
          designerDispatch({ type: 'TOGGLE_SHOW_AREA_EXPLORER' });
          changes.current = { grid, activeCell, selection, setGridSize, areas, activeArea, showAreaExplorer, previewMode, format } as IDesignerState;
        }
      },
      {
        key: 'previewMode',
        disabled: !areas.length,
        checked: !!previewMode,
        text: 'Просмотр',
        iconProps: {
          iconName: 'Tiles'
        },
        onClick: () => {
          designerDispatch({ type: 'PREVIEW_MODE' });
        }
      },
      {
        key: 'toggleFormat',
        text: 'Форматирование',
        iconProps: {
          iconName: 'FabricTextHighlight'
        },
        onClick: () => {
          designerDispatch({ type: 'TOGGLE_FORMAT' });
        }
      }
    ],
    [
      {
        key: 'saveAndClose',
        disabled: changeArray && changeArray.length === 0,
        text: 'Сохранить',
        iconProps: {
          iconName: 'Save'
        },
        onClick: () => {
          changes.current = undefined;
          localStorage.setItem(`des-${entityName}`, JSON.stringify({ grid, activeCell, selection, setGridSize, areas, activeArea, showAreaExplorer, previewMode, changeArray: [] }));
          designerDispatch({ type: 'SAVE_CHANGES' });
          props.outDesigner();
        }
      },

      {
        key: 'cancelAndClose',
        text: 'Закрыть',
        iconProps: {
          iconName: 'Cancel'
        },
        onClick: () => {
          changes.current = undefined;
          props.outDesigner();
        }
      },
      {
        key: 'revert',
        disabled: changeArray && changeArray.length === 0,
        text: 'Отменить шаг',
        iconProps: {
          iconName: 'Undo'
        },
        onClick: () => {
          changes.current = undefined;
          designerDispatch({ type: 'CANCEL_CHANGES', entityName: `des-${entityName}`, fields });
        }
      },
      {
        key: 'return',
        disabled: changeArray && changeArray.length === 0,
        text: 'Вернуть',
        iconProps: {
          iconName: 'ReturnToSession'
        },
        onClick: () => {
          changes.current = undefined;
          designerDispatch({ type: 'RETURN_CHANGES', entityName: `des-${entityName}`, fields });
        }
      },
      {
        key: 'clear',
        text: 'Очистить',
        iconProps: {
          iconName: 'Broom'
        },
        onClick: () => {
          changes.current = undefined;
          designerDispatch({ type: 'CLEAR' });
        }
      }
    ]
];

  const getOnMouseDown = (x: number, y: number) => (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    e.preventDefault();
    designerDispatch({ type: 'SET_ACTIVE_CELL', activeCell: { x, y }, shiftKey: e.shiftKey });
    changes.current = { grid, activeCell, selection, setGridSize, areas, activeArea, showAreaExplorer, previewMode, format } as IDesignerState;
  };

  const getOnMouseDownForArea = (idx: number) => (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    e.preventDefault();
    designerDispatch({ type: 'SET_ACTIVE_AREA', activeArea: idx, shiftKey: e.shiftKey });
    changes.current = { grid, activeCell, selection, setGridSize, areas, activeArea, showAreaExplorer, previewMode, format } as IDesignerState;
  };

  const WithToolPanel = (props: { children: JSX.Element, toolPanel: JSX.Element }): JSX.Element => {
    return (
      <div style={{
        display: 'grid',
        width: '100%',
        height: '100%',
        gridTemplateColumns: !setGridSize ? 'auto 360px' : 'auto 240px',
        gridTemplateRows: 'auto',
        gridAutoFlow: 'column',
     }}>
        <div style={{
          width: '100%',
          height: '100%',
          gridArea: '1 / 1 / 2 / 2',
          margin: '1px',
          padding: '4px',
          overflow: 'auto'
      }}>
          {props.children}
        </div>
        <div style={{
          width: '100%',
          height: '87%',
          gridArea: '1 / 2 / 2 / 3',
          padding: '4px',
          overflow: 'auto'
        }}>
          <div style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid violet',
            borderRadius: '4px',
            justifyContent: 'center',
            padding: '0px 8px'
          }}>
            {props.toolPanel}
          </div>
        </div>
      </div>
    );
  };

  const WithAreaExplorer = CSSModules((props: { children: JSX.Element }): JSX.Element => {
    //if (!showAreaExplorer || activeArea === undefined) {
      return props.children;
    /*}

    const area = areas[activeArea];

    return !showAreaExplorer || activeArea === undefined ? props.children :
      <WithToolPanel
        {...props}
        toolPanel={
          <>
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
              onChange={(_, option) =>
                option
                && designerDispatch({ type: 'CONFIGURE_AREA', direction: option.key as TDirection })
                && (changes.current = { grid, activeCell, selection, setGridSize, areas, activeArea, showAreaExplorer, previewMode, format } as IDesignerState)
              }
            />
          </>
        }
      />*/
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
                  width: '104px'
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

  const WithSetting = (props: { children: JSX.Element }): JSX.Element => {
      const tabs = ['Настройка', 'Поля'];
      const style = areas[activeArea!].style;
      
      return (
        <WithToolPanel
        {...props}
        toolPanel={
          <>
          <div className="SignInForm">
            <div className="SignInFormTabs"
              style={{
                width: '100%',
                height: '32px',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-start'
              }}
            >
              {tabs.map(t =>
                t === activeTab ? (
                  <Fragment key={t}>
                    <div
                      className="SettingFormTab"
                      onClick={() => designerDispatch({ type: 'SET_ACTIVE_TAB', tab: t }) }
                      style={{
                        backgroundColor: 'white',
                        color: '#404040',
                        minWidth: '96px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start'
                      }}
                    >
                      <div
                        className="SettingFormActiveColor"
                        style={{
                          height: '5px',
                          backgroundImage: 'linear-gradient(lime, white)',
                          borderLeft: '1px solid #404040',
                          borderRight: '1px solid #404040'
                        }}
                      />
                      <div
                        className="SettingFormTabText SignInFormActiveTab"
                        style={{
                          flex: '1 0 auto',
                          height: '30px',
                          padding: '2px 4px 0px 4px',
                          textAlign: 'center',
                          borderLeft: '1px solid #404040',
                          borderRight: '1px solid #404040'
                        }}
                      >{t}</div>
                    </div>
                    <div
                      className="SettingFormTabSpace"
                      style={{
                        minWidth: '4px',
                        backgroundColor: 'transparent',
                        borderBottom: '1px solid #404040',
                        flex: '0 0 initial'
                      }}
                    />
                  </Fragment>
                ) : (
                    <Fragment key={t}>
                      <div
                        className="SettingFormTab"
                        onClick={() => designerDispatch({ type: 'SET_ACTIVE_TAB', tab: t }) }
                        style={{
                          backgroundColor: 'white',
                          color: '#404040',
                          minWidth: '96px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'flex-start'
                        }}
                      >
                        <div
                          className="SettingFormTabText SettingFormInactiveTab"
                          style={{
                            flex: '1 0 auto',
                            height: '30px',
                            padding: '2px 4px 0px 4px',
                            textAlign: 'center',
                            borderLeft: '1px solid #404040',
                            borderRight: '1px solid #404040',
                            borderTop: '1px solid #404040'
                          }}
                        >{t}</div>
                        <div
                          className="SettingFormInactiveShadow"
                          style={{
                            height: '6px',
                            flex: '0 0 initial',
                            justifySelf: 'flex-end',
                            backgroundImage: 'linear-gradient(white, silver)',
                            borderLeft: '1px solid #404040',
                            borderRight: '1px solid #404040',
                            borderBottom: '1px solid #404040'
                          }}
                        />
                      </div>
                      <div
                        className="SettingFormTabSpace"
                        style={{
                          minWidth: '4px',
                          backgroundColor: 'transparent',
                          borderBottom: '1px solid #404040',
                          flex: '0 0 initial'
                        }}
                      />
                    </Fragment>
                  )
              )}
              <div
                className="SettingFormRestSpace"
                style={{
                  backgroundColor: 'transparent',
                  borderBottom: '1px solid #404040',
                  flex: '1 1 auto',
                  justifySelf: 'flex-end'
                }}
              />
            </div>
            <div
              className="SettingFormBody"
              style={{
                width: '100%',
                backgroundColor: 'white',
                flex: '1 1 auto',
                borderLeft: '1px solid #404040',
                borderRight: '1px solid #404040',
                borderBottom: '1px solid #404040',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                padding: '12px'
              }}
            >
              {activeTab === 'Настройка' ? (
                <>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      marginBottom: '4px'
                    }}
                  >
                    <div>
                      <Label>
                        Padding
                      </Label>
                      <TextField
                        key='padding'
                        value={style.padding.toString()}
                        onChange={(e) => {
                          designerDispatch({ type: 'SET_STYLE_AREA', style: {...style, padding: Number(e.currentTarget.value)} });
                        }}
                      />
                    </div>
                    <div>
                      <Label>
                        Margin
                      </Label>
                      <TextField
                        key='margin'
                        value={style.margin.toString()}
                        onChange={(e) => {
                          designerDispatch({ type: 'SET_STYLE_AREA', style: {...style, margin: Number(e.currentTarget.value)} });
                        }}
                      />
                    </div>
                    <div>
                      <Label>
                        Align
                      </Label>
                      <TextField
                        key='align'
                        value={style.align.toString()}
                        onChange={(e) => {
                          designerDispatch({ type: 'SET_STYLE_AREA', style: {...style, align: e.currentTarget.value} });
                        }}
                      />
                    </div>
                    <div>
                      <Label>
                        Background
                      </Label>
                      <TextField
                        key='background'
                        value={style.background.toString()}
                        onChange={(e) => {
                          designerDispatch({ type: 'SET_STYLE_AREA', style: {...style, background: e.currentTarget.value} });
                        }}
                      />
                    </div>
                    <div>
                      <Label>
                        Font
                      </Label>
                      <div>
                        <Label>
                          Size
                        </Label>
                        <TextField
                          key='font-size'
                          value={style.font.size.toString()}
                          onChange={(e) => {
                            designerDispatch({ type: 'SET_STYLE_AREA', style: {...style, font: {...style.font, size: Number(e.currentTarget.value)}} });
                          }}
                        />
                      </div>
                      <div>
                        <Label>
                          Color
                        </Label>
                        <TextField
                          key='font-color'
                          value={style.font.color.toString()}
                          onChange={(e) => {
                            designerDispatch({ type: 'SET_STYLE_AREA', style: {...style, font: {...style.font, color: e.currentTarget.value}} });
                          }}
                        />
                      </div>
                      <div>
                        <Label>
                          Family
                        </Label>
                        <TextField
                          key='font-family'
                          value={style.font.family.toString()}
                          onChange={(e) => {
                            designerDispatch({ type: 'SET_STYLE_AREA', style: {...style, font: {...style.font, family: e.currentTarget.value}} });
                          }}
                        />
                      </div>
                      <div>
                        <Label>
                          Style
                        </Label>
                        <TextField
                          key='font-style'
                          value={style.font.style.toString()}
                          onChange={(e) => {
                            designerDispatch({ type: 'SET_STYLE_AREA', style: {...style, font: {...style.font, style: e.currentTarget.value}} });
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>
                        Border
                      </Label>
                      <div>
                        <Label>
                          Color
                        </Label>
                        <TextField
                          key='border-color'
                          value={style.border.color.toString()}
                          onChange={(e) => {
                            designerDispatch({ type: 'SET_STYLE_AREA', style: {...style, border: {...style.border, color: e.currentTarget.value}} });
                          }}
                        />
                      </div>
                      <div>
                        <Label>
                          Width
                        </Label>
                        <TextField
                          key='border-width'
                          value={style.border.width.toString()}
                          onChange={(e) => {
                            designerDispatch({ type: 'SET_STYLE_AREA', style: {...style, border: {...style.border, width: Number(e.currentTarget.value)}} });
                          }}
                        />
                      </div>
                      <div>
                        <Label>
                          Style
                        </Label>
                        <TextField
                          key='border-style'
                          value={style.border.style.toString()}
                          onChange={(e) => {
                            /*e.currentTarget.value === TStyleBorder[0] || e.currentTarget.value === TStyleBorder[1] ?
                            designerDispatch({ type: 'SET_STYLE_AREA', style: {...style, border: {...style.border, style: e.currentTarget.value}} })
                            : undefined*/
                          }}
                        />
                      </div>
                      <div>
                        <Label>
                          Radius
                        </Label>
                        <TextField
                          key='border-radius'
                          value={style.border.radius.toString()}
                          onChange={(e) => {
                            designerDispatch({ type: 'SET_STYLE_AREA', style: {...style, border: {...style.border, radius: Number(e.currentTarget.value)}} });
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>
                        Align
                      </Label>
                    </div>
                  </div>
                </>
              ) : (
                  <>
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
                          checked={!!areas[activeArea!].fields.find(areaF => areaF === `${field.caption}-${field.fieldName}-${field.eqfa!.attribute}`)}
                          onChange={(_, isChecked) => {
                            designerDispatch({ type: 'AREA_FIELD', fieldName: `${field.caption}-${field.fieldName}-${field.eqfa!.attribute}`, include: !!isChecked });
                            changes.current = { grid, activeCell, selection, setGridSize, areas, activeArea, showAreaExplorer, previewMode, format } as IDesignerState;
                          }}
                        />
                      )
                    }
                  </>
                )}
            </div>
          </div>
          </>
          /*
          <>
            <div onClick={() => designerDispatch({ type: 'TOGGLE_FORMAT' })}>Format</div>
            <div onClick={() => designerDispatch({ type: 'TOGGLE_FIELD' })}>Setting</div>
            <div>Show format text and field in grid</div>
          </>*/
        }
        />
      );

    return !setGridSize ? props.children :
      <WithToolPanel
        {...props}
        toolPanel={
          <>
            {!setGridSize ? props.children : undefined}
            {
              grid.columns.map((c, idx) =>
                <OneSize key={`c${idx}`} label={`Column ${idx}`} size={c} onChange={(size: ISize) => {
                  designerDispatch({ type: 'SET_COLUMN_SIZE', column: idx, size });
                  changes.current = { grid, activeCell, selection, setGridSize, areas, activeArea, showAreaExplorer, previewMode, format } as IDesignerState;
                }} />
              )
            }
            {
              grid.rows.map((r, idx) =>
                <OneSize key={`r${idx}`} label={`Row ${idx}`} size={r} onChange={(size: ISize) => {
                  designerDispatch({ type: 'SET_ROW_SIZE', row: idx, size });
                  changes.current = { grid, activeCell, selection, setGridSize, areas, activeArea, showAreaExplorer, previewMode, format } as IDesignerState;
                }} />
              )
            }
          </>
        }
      />
  };

  const areasGroups = areas.filter(areaIsGroup => areaIsGroup.group);
  const showAreas = areas.some(area => area.group) ? areas.filter(area =>
    !areasGroups
    .some(group => group !== area
      && group.rect.left <= area.rect.right
      && group.rect.right >= area.rect.left
      && group.rect.top <= area.rect.bottom
      && group.rect.bottom >= area.rect.top)
    ).concat(...areasGroups.filter(area =>
      !areasGroups
      .some(group => group !== area
        && group.rect.left <= area.rect.left
        && group.rect.right >= area.rect.right
        && group.rect.top <= area.rect.top
        && group.rect.bottom >= area.rect.bottom)
      ))
      : areas;

  return (
    <>
      <CommandBar items={commandBarItems[0]} />
      <CommandBar items={commandBarItems[1]} />
      <WithAreaExplorer>
        <WithSetting>
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
              areas.length
                ? areas
                  .map((area, idx) => (
                    showAreas.find(findArea => area === findArea) ? 
                  <div
                    key={`${area.rect.top}-${area.rect.left}-${area.rect.bottom}-${area.rect.right}`}
                    styleName={
                      previewMode
                        ? "commonStyle"
                        : activeArea === idx
                          ? "commonStyle activeArea"
                          : "commonStyle area"
                    }
                    onMouseDown={getOnMouseDownForArea(idx)}
                  >
                    {
                      area.fields.map(f =>
                        <TextField
                          styles={area.direction === 'row'
                            ? {
                              root: {
                                flexGrow: 1
                              },
                              field: {
                                border: `${area.style.border.width}px ${area.style.border.style} ${area.style.border.color}`,
                                fontSize: `${area.style.font.size}`,
                                background: `${area.style.background}`,
                                borderRadius: `${area.style.border.radius}px`
                              }
                            }
                            : {
                              root: {
                                flexGrow: 0
                              },
                              field: {
                                border: `${area.style.border.width}px ${area.style.border.style} ${area.style.border.color}`,
                                fontSize: `${area.style.font.size}`,
                                background: `${area.style.background}`,
                                borderRadius: `${area.style.border.radius}px`
                              }
                            }
                          }
                          key={f}
                          label={f}
                        />
                      )
                    }
                  </div>
                : null
              ))
            : null
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
                    changes.current = { grid, activeCell, selection, setGridSize, areas, activeArea, showAreaExplorer, previewMode, format } as IDesignerState;
                  }}
                >
                  selection
                </div>
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
        </WithSetting>
      </WithAreaExplorer>
    </>
  );
}, styles, { allowMultiple: true });
