import React, { useReducer, useMemo, useCallback } from "react";
import { IDesigner2Props } from "./Designer2.types";
import { useTab } from "./useTab";
import { ICommandBarItemProps, CommandBar, getTheme, Dropdown, Stack, Label, TextField, ChoiceGroup } from "office-ui-fabric-react";
import { ColorDropDown } from "./ColorDropDown";
import { GridInspector } from "./GridInspector";
import { IRectangle, IGridSize, ISize, Object, TObjectType, objectNamePrefixes, IArea, isArea, ILabel, IField, IImage, IWindow, isWindow, areas } from "./types";
import { inRect, makeRect, rectIntersect, isValidRect, outOfBorder, rect, object2style, object2IStyle } from "./utils";
import { SelectFields } from "./SelectFields";
import { WithSelectionFrame } from "./WithSelectionFrame";

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
  gridMode?: boolean;
  selectFieldsMode?: boolean;
  objects: Object[];
  selectedObject?: Object;
};

const undo: IDesigner2State[] = [];
const redo: IDesigner2State[] = [];

const getDefaultState = (): IDesigner2State => {
  const objects: Object[] = [
    {
      name: 'Window',
      type: 'WINDOW'
    },
    {
      name: 'Area1',
      type: 'AREA',
      left: 0,
      top: 0,
      right: 0,
      bottom: 0
    }
  ];

  return {
    grid: {
      columns: [{ unit: 'FR', value: 1 }],
      rows: [{ unit: 'FR', value: 1 }],
    },
    objects,
    selectedObject: objects.find( object => object.type === 'WINDOW' )
  };
};

type Action = { type: 'TOGGLE_PREVIEW_MODE' }
  | { type: 'SHOW_GRID', gridMode: boolean }
  | { type: 'SET_GRID_SELECTION', gridSelection?: IRectangle }
  | { type: 'UPDATE_GRID', updateColumn: boolean, idx: number, newSize: ISize }
  | { type: 'SELECT_OBJECT', object?: Object }
  | { type: 'SELECT_OBJECT_BY_NAME', name: string }
  | { type: 'CREATE_LABEL', text?: string }
  | { type: 'CREATE_IMAGE' }
  | { type: 'CREATE_FIELD', fieldName: string, label?: string, makeSelected?: boolean }
  | { type: 'UPDATE_OBJECT', newProps: Partial<Object> }
  | { type: 'SELECT_FIELDS', show: boolean }
  | { type: 'MOVE_OBJECT', delta: number }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'CREATE_AREA' }
  | { type: 'DELETE_OBJECT' }
  | { type: 'ADD_COLUMN' }
  | { type: 'ADD_ROW' }
  | { type: 'DELETE_COLUMN' }
  | { type: 'DELETE_ROW' };

function reducer(state: IDesigner2State, action: Action): IDesigner2State {

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

  switch (action.type) {
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
        selectedObject: undefined,
        gridSelection: undefined
      }
    }

    case 'SET_GRID_SELECTION': {
      if (!action.gridSelection) {
        return {
          ...state,
          gridSelection: undefined
        }
      }

      const area = state.objects
        .filter( object => object.type === 'AREA' )
        .find( area => rectIntersect(area as IArea, action.gridSelection!) );

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

    case 'SELECT_FIELDS': {
      return {
        ...state,
        selectFieldsMode: action.show
      }
    }

    case 'SELECT_OBJECT': {
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
        ...state.objects.filter( object => object.type === 'WINDOW' || object.type === 'AREA' ),
        ...state.objects.filter( object => object.type !== 'WINDOW' && object.type !== 'AREA' )
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
      if (!state.selectedObject || isWindow(state.selectedObject)) {
        return state;
      }

      if (!state.gridMode && isArea(state.selectedObject)) {
        if (state.objects.filter( object => isArea(object)).length === 1) {
          return state;
        }
      }

      return {
        ...state,
        selectedObject: undefined,
        objects: state.objects.filter( object => object !== state.selectedObject )
      }
    }

    case 'SELECT_OBJECT_BY_NAME': {
      return {
        ...state,
        selectedObject: state.objects.find( object => object.name === action.name )
      }
    }

    case 'CREATE_LABEL': {
      const { selectedObject } = state;

      if (!selectedObject || !isArea(selectedObject)) {
        return state;
      }

      const name = getObjectName('LABEL');

      const newObject: ILabel = {
        name,
        parent: selectedObject.name,
        type: 'LABEL',
        text: action.text ? action.text : name
      };

      return {
        ...state,
        objects: [...state.objects, newObject],
        selectedObject: newObject
      }
    }

    case 'CREATE_IMAGE': {
      const { selectedObject } = state;

      if (!selectedObject || !isArea(selectedObject)) {
        return state;
      }

      const name = getObjectName('IMAGE');

      const newObject: IImage = {
        name,
        parent: selectedObject.name,
        type: 'IMAGE',
        alt: name
      };

      return {
        ...state,
        objects: [...state.objects, newObject],
        selectedObject: newObject
      }
    }

    case 'CREATE_FIELD': {
      const { selectedObject } = state;

      if (!selectedObject || !isArea(selectedObject)) {
        return state;
      }

      const name = getObjectName('FIELD');

      const newObject: IField = {
        name,
        parent: selectedObject.name,
        type: 'FIELD',
        fieldName: action.fieldName,
        label: action.label ? action.label : action.fieldName
      };

      return {
        ...state,
        objects: [...state.objects, newObject],
        selectedObject: action.makeSelected ? newObject : state.selectedObject
      }
    }

    case 'UPDATE_OBJECT': {
      if (!state.selectedObject) {
        return state;
      }

      const updatedObject = {...state.selectedObject, ...action.newProps} as Object;

      if (isArea(updatedObject)) {
        if (!isValidRect(updatedObject) || outOfBorder(updatedObject, rect(0, 0, state.grid.columns.length - 1, state.grid.rows.length - 1))) {
          return state;
        }
      }

      return {
        ...state,
        objects: state.objects.map( object => object === state.selectedObject ? updatedObject : object ),
        selectedObject: updatedObject
      }
    }

    case 'CREATE_AREA': {
      if (state.gridSelection) {
        const newArea: IArea = { name: getObjectName('AREA'), type: 'AREA', parent: 'Window', ...state.gridSelection };
        return {
          ...state,
          selectedObject: newArea,
          objects: [...state.objects, newArea],
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
        gridSelection: undefined
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
        gridSelection: undefined
      }
    }
  }

  return state;
};

export const Designer2 = (props: IDesigner2Props): JSX.Element => {

  const { viewTab, url, dispatch, erModel } = props;
  const [state, designerDispatch] = useReducer(reducer, getDefaultState());
  const { grid, previewMode, gridMode, gridSelection, objects, selectedObject, selectFieldsMode } = state;

  useTab(viewTab, url, 'Designer2', true, dispatch);

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
          <div
            key={`grid_cell_${y + 1} / ${x + 1} / ${y + 2} / ${x + 2}`}
            style={{
              gridArea: `${y + 1} / ${x + 1} / ${y + 2} / ${x + 2}`,
              borderColor: getTheme().palette.neutralTertiary,
              backgroundColor: inRect(gridSelection, x, y) ? getTheme().palette.red : undefined,
              border: '1px dotted',
              borderRadius: '4px',
              margin: '2px',
              zIndex: 10,
              padding: '4px',
              opacity: 0.6
            }}
            onClick={ e => {
              e.stopPropagation();
              e.preventDefault();
              if (e.shiftKey && gridSelection) {
                designerDispatch({ type: 'SET_GRID_SELECTION', gridSelection: makeRect(gridSelection, x, y) });
              } else {
                designerDispatch({ type: 'SET_GRID_SELECTION', gridSelection: { left: x, top: y, right: x, bottom: y } });
              }
            }}
          >
            {`(${x}, ${y})`}
          </div>
        )
      }
    }
    return res;
  }, [grid, gridSelection]);

  const getAreas = useCallback( () => areas(objects).map( area => {
    const areaStyle = gridMode
      ? {
        borderColor: getTheme().palette.themeDark,
        backgroundColor: getTheme().palette.themePrimary,
        opacity: area === selectedObject ? 0.5 : 0.3,
        border: '1px solid',
        borderRadius: '4px',
        margin: '2px',
        padding: '4px',
        zIndex: 1
      }
      : previewMode
      ? {
        ...object2style(area),
        padding: '4px'
      }
      : {
        ...object2style(area),
        border: area === selectedObject ? '1px dotted' : '1px dashed',
        borderColor: area === selectedObject ? getTheme().palette.themePrimary : getTheme().palette.themeLight,
        borderRadius: '4px',
        padding: '4px'
      };

    const createControl = (object: Object) => {
      switch (object.type) {
        case 'LABEL':
          return (
            <Label
              key={object.name}
              styles={{ root: object2IStyle(object) }}
              onClick={
                e => {
                  e.stopPropagation();
                  designerDispatch({ type: 'SELECT_OBJECT', object });
                }
              }
            >
              {object.text}
            </Label>
          );

        case 'FIELD':
          return (
            <div
              onClick={
                e => {
                  e.stopPropagation();
                  designerDispatch({ type: 'SELECT_OBJECT', object });
                }
              }
            >
              <TextField
                styles={{
                  root: object2IStyle(object),
                  wrapper: object2IStyle(object)
                }}
                label={object.label}
              />
            </div>
          )

        default:
          return null;
      }
    };

    return (
      <div
        key={area.name}
        style={{
          ...areaStyle,
          gridArea: `${area.top + 1} / ${area.left + 1} / ${area.bottom + 2} / ${area.right + 2}`,
        }}
        onClick={ previewMode ? undefined :
          e => {
            e.stopPropagation();
            designerDispatch({ type: 'SELECT_OBJECT', object: area });
          }
        }
      >
        {
          gridMode
          ?
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                fontWeight: 600,
                fontSize: '48px',
                color: 'black'
              }}
            >
              <div>
                {area.name}
              </div>
            </div>
          :
            <Stack horizontal={area.horizontal}>
              {
                objects
                  .filter( object => object.parent === area.name )
                  .map( object => <WithSelectionFrame key={object.name} selected={object === selectedObject}>{createControl(object)}</WithSelectionFrame> )
              }
            </Stack>
        }
      </div>
    )
  }), [objects, selectedObject, grid, gridSelection, gridMode, previewMode]);

  const commandBarItems: ICommandBarItemProps[] = useMemo( () => [
    {
      key: 'insertField',
      disabled: previewMode || gridMode || !selectedObject || selectedObject.type !== 'AREA' || !erModel,
      text: 'Insert Field',
      iconOnly: true,
      iconProps: { iconName: 'TextField' },
      onClick: () => designerDispatch({ type: 'SELECT_FIELDS', show: true })
    },
    {
      key: 'insertLabel',
      disabled: previewMode || gridMode || !selectedObject || selectedObject.type !== 'AREA',
      text: 'Insert Label',
      iconOnly: true,
      iconProps: { iconName: 'InsertTextBox' },
      onClick: () => designerDispatch({ type: 'CREATE_LABEL' })
    },
    {
      key: 'insertPicture',
      disabled: previewMode || gridMode || !selectedObject || selectedObject.type !== 'AREA',
      text: 'Insert Picture',
      iconOnly: true,
      iconProps: { iconName: 'PictureCenter' },
      onClick: () => designerDispatch({ type: 'CREATE_IMAGE' })
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
      disabled: previewMode || !selectedObject || isWindow(selectedObject) || (!gridMode && isArea(selectedObject) && areas(objects).length === 1),
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
      disabled: previewMode || gridMode || !selectedObject || selectedObject.type === 'WINDOW' || selectedObject.type === 'AREA',
      text: 'Move Up',
      iconOnly: true,
      iconProps: { iconName: 'Up' },
      onClick: () => designerDispatch({ type: 'MOVE_OBJECT', delta: -1 })
    },
    {
      key: 'moveDown',
      disabled: previewMode || gridMode || !selectedObject || selectedObject.type === 'WINDOW' || selectedObject.type === 'AREA',
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
      disabled: previewMode || !gridMode || !gridSelection || areas(objects).some( area => rectIntersect(area, gridSelection) ),
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

  const WithObjectInspector = ({ children }: { children: JSX.Element }) => {
    if (previewMode) {
      return children;
    }

    return (
      <div
        style = {{
          display: 'grid',
          width: '100%',
          height: '100%',
          gridTemplateColumns: '1fr 320px',
          gridTemplateRows: '1fr'
        }}
      >
        <div
          style={{
            gridArea: '1 1 2 2',
            width: '100%'
          }}
        >
          {children}
        </div>
        <div
          style={{
            gridArea: '1 2 2 3',
            paddingRight: '4px'
          }}
        >
          <div
            style={{
              border: '1px solid dimGray',
              borderRadius: '4px',
              height: 'calc(100% - 48px)',
              padding: '4px'
            }}
          >
            {
              gridMode
              ?
                <GridInspector
                  grid={grid}
                  selectedArea={selectedObject && selectedObject.type === 'AREA' ? selectedObject : undefined}
                  onUpdateGrid={ (updateColumn, idx, newSize) => designerDispatch({ type: 'UPDATE_GRID', updateColumn, idx, newSize }) }
                  onChangeArea={ newArea => designerDispatch({ type: 'UPDATE_OBJECT', newProps: newArea }) }
                />
              :
                <>
                  <Dropdown
                    label="Selected object"
                    selectedKey={selectedObject ? selectedObject.name : undefined}
                    onChange={ (_, option) => option && designerDispatch({ type: 'SELECT_OBJECT_BY_NAME', name: option.key as string }) }
                    options={ objects.map( object => ({ key: object.name, text: object.name }) ) }
                  />
                  {
                    !selectedObject
                    ? null
                    : selectedObject.type === 'LABEL'
                    ?
                      <TextField
                        label="Text"
                        value={selectedObject.text}
                        onChange={
                          (e, newValue?: string) => {
                            if (newValue !== undefined) {
                              designerDispatch({ type: 'UPDATE_OBJECT', newProps: { text: newValue } })
                            }
                          }
                        }
                      />
                    : selectedObject.type === 'AREA'
                    ? <ChoiceGroup
                        label="Direction"
                        selectedKey={ selectedObject.horizontal ? 'h' : 'v' }
                        options={[
                          { key: 'v', text: 'Vertical' },
                          { key: 'h', text: 'Horizontal' }
                        ]}
                        onChange={ (_e, option) => option && designerDispatch({ type: 'UPDATE_OBJECT', newProps: { horizontal: option.key === 'h' } }) }
                      />
                    : null
                  }
                  {
                    !selectedObject
                    ? null
                    :
                      <ColorDropDown
                        selectedColor={selectedObject.color}
                        label="Color"
                        onSelectColor={ color => designerDispatch({ type: 'UPDATE_OBJECT', newProps: { color } }) }
                      />
                  }
                  {
                    !selectedObject
                    ? null
                    :
                      <ColorDropDown
                        selectedColor={selectedObject.backgroundColor}
                        label="Background Color"
                        onSelectColor={ color => designerDispatch({ type: 'UPDATE_OBJECT', newProps: { backgroundColor: color } }) }
                      />
                  }
                </>
            }
          </div>
        </div>
      </div>
    );
  };

  const window = objects.find( object => object.type === 'WINDOW' ) as IWindow;

  return (
    <>
      <CommandBar items={commandBarItems} />
      {
        selectFieldsMode && erModel &&
        <SelectFields
          entity={erModel.entities['TgdcCompany']}
          onCreate={ fields => {
            if (fields.length === 1) {
              designerDispatch({ type: 'CREATE_FIELD', fieldName: fields[0].fieldName, label: fields[0].label, makeSelected: true });
            } else {
              fields.forEach( ({ fieldName, label}) => designerDispatch({ type: 'CREATE_FIELD', fieldName, label }) );
            }
            designerDispatch({ type: 'SELECT_FIELDS', show: false });
          } }
          onCancel={ () => designerDispatch({ type: 'SELECT_FIELDS', show: false }) }
        />
      }
      <WithObjectInspector>
        <div
          style={{...windowStyle, ...object2style(window)}}
          onClick={ e => {
            e.stopPropagation();
            e.preventDefault();
            designerDispatch({ type: 'SELECT_OBJECT', object: window });
          } }
        >
          {
            previewMode
              ? getAreas()
              : gridMode
              ? gridCells.concat(getAreas())
              : getAreas()
          }
        </div>
      </WithObjectInspector>
    </>
  )
};