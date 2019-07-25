import React, { useEffect, useReducer, useRef, useState, Fragment } from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.css';
import { IDesignerProps } from './Designer.types';
import { CommandBar, ICommandBarItemProps, ComboBox, SpinButton, Checkbox, TextField, Label, DefaultButton } from 'office-ui-fabric-react';
import { IFieldDef } from 'gdmn-recordset';
import { ChromePicker  } from 'react-color';

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

type TDirection = 'row' | 'column';

interface IArea {
  rect: IRectangle;
  fields: string[];
  direction: TDirection;
  group: boolean;
  style: IStyleFieldsAndAreas;
}

const StyleBorder = ['none', 'solid', 'double', 'groove', 'ridge', 'dashed', 'dotted', 'inset', 'outset'];
const FamilyFont = ["Times New Roman, serif", "Arial, sans-serif", "Courier New, monospace", "Bickley Script, cursive, serif", "Euclid Fraktur, fantasy, serif", "Lucida Console, Monaco, monospace"];
const StyleFont = ["normal", "italic"];
const WeightFont = ["normal", "bold"];

interface IBorder {
  width: number;
  style: string;
  color: string;
  radius: number;
}

interface IFont {
  size: number;
  style: string;
  family: string;
  color: string;
  weight: string;
}

interface IStyleFieldsAndAreas {
  padding: number;
  margin: number;
  font: IFont;
  background: string;
  border: IBorder;
  align: string;
}

export interface IDesignerState {
  grid: IGridSize;
  entityName: string;
  selection?: IRectangle;
  areas: IArea[];
  activeArea: number;
  changeArray: IDesignerState[];
  previewMode?: boolean;
  activeTab: string;
};

const ButtonExample = (props: {color: string, onChangeColor: (color: string) => void}): JSX.Element => {
  const [displayColorPicker, onChange] = useState(false);

  const handleClick = () => {
    onChange(!displayColorPicker)
  };

  const handleClose = () => {
    onChange( false )
  };

    return (
      <div>
        <DefaultButton onClick={() => handleClick() }>Select</DefaultButton>
        { displayColorPicker ?
          <>
            <div
              onClick={() => handleClose() }
            />
              <ChromePicker color={ props.color } onChangeComplete={(c) => props.onChangeColor(c.hex) } />
          </> : null }
      </div>
    )
  }

  type Action = { type: 'SET_ACTIVE_AREA', activeArea: number, shiftKey: boolean }
  | { type: 'SET_COLUMN_SIZE', column: number, size: ISize }
  | { type: 'SET_ROW_SIZE', row: number, size: ISize }
  | { type: 'SET_STYLE_AREA', style: IStyleFieldsAndAreas }
  | { type: 'AREA_FIELD', fieldName: string, include: boolean }
  | { type: 'CONFIGURE_AREA', rect?: IRectangle, direction?: TDirection }
  | { type: 'PREVIEW_MODE' }
  | { type: 'SET_ACTIVE_TAB', tab: string }
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
          activeArea: 0,
        }
      }
    }

    case 'CONFIGURE_AREA': {
      const { direction, rect } = action;
      const { areas, activeArea, grid, changeArray } = state;

      if (activeArea >= 0 && activeArea <= (areas.length - 1)) {
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
          previewMode: true
        };
      }
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
                    family: 'Arial, sans-serif',
                    color: '#000000',
                    weight: 'normal'
                  },
                  background: '#DBE5FF',
                  border: {
                    width: 1,
                    style: 'none',
                    color: '#323130',
                    radius: 3
                  },
                  align: 'center'
                }
              }],
            activeArea: state.areas.length,
            selection: undefined,
            changeArray: [...changeArray!, {...state}]
        }
      }
    }


    case 'DELETE_GROUP': {
      const { areas, activeArea, changeArray } = state;

      if (!areas.length) {
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
      newAreas[activeArea] = {...newAreas[activeArea], style}
      return {
        ...state,
        areas: newAreas,
        changeArray: [...changeArray!, {...state}]
      }
    }

    case 'ADD_COLUMN': {
      const { grid, areas, activeArea, changeArray } = state;
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
              family: 'Arial, sans-serif',
              color: '#000000',
              weight: 'normal'
            },
            background: '#FFFFFF',
            border: {
              width: 1,
              style: 'none',
              color: '#323130',
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
          columns: [...grid.columns.slice(0, areas[activeArea].rect.right + 1), { unit: 'FR', value: 1 }, ...grid.columns.slice(areas[activeArea].rect.right + 1)]
        },
        areas: [...areas, ...newAreas],
        changeArray: [...changeArray!, {...state}]
      }
    }

    case 'ADD_ROW': {
      const { grid, areas, activeArea, changeArray } = state;
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
              family: 'Arial, sans-serif',
              color: '#000000',
              weight: 'normal'
            },
            background: '#FFFFFF',
            border: {
              width: 1,
              style: 'none',
              color: '#323130',
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
          rows: [...grid.rows.slice(0, areas[activeArea].rect.bottom + 1), { unit: 'FR', value: 1 }, ...grid.rows.slice(areas[activeArea].rect.bottom + 1)]
        },
      changeArray: [...changeArray!, {...state}],
      areas: [...areas, ...newAreas]
    }
  }
  


    case 'DELETE_COLUMN': {
      const { grid, selection, areas, activeArea, changeArray } = state;

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
          columns: [...grid.columns.slice(0, active!.rect.left), ...grid.columns.slice( active!.rect.left + 1 )]
        },
        areas: newAreas,
        activeArea: !newAreas.length
          ? 0
          : activeArea < newAreas.length
            ? activeArea
            : 0,
        changeArray: [...changeArray!, {...state}]
      }
    }

    case 'DELETE_ROW': {
      const { grid, selection, areas, activeArea, changeArray } = state;

      if (grid.rows.length === 1 || selection) {
        return state;
      }

      const active = areas.find((_, idx) => idx === activeArea);
      const newAreas = areas
        .filter(area => !(active!.rect.top === area.rect.top && area.rect.top === area.rect.bottom))
        .map(area => area.rect.bottom >= active!.rect.top ? { ...area, rect: { ...area.rect, bottom: area.rect.bottom - 1 } } : area)
        .map(area => area.rect.top >= active!.rect.top ? { ...area, rect: { ...area.rect, top: area.rect.top - 1 } } : area);

      return {
        ...state,
        grid: {
          ...grid,
          rows: [...grid.rows.slice(0, active!.rect.top), ...grid.rows.slice(active!.rect.top + 1)]
        },
        areas: newAreas,
        activeArea: !newAreas.length
          ? 0
          : activeArea < newAreas.length
            ? activeArea
            : 0,
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
          previewMode: localState.previewMode,
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
          previewMode: localState.previewMode,
          changeArray: []
        }
      } else {
        return {
          grid: {
            columns: [{ unit: 'PX', value: 350 }, { unit: 'FR', value: 1 }],
            rows: [{ unit: 'FR', value: 1 }],
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
                family: 'Arial, sans-serif',
                color: '#000000',
                weight: 'normal'
              },
              background: '#ffffff',
              border: {
                width: 1,
                style: 'none',
                color: '#323130',
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
                family: 'Arial, sans-serif',
                color: '#000000',
                weight: 'normal'
              },
              background: '#ffffff',
              border: {
                width: 1,
                style: 'none',
                color: '#ffffff',
                radius: 3
              },
              align: 'center'
            }
          }],
          entityName: entityName,
          activeArea: 0,
          changeArray: [],
          activeTab: 'Настройка'
        };
      }
    }

    case 'CLEAR': {
      const { entityName, changeArray } = state;
      return {
        grid: {
          columns: [{ unit: 'FR', value: 1 }],
          rows: [{ unit: 'FR', value: 1 }],
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
              family: 'Arial, sans-serif',
              color: '#000000',
              weight: 'normal'
            },
            background: '#ffffff',
            border: {
              width: 1,
              style: 'none',
              color: '#323130',
              radius: 3
            },
            align: 'center'
          }
        }],
        activeArea: 0,
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

let tempSavedScroll = 0;
let tempSavedScrollToolPanel = 0;

export const Designer = CSSModules((props: IDesignerProps): JSX.Element => {

  const { entityName, viewTab, fields } = props;
  
  const getSavedLastEdit = (): IDesignerState | undefined => {
    if (viewTab && viewTab.sessionData && viewTab.sessionData.changesDesigner instanceof Object) {
      return viewTab.sessionData.changesDesigner as IDesignerState;
    }
    return undefined;
  };

  const changes = useRef(getSavedLastEdit());
  const divRef = useRef<HTMLDivElement | null>(null);
  const toolPanelRef = useRef<HTMLDivElement | null>(null);

  const localState = localStorage.getItem(`des-${entityName}`) === null ? undefined : JSON.parse(localStorage.getItem(`des-${entityName}`)!);
  const [{ grid, selection, areas, activeArea, previewMode, changeArray, activeTab }, designerDispatch] =
    useReducer(reducer, changes.current !== undefined
      ? changes.current
      : localState !== undefined
        ? localState as IDesignerState
        : {
          grid: {
            columns: [{ unit: 'PX', value: 350 }, { unit: 'FR', value: 1 }],
            rows: [{ unit: 'FR', value: 1 }],
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
                family: 'Arial, sans-serif',
                color: '#000000',
                weight: 'normal'
              },
              background: '#ffffff',
              border: {
                width: 1,
                style: 'none',
                color: '#ffffff',
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
                family: 'Arial, sans-serif',
                color: '#000000',
                weight: 'normal'
              },
              background: '#ffffff',
              border: {
                width: 1,
                style: 'none',
                color: '#323130',
                radius: 3
              },
              align: 'center'
            }
          }],
          entityName: entityName,
          activeArea: 0,
          changeArray: [],
          activeTab: 'Настройка'
        });

  useEffect( () => {
    if (tempSavedScroll && divRef.current) {
      divRef.current.scrollTop = tempSavedScroll;
    }
  }, [divRef.current]);

  useEffect( () => {
    if (tempSavedScrollToolPanel && toolPanelRef.current) {
      toolPanelRef.current.scrollTop = tempSavedScrollToolPanel;
    }
  }, [toolPanelRef.current]);

  const getGridStyle = (): React.CSSProperties => ({
    display: 'grid',
    width: '100%',
    gridTemplateColumns: grid.columns.map(c => c.unit === 'AUTO' ? 'auto' : `${c.value ? c.value : 1}${c.unit}`).join(' '),
    gridTemplateRows: grid.rows.map(r => r.unit === 'AUTO' ? 'auto' : `${r.value ? r.value : 1}${r.unit}`).join(' '),
    height: '87%',
    overflow: 'auto'
  });

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
          changes.current = { grid, selection, areas, activeArea, previewMode } as IDesignerState;
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
          changes.current = { grid, selection, areas, activeArea, previewMode } as IDesignerState;
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
          changes.current = { grid, selection, areas, activeArea, previewMode } as IDesignerState;
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
          changes.current = { grid, selection, areas, activeArea, previewMode } as IDesignerState;
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
          changes.current = { grid, selection, areas, activeArea, previewMode } as IDesignerState;
        }
      },
      {
        key: 'deleteArea',
        disabled: previewMode
          || areas[activeArea] === undefined || (areas[activeArea]!.rect.bottom === areas[activeArea]!.rect.top
            && areas[activeArea]!.rect.right === areas[activeArea]!.rect.left),
        text: 'Разгруппировать',
        iconProps: {
          iconName: 'UngroupObject'
        },
        onClick: () => {
          designerDispatch({ type: 'DELETE_GROUP' });
          changes.current = { grid, selection, areas, activeArea, previewMode } as IDesignerState;
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
          localStorage.setItem(`des-${entityName}`, JSON.stringify({ grid, selection, areas, activeArea, previewMode, changeArray: [] }));
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

  const getOnMouseDownForArea = (idx: number) => (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    e.preventDefault();
    designerDispatch({ type: 'SET_ACTIVE_AREA', activeArea: idx, shiftKey: e.shiftKey });
    changes.current = { grid, selection, areas, activeArea, previewMode } as IDesignerState;
  };

  const WithToolPanel = (props: { children: JSX.Element, toolPanel: JSX.Element }): JSX.Element => {
    return (
      <div style={{
        display: 'grid',
        width: '100%',
        height: '100%',
        gridTemplateColumns:'auto 360px',
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
        }}
          ref={toolPanelRef}
          onScroll={ (e) => {
            e.currentTarget && (tempSavedScrollToolPanel = e.currentTarget.scrollTop)
          } }
        >
          <div style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
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

    const area = areas[activeArea];
    const tabs = ["Настройка", "Поля"];
    const style = area.style;

    const idc = areas[activeArea].rect.left
    const idr = areas[activeArea].rect.top


    return (
      <WithToolPanel
        {...props}
        toolPanel={
          <div className="SettingForm">
            <div className="SettingFormTabs"
              style={{
                width: '100%',
                height: '32px',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-start'
              }}
            >
              {tabs.map(t =>
                (activeTab === undefined ? (t === 'Настройка') : (t === activeTab)) ? (
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
                      key={t}
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
                        key={t}
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
              { activeTab === undefined || activeTab === 'Настройка' ? (
                <>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      marginBottom: '4px'
                    }}
                    key='Setting'
                  >
                    <div>
                      <Label>Size</Label>
                      <>
                        {
                          <OneSize key='column_size' label='Width' size={grid.columns[idc]} isRow={false} onChange={(size: ISize) => {
                            const left = idc;
                            const right = areas[activeArea].rect.right;
                            if(left === right && size.unit === 'AUTO') {
                              designerDispatch({ type: 'SET_COLUMN_SIZE', column: idc, size });
                              changes.current = { grid, selection, areas, activeArea, previewMode } as IDesignerState;
                            } else {
                              const value = size.value! / (right + 1 - left);
                              for(let i = left; i <= right; i++) {
                                designerDispatch({ type: 'SET_COLUMN_SIZE', column: i, size: {...size, value} });
                                changes.current = { grid, selection, areas, activeArea, previewMode } as IDesignerState;
                              }
                            }
                          }} />
                        }
                        {
                          <OneSize key='row_size' label='Height' size={grid.rows[idr]} isRow={true} onChange={(size: ISize) => {
                            const top = idr;
                            const bottom = areas[activeArea].rect.bottom;
                            if(top === bottom && size.unit === 'AUTO') {
                              designerDispatch({ type: 'SET_ROW_SIZE', row: idr, size });
                              changes.current = { grid, selection, areas, activeArea, previewMode } as IDesignerState;
                            } else {
                              const value = size.value! / (bottom + 1 - top);
                              for(let i = top; i <= bottom; i++) {
                                designerDispatch({ type: 'SET_ROW_SIZE', row: i, size: {...size, value} });
                                changes.current = { grid, selection, areas, activeArea, previewMode } as IDesignerState;
                              }
                            }
                          }} />
                        }
                      </>
                    </div>
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
                      <ButtonExample
                        key='background'
                        color={style.background}
                        onChangeColor={(e) => {
                          designerDispatch({ type: 'SET_STYLE_AREA', style: {...style, background: e} });
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
                        <ButtonExample
                          key='font-color'
                          color={style.font.color}
                          onChangeColor={(e) => {
                            designerDispatch({ type: 'SET_STYLE_AREA', style: {...style, font: {...style.font, color: e}} });
                          }}
                        />
                      </div>
                      <div>
                        <Label>
                          Family
                        </Label>
                        <ComboBox
                          key='font-family'
                          defaultSelectedKey={style.font.family}
                          options={FamilyFont.map(family => ({key: family, text: family}))}
                          onChange={(e, value) => {
                            designerDispatch({ type: 'SET_STYLE_AREA', style: {...style, font: {...style.font, family: value!.text}} })
                          }}
                        />
                      </div>
                      <div>
                        <Label>
                          Style
                        </Label>
                        <ComboBox
                          key='font-style'
                          defaultSelectedKey={style.font.style}
                          options={StyleFont.map(style => ({key: style, text: style}))}
                          onChange={(e, value) => {
                            designerDispatch({ type: 'SET_STYLE_AREA', style: {...style, font: {...style.font, style: value!.text}} })
                          }}
                        />
                      </div>
                      <div>
                        <Label>
                          Weight
                        </Label>
                        <ComboBox
                          key='font-weight'
                          defaultSelectedKey={style.font.weight}
                          options={WeightFont.map(weight => ({key: weight, text: weight}))}
                          onChange={(e, value) => {
                            designerDispatch({ type: 'SET_STYLE_AREA', style: {...style, font: {...style.font, weight: value!.text}} })
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
                        <ButtonExample
                          key='border-color'
                          color={style.border.color}
                          onChangeColor={(e) => {
                            designerDispatch({ type: 'SET_STYLE_AREA', style: {...style, border: {...style.border, color: e}} });
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
                        <ComboBox
                          key='border-style'
                          defaultSelectedKey={style.border.style}
                          options={StyleBorder.map(style => ({key: style, text: style}))}
                          onChange={(e, value) => {
                            designerDispatch({ type: 'SET_STYLE_AREA', style: {...style, border: {...style.border, style: value!.text}} })
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
                          checked={!!areas[activeArea].fields.find(areaF => areaF === `${field.caption}-${field.fieldName}-${field.eqfa!.attribute}`)}
                          onChange={(_, isChecked) => {
                            designerDispatch({ type: 'AREA_FIELD', fieldName: `${field.caption}-${field.fieldName}-${field.eqfa!.attribute}`, include: !!isChecked });
                            changes.current = { grid, selection, areas, activeArea, previewMode } as IDesignerState;
                          }}
                        />
                      )
                    }
                  </>
                )}
            </div>
          </div>
        }
      />)
  }, styles, { allowMultiple: true });

  const OneSize = ({ label, size, isRow, onChange }: { label: string, size: ISize, isRow: boolean, onChange: (newSize: ISize) => void }) => {

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

    const value = isRow
      ? areas[activeArea].rect.top !== areas[activeArea].rect.bottom
        ? !grid.rows.filter((_, idr) => idr >= areas[activeArea].rect.top && idr <= areas[activeArea].rect.bottom )
          .some(row => row.unit === 'AUTO')
            ? grid.rows.filter((_, idr) => idr >= areas[activeArea].rect.top && idr <= areas[activeArea].rect.bottom )
              .reduce((value, curr) => {return value + curr.value!}, 0)
            : {unit: 'AUTO'} as ISize
        : size.value
      : areas[activeArea].rect.left !== areas[activeArea].rect.right
        ? !grid.columns.filter((_, idc) => idc >= areas[activeArea].rect.left && idc <= areas[activeArea].rect.right )
          .some(column => column.unit === 'AUTO')
            ? grid.columns.filter((_, idc) => idc >= areas[activeArea].rect.left && idc <= areas[activeArea].rect.right )
              .reduce((value, curr) => {return value + curr.value!}, 0)
            : {unit: 'AUTO'} as ISize
        : size.value;

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
              value={value!.toString()}
              onIncrement={getOnChangeColumnSpin(1)}
              onDecrement={getOnChangeColumnSpin(-1)}
              onValidate={getOnChangeColumnSpin()}
            />
        }
      </div>
    );
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
          <div
            style={getGridStyle()}
            tabIndex={0}
            ref={divRef}
            onScroll={ (e) => {
              e.currentTarget && (tempSavedScroll = e.currentTarget.scrollTop)
            } }
          >
            {
              areas.length
                ? areas
                  .map((area, idx) => (
                    showAreas.find(findArea => area === findArea) ? 
                  <div
                    key={`${area.rect.top}-${area.rect.left}-${area.rect.bottom}-${area.rect.right}`}
                    style={{
                      gridArea: `${area.rect.top + 1} / ${area.rect.left + 1} / ${area.rect.bottom + 2} / ${area.rect.right + 2}`,
                      display: 'flex',
                      flexDirection: area.direction,
                      justifyContent: 'flex-start',
                      background: `${area.style.background}`,
                      margin: `${area.style.margin}px`,
                      padding: `${area.style.padding}px`,
                      border: area.style.border.style === 'none' ? `1px solid ${previewMode ? area.style.background : '#606060'}` : `${area.style.border.width}px ${area.style.border.style} ${area.style.border.color}`,
                      borderRadius: `${area.style.border.radius}px`,
                      color: `${area.style.font.color}`,
                      fontSize: `${area.style.font.size}px`,
                      fontWeight: area.style.font.weight === 'normal' ? 400 : 600,
                      fontStyle: `${area.style.font.style}`,
                      fontFamily: `${area.style.font.family}`
                    }}
                    onMouseDown={getOnMouseDownForArea(idx)}
                    >
                      <div
                    styleName={
                      previewMode
                        ? "commonStyle"
                        : activeArea === idx
                          ? "commonStyle activeArea"
                          : "commonStyle"
                    }
                  >
                    {
                      area.fields.map(f =>
                        <TextField
                          styles={area.direction === 'row'
                            ? {
                              root: {
                                flexGrow: 1
                              },
                              subComponentStyles: {
                                label: {
                                  root: {
                                    color: `${area.style.font.color}`,
                                    fontSize: `${area.style.font.size}px`,
                                    fontWeight: area.style.font.weight === 'normal' ? 400 : 600,
                                    fontFamily: `${area.style.font.family}`
                                  }
                                }
                              }
                            }
                            : {
                              root: {
                                flexGrow: 0
                              },
                              subComponentStyles: {
                                label: {
                                  root: {
                                    color: `${area.style.font.color}`,
                                    fontSize: `${area.style.font.size}px`,
                                    fontWeight: area.style.font.weight === 'normal' ? 400 : 600,
                                    fontFamily: `${area.style.font.family}`
                                  }
                                }
                              }
                            }
                          }
                          key={f}
                          label={f}
                        />
                      )
                    }
                  </div>
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
                    changes.current = { grid, selection, areas, activeArea, previewMode } as IDesignerState;
                  }}
                >
                  selection
                </div>
            }
          </div>
      </WithAreaExplorer>
    </>
  );
}, styles, { allowMultiple: true });
