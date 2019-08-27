import React, { useReducer, useMemo, useEffect } from "react";
import { IDesignerProps } from "./Designer.types";
import { useTab } from "./useTab";
import { ICommandBarItemProps, CommandBar } from "office-ui-fabric-react";
import { IRectangle, IGrid, ISize, Object, TObjectType, objectNamePrefixes, IArea, isArea, IWindow, isWindow, getAreas, Objects, IImage, deleteWithChildren, getWindow, IField } from "./types";
import { rectIntersect, isValidRect, object2style, sameRect, outOfGrid } from "./utils";
import { SelectFields } from "./SelectFields";
import { WithObjectInspector } from "./WithObjectInspector";
import { Area } from "./Area";
import { GridCell } from "./GridCell";
import { Entity } from 'gdmn-orm';
import { getLName } from "gdmn-internals";

/**
 *
 * Переведенная в режим настройки форма может находиться в трех состояних: Дизайнер, Сетка, Просмотр.
 *
 * В режиме сетки мы задаем параметры CSS Grid (количество строк и столбцов, их ширину и высоту),
 * а также создаем, изменяем или удаляем области. Область -- это прямоугольная часть сетки,
 * которая задается номерами столбца и колонки её левого верхнего и правого нижнего углов.
 * Области нужны для размещения на них управляющих элементов: полей ввода, меток, пиктограмок и т.п.
 * Области не могут пересекаться. Для создания области мы выделяем одну или несколько
 * клеток грида и выбираем соответствующую команду. Для изменения размеров области мы выделяем ее
 * в режиме Сетки и устанавливаем границы в окне Инспектора. Каждая область имеет уникальное имя
 * и набор свойств, которые настраиваются в окне Инспектора, в режиме Дизайнера.
 *
 * В режиме сетки доступны только команды настройки сетки, перехода в режим просмотра и выхода
 * из режима настройки формы.
 *
 * Режим просмотра позволяет скрыть инспектор свойств и дополнительную разметку и просмотреть
 * форму в виде, максимально приближенном к ее рабочему состоянию. В режиме просмотра доступны
 * только команды выхода из этого режима и выхода из режима настройки формы.
 *
 * Режим дизайнера позволяет:
 * 1) выбрать объект и настроить его свойства в инспекторе объектов.
 * 2) удалить выбранный объект.
 * 3) выбрать область и создать на ней новый объект.
 * 4) изменить порядок расположения объектов.
 *
 * Доступны следующие типы объектов:
 * 1) Область
 * 2) Метка (текст)
 * 3) Поле
 * 4) Изображение
 *
 * У каждого объекта есть уникальное в пределах формы, непустое имя. Для выбора объекта необходимо
 * щелкнуть по нему мышью или выбрать из выпадающего списка в Инспекторе объектов.
 *
 */

export interface IDesignerState {
  grid: IGrid;

  /**
   * Выделенная прямоугольная группа клеток в гриде. Используется для создания области.
   * Координаты области -- это номера клеток в гриде для левого верхнего
   * и правого нижнего углов. Если выделена одна клетка грида,
   * то left === right, top === bottom -- координаты выделенной клетки.
   */
  gridSelection?: IRectangle;
  previewMode?: boolean;
  gridMode?: boolean;
  selectFieldsMode?: boolean;
  objects: Objects;
  selectedObject?: Object;
};

const undo: IDesignerState[] = [];
const redo: IDesignerState[] = [];

interface IDesignerSerializedState {
  version: string;
  grid: IGrid;
  objects: Objects;
};

const getDefaultState = (entity?: Entity): IDesignerState => {
  const window: IWindow = {
    name: 'Window',
    type: 'WINDOW'
  };

  const area1: IArea = {
    name: 'Area1',
    type: 'AREA',
    parent: 'Window',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0
  };

  const image1: IImage = {
    name: 'Image1',
    type: 'IMAGE',
    parent: 'Area1',
    url: 'http://gsbelarus.com/gs/images/gs/2006/ged_logo.png'
  };

  const fields1: IField[] = entity ? Object.entries(entity.attributes).map(
      ([name, attr]) => ({
        type: 'FIELD',
        parent: 'Area1',
        fieldName: name,
        label: getLName(attr.lName, ['by', 'ru', 'en']),
        name: name
      } as IField)
    )
    : [];

  const objects: Objects = [window, area1, image1, ...fields1];

  return {
    grid: {
      columns: [{ unit: 'PX', value: 320 }],
      rows: [{ unit: 'FR', value: 1 }],
    },
    objects,
    selectedObject: window
  };
};

export const LOCAL_STORAGE_KEY = 'designerState';

const loadState = (entityName?: string, erModel?: Entity): IDesignerState => {
  const loaded = localStorage.getItem(`${LOCAL_STORAGE_KEY}/${entityName}`);

  if (loaded && entityName !== undefined) {
    const parsed = JSON.parse(loaded) as IDesignerSerializedState;

    if (parsed.version === '1.0' && Array.isArray(parsed.objects) && parsed.grid instanceof Object) {
      return parsed;
    }
  }

  return getDefaultState(erModel);
};

type Action = { type: 'TOGGLE_PREVIEW_MODE' }
  | { type: 'SHOW_GRID', gridMode: boolean }
  | { type: 'SET_GRID_SELECTION', gridSelection?: IRectangle }
  | { type: 'UPDATE_GRID', updateColumn: boolean, idx: number, newSize: ISize }
  | { type: 'SELECT_OBJECT', object?: Object }
  | { type: 'CREATE_LABEL' }
  | { type: 'CREATE_OBJECT', objectType: TObjectType, newProps?: Partial<Object>, makeSelected?: boolean }
  | { type: 'UPDATE_OBJECT', newProps: Partial<Object> }
  | { type: 'TOGGLE_SELECT_FIELDS' }
  | { type: 'MOVE_OBJECT', delta: number }
  | { type: 'RESET' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'CREATE_AREA' }
  | { type: 'DELETE_OBJECT' }
  | { type: 'ADD_COLUMN' }
  | { type: 'ADD_ROW' }
  | { type: 'DELETE_COLUMN' }
  | { type: 'DELETE_ROW' };

function reducer(state: IDesignerState, action: Action): IDesignerState {

  if (action.type === 'UNDO') {
    if (undo.length) {
      redo.push(state);
      return undo.pop()!;
    }

    return state;
  }

  if (action.type === 'REDO') {
    if (redo.length) {
      return redo.pop()!;
    }

    return state;
  }

  undo.push(state);
  if (undo.length > 20) {
    undo.shift();
  }

  redo.length = 0;

  const getObjectName = (objectType: TObjectType) => {
    for (let i = 1; i < 1000000; i++) {
      const name = `${objectNamePrefixes[objectType]}${i}`;
      if (!state.objects.find( object => object.name === name )) {
        return name;
      }
    }
    throw new Error(`Can't assign object namefor a type ${objectType}`);
  };

  const createObject = (type: TObjectType, props?: Partial<Object>, makeSelected: boolean = true): IDesignerState => {
    const partialProps = props ? { type, ...props } : { type };

    const { selectedObject } = state;

    if (!isArea(selectedObject)) {
      return state;
    }

    const name = partialProps.name || getObjectName(partialProps.type);

    const newObject = {
      name,
      parent: selectedObject.name,
      ...partialProps
    } as Object;

    return {
      ...state,
      objects: [...state.objects, newObject],
      selectedObject: makeSelected ? newObject : selectedObject
    }
  };

  switch (action.type) {
    case 'RESET':
      return getDefaultState();

    case 'TOGGLE_PREVIEW_MODE': {
      return {
        ...state,
        previewMode: !state.previewMode
      }
    }

    case 'SHOW_GRID': {
      return {
        ...state,
        gridMode: action.gridMode,
        selectedObject: isArea(state.selectedObject) ? state.selectedObject : undefined,
        gridSelection: undefined
      }
    }

    case 'SET_GRID_SELECTION': {
      if (sameRect(action.gridSelection, state.gridSelection)) {
        return state;
      }

      if (!action.gridSelection) {
        return {
          ...state,
          gridSelection: undefined
        }
      }

      const area = getAreas(state.objects)
        .find( area => rectIntersect(area, action.gridSelection) );

      return {
        ...state,
        selectedObject: area,
        gridSelection: action.gridSelection
      }
    }

    case 'UPDATE_GRID': {
      if (action.updateColumn) {
        const columns = [...state.grid.columns];

        columns[action.idx] = {
          ...columns[action.idx],
          ...action.newSize
        };

        return {
          ...state,
          grid: {
            ...state.grid,
            columns
          }
        }
      } else {
        const rows = [...state.grid.rows];

        rows[action.idx] = {
          ...rows[action.idx],
          ...action.newSize
        };

        return {
          ...state,
          grid: {
            ...state.grid,
            rows
          }
        }
      }
    }

    case 'TOGGLE_SELECT_FIELDS': {
      return {
        ...state,
        selectFieldsMode: !state.selectFieldsMode
      }
    }

    case 'SELECT_OBJECT': {
      if (state.selectedObject === action.object) {
        return state;
      }

      return {
        ...state,
        selectedObject: action.object
      }
    }

    case 'MOVE_OBJECT': {
      if (!state.selectedObject) {
        return state;
      }

      const newObjects = [
        ...state.objects.filter( object => isWindow(object) || isArea(object) ),
        ...state.objects.filter( object => !isWindow(object) && !isArea(object) )
      ];
      const idx = newObjects.findIndex( object => object === state.selectedObject );
      const newIdx = idx + action.delta;

      if (idx === newIdx || idx === -1 || newIdx < 0 || newIdx >= newObjects.length) {
        return state;
      }

      const temp = newObjects[newIdx];
      newObjects[newIdx] = newObjects[idx];
      newObjects[idx] = temp;

      return {
        ...state,
        objects: newObjects
      }
    }

    case 'DELETE_OBJECT': {
      const { selectedObject, objects, gridMode } = state;

      if (!selectedObject || isWindow(selectedObject)) {
        return state;
      }

      if (!gridMode && isArea(selectedObject)) {
        if (getAreas(objects).length === 1) {
          return state;
        }
      }

      return {
        ...state,
        selectedObject: undefined,
        objects: deleteWithChildren(selectedObject, objects)
      }
    }

    case 'CREATE_LABEL': {
      const name = getObjectName('LABEL');
      return createObject('LABEL', { name, text: name });
    }

    case 'CREATE_OBJECT': {
      const { objectType, newProps, makeSelected } = action;
      return createObject(objectType, newProps, makeSelected);
    }

    case 'UPDATE_OBJECT': {
      const { selectedObject, grid, objects } = state;
      const { newProps } = action;

      if (!selectedObject) {
        return state;
      }

      if (newProps.name && newProps.name !== selectedObject.name) {
        return state;
      }

      if (newProps.type && newProps.type !== selectedObject.type) {
        return state;
      }

      const updatedObject = {...selectedObject, ...newProps} as Object;

      if (isArea(updatedObject)) {
        if (
          !isValidRect(updatedObject)
          || outOfGrid(updatedObject, grid)
          || getAreas(objects).filter( area => area !== selectedObject ).some( area => rectIntersect(area, updatedObject) )
        ) {
          return state;
        }
      }

      if (!isWindow && !objects.some( object => object.name === updatedObject.parent )) {
        return state;
      }

      return {
        ...state,
        objects: objects.map( object => object === selectedObject ? updatedObject : object ),
        selectedObject: updatedObject
      }
    }

    case 'CREATE_AREA': {
      const { objects, gridSelection, grid } = state;

      if (gridSelection) {
        const newArea: IArea = { name: getObjectName('AREA'), type: 'AREA', parent: getWindow(objects).name, ...gridSelection };

        if (
          !isValidRect(newArea)
          || outOfGrid(newArea, grid)
          || getAreas(objects).some( area => rectIntersect(area, newArea) )
        ) {
          return state;
        }

        return {
          ...state,
          selectedObject: newArea,
          objects: [...objects, newArea],
          gridSelection: undefined
        }
      }
      return state;
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

    case 'DELETE_ROW': {
      if (!state.gridSelection || state.grid.rows.length <= 1) {
        return state;
      }

      let objects = state.objects;

      for (let y = state.gridSelection.bottom; y >= state.gridSelection.top; y--) {
        objects = objects
          .map( object => {
            if (isArea(object)) {
              if (object.top > y) {
                return {
                  ...object,
                  top: object.top - 1,
                  bottom: object.bottom - 1
                }
              }

              if (object.bottom >= y) {
                return {
                  ...object,
                  bottom: object.bottom - 1
                }
              }
            }

            return object;
          })
          .filter( object => !isArea(object) || object.bottom >= object.top );
      }

      const rows = [...state.grid.rows];
      rows.splice(state.gridSelection.top, state.gridSelection.bottom - state.gridSelection.top + 1)

      return {
        ...state,
        grid: {
          ...state.grid,
          rows,
        },
        objects,
        gridSelection: undefined,
        selectedObject: objects.find( object => object === state.selectedObject ) // область могла удалиться в процессе удаления строки
      }
    }

    case 'DELETE_COLUMN': {
      if (!state.gridSelection || state.grid.columns.length <= 1) {
        return state;
      }

      let objects = state.objects;

      for (let x = state.gridSelection.right; x >= state.gridSelection.left; x--) {
        objects = objects
          .map( object => {
            if (isArea(object)) {
              if (object.left > x) {
                return {
                  ...object,
                  left: object.left - 1,
                  right: object.right - 1
                }
              }

              if (object.right >= x) {
                return {
                  ...object,
                  right: object.right - 1
                }
              }
            }

            return object;
          })
          .filter( object => !isArea(object) || object.right >= object.left );
      }

      const columns = [...state.grid.columns];
      columns.splice(state.gridSelection.left, state.gridSelection.right - state.gridSelection.left + 1)

      return {
        ...state,
        grid: {
          ...state.grid,
          columns,
        },
        objects,
        gridSelection: undefined,
        selectedObject: objects.find( object => object === state.selectedObject ) // область могла удалиться в процессе удаления колонки
      }
    }
  }

  return state;
};

export const Designer = (props: IDesignerProps): JSX.Element => {

  const { viewTab, url, dispatch, erModel } = props;
  const [state, designerDispatch] = useReducer(reducer, loadState(url.split('/')[4], erModel ? erModel.entities[url.split('/')[4]] : undefined));
  const { grid, previewMode, gridMode, gridSelection, objects, selectedObject, selectFieldsMode } = state;

  const windowStyle = useMemo( (): React.CSSProperties => ({
    display: 'grid',
    width: '100%',
    height: 'calc(100% - 44px)',
    paddingLeft: '4px',
    paddingRight: '4px',
    paddingBottom: '4px',
    gridTemplateColumns: grid.columns.map(c => c.unit === 'AUTO' ? 'auto' : `${c.value ? c.value : 1}${c.unit}`).join(' '),
    gridTemplateRows: grid.rows.map(r => r.unit === 'AUTO' ? 'auto' : `${r.value ? r.value : 1}${r.unit}`).join(' '),
    overflow: 'auto',
    userSelect: gridMode ? 'none' : undefined,
  }), [grid, gridMode]);

  const gridCells = useMemo( () => {
    const res: JSX.Element[] = [];
    for (let x = 0; x < grid.columns.length; x++) {
      for (let y = 0; y < grid.rows.length; y++) {
        res.push(
          <GridCell
            x={x}
            y={y}
            gridSelection={gridSelection}
            onSetGridSelection={ r => designerDispatch({ type: 'SET_GRID_SELECTION', gridSelection: r }) }
          />
        )
      }
    }
    return res;
  }, [grid, gridSelection]);

  const renderAreas = () => getAreas(objects).map( area =>
    <Area
      previewMode={previewMode}
      gridMode={gridMode}
      selectedObject={selectedObject}
      objects={objects}
      area={area}
      onSelectObject={ object => designerDispatch({ type: 'SELECT_OBJECT', object }) }
    />
  );

  const commandBarItems: ICommandBarItemProps[] = useMemo( () => [
    {
      key: 'save',
      disabled: previewMode || gridMode,
      text: 'Save',
      iconOnly: true,
      iconProps: { iconName: 'Save' },
      onClick: () => {
        localStorage.setItem(`${LOCAL_STORAGE_KEY}/${url.split('/')[4]}`, JSON.stringify({ version: '1.0', grid, objects }) )
      }
    },
    {
      key: 'reset',
      disabled: previewMode || gridMode,
      text: 'Reset',
      iconOnly: true,
      iconProps: { iconName: 'Favicon' },
      onClick: () => designerDispatch({ type: 'RESET' })
    },
    {
      key: 'split0',
      disabled: true,
      iconOnly: true,
      iconProps: {
        iconName: 'Remove',
        styles: { root: { transform: 'rotate(90deg)' } }
      },
    },
    {
      key: 'insertField',
      disabled: previewMode || gridMode || !selectedObject || !isArea(selectedObject) || !erModel,
      text: 'Insert Field',
      iconOnly: true,
      iconProps: { iconName: 'TextField' },
      onClick: () => designerDispatch({ type: 'TOGGLE_SELECT_FIELDS' })
    },
    {
      key: 'insertLabel',
      disabled: previewMode || gridMode || !selectedObject || !isArea(selectedObject),
      text: 'Insert Label',
      iconOnly: true,
      iconProps: { iconName: 'InsertTextBox' },
      onClick: () => designerDispatch({ type: 'CREATE_LABEL' })
    },
    {
      key: 'insertPicture',
      disabled: previewMode || gridMode || !selectedObject || !isArea(selectedObject),
      text: 'Insert Picture',
      iconOnly: true,
      iconProps: { iconName: 'PictureCenter' },
      onClick: () => designerDispatch({ type: 'CREATE_OBJECT', objectType: 'IMAGE' })
    },
    {
      key: 'split1',
      disabled: true,
      iconOnly: true,
      iconProps: {
        iconName: 'Remove',
        styles: { root: { transform: 'rotate(90deg)' } }
      },
    },
    {
      key: 'deleteObject',
      disabled: previewMode || !selectedObject || isWindow(selectedObject) || (!gridMode && isArea(selectedObject) && getAreas(objects).length === 1),
      text: selectedObject && `Delete "${selectedObject.name}"`,
      iconOnly: true,
      iconProps: { iconName: 'Delete' },
      onClick: () => designerDispatch({ type: 'DELETE_OBJECT' })
    },
    {
      key: 'undo',
      disabled: previewMode || !undo.length,
      text: 'Undo',
      iconOnly: true,
      iconProps: { iconName: 'Undo' },
      onClick: () => designerDispatch({ type: 'UNDO' })
    },
    {
      key: 'redo',
      disabled: previewMode || !redo.length,
      text: 'Redo',
      iconOnly: true,
      iconProps: { iconName: 'Redo' },
      onClick: () => designerDispatch({ type: 'REDO' })
    },
    {
      key: 'split2',
      disabled: true,
      iconOnly: true,
      iconProps: {
        iconName: 'Remove',
        styles: { root: { transform: 'rotate(90deg)' } }
      },
    },
    {
      key: 'moveUp',
      disabled: previewMode || gridMode || !selectedObject || isWindow(selectedObject) || isArea(selectedObject),
      text: 'Move Up',
      iconOnly: true,
      iconProps: { iconName: 'Up' },
      onClick: () => designerDispatch({ type: 'MOVE_OBJECT', delta: -1 })
    },
    {
      key: 'moveDown',
      disabled: previewMode || gridMode || !selectedObject || isWindow(selectedObject) || isArea(selectedObject),
      text: 'Move Down',
      iconOnly: true,
      iconProps: { iconName: 'Down' },
      onClick: () => designerDispatch({ type: 'MOVE_OBJECT', delta: 1 })
    },
    {
      key: 'split3',
      disabled: true,
      iconOnly: true,
      iconProps: {
        iconName: 'Remove',
        styles: { root: { transform: 'rotate(90deg)' } }
      },
    },
    {
      key: 'gridMode',
      disabled: previewMode,
      checked: gridMode,
      text: 'Show Grid',
      iconOnly: true,
      iconProps: { iconName: 'Tiles' },
      onClick: () => designerDispatch({ type: 'SHOW_GRID', gridMode: !gridMode })
    },
    {
      key: 'addColumn',
      disabled: previewMode || !gridMode,
      text: 'Add Column',
      iconOnly: true,
      iconProps: { iconName: 'InsertColumnsRight' },
      onClick: () => designerDispatch({ type: 'ADD_COLUMN' })
    },
    {
      key: 'addRow',
      disabled: previewMode || !gridMode,
      text: 'Add Row',
      iconOnly: true,
      iconProps: { iconName: 'InsertRowsBelow' },
      onClick: () => designerDispatch({ type: 'ADD_ROW' })
    },
    {
      key: 'deleteColumn',
      disabled: previewMode || !gridMode || !gridSelection || grid.columns.length <= 1,
      text: 'Delete Column',
      iconOnly: true,
      iconProps: { iconName: 'DeleteColumns' },
      onClick: () => designerDispatch({ type: 'DELETE_COLUMN' })
    },
    {
      key: 'deleteRow',
      disabled: previewMode || !gridMode || !gridSelection || grid.rows.length <= 1,
      text: 'Delete Row',
      iconOnly: true,
      iconProps: { iconName: 'DeleteRows' },
      onClick: () => designerDispatch({ type: 'DELETE_ROW' })
    },
    {
      key: 'createArea',
      disabled: previewMode || !gridMode || !gridSelection || getAreas(objects).some( area => rectIntersect(area, gridSelection) ),
      text: 'Create Area',
      iconOnly: true,
      iconProps: { iconName: 'SelectAll' },
      onClick: () => designerDispatch({ type: 'CREATE_AREA' })
    },
    {
      key: 'split4',
      disabled: true,
      iconOnly: true,
      iconProps: {
        iconName: 'Remove',
        styles: { root: { transform: 'rotate(90deg)' } }
      },
    },
    {
      key: 'preview',
      text: 'Preview',
      checked: previewMode,
      iconOnly: true,
      iconProps: { iconName: 'RedEye' },
      onClick: () => designerDispatch({ type: 'TOGGLE_PREVIEW_MODE' })
    }
  ], [previewMode, gridMode, objects, selectedObject, grid, gridSelection]);

  const window = objects.find( object => isWindow(object) ) as IWindow;

  return (
    <>
      <CommandBar items={commandBarItems} />
      {
        selectFieldsMode && erModel &&
        <SelectFields
          entity={erModel.entities['TgdcCompany']}
          onCreate={ fields => {
            fields.forEach( ({ fieldName, label }) => designerDispatch({ type: 'CREATE_OBJECT', objectType: 'FIELD', newProps: { fieldName, label }, makeSelected: fields.length === 1 }) );
            designerDispatch({ type: 'TOGGLE_SELECT_FIELDS' });
          } }
          onCancel={ () => designerDispatch({ type: 'TOGGLE_SELECT_FIELDS' }) }
        />
      }
      <WithObjectInspector
        previewMode={previewMode}
        gridMode={gridMode}
        grid={grid}
        objects={objects}
        selectedObject={selectedObject}
        onUpdateGrid={ (updateColumn, idx, newSize) => designerDispatch({ type: 'UPDATE_GRID', updateColumn, idx, newSize }) }
        onUpdateSelectedObject={ newProps => designerDispatch({ type: 'UPDATE_OBJECT', newProps }) }
        onSelectObject={ object => designerDispatch({ type: 'SELECT_OBJECT', object }) }
      >
        <div
          style={{...windowStyle, ...object2style(window, objects, !gridMode)}}
          onClick={ e => {
            e.stopPropagation();
            e.preventDefault();
            designerDispatch({ type: 'SELECT_OBJECT', object: window });
          } }
        >
          {
            previewMode
              ? renderAreas()
              : gridMode
              ? gridCells.concat(renderAreas())
              : renderAreas()
          }
        </div>
      </WithObjectInspector>
    </>
  )
};
