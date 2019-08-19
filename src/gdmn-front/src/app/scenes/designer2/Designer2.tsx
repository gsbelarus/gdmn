import React, { useReducer, useMemo } from "react";
import { IDesigner2Props } from "./Designer2.types";
import { useTab } from "./useTab";
import { ICommandBarItemProps, CommandBar, getTheme, Dropdown, Stack, Label, TextField, ChoiceGroup } from "office-ui-fabric-react";
import { ColorDropDown } from "./ColorDropDown";
import { GridInspector } from "./GridInspector";
import { IRectangle, IGridSize } from "./types";
import { inRect, makeRect, rectIntersect } from "./utils";

/**
 *
 * Переведенная в режим настройки форма может находиться в трех состояних: Дизайнер, Сетка, Просмотр.
 *
 * В режиме сетки мы задаем параметры CSS Grid (количество строк и столбцов, их ширину и высоту),
 * а также создаем, изменяем или удаляем области. Области нужны для размещения на них управляющих
 * элементов: полей ввода, меток, пиктограмок и т.п. Для создания области мы выделяем одну или несколько
 * клеток грида и выбираем соответствующую команду. Для расширения мы выделяем клетку (клетки),
 * прилежащие к области. Для уменьшения -- клетку (клетки) внутри области. Область -- это
 * прямоугольная часть сетки, которая задается номерами столбца и колонки её левого верхнего
 * и правого нижнего углов. Области не могут пересекаться. Каждая область -- это объект с уникальным
 * именем и своими свойствами. Свойства области настраиваются в режиме Дизайнера.
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
 *
 * Доступны следующие типы объектов:
 * 1) Область
 * 2) Метка (текст)
 * 3) Поле
 *
 * У каждого объекта есть уникальное в пределах формы, непустое имя. Для выбора объекта необходимо
 * щелкнуть по нему мышью или выбрать из выпадающего списка в Инспекторе объектов.
 *
 */

type TObjectType = 'WINDOW' | 'AREA' | 'LABEL';

const objectNamePrefixes = {
  'WINDOW': 'Window',
  'AREA': 'Area',
  'LABEL': 'Label'
};

interface IObject {
  name: string;
  parent?: string;
  type: TObjectType;
  color?: string;
  backgroundColor?: string;
};

interface IWindow extends IObject {
  type: 'WINDOW';
};

function isWindow(x: IObject): x is IArea {
  return x.type === 'WINDOW';
};

interface ILabel extends IObject {
  type: 'LABEL';
  text: string;
};

interface IObjectWithCoord extends IObject, IRectangle { };

interface IArea extends IObjectWithCoord {
  type: 'AREA';
  horizontal?: boolean;
};

function isArea(x: IObject): x is IArea {
  return x.type === 'AREA';
};

type Object = IWindow | IArea | ILabel;

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
  selectedObject?: Object;
};

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
      right: 1,
      bottom: 1
    }
  ];

  return {
    grid: {
      columns: [{ unit: 'PX', value: 350 }, { unit: 'FR', value: 1 }, { unit: 'FR', value: 1 }],
      rows: [{ unit: 'FR', value: 1 }, { unit: 'FR', value: 1 }, { unit: 'FR', value: 1 }],
    },
    showGrid: true,
    objects,
    selectedObject: objects.find( object => object.type === 'WINDOW' )
  };
};

type Action = { type: 'TOGGLE_PREVIEW_MODE' }
  | { type: 'SHOW_GRID', showGrid: boolean }
  | { type: 'SET_GRID_SELECTION', gridSelection?: IRectangle }
  | { type: 'SELECT_OBJECT', object?: Object }
  | { type: 'SELECT_OBJECT_BY_NAME', name: string }
  | { type: 'INSERT_OBJECT', objectType: 'LABEL' }
  | { type: 'UPDATE_OBJECT', newProps: Partial<Object> }
  | { type: 'ADD_COLUMN' }
  | { type: 'CREATE_AREA' }
  | { type: 'ADD_ROW' }
  | { type: 'DELETE_COLUMN' }
  | { type: 'DELETE_ROW' };

function reducer(state: IDesigner2State, action: Action): IDesigner2State {

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
        showGrid: action.showGrid
      }
    }

    case 'SET_GRID_SELECTION': {
      return {
        ...state,
        gridSelection: action.gridSelection
      }
    }

    case 'SELECT_OBJECT': {
      return {
        ...state,
        selectedObject: action.object
      }
    }

    case 'SELECT_OBJECT_BY_NAME': {
      return {
        ...state,
        selectedObject: state.objects.find( object => object.name === action.name )
      }
    }

    case 'INSERT_OBJECT': {
      let newObject: Object;
      const name = getObjectName(action.objectType);

      switch (action.objectType) {
        default: {
          newObject = {
            name,
            parent: state.selectedObject ? state.selectedObject.name : undefined,
            type: 'LABEL',
            text: name
          };
        }
      }

      return {
        ...state,
        objects: [...state.objects, newObject],
        selectedObject: newObject
      }
    }

    case 'UPDATE_OBJECT': {
      if (!state.selectedObject) {
        return state;
      }

      const updatedObject = {...state.selectedObject, ...action.newProps} as Object;

      return {
        ...state,
        objects: state.objects.map( object => object === state.selectedObject ? updatedObject : object ),
        selectedObject: updatedObject
      }
    }

    case 'CREATE_AREA': {
      if (state.gridSelection) {
        return {
          ...state,
          objects: [...state.objects, { name: getObjectName('AREA'), type: 'AREA', parent: 'Window', ...state.gridSelection}]
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
  }

  return state;
};

export const Designer2 = (props: IDesigner2Props): JSX.Element => {

  const { viewTab, url, dispatch } = props;
  const [ { grid, previewMode, showGrid, gridSelection, objects, selectedObject }, designerDispatch ] = useReducer(reducer, getDefaultState());

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
            key={`grid_cell_${y + 1} / ${x + 1} / ${y + 2} / ${x + 2}`}
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

  const areas = objects.filter( obj => obj.type === 'AREA' ) as IArea[];
  const getAreas = () => areas.map( obj => {
    const area = obj as IArea;
    return (
      <div
        key={area.name}
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
        onClick={
          e => {
            e.stopPropagation();
            designerDispatch({ type: 'SELECT_OBJECT', object: area });
          }
        }
      >
        {area.name}
        {
          showGrid
          ?
            null
          :
            <Stack horizontal={area.horizontal}>
              {
                objects
                  .filter( object => object.parent === area.name )
                  .map( object => object.type === 'LABEL'
                    ? <Label
                        key={object.name}
                        onClick={
                          e => {
                            e.stopPropagation();
                            designerDispatch({ type: 'SELECT_OBJECT', object });
                          }
                        }
                      >
                        {object.text}
                      </Label>
                    : <div>Unknown object</div>
                  )
              }
            </Stack>
        }
      </div>
    )
  });

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'insertLabel',
      disabled: previewMode || showGrid || !selectedObject || selectedObject.type !== 'AREA',
      text: 'Insert Label',
      iconOnly: true,
      iconProps: { iconName: 'InsertTextBox' },
      onClick: () => designerDispatch({ type: 'INSERT_OBJECT', objectType: 'LABEL' })
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
      key: 'showGrid',
      disabled: previewMode,
      checked: showGrid,
      text: 'Show Grid',
      iconOnly: true,
      iconProps: { iconName: 'Tiles' },
      onClick: () => designerDispatch({ type: 'SHOW_GRID', showGrid: !showGrid })
    },
    {
      key: 'addColumn',
      disabled: previewMode || !showGrid,
      text: 'Add Column',
      iconOnly: true,
      iconProps: { iconName: 'InsertColumnsRight' },
      onClick: () => designerDispatch({ type: 'ADD_COLUMN' })
    },
    {
      key: 'addRow',
      disabled: previewMode || !showGrid,
      text: 'Add Row',
      iconOnly: true,
      iconProps: { iconName: 'InsertRowsBelow' },
      onClick: () => designerDispatch({ type: 'ADD_ROW' })
    },
    {
      key: 'createArea',
      disabled: previewMode || !showGrid || !gridSelection || areas.some( area => rectIntersect(area, gridSelection) ),
      text: 'Create Area',
      iconOnly: true,
      iconProps: { iconName: 'SelectAll' },
      onClick: () => designerDispatch({ type: 'CREATE_AREA' })
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
      key: 'preview',
      text: 'Preview',
      checked: previewMode,
      iconOnly: true,
      iconProps: { iconName: 'RedEye' },
      onClick: () => designerDispatch({ type: 'TOGGLE_PREVIEW_MODE' })
    }
  ];

  const WithObjectInspector = (props: { children: JSX.Element }) => {
    if (previewMode) {
      return props.children;
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
          {props.children}
        </div>
        <div
          style={{
            gridArea: '1 2 2 3',
            padding: '4px',
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
              showGrid
              ?
                <GridInspector
                  grid={grid}
                  gridSelection={gridSelection}
                  onSetColumnWidth={ (column, size) => {} }
                  onSetRowHeight={ (column, size) => {} }
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

  return (
    <>
      <CommandBar items={commandBarItems} />
      <WithObjectInspector>
        <div style={gridStyle}>
          {
            previewMode
              ? getAreas()
              : showGrid
              ? getGridCells().concat(getAreas())
              : getAreas()
          }
        </div>
      </WithObjectInspector>
    </>
  )
};