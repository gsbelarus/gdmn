import React, { useEffect, useReducer, useRef, Fragment, useState } from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.css';
import { IDesignerProps } from './Designer.types';
import { CommandBar, ICommandBarItemProps, ComboBox, SpinButton, Checkbox, TextField, Label, getTheme, ChoiceGroup, Stack, Image, IComboBoxOption, IComboBoxStyles, IButtonStyles, IconButton, DefaultButton, Link } from 'office-ui-fabric-react';
import { IFieldDef, TFieldType } from 'gdmn-recordset';
import { LookupComboBox } from '@src/app/components/LookupComboBox/LookupComboBox';
import { DatepickerJSX } from '@src/app/components/Datepicker/Datepicker';
import { EntityAttribute } from 'gdmn-orm';

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

export type TDirection = 'row' | 'column';

interface IArea {
  rect: IRectangle;
  fields: IField[];
  direction: TDirection;
  group: boolean;
  style?: IStyleFieldsAndAreas;
}
export interface IField {
  key: string,
  color: string
}

const StyleBorder = ['none', 'solid', 'double', 'groove', 'ridge', 'dashed', 'dotted', 'inset', 'outset'];
/*const FamilyFont = ['Times New Roman, serif', 'Arial, sans-serif', 'Courier New, monospace', 'Bickley Script, cursive, serif', 'Euclid Fraktur, fantasy, serif', 'Lucida Console, Monaco, monospace'];
const StyleFont = ['normal', 'italic'];
const WeightFont = ['normal', 'bold'];
*/
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

export interface IStyleFieldsAndAreas {
  padding: number;
  margin: number;
  font: IFont;
  background?: string;
  border: IBorder;
}

interface IAdditionallyObject {
  images?: string[],
  texts?: string[],
  icons?: string[]
}

export interface IDesignerState {
  grid: IGridSize;
  entityName: string;
  selection?: IRectangle;
  areas: IArea[];
  activeArea?: number;
  changeArray: IDesignerState[];
  previewMode?: boolean;
  activeTab: string;
  selectedField?: string;
  additionallyObject?: IAdditionallyObject;
};

  const defaultState = (entityName: string, fields?: IFieldDef[]) => {return {
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
          return {key: `${field.caption}-${field.fieldName}-${field.eqfa!.attribute}`, color: getTheme().palette.white}
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
          color: getTheme().palette.black,
          weight: 'normal'
        },
        border: {
          style: 'none',
          width: 1,
          color: getTheme().palette.black,
          radius: 3
        }
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
          color: getTheme().palette.black,
          weight: 'normal'
        },
        border: {
          style: 'none',
          width: 1,
          color: getTheme().palette.black,
          radius: 3
        }
      }
    }],
    entityName: entityName,
    changeArray: [],
    activeTab: 'Настройка'
  } as IDesignerState};

  type Action = { type: 'SET_ACTIVE_AREA', activeArea?: number, shiftKey: boolean }
  | { type: 'SET_COLUMN_SIZE', column: number, size: ISize }
  | { type: 'SET_ROW_SIZE', row: number, size: ISize }
  | { type: 'SET_STYLE_AREA', style: IStyleFieldsAndAreas }
  | { type: 'SET_STYLE_FIELD', color: string }
  | { type: 'SET_SELECTED_FIELD', value?: string }
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
  | { type: 'LIFT_FIELD', field: string }
  | { type: 'LOWER_FIELD', field: string }
  | { type: 'ADD_ADDITIONALLY_TEXT', text: string }
  | { type: 'ADD_ADDITIONALLY_IMAGE', image: string }
  | { type: 'ADD_ADDITIONALLY_ICON', icon: string }
  | { type: 'CANCEL_CHANGES', entityName: string, fields: IFieldDef[] | undefined }
  | { type: 'RETURN_CHANGES', entityName: string, fields: IFieldDef[] | undefined }
  | { type: 'CLEAR' }
  | { type: 'SAVE_CHANGES' };

function reducer(state: IDesignerState, action: Action): IDesignerState {
  switch (action.type) {
    case 'SET_ACTIVE_AREA': {
      const { activeArea, shiftKey } = action;
      const { areas, activeArea: prevActiveArea, selection, selectedField } = state;

      if(activeArea === undefined) {
        return {
          ...state,
          activeArea,
          selectedField: undefined
        }
      }

      if (activeArea >= 0 && activeArea <= (areas.length - 1) && prevActiveArea !== undefined) {
        const area = areas[activeArea];
        const prevArea = areas[prevActiveArea];
        if (!shiftKey) {
        return {
            ...state,
            activeArea,
            selectedField: prevActiveArea !== activeArea ? undefined : selectedField,
            selection: undefined,
          };
        }

        if (!selection) {
          return {
            ...state,
            activeArea,
            selectedField: prevActiveArea !== activeArea ? undefined : selectedField,
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
            selectedField: prevActiveArea !== activeArea ? undefined : selectedField,
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
          activeArea,
          selectedField: prevActiveArea !== activeArea ? undefined : selectedField
        }
      } else {
        return {
          ...state,
          activeArea: 0,
          selectedField: prevActiveArea !== activeArea ? undefined : selectedField
        }
      }
    }

    case 'CONFIGURE_AREA': {
      const { direction, rect } = action;
      const { areas, activeArea, grid, changeArray } = state;

      if(activeArea === undefined) {
        return state;
      }

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

    case 'SET_SELECTED_FIELD': {
      const { value } = action;
      return {
        ...state,
        selectedField: value
      };
    }

    case 'AREA_FIELD': {
      const { activeArea, areas, changeArray } = state;
      const { fieldName, include } = action;

      if(activeArea === undefined) {
        return state;
      }

      const newAreas = [...areas];

      if (include && !areas[activeArea].fields.find(f => f.key === fieldName)) {
        newAreas[activeArea] = {
          ...newAreas[activeArea],
          fields: [...newAreas[activeArea].fields, {key: fieldName, color: getTheme().palette.white}]
        };
      }

      if (!include && !!areas[activeArea].fields.find(f => f.key === fieldName)) {
        newAreas[activeArea] = {
          ...newAreas[activeArea],
          fields: newAreas[activeArea].fields.filter(f => f.key !== fieldName)
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
        const fields = selectAreas.reduce( (prevFields, currArea) => [...currArea.fields, ...prevFields], [] as IField[])
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
                    color: getTheme().palette.black,
                    weight: 'normal'
                  },
                  border: {
                    width: 1,
                    style: 'none',
                    color: getTheme().palette.neutralPrimary,
                    radius: 3
                  }
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
        activeArea: areas.findIndex(area => area.rect.left === areas[activeArea!].rect.left && area.rect.top === areas[activeArea!].rect.top),
        areas: areas.slice(0, activeArea).concat(areas.slice(+activeArea! + 1)),
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

    case 'SET_STYLE_FIELD': {
      const { selectedField, areas, activeArea, changeArray } = state;
      const { color } = action;
      if(selectedField) {
        const fields = areas[activeArea!].fields.map(
          field => field.key === selectedField ? {key: field.key, color} as IField : field
        );
        return {
          ...state,
          areas: [...areas.map((area, idx) => idx !== Number(activeArea!) ? area : {...area, fields})],
          changeArray: [...changeArray!, {...state}]
        }
      }
      return {
        ...state,
        areas: [...areas.map(area => {return {...area, fields: area.fields.map(field => {return {...field, color}})}})],
        changeArray: [...changeArray!, {...state}]
      }
    }

    case 'ADD_COLUMN': {
      const { grid, areas, activeArea, changeArray } = state;

      if(activeArea === undefined) {
        return state;
      }

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
              color: getTheme().palette.black,
              weight: 'normal'
            },
            border: {
              width: 1,
              style: 'none',
              color: getTheme().palette.neutralPrimary,
              radius: 3
            }
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

      if(activeArea === undefined) {
        return state;
      }

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
              color: getTheme().palette.black,
              weight: 'normal'
            },
            border: {
              width: 1,
              style: 'none',
              color: getTheme().palette.neutralPrimary,
              radius: 3
            }
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

      if (grid.columns.length === 1 || selection || activeArea === undefined) {
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

      if (grid.rows.length === 1 || selection || activeArea === undefined) {
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

    case 'LIFT_FIELD': {
      const {areas, activeArea, changeArray} = state;
      const {field} = action;
      if(activeArea === undefined) {
        return state;
      }
      const fields = areas[activeArea].fields;
      const idx = fields.findIndex(item => item.key === field)
      if(idx === 0) {
        return state;
      }
      const changeArea = {
        ...areas[activeArea],
        fields: [...fields.slice(0, idx - 1), fields[idx], fields[idx - 1], ...fields.slice(idx + 1)]
      }
      return {
        ...state,
        areas: [...areas.slice(0, activeArea), changeArea, ...areas.slice(activeArea + 1)],
        changeArray: [...changeArray!, {...state}]
      };
    }

    case 'LOWER_FIELD': {
      const {areas, activeArea, changeArray} = state;
      const {field} = action;
      if(activeArea === undefined) {
        return state;
      }
      const fields = areas[activeArea].fields;
      const idx = fields.findIndex(item => item.key === field)
      if(idx === fields.length - 1) {
        return state;
      }
      const changeArea = {
        ...areas[activeArea],
        fields: [...fields.slice(0, idx), fields[idx + 1], fields[idx], ...fields.slice(idx + 2)]
      }
      return {
        ...state,
        areas: [...areas.slice(0, activeArea), changeArea, ...areas.slice(activeArea + 1)],
        changeArray: [...changeArray!, {...state}]
      };
    }

    case 'ADD_ADDITIONALLY_TEXT' : {
      const {additionallyObject, changeArray} = state;
      const {text} = action;
      if(text === '') {
        return state;
      }
      return {
        ...state,
        additionallyObject:
          additionallyObject
            ? {...additionallyObject, texts: additionallyObject!.texts !== undefined ? [...additionallyObject!.texts, text] : [text] }
            : { texts: [text]},
        changeArray: [...changeArray!, {...state}]
          };
    }

    case 'ADD_ADDITIONALLY_IMAGE' : {
      const {additionallyObject, changeArray} = state;
      const {image} = action;
      if(image === '') {
        return state;
      }
      return {
        ...state,
        additionallyObject:
          additionallyObject
            ? {...additionallyObject, images: additionallyObject!.images !== undefined ? [...additionallyObject!.images, image] : [image] }
            : { images: [image]},
        changeArray: [...changeArray!, {...state}]
      };
    }

    case 'ADD_ADDITIONALLY_ICON' : {
      const {additionallyObject, changeArray} = state;
      const {icon} = action;
      if(icon === '') {
        return state;
      }
      return {
        ...state,
        additionallyObject:
          additionallyObject
          ? {...additionallyObject, icons: additionallyObject!.icons !== undefined ? [...additionallyObject!.icons, icon] : [icon] }
          : { icons: [icon]},
        changeArray: [...changeArray!, {...state}]
      };
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
          additionallyObject: localState.additionallyObject,
          changeArray: []
        }
      } else {
        return defaultState(entityName, fields);
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
          style: {
            padding: 4,
            margin: 0,
            font: {
              size: 14,
              style: 'normal',
              family: 'Arial, sans-serif',
              color: getTheme().palette.black,
              weight: 'normal'
            },
            border: {
              width: 1,
              style: 'none',
              color: getTheme().palette.neutralPrimary,
              radius: 3
            }
          },
          fields:[],
          direction: 'column',
          group: false
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

  const { entityName, viewTab, fields, rs, entity } = props;

  const Field = (props: { fd: IFieldDef, field?: IField, areaStyle?: IStyleFieldsAndAreas, aeraDirection?: TDirection }): JSX.Element => {
    const locked = rs ? rs.locked : false;
    const theme = getTheme();
  
    if (props.fd.eqfa!.linkAlias !== rs!.eq!.link.alias && props.fd.eqfa!.attribute === 'ID') {
      const fkFieldName = props.fd.eqfa!.linkAlias;
      const attr = entity!.attributes[fkFieldName] as EntityAttribute;
      if (attr instanceof EntityAttribute) {
        const style = {
          root: {
            flexGrow: props.aeraDirection === 'row' ? 1 : 0,
            background: props.areaStyle!.background
          },
          input: {
            background: props.areaStyle!.background
          }
        }
        const styleCaretDownButton = props.areaStyle !== undefined ? {
          rootHovered: {
            backgroundColor: props.areaStyle.font.color,
          },
        } : undefined
      return (
        <LookupComboBox
          key={fkFieldName}
          name={fkFieldName}
          label={`${props.fd.caption}-${props.fd.fieldName}-${props.fd.eqfa!.attribute}`}
          onLookup={(filter, limit) => {return Promise.resolve([])}}
          onChanged={() => {}}
          styles={style as Partial<IComboBoxStyles>}
          caretDownButtonStyles={styleCaretDownButton as IButtonStyles}
        />
      );
    }
  }

  if (props.fd.dataType === TFieldType.Date) {
    const style = {
      root: {
        flexGrow: props.aeraDirection === 'row' ? 1 : 0,
        background: props.areaStyle!.background,
      },
      fieldGroup: {
        borderWidth: props.field!.color === selectedField ? '3px' : '1px',
        background: props.areaStyle!.background,
      },
      input: {
        borderWidth: props.field!.color === selectedField ? '3px' : '1px',
        background: props.areaStyle!.background,
      }
    }
    const styleIcon = props.areaStyle !== undefined ? {
      root: {
        border: '1px solid',
        borderColor: theme.semanticColors.inputBorder,
        borderLeft: 'none'
      },
      rootHovered: {
        border: '1px solid',
        borderColor: theme.semanticColors.inputBorder,
        borderLeft: 'none'
      },
      rootChecked: {
        border: '1px solid',
        borderColor: theme.semanticColors.inputBorder,
        borderLeft: 'none'
      },
      rootCheckedHovered: {
        border: '1px solid',
        borderColor: theme.semanticColors.inputBorder,
        borderLeft: 'none'
      }
    } : undefined
    return (
      <DatepickerJSX
        key={props.fd.fieldName}
        fieldName={`${props.fd.fieldName}`}
        label={`${props.fd.caption}-${props.fd.fieldName}-${props.fd.eqfa!.attribute}`}
        value=''
        onChange={() => {}}
        styles={style}
        styleIcon={styleIcon}
    />);
  } else if (props.fd.dataType === TFieldType.Boolean) {
    return (
      <Checkbox
        key={props.fd.fieldName}
        disabled={locked}
        label={`${props.fd.caption}-${props.fd.fieldName}-${props.fd.eqfa!.attribute}`}
        defaultChecked={rs!.getBoolean(props.fd.fieldName)}
      />
    )
  } else {
    const style = {
      root: {
        flexGrow: props.aeraDirection === 'row' ? 1 : 0,
        background: props.areaStyle!.background,
      },
      fieldGroup: {
        borderWidth: props.field!.color === selectedField ? '3px' : '1px',
        background: props.areaStyle!.background,
      },
      field: {
        background: props.areaStyle!.background,
      },
      input: {
        borderWidth: props.field!.color === selectedField ? '3px' : '1px',
        background: props.areaStyle!.background,
      }
    };
    return (
      <TextField
        key={props.fd.fieldName}
        label={`${props.fd.caption}-${props.fd.fieldName}-${props.fd.eqfa!.attribute}`}
        defaultValue={rs!.getString(props.fd.fieldName)}
        readOnly={true}
        styles={style}
      />
    )
  }
}

const FieldMemo = React.memo(Field, (prevProps, nextProps) => {
  if (prevProps === nextProps) {
    return true;
  }
  return false;
})
  
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
  const [{ grid, selection, areas, activeArea, previewMode, changeArray, activeTab, selectedField, additionallyObject }, designerDispatch] =
    useReducer(reducer, changes.current !== undefined
      ? changes.current
      : localState !== undefined
        ? localState as IDesignerState
        : defaultState(entityName, fields) 
        ) ;

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
          changes.current = { grid, selection, areas, activeArea, previewMode, additionallyObject } as IDesignerState;
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
          changes.current = { grid, selection, areas, activeArea, previewMode, additionallyObject } as IDesignerState;
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
          changes.current = { grid, selection, areas, activeArea, previewMode, additionallyObject } as IDesignerState;
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
          changes.current = { grid, selection, areas, activeArea, previewMode, additionallyObject } as IDesignerState;
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
          changes.current = { grid, selection, areas, activeArea, previewMode, additionallyObject } as IDesignerState;
        }
      },
      {
        key: 'deleteArea',
        disabled: previewMode || activeArea === undefined
          || areas[activeArea] === undefined || (areas[activeArea]!.rect.bottom === areas[activeArea]!.rect.top
            && areas[activeArea]!.rect.right === areas[activeArea]!.rect.left),
        text: 'Разгруппировать',
        iconProps: {
          iconName: 'UngroupObject'
        },
        onClick: () => {
          designerDispatch({ type: 'DELETE_GROUP' });
          changes.current = { grid, selection, areas, activeArea, previewMode, additionallyObject } as IDesignerState;
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
          localStorage.setItem(`des-${entityName}`, JSON.stringify({ grid, selection, areas, activeArea, previewMode, additionallyObject, changeArray: [] }));
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
    designerDispatch({ type: 'SET_SELECTED_FIELD'});
    changes.current = { grid, selection, areas, activeArea, previewMode, additionallyObject } as IDesignerState;
  };

  const getOnMouseDownForField = (area: number, field: string) => (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    e.preventDefault();
    if(activeArea !== undefined && activeArea === area) {
      designerDispatch({ type: 'SET_SELECTED_FIELD', value: field });
    }
    else {
      designerDispatch({ type: 'SET_ACTIVE_AREA', activeArea: area, shiftKey: e.shiftKey });
    }
    changes.current = { grid, selection, areas, activeArea, previewMode, additionallyObject } as IDesignerState;
  };

  const getOnContextMenuForArea = () => (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    e.preventDefault();
    if(activeArea !== undefined && selectedField !== undefined) {
      designerDispatch({ type: 'SET_SELECTED_FIELD' });
    }
    else if(activeArea !== undefined) {
      designerDispatch({ type: 'SET_ACTIVE_AREA', shiftKey: e.shiftKey });
    }
    changes.current = { grid, selection, areas, activeArea, previewMode, additionallyObject } as IDesignerState;
  };

  const WithToolPanel = (props: { children: JSX.Element, toolPanel: JSX.Element }): JSX.Element => {
    const theme = getTheme();
    return (
      <div style={{
        display: 'grid',
        width: '100%',
        height: '100%',
        gridTemplateColumns:'auto 360px',
        gridTemplateRows: 'auto',
        gridAutoFlow: 'column',
        background: theme.palette.white
     }}>
        <div style={{
          width: '100%',
          height: '100%',
          gridArea: '1 / 1 / 2 / 2',
          margin: '1px',
          padding: '4px',
          overflow: 'auto',
      }}>
        {props.children}
        </div>
        <div style={{
          width: '100%',
          height: '87%',
          gridArea: '1 / 2 / 2 / 3',
          padding: '4px',
          overflow: 'auto',
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
            padding: '0px 8px',
          }}>
            {props.toolPanel}
          </div>
        </div>
      </div>
    );
  };

  const MemoToolPanel = React.memo(WithToolPanel, (prevProps, nextProps) => {
    if (prevProps === nextProps) {
      return true;
    }
    return false;
  })

  const CheckboxForObjectsInInspector = (props: {field: string}): JSX.Element => {
    return (<div key={props.field} style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
        <Checkbox
          key={props.field}
          styles={{
            root: {
              paddingBottom: '4px'
            }
          }}
          label={props.field}
          checked={!!areas[activeArea!].fields.find(areaF => areaF.key === props.field)}
          onChange={(_, isChecked) => {
            designerDispatch({ type: 'AREA_FIELD', fieldName: props.field, include: !!isChecked });
            changes.current = { grid, selection, areas, activeArea, previewMode, additionallyObject } as IDesignerState;
          }}
        />
        <div style={{display: 'flex', flexDirection: 'row'}}>
          <IconButton
            key='lift_field'
            iconProps={{ iconName: 'CaretUp8' }}
            onClick={() => {
              designerDispatch({ type: 'LIFT_FIELD', field: props.field });
              changes.current = { grid, selection, areas, activeArea, previewMode, additionallyObject } as IDesignerState;
            }}
          />
          <IconButton
            key='lower_field'
            iconProps={{ iconName: 'CaretDown8' }}
            onClick={() => {
              designerDispatch({ type: 'LOWER_FIELD', field: props.field });
              changes.current = { grid, selection, areas, activeArea, previewMode, additionallyObject } as IDesignerState;
            }}
          />
        </div>
      </div>
    )
  };

  const MemoCheckboxForObjectsInInspector = React.memo(CheckboxForObjectsInInspector, (prevProps, nextProps) => {
    if (prevProps === nextProps) {
      return true;
    }
    return false;
  })

  const WithAreaExplorer = CSSModules((props: { children: JSX.Element }): JSX.Element => {
    const tabs = ["Настройка", "Поля"];
    const area = areas[activeArea!];
    const [viewAddObject, onChangeView] = useState(false);
    const [addTexts, onchangeText] = useState('');
    const [addUrlImage, onchangeUrlImage] = useState('');
    const [addIcon, onchangeIcon] = useState('');

    const idc = activeArea!==undefined ? area.rect.left : -1;
    const idr = activeArea!==undefined ? area.rect.top : -1;
    const theme = getTheme();

    return (
      <MemoToolPanel
        {...props}
        toolPanel={
          <div className="SettingForm">
            <div className="SettingFormTabs"
              style={{
                width: '100%',
                height: '32px',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                background: theme.palette.white,
                color: theme.palette.neutralPrimary
              }}
            >
              {tabs.map(t =>
                (activeTab === undefined ? (t === 'Настройка') : (t === activeTab)) ? (
                  <Fragment key={t}>
                    <div
                      className="SettingFormTab"
                      onClick={() => designerDispatch({ type: 'SET_ACTIVE_TAB', tab: t }) }
                      style={{
                        minWidth: '96px',
                        display: 'flex',
                        cursor: 'pointer',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        background: theme.palette.white,
                        color: theme.palette.neutralPrimary
                      }}
                      key={t}
                    >
                      <div
                        className="SettingFormActiveColor"
                        style={{
                          height: '5px',
                          backgroundImage: `linear-gradient(${theme.palette.neutralPrimary}, ${theme.palette.white})`,
                          borderLeft: '1px solid',
                          borderRight: '1px solid'
                        }}
                      />
                      <div
                        className="SettingFormTabText SignInFormActiveTab"
                        style={{
                          flex: '1 0 auto',
                          height: '30px',
                          padding: '2px 4px 0px 4px',
                          textAlign: 'center',
                          borderLeft: '1px solid',
                          borderRight: '1px solid'
                        }}
                      >{t}</div>
                    </div>
                    <div
                      className="SettingFormTabSpace"
                      style={{
                        minWidth: '4px',
                        backgroundColor: 'transparent',
                        borderBottom: '1px solid',
                        flex: '0 0 initial'
                      }}
                    />
                  </Fragment>
                ) : activeArea === undefined || areas[activeArea] === undefined ? undefined : (
                    <Fragment key={t}>
                      <div
                        className="SettingFormTab"
                        onClick={() => designerDispatch({ type: 'SET_ACTIVE_TAB', tab: t }) }
                        style={{
                          background: theme.palette.white,
                          color: theme.palette.themeTertiary,
                          cursor: 'pointer',
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
                            borderLeft: '1px solid',
                            borderRight: '1px solid',
                            borderTop: '1px solid'
                          }}
                        >{t}</div>
                        <div
                          className="SettingFormInactiveShadow"
                          style={{
                            height: '6px',
                            flex: '0 0 initial',
                            justifySelf: 'flex-end',
                            backgroundImage: `linear-gradient(${theme.palette.neutralPrimary}, ${theme.palette.themePrimary})`,
                            borderLeft: '1px solid',
                            borderRight: '1px solid',
                            borderBottom: '1px solid'
                          }}
                        />
                      </div>
                      <div
                        className="SettingFormTabSpace"
                        style={{
                          minWidth: '4px',
                          backgroundColor: 'transparent',
                          borderBottom: '1px solid',
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
                  borderBottom: `1px solid`,
                  flex: '1 1 auto',
                  justifySelf: 'flex-end'
                }}
              />
            </div>
            <div
              className="SettingFormBody"
              style={{
                width: '100%',
                background: theme.palette.white,
                color: theme.palette.neutralPrimary,
                flex: '1 1 auto',
                borderLeft: '1px solid',
                borderRight: '1px solid',
                borderBottom: '1px solid',
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
                  { activeArea !== undefined && selectedField === undefined
                    ? <>
                    <div>
                      <>
                      <DefaultButton
                        key='viewAdditionallyObject'
                        onClick={() => {
                          onChangeView(!viewAddObject)
                        }}
                      >Add additionallyObject</DefaultButton>
                      {
                        viewAddObject ?
                        <>
                        <TextField
                          key='additionallyText'
                          value={addTexts}
                          onChange={(e) => {
                            onchangeText(e.currentTarget.value)
                          }}
                        />
                          <DefaultButton
                            key='addText'
                            onClick={() => {
                              designerDispatch({ type: 'ADD_ADDITIONALLY_TEXT', text: addTexts});
                              designerDispatch({ type: 'AREA_FIELD', fieldName: addTexts, include: true });
                              changes.current = { grid, selection, areas, activeArea, previewMode, additionallyObject } as IDesignerState;
                            }}
                          >Add text</DefaultButton>
                          <TextField
                            key='additionallyImage'
                            value={addUrlImage}
                            onChange={(e) => {
                              onchangeUrlImage(e.currentTarget.value)
                            }}
                          />
                          <DefaultButton
                            key='addUrlImage'
                            onClick={() => {
                              designerDispatch({ type: 'ADD_ADDITIONALLY_IMAGE', image: addUrlImage });
                              designerDispatch({ type: 'AREA_FIELD', fieldName: addUrlImage, include: true });
                              changes.current = { grid, selection, areas, activeArea, previewMode, additionallyObject } as IDesignerState;
                            }}
                          >Add image</DefaultButton>
                          <TextField
                            key='additionallyIcon'
                            value={addIcon}
                            onChange={(e) => {
                              onchangeIcon(e.currentTarget.value)
                            }}
                          />
                          <Link href="https://uifabricicons.azurewebsites.net/">Посмотреть и выбрать</Link>
                          <DefaultButton
                            key='addIcon'
                            onClick={() => {
                              designerDispatch({ type: 'ADD_ADDITIONALLY_ICON', icon: addIcon });
                              designerDispatch({ type: 'AREA_FIELD', fieldName: addIcon, include: true });
                              changes.current = { grid, selection, areas, activeArea, previewMode, additionallyObject } as IDesignerState;
                            }}
                          >Add icon</DefaultButton>
                        </>
                        : undefined
                      }
                      </>
                    <Label>Size</Label>
                    <>
                      {
                        <OneSize key='column_size' label='Width' size={grid.columns[idc]} isRow={false} onChange={(size: ISize) => {
                          const left = idc;
                          const right = areas[activeArea!].rect.right;
                          if(left === right && size.unit === 'AUTO') {
                            designerDispatch({ type: 'SET_COLUMN_SIZE', column: idc, size });
                            changes.current = { grid, selection, areas, activeArea, previewMode, additionallyObject } as IDesignerState;
                          } else {
                            const value = size.value! / (right + 1 - left);
                            for(let i = left; i <= right; i++) {
                              designerDispatch({ type: 'SET_COLUMN_SIZE', column: i, size: {...size, value} });
                              changes.current = { grid, selection, areas, activeArea, previewMode, additionallyObject } as IDesignerState;
                            }
                          }
                        }} />
                      }
                      {
                        <OneSize key='row_size' label='Height' size={grid.rows[idr]} isRow={true} onChange={(size: ISize) => {
                          const top = idr;
                          const bottom = areas[activeArea!].rect.bottom;
                          if(top === bottom && size.unit === 'AUTO') {
                            designerDispatch({ type: 'SET_ROW_SIZE', row: idr, size });
                            changes.current = { grid, selection, areas, activeArea, previewMode, additionallyObject } as IDesignerState;
                          } else {
                            const value = size.value! / (bottom + 1 - top);
                            for(let i = top; i <= bottom; i++) {
                              designerDispatch({ type: 'SET_ROW_SIZE', row: i, size: {...size, value} });
                              changes.current = { grid, selection, areas, activeArea, previewMode, additionallyObject } as IDesignerState;
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
                        value={area.style!.padding.toString()}
                        onChange={(e) => {
                          designerDispatch({ type: 'SET_STYLE_AREA', style: {...area.style!,  padding: Number(e.currentTarget.value)} });
                        }}
                      />
                    </div>
                    <div>
                      <Label>
                        Margin
                      </Label>
                      <TextField
                        key='margin'
                        value={area.style!.margin.toString()}
                        onChange={(e) => {
                          designerDispatch({ type: 'SET_STYLE_AREA', style: {...area.style!, margin: Number(e.currentTarget.value)} });
                        }}
                      />
                    </div>
                  {
                    /*
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
                        Font
                      </Label>
                      <div>
                        <Label>
                          Size
                        </Label>
                        <TextField
                          key='font-size'
                          value={styleSetting.font.size.toString()}
                          onChange={(e) => {
                            designerDispatch({ type: 'SET_STYLE_AREA', style: {...style, font: {...style.font, size: Number(e.currentTarget.value)}} });
                          }}
                        />
                      </div>
                      <div>
                        <Label>
                          Color
                        </Label>
                      </div>
                      <div>
                        <Label>
                          Family
                        </Label>
                        <ComboBox
                          key='font-family'
                          defaultSelectedKey={styleSetting.font.family}
                          options={FamilyFont.map(family => ({key: family, text: family}))}
                          onChange={(e, value) => {
                            designerDispatch({ type: 'SET_STYLE_SETTING', style: {...styleSetting, font: {...styleSetting.font, family: value!.text}} })
                          }}
                        />
                      </div>
                      <div>
                        <Label>
                          Style
                        </Label>
                        <ComboBox
                          key='font-style'
                          defaultSelectedKey={styleSetting.font.style}
                          options={StyleFont.map(style => ({key: style, text: style}))}
                          onChange={(e, value) => {
                            designerDispatch({ type: 'SET_STYLE_SETTING', style: {...styleSetting, font: {...styleSetting.font, style: value!.text}} })
                          }}
                        />
                      </div>
                      <div>
                        <Label>
                          Weight
                        </Label>
                        <ComboBox
                          key='font-weight'
                          defaultSelectedKey={styleSetting.font.weight}
                          options={WeightFont.map(weight => ({key: weight, text: weight}))}
                          onChange={(e, value) => {
                            designerDispatch({ type: 'SET_STYLE_SETTING', style: {...styleSetting, font: {...styleSetting.font, weight: value!.text}} })
                          }}
                        />
                      </div>
                    </div>
                    */
                  }
                    <div>
                      <Label>Backgroung</Label>
                      <ComboBox
                        key='background'
                        defaultSelectedKey={
                          activeArea !== undefined && areas[activeArea!].style && area.style!.background ? Object.values(theme.palette).findIndex( color => color === area.style!.background) : Object.values(theme.palette).findIndex( color => color === theme.palette.white)
                        }
                        options={
                          Object.keys(theme.palette).map((color, idx) => { return {key: idx, text: color } })
                        }
                        onRenderOption={(option) =>
                          {
                            return (
                            <Stack style={{
                              display: 'flex',
                              flexDirection: 'row',
                              alignItems: 'center'
                            }}>
                              <span style={{
                                background: Object.values(theme.palette)[+(option as IComboBoxOption).key],
                                border: `1px solid ${theme.palette.black}`,
                                height:'16px',
                                width: '16px',
                                marginRight: '4px'
                              }}></span>
                              <span>{(option as IComboBoxOption).text}</span>
                            </Stack>
                          );}
                        }
                        onChange={(e, value) => {
                          designerDispatch({ type: 'SET_STYLE_AREA', style: {...area.style!, background: value!.text} })
                        }}
                      />
                    </div>
                    <div>
                      <Label>
                        Border
                      </Label>
                      <div>
                        <Label>
                          Style
                        </Label>
                        <ComboBox
                          key='border-style'
                          defaultSelectedKey={activeArea !== undefined && area.style !== undefined && area.style!.border !== undefined ? area.style!.border.style : 'none'}
                          options={StyleBorder.map(style => ({key: style, text: style}))}
                          onChange={(e, value) => {
                            designerDispatch({ type: 'SET_STYLE_AREA', style: {...area.style!, border: {...area.style!.border, style: value!.text}} })
                          }}
                        />
                      </div>
                      {
                        area.style !== undefined && area.style!.border.style !== 'none' ?
                        <>
                          <div>
                            <Label>
                              Width
                            </Label>
                            <TextField
                              key='border-width'
                              value={area.style!.border.width.toString()}
                              onChange={(e) => {
                                designerDispatch({ type: 'SET_STYLE_AREA', style: {...area.style!, border: {...area.style!.border, width: Number(e.currentTarget.value)}} });
                              }}
                            />
                          </div>
                          <div>
                            <Label>
                              Radius
                            </Label>
                            <TextField
                              key='border-radius'
                              value={area.style!.border.radius.toString()}
                              onChange={(e) => {
                                designerDispatch({ type: 'SET_STYLE_AREA', style: {...area.style!, border: {...area.style!.border, radius: Number(e.currentTarget.value)}} });
                              }}
                            />
                          </div>
                        </>
                        : undefined
                      }
                      <div>
                        <Label>Direction fields</Label>
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
                            && (changes.current = { grid, selection, areas, activeArea, previewMode, additionallyObject } as IDesignerState)
                          }
                        />
                      </div>
                    </div>
                    {/*
                      activeArea !== undefined && selectedField && area.fields !== [] ? 
                        <div>
                          <Label>
                            Field
                          </Label>
                          <div>
                            <Label>
                              Color
                            </Label>
                            <TextField
                              key='fieldColor'
                              value={area.fields.find(field => field.key === selectedField)!.color}
                              onChange={(e) => {
                                designerDispatch({ type: 'SET_STYLE_FIELD', color: e.currentTarget.value });
                              }}
                            />
                          </div>
                        </div>
                      : undefined
                      */
                    }
                  </>
                  : selectedField && activeArea !== undefined
                    ? <Label>{`Выбранный объект: ${selectedField}`}</Label>
                    : undefined
                  }
                  </div>
                </>
              ) : (
                  <>
                    <Label>
                      Show fields:
                    </Label>
                    {}
                      { additionallyObject ?
                        [additionallyObject.texts!, additionallyObject.images!, additionallyObject.icons!].reduce((arr, curr) => {return curr ? [...arr, ...curr] : [...arr] }, []).map(object =>
                          object !== undefined ?
                            <MemoCheckboxForObjectsInInspector field={object} />
                          : undefined
                        )
                      : undefined
                    }
                    {
                      fields!.map(field =>
                        <MemoCheckboxForObjectsInInspector field={`${field.caption}-${field.fieldName}-${field.eqfa!.attribute}`} />
                      )
                    }
                  </>
                )}
            </div>
          </div>
        }
      />)
  }, styles, { allowMultiple: true });

  const Area = (props: {area: IArea, idx: number}): JSX.Element => {
    const {area, idx} = props;
    const theme = getTheme();
    return (
    <div
        key={`${area.rect.top}-${area.rect.left}-${area.rect.bottom}-${area.rect.right}`}
        className={
          "commonStyle"
        }
        style={{
          gridArea: `${area.rect.top + 1} / ${area.rect.left + 1} / ${area.rect.bottom + 2} / ${area.rect.right + 2}`,
          display: 'flex',
          justifyContent: 'flex-start',
          //flexGrow: area.direction === 'row' ? 1 : 0,
          background: area.style ? Object.values(theme.palette)[Object.keys(theme.palette).findIndex(color => color === area.style!.background)] : theme.palette.white,
          margin: area.style ? `${area.style.margin}px` : '1px',
          padding: area.style ? `${area.style.padding}px` : '1px',
          border: !area.style || area.style.border.style === 'none' ? `1px solid ${previewMode ? area.style!.background : theme.semanticColors.inputBorder}` : `${area.style.border.width}px ${area.style.border.style} ${area.style.border.color}`,
          borderRadius: area.style ? `${area.style.border.radius}px` : '3px',
          //color: `${area.style!.font.color}`,
          //fontSize: area.style ? `${area.style.font.size}px` : '14px',
          //fontWeight: !area.style || area.style.font.weight === 'normal' ? 400 : 600,
          //fontStyle: area.style ? `${area.style.font.style}` : 'normal',
          //fontFamily: area.style ? `${area.style.font.family}` : 'normal'
        }}
        onClick={getOnMouseDownForArea(idx)}
        onContextMenu={getOnContextMenuForArea()}
        >
          <div
            style={
              previewMode
              ? {
                backgroundSize: '16px 16px',
                justifyContent: 'flex-start',
                display: 'flex',
                flexWrap: 'wrap',
                flexGrow: area.direction === 'row' ? 1 : 0,
                flexDirection: area.direction,
                alignContent: 'flex-start'
              }
              : activeArea === idx
                ? {
                  backgroundSize: '16px 16px',
                  justifyContent: 'flex-start',
                  border: '2px dashed #d84141',
                  height: '100%',
                  width: '100%',
                  display: 'flex',
                  flexWrap: 'wrap',
                  flexGrow: area.direction === 'row' ? 1 : 0,
                  flexDirection: area.direction,
                  alignContent: 'flex-start'
                }
                : {
                  backgroundSize: '16px 16px',
                  justifyContent: 'flex-start',
                  display: 'flex',
                  flexWrap: 'wrap',
                  flexGrow: area.direction === 'row' ? 1 : 0,
                  flexDirection: area.direction,
                  alignContent: 'flex-start'
                }
            }
          >
          {
            area.fields.map(f =>
              { 
                const fd: IFieldDef | undefined = rs!.fieldDefs.find(fieldDef =>
                  `${fieldDef.caption}-${fieldDef.fieldName}-${fieldDef.eqfa!.attribute}` === f.key
                );
              return fd !== undefined
              ? <div
                key={f.key}
                onClick={getOnMouseDownForField(idx, f.key)}
              ><FieldMemo key={f.key} fd={fd} field={f} areaStyle={area.style!} aeraDirection={area.direction} /></div>
              : additionallyObject!.texts && additionallyObject!.texts!.find(text => text === f.key)
                ? <div key={f.key} onClick={getOnMouseDownForField(idx, f.key)}><Label>{f.key}</Label></div>
                : additionallyObject!.images && additionallyObject!.images.find(image => image === f.key)
                  ? <Image key={f.key} onClick={getOnMouseDownForField(idx, f.key)} height={100} width={100} src={f.key} alt='Text' styles={{ root: {borderColor: theme.semanticColors.inputBorder}}} />
                  : additionallyObject!.icons && additionallyObject!.icons.find(icon => icon === f.key)
                    ? <IconButton key={f.key} iconProps={{ iconName: f.key }} onClick={getOnMouseDownForField(idx, f.key)} />
                    : undefined
              }
            )
          }
        </div>
      </div>);
  }

  const MemoArea = React.memo(Area, (prevProps, nextProps) => {
    if (prevProps === nextProps) {
      return true;
    }
    return false;
  })

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
      ? areas[activeArea!].rect.top !== areas[activeArea!].rect.bottom
        ? !grid.rows.filter((_, idr) => idr >= areas[activeArea!].rect.top && idr <= areas[activeArea!].rect.bottom )
          .some(row => row.unit === 'AUTO')
            ? grid.rows.filter((_, idr) => idr >= areas[activeArea!].rect.top && idr <= areas[activeArea!].rect.bottom )
              .reduce((value, curr) => {return value + curr.value!}, 0)
            : {unit: 'AUTO'} as ISize
        : size.value
      : areas[activeArea!].rect.left !== areas[activeArea!].rect.right
        ? !grid.columns.filter((_, idc) => idc >= areas[activeArea!].rect.left && idc <= areas[activeArea!].rect.right )
          .some(column => column.unit === 'AUTO')
            ? grid.columns.filter((_, idc) => idc >= areas[activeArea!].rect.left && idc <= areas[activeArea!].rect.right )
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
      <CommandBar key={'commandBarFunctional'} items={commandBarItems[0]} />
      <CommandBar key={'commandBarAction'} items={commandBarItems[1]} />
      <WithAreaExplorer>
          <div
            key='withAreaExplorer'
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
                      <MemoArea key={idx} area={area} idx={idx} />
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
                    changes.current = { grid, selection, areas, activeArea, previewMode, additionallyObject } as IDesignerState;
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
