import React, { useEffect, useReducer, useRef, Fragment, useState } from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.css';
import { IDesignerProps } from './Designer.types';
import { CommandBar, ICommandBarItemProps, ComboBox, SpinButton, Checkbox, TextField, Label, getTheme, ChoiceGroup, Stack, Image, IComboBoxOption, IComboBoxStyles, IButtonStyles, IconButton, DefaultButton, Link, mergeStyles, MarqueeSelection } from 'office-ui-fabric-react';
import { IFieldDef, TFieldType } from 'gdmn-recordset';
import { Selection, IColumn, buildColumns, DetailsList } from 'office-ui-fabric-react/lib/DetailsList';
import { LookupComboBox } from '@src/app/components/LookupComboBox/LookupComboBox';
import { DatepickerJSX } from '@src/app/components/Datepicker/Datepicker';
import { EntityAttribute } from 'gdmn-orm';
import { Icon } from 'office-ui-fabric-react/lib/Icon';

interface IShowObjects {
  key: string,
  name: string,
}

interface IObject {
  id: string;
}

interface IFieldObject extends IObject {
  fieldName: string;
}

interface ITextObject extends IObject {
  text: string;
}

interface IImageObject extends IObject {
  imageUrl: string;
}

function isTextObject(object: IObject | ITextObject | IImageObject): object is ITextObject {
  return (object as ITextObject).text !== undefined;
}

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
  fields: string[];
  direction: TDirection;
  group: boolean;
  style?: IStyleFieldsAndAreas;
}

const StyleBorder = ['none', 'solid', 'double', 'groove', 'ridge', 'dashed', 'dotted', 'inset', 'outset'];

interface IBorder {
  width: number;
  style: string;
  color: string;
  radius: number;
}

export interface IStyleFieldsAndAreas {
  padding: number;
  margin: number;
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
      fields: fields!.map( field => `${field.caption}-${field.fieldName}-${field.eqfa!.attribute}` ),
      direction: 'column',
      group: false,
      style: {
        padding: 4,
        margin: 0,
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
    activeTab: 'Свойства'
  } as IDesignerState};

  type Action = { type: 'SET_ACTIVE_AREA', activeArea?: number, shiftKey: boolean }
  | { type: 'SET_COLUMN_SIZE', column: number, size: ISize }
  | { type: 'SET_ROW_SIZE', row: number, size: ISize }
  | { type: 'SET_STYLE_AREA', style: IStyleFieldsAndAreas }
  | { type: 'SET_STYLE_FIELD', color: string }
  | { type: 'SET_SELECTED_FIELD', value?: string }
  | { type: 'AREA_FIELD', fieldName: string, include: boolean }
  | { type: 'SET_FIELDS_AREA', fields: string[] }
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
  | { type: 'DRAG_FIELD', field: string, position: number }
  | { type: 'ADD_ADDITIONALLY_TEXT', text: string }
  | { type: 'ADD_ADDITIONALLY_IMAGE', image: string }
  | { type: 'ADD_ADDITIONALLY_ICON', icon: string }

  | { type: 'SET_ADDITIONALLY_TEXT', text: string, newText: string }
  | { type: 'SET_ADDITIONALLY_IMAGE', image: string, setURL: string }
  | { type: 'SET_ADDITIONALLY_ICON', icon: string, setTitle: string }

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

    case 'SET_FIELDS_AREA': {
      const { areas, activeArea, changeArray } = state;
      const { fields } = action;

      if(activeArea === undefined) {
        return state;
      }

      const newAreas = areas;
      newAreas[activeArea] = {
        ...newAreas[activeArea],
        fields: fields.map(field => {return field})
      }
      return {
        ...state,
        areas: newAreas,
        changeArray: [...changeArray!, {...state}]
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
        const fields = selectAreas.flatMap( area => area.fields );
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
          field => field === selectedField ? field : field
        );
        return {
          ...state,
          areas: [...areas.map((area, idx) => idx !== Number(activeArea!) ? area : {...area, fields})],
          changeArray: [...changeArray!, {...state}]
        }
      }
      return {
        ...state,
        areas: [...areas.map(area => {return {...area, fields: area.fields.map(field => {return field})}})],
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

    case 'DRAG_FIELD' : {
      const {areas, activeArea, changeArray} = state;
      const {field, position} = action;

      if(activeArea === undefined) {
        return state;
      }

      const fields = areas[activeArea].fields.filter(item => item !== field);
      fields.splice(position, 0, field )

      const changeArea = {
        ...areas[activeArea],
        fields: fields
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

    case 'SET_ADDITIONALLY_TEXT' : {
      const { additionallyObject, changeArray, areas, activeArea } = state;
      const { text, newText } = action;
      if(text === '' || newText === '' || activeArea === undefined) {
        return state;
      }
      const newAreas = [...areas];
      const selectArea = newAreas[activeArea];
      newAreas[activeArea] = {...selectArea, fields: [...selectArea.fields.splice(selectArea.fields.findIndex(field => field === text), 1, newText )]}
      const additionallyObjectTexts = additionallyObject!.texts!;
      additionallyObjectTexts[additionallyObjectTexts.findIndex(object => text == object)] = newText;
      return {
        ...state,
        additionallyObject: {
          ...additionallyObject,
          texts: additionallyObjectTexts,
        },
        selectedField: newText,
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

    case 'SET_ADDITIONALLY_IMAGE' : {
      const { additionallyObject, changeArray, areas, activeArea } = state;
      const {image, setURL} = action;
      if(image === '' || activeArea === undefined) {
        return state;
      }
      const newAreas = [...areas];
      const selectArea = newAreas[activeArea];
      newAreas[activeArea] = {...selectArea, fields: [...selectArea.fields.splice(selectArea.fields.findIndex(field => field === image), 1, setURL )]}
      const additionallyObjectImages = additionallyObject!.images!;
      additionallyObjectImages[additionallyObjectImages.findIndex(object => image == object)] = setURL;
      return {
        ...state,
        additionallyObject: {
          ...additionallyObject,
          images: additionallyObjectImages,
        },
        selectedField: setURL,
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

    case 'SET_ADDITIONALLY_ICON' : {
      const { additionallyObject, changeArray, areas, activeArea } = state;
      const {icon, setTitle} = action;
      if(icon === '' || activeArea === undefined) {
        return state;
      }
      const newAreas = [...areas];
      const selectArea = newAreas[activeArea];
      newAreas[activeArea] = {...selectArea, fields: [...selectArea.fields.splice(selectArea.fields.findIndex(field => field === icon), 1, setTitle )]}
      const additionallyObjectIcons = additionallyObject!.icons!;
      additionallyObjectIcons[additionallyObjectIcons.findIndex(object => icon == object)] = setTitle;
      return {
        ...state,
        additionallyObject: {
          ...additionallyObject,
          icons: additionallyObjectIcons,
        },
        selectedField: setTitle,
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
        activeTab: 'Свойства'
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

  const Field = (props: { fd: IFieldDef, field?: string, areaStyle?: IStyleFieldsAndAreas, aeraDirection?: TDirection }): JSX.Element => {
    const locked = rs ? rs.locked : false;
    const theme = getTheme();
  
    if (props.fd.eqfa!.linkAlias !== rs!.eq!.link.alias && props.fd.eqfa!.attribute === 'ID') {
      const fkFieldName = props.fd.eqfa!.linkAlias;
      const attr = entity!.attributes[fkFieldName] as EntityAttribute;
      if (attr instanceof EntityAttribute) {
        const style = {
          root: {
            background: props.areaStyle!.background
          },
          input: {
            background: props.areaStyle!.background
          }
        }
      return (
        <LookupComboBox
          key={fkFieldName}
          name={fkFieldName}
          label={`${props.fd.caption}-${props.fd.fieldName}-${props.fd.eqfa!.attribute}`}
          onLookup={(filter, limit) => {return Promise.resolve([])}}
          onChanged={() => {}}
          styles={style as Partial<IComboBoxStyles>}
        />
      );
    }
  }

  if (props.fd.dataType === TFieldType.Date) {
    const style = {
      root: {
        background: props.areaStyle!.background,
      },
      fieldGroup: {
        background: props.areaStyle!.background,
      },
      input: {
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
        background: props.areaStyle!.background,
      },
      fieldGroup: {
        background: props.areaStyle!.background,
      },
      field: {
        background: props.areaStyle!.background,
      },
      input: {
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
    height: '92%',
    overflow: 'auto'
  });

  const commandBarItems: ICommandBarItemProps[] = [
      {
        key: 'addColumn',
        disabled: previewMode,
        name: 'Добавить колонку',
        iconOnly: true,
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
        name: 'Удалить колонку',
        iconOnly: true,
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
        name: 'Добавить строку',
        iconOnly: true,
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
        name: 'Удалить строку',
        iconOnly: true,
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
        name: 'Сгруппировать',
        iconOnly: true,
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
        name: 'Разгруппировать',
        iconOnly: true,
        iconProps: {
          iconName: 'UngroupObject'
        },
        onClick: () => {
          designerDispatch({ type: 'DELETE_GROUP' });
          changes.current = { grid, selection, areas, activeArea, previewMode, additionallyObject } as IDesignerState;
        }
      },
      {
        key: 'addText',
        disabled: previewMode || activeArea === undefined || selectedField !== undefined,
        name: 'Добавить текст',
        iconOnly: true,
        iconProps: {
          iconName: 'TextField'
        },
        onClick: () => {
          designerDispatch({ type: 'ADD_ADDITIONALLY_TEXT', text: 'text' });
          designerDispatch({ type: 'AREA_FIELD', fieldName: 'text', include: true });
          changes.current = { grid, selection, areas, activeArea, previewMode, additionallyObject } as IDesignerState;
        }
      },
      {
        key: 'addImage',
        disabled: previewMode || activeArea === undefined || selectedField !== undefined,
        name: 'Добавить картинку',
        iconOnly: true,
        iconProps: {
          iconName: 'ImageDiff'
        },
        onClick: () => {
          designerDispatch({ type: 'ADD_ADDITIONALLY_IMAGE', image: 'data:image/png;base64,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' });
          designerDispatch({ type: 'AREA_FIELD', fieldName: 'data:image/png;base64,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', include: true });
          changes.current = { grid, selection, areas, activeArea, previewMode, additionallyObject } as IDesignerState;
        }
      },
      {
        key: 'addIcon',
        disabled: previewMode || activeArea === undefined || selectedField !== undefined,
        name: 'Добавить иконку',
        iconOnly: true,
        iconProps: {
          iconName: 'IconSetsFlag'
        },
        onClick: () => {
          designerDispatch({ type: 'ADD_ADDITIONALLY_ICON', icon: 'IncidentTriangle' });
          designerDispatch({ type: 'AREA_FIELD', fieldName: 'IncidentTriangle', include: true });
          changes.current = { grid, selection, areas, activeArea, previewMode, additionallyObject } as IDesignerState;
        }
      },
      {
        key: 'previewMode',
        disabled: !areas.length,
        checked: !!previewMode,
        name: 'Просмотр',
        iconOnly: true,
        iconProps: {
          iconName: 'Tiles'
        },
        onClick: () => {
          designerDispatch({ type: 'PREVIEW_MODE' });
        }
      },
      {
        key: 'saveAndClose',
        disabled: changeArray && changeArray.length === 0,
        name: 'Сохранить',
        iconOnly: true,
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
        disabled: previewMode,
        name: 'Закрыть',
        iconOnly: true,
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
        name: 'Отменить шаг',
        iconOnly: true,
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
        name: 'Вернуть',
        iconOnly: true,
        iconProps: {
          iconName: 'Refresh'
        },
        onClick: () => {
          changes.current = undefined;
          designerDispatch({ type: 'RETURN_CHANGES', entityName: `des-${entityName}`, fields });
        }
      },
      {
        key: 'clear',
        disabled: previewMode,
        name: 'Очистить',
        iconOnly: true,
        iconProps: {
          iconName: 'Broom'
        },
        onClick: () => {
          changes.current = undefined;
          designerDispatch({ type: 'CLEAR' });
        }
      }
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
    if (previewMode || activeArea === undefined) {
      return props.children;
    }
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
          padding: '0px 0px 0px 4px',
          overflow: 'auto',
        }}>
          {props.children}
        </div>
        <div style={{
          width: '100%',
          height: '92%',
          gridArea: '1 / 2 / 2 / 3',
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
            padding: '0px 4px 0px 6px',
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
  
  const TabSettingsArea = ({}): JSX.Element => {
    const area = areas[activeArea!];
    const [viewAddText, viewAddImage] = useState(false);
    const [viewAddIcon, onChangeView] = useState(false);
    const [addTexts, onchangeText] = useState('');
    const [addUrlImage, onchangeUrlImage] = useState('');
    const [addIcon, onchangeIcon] = useState('');
    const [valueText, setValueText] = useState(selectedField ? selectedField : '');

    const idc = activeArea!==undefined ? area.rect.left : -1;
    const idr = activeArea!==undefined ? area.rect.top : -1;
    const theme = getTheme();

    return <>
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        marginBottom: '4px'
      }}
      key='Setting'
    >
      <Stack horizontal verticalAlign="center">
          <DefaultButton
            styles={{
              root: {
                borderColor: theme.semanticColors.bodyBackground
              }
            }}
            onClick={() => {
              designerDispatch({ type: 'SET_ACTIVE_AREA', shiftKey: false});
              designerDispatch({ type: 'SET_SELECTED_FIELD'});
              changes.current = { grid, selection, areas, activeArea, previewMode, additionallyObject } as IDesignerState;
            }}
          >Окно</DefaultButton>
          {
            activeArea !== undefined ?
            <>
            <Icon iconName="ChevronRight"/>
            <DefaultButton
              styles={{
                root: {
                  borderColor: theme.semanticColors.bodyBackground
                }
              }}
              onClick={() => {
                designerDispatch({ type: 'SET_SELECTED_FIELD'});
                changes.current = { grid, selection, areas, activeArea, previewMode, additionallyObject } as IDesignerState;
              }}
            >Область</DefaultButton>
            {
              selectedField !== undefined ?
              <>
                <Icon iconName="ChevronRight"/>
                <>
                  {
                    additionallyObject && additionallyObject.images!.find(image => image === selectedField)
                    ? <Icon iconName="ImageDiff"
                        styles={{
                          root: {
                            fontSize: '18px',
                            paddingLeft: '20px'
                          }
                        }}
                      />
                      : additionallyObject && additionallyObject.texts!.find(text => text === selectedField)
                        ? <Icon iconName="TextField"
                            styles={{
                              root: {
                                fontSize: '18px',
                                paddingLeft: '20px'
                              }
                            }}
                          />
                          : additionallyObject && additionallyObject.icons!.find(icon => icon === selectedField)
                            ? <Icon iconName="IconSetsFlag"
                                styles={{
                                  root: {
                                    fontSize: '18px',
                                    paddingLeft: '20px'
                                  }
                                }}
                              />
                              : <Icon iconName="FieldEmpty"
                                  styles={{
                                    root: {
                                      fontSize: '18px',
                                      paddingLeft: '20px'
                                    }
                                  }}
                                />
                  }
                </>
              </>
              : undefined
            }
            </>
            : undefined
          }
        </Stack>
    { activeArea !== undefined && selectedField === undefined
      ? <>
      <div>
        <>
        <DefaultButton
          key='viewAddText'
          onClick={() => {
            onChangeView(!viewAddText)
          }}
        >Добавить текст</DefaultButton>
        <DefaultButton
          key='viewAddImage'
          onClick={() => {
            onChangeView(!viewAddImage)
          }}
        >Добавить изображение</DefaultButton>
        <DefaultButton
          key='viewAddIcon'
          onClick={() => {
            onChangeView(!viewAddIcon)
          }}
        >Добавить иконку</DefaultButton>
        {
          viewAddText ?
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
            }
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
      <div>
        <Label>Backgroung</Label>
        <ComboBox
          key='background'
          selectedKey={
            activeArea !== undefined && area.style && area.style.background
              ? Object.keys(theme.palette).findIndex( color => color === area.style!.background)
              : Object.keys(theme.palette).findIndex( color => color === 'white')
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
            <div>
              <Label>Color</Label>
              <ComboBox
                key='border-color'
                selectedKey={
                  activeArea !== undefined && area.style && area.style.border.color
                    ? Object.keys(theme.palette).findIndex( color => color === area.style!.border.color)
                    : Object.keys(theme.palette).findIndex( color => color === 'white')
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
                  designerDispatch({ type: 'SET_STYLE_AREA', style: {...area.style!, border: {...area.style!.border, color: value!.text} } })
                }}
              />
            </div>
          </>
          : undefined
        }
      </div>
    </>
    : selectedField && activeArea !== undefined
      ? <>
        <Label>{`Выбранный объект: ${selectedField}`}</Label>
        {
          additionallyObject
            ? <TextField
              key='setNewValueText'
              value={valueText}
              onChange={(event, newValue) => {
                newValue
                ? setValueText(newValue)
                : setValueText('')
              }}
              onKeyDown={
                (event: React.KeyboardEvent<HTMLInputElement>) => {
                  if(event.key === 'Enter') {
                    if(additionallyObject.texts && additionallyObject.texts.some(text => text === selectedField)) {
                      designerDispatch({ type: 'SET_ADDITIONALLY_TEXT', text: selectedField, newText: valueText })
                    }
                    if(additionallyObject.images && additionallyObject.images.some(image => image === selectedField)) {
                      designerDispatch({ type: 'SET_ADDITIONALLY_IMAGE', image: selectedField, setURL: valueText })
                    }
                    if(additionallyObject.icons && additionallyObject.icons.some(icon => icon === selectedField)) {
                      designerDispatch({ type: 'SET_ADDITIONALLY_ICON', icon: selectedField, setTitle: valueText })
                    }
                    changes.current = { grid, selection, areas, activeArea, previewMode, additionallyObject } as IDesignerState
                  }
                }
              }
            />
          : undefined
        }
        <Label></Label>
      </>
      : undefined
    }
    </div>
  </>
  }

  const TabFields = (): JSX.Element => {
    const theme = getTheme();
    const dragEnterClass = mergeStyles({
      backgroundColor: theme.palette.neutralLight
    });

    const _draggedItem = useRef<any>(undefined);
    const _draggedIndex = useRef(-1);

    const allObjects = [...(additionallyObject ? [additionallyObject.texts!, additionallyObject.images!, additionallyObject.icons!]
      .reduce((arr, curr) => {return curr ? [...arr, ...curr] : [...arr] }, []) : []), ...fields!.map(field => `${field.caption}-${field.fieldName}-${field.eqfa!.attribute}`)];

    const selectedObjects = allObjects.filter( object => !!areas[activeArea!].fields.find(areaF => areaF === object))
    const unSelectedObjects = allObjects.filter( object => !areas[activeArea!].fields.some(areaF => areaF === object))
    const items = [...areas[activeArea!].fields.map(item => ({key: item, name: item})), ...unSelectedObjects.map(item => ({key: item, name: item}))]

    const [selectionForDL, setSelection] = useState(new Selection({
      onSelectionChanged: () => {
        designerDispatch({ type: 'SET_FIELDS_AREA', fields: selectionForDL.getSelection().map(item => (item.key as string)) });
        changes.current = { grid, selection, areas, activeArea, previewMode, additionallyObject } as IDesignerState;
      },
      getKey: (item: any) => item.key
    }))

    useEffect( () => {
      if(selectionForDL) {
        selectionForDL.setChangeEvents(false, false);
        selectedObjects.forEach(item => {
          selectionForDL.setKeySelected(item, true, false)
        })
      selectionForDL.setChangeEvents(true, true);
      }
    }, [])

    const _insertBeforeItem = (item: any): void => {
      const draggedItems = selectionForDL.isIndexSelected(_draggedIndex.current)
        ? (selectionForDL.getSelection())
        : [_draggedItem.current];
  
      const itemsfilter = items.filter(itm => draggedItems.indexOf(itm) === -1);
      let insertIndex = itemsfilter.indexOf(item);
  
      if (insertIndex === -1) {
        insertIndex = 0;
      }
  
      itemsfilter.splice(insertIndex, 0, ...draggedItems);
    }

    return <>
    <div>
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
            text: 'колонкой',
            styles: {
              root: {
                paddingRight: '8px'
              }
            }
          },
          {
            key: 'row',
            text: 'строкой'
          }
        ]}
        selectedKey={areas[activeArea!].direction}
        label='Положение объектов'
        onChange={(_, option) =>
          option
          && designerDispatch({ type: 'CONFIGURE_AREA', direction: option.key as TDirection })
          && (changes.current = { grid, selection, areas, activeArea, previewMode, additionallyObject } as IDesignerState)
        }
      />
    </div>
      <Label>
        Отобразить объекты:
      </Label>
      <MarqueeSelection selection={selectionForDL}>
        <DetailsList
          setKey="items"
          items={items}
          columns={buildColumns(items, true).filter(column => column.key !== 'key')}
          selection={selectionForDL}
          dragDropEvents={{
            canDrop: () => true,
            canDrag: () => true,
            onDragEnter: () => dragEnterClass,
            onDragLeave: undefined,
            onDrop: (item?: any, event?: DragEvent) => {
              if (_draggedItem.current) {
                _insertBeforeItem(item);
                const position = items.findIndex(object => object === item)
                designerDispatch({ type: 'DRAG_FIELD', field: _draggedItem.current.key, position: position - 1 });
                changes.current = { grid, selection, areas, activeArea, previewMode, additionallyObject } as IDesignerState;
              }
            },
            onDragStart: (item?: any, itemIndex?: number) => {
              _draggedItem.current = item;
              _draggedIndex.current = itemIndex!;
            },
            onDragEnd: () => {
              _draggedItem.current = undefined;
              _draggedIndex.current = -1;
            }
          }}
          selectionPreservedOnEmptyClick={true}
          enterModalSelectionOnTouch={true}
        />
      </MarqueeSelection>
    </>
  }

  const MemoTabFields = React.memo(TabFields, (prevProps, nextProps) => {
    if (prevProps === nextProps) {
      return true;
    }
    return false;
  })

  const WithAreaExplorer = CSSModules((props: { children: JSX.Element }): JSX.Element => {
    const tabs = ["Свойства", "Объекты"];
    const theme = getTheme();
    const canSelectedTabs = selectedField ? [tabs[0]] : tabs;

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
                backgroundColor: getTheme().semanticColors.bodyBackground,
                color: getTheme().semanticColors.bodyText
              }}
            >
              {canSelectedTabs.map(t =>
                (activeTab === undefined ? (t === 'Свойства') : (t === activeTab)) ? (
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
                        backgroundColor: getTheme().semanticColors.bodyBackground,
                        color: getTheme().semanticColors.bodyText
                      }}
                      key={t}
                    >
                      <div
                        className="SettingFormActiveColor"
                        style={{
                          height: '5px',
                          borderLeft: '1px solid',
                          borderRight: '1px solid',
                          borderColor: getTheme().semanticColors.bodyText,
                          backgroundColor: getTheme().palette.themeSecondary
                        }}
                      />
                      <div
                        className="SettingFormTabText SignInFormActiveTab"
                        style={{
                          flex: '1 0 auto',
                          padding: '2px 4px 0px 4px',
                          textAlign: 'center',
                          minHeight: '27px',
                          width: '100%',
                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          borderLeft: '1px solid',
                          borderRight: '1px solid',
                          borderColor: getTheme().semanticColors.bodyText
                        }}
                      >{t}</div>
                    </div>
                    <div
                      className="SettingFormTabSpace"
                      style={{
                        minWidth: '4px',
                        backgroundColor: 'transparent',
                        borderBottom: '1px solid',
                        borderColor: getTheme().semanticColors.bodyText,
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
                          backgroundColor: getTheme().semanticColors.bodyBackground,
                          color: getTheme().semanticColors.bodyText,
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
                            padding: '2px 4px 0px 4px',
                            textAlign: 'center',
                            minHeight: '27px',
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            borderLeft: '1px solid',
                            borderRight: '1px solid',
                            borderTop: '1px solid',
                            borderColor: getTheme().semanticColors.bodyText
                          }}
                        >{t}</div>
                        <div
                          className="SettingFormInactiveShadow"
                          style={{
                            borderColor: getTheme().semanticColors.bodyText,
                            backgroundColor: getTheme().semanticColors.bodyDivider,
                            height: '6px',
                            flex: '0 0 initial',
                            justifySelf: 'flex-end',
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
                          borderColor: getTheme().semanticColors.bodyText,
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
                  borderBottom: '1px solid',
                  flex: '1 1 auto',
                  justifySelf: 'flex-end',
                  borderColor: getTheme().semanticColors.bodyText
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
              { activeTab === undefined || activeTab === 'Свойства' ?
                <TabSettingsArea />
              :
                  <MemoTabFields />
                }
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
          background: area.style ? Object.values(theme.palette)[Object.keys(theme.palette).findIndex(color => color === area.style!.background)] : theme.palette.white,
          margin: area.style && area.style.margin ? `${area.style.margin}px` : '0px',
          padding: area.style && area.style.padding ? `${area.style.padding}px` : '4px',
          border: !area.style || area.style.border.style === 'none' ? `1px solid ${previewMode ? area.style!.background : theme.semanticColors.inputBorder}` : `${area.style.border.width}px ${area.style.border.style} ${Object.values(theme.palette)[Object.keys(theme.palette).findIndex(color => color === area.style!.border.color)]}`,
          borderRadius: area.style && area.style.border.radius ? `${area.style.border.radius}px` : undefined,
        }}
        onClick={getOnMouseDownForArea(idx)}
        onContextMenu={getOnContextMenuForArea()}
        >
          <div
            style={
              previewMode
              ? {
                margin: '1px',
                padding: '4px',
                display: 'flex',
                height: '100%',
                width: '100%',
                minHeight: '64px',
                flexDirection: area.direction,
                flexWrap: 'wrap',
                alignContent: 'flex-start'
              }
              : activeArea === idx
                ? {
                  margin: '1px',
                  borderRadius: '4px',
                  padding: '4px',
                  border: '2px dashed',
                  borderColor: getTheme().palette.themeSecondary,
                  height: '100%',
                  width: '100%',
                  minHeight: '64px',
                  display: 'flex',
                  flexDirection: area.direction,
                  flexWrap: 'wrap',
                  alignContent: 'flex-start'
                }
                : {
                  margin: '1px',
                  padding: '4px',
                  display: 'flex',
                  height: '100%',
                  width: '100%',
                  minHeight: '64px',
                  flexDirection: area.direction,
                  flexWrap: 'wrap',
                  alignContent: 'flex-start'
                }
            }
          >
          {
            area.fields.map(f => {
              const fd: IFieldDef | undefined = rs!.fieldDefs.find(fieldDef =>
                `${fieldDef.caption}-${fieldDef.fieldName}-${fieldDef.eqfa!.attribute}` === f
              );
              return fd !== undefined
              ? <div
                key={f}
                onClick={getOnMouseDownForField(idx, f)}
                style={{minWidth: '64px', width: area.direction === 'row' ? undefined : '100%'}}
              ><FieldMemo key={f} fd={fd} field={f} areaStyle={area.style!} aeraDirection={area.direction} /></div>
              : additionallyObject
                ? additionallyObject.texts && additionallyObject.texts!.find(text => text === f)
                ? <div key={f} onClick={getOnMouseDownForField(idx, f)} style={{minWidth: '64px', width: area.direction === 'row' ? undefined : '100%'}}>
                    <Label>{f}</Label>
                  </div>
                : additionallyObject.images && additionallyObject.images.find(image => image === f)
                  ? <Image key={f} onClick={getOnMouseDownForField(idx, f)} height={100} width={100} src={f} alt='Text' styles={{ root: {borderColor: theme.semanticColors.inputBorder}}} />
                  : additionallyObject.icons && additionallyObject!.icons.find(icon => icon === f)
                    ? <IconButton key={f} iconProps={{ iconName: f }} onClick={getOnMouseDownForField(idx, f)} />
                    : undefined
                : undefined
            })
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
                },
                input: {
                  backgroundColor: getTheme().semanticColors.inputBackground,
                  color: getTheme().semanticColors.inputText,
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

      const theme = getTheme();

  return (
    <>
      <CommandBar key={'commandBar'} items={commandBarItems}/>
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
                  styleName="commonStyle"
                  style={{
                    gridArea: `${selection.top + 1} / ${selection.left + 1} / ${selection.bottom + 2} / ${selection.right + 2}`,
                    backgroundImage: `linear-gradient(
                      135deg,
                      ${theme.palette.themeSecondary} 4.55%,
                      ${theme.palette.white} 4.55%,
                      ${theme.palette.white} 50%,
                      ${theme.palette.themeSecondary} 50%,
                      ${theme.palette.themeSecondary} 54.55%,
                      ${theme.palette.white} 54.55%,
                      ${theme.palette.white} 100%
                    )`
                  }}
                  onClick={() => {
                    designerDispatch({ type: 'CLEAR_SELECTION' });
                    changes.current = { grid, selection, areas, activeArea, previewMode, additionallyObject } as IDesignerState;
                  }}
                >
                </div>
            }
          </div>
      </WithAreaExplorer>
    </>
  );
}, styles, { allowMultiple: true });
