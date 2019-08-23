import React from "react";
import { GridInspector, OnUpdateGrid } from "./GridInspector";
import { IGrid, isArea, IObject, OnUpdateSelectedObject, Object, Objects, isLabel } from "./types";
import { Dropdown, TextField, ChoiceGroup } from "office-ui-fabric-react";
import { ColorDropDown } from "./ColorDropDown";

interface IWithObjectInspectorProps {
  children: JSX.Element;
  previewMode?: boolean;
  gridMode?: boolean;
  objects: Objects;
  grid: IGrid;
  selectedObject?: IObject;
  onUpdateGrid: OnUpdateGrid;
  onUpdateSelectedObject: OnUpdateSelectedObject;
  onSelectObject: (object: Object) => void;
};

export const WithObjectInspector = (props: IWithObjectInspectorProps) => {
  const { previewMode, gridMode, children, objects, grid, selectedObject, onUpdateGrid, onUpdateSelectedObject, onSelectObject } = props;

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
                selectedArea={isArea(selectedObject) ? selectedObject : undefined}
                onUpdateGrid={onUpdateGrid}
                onChangeArea={onUpdateSelectedObject}
              />
            :
              <>
                <Dropdown
                  label="Selected object"
                  selectedKey={selectedObject ? selectedObject.name : undefined}
                  onChange={ (_, option) => option && option.data && onSelectObject(option.data) }
                  options={ objects.map( object => ({ key: object.name, text: object.name, data: object }) ) }
                />
                {
                  !selectedObject
                  ? null
                  : isLabel(selectedObject)
                  ?
                    <TextField
                      label="Text"
                      value={selectedObject.text}
                      onChange={
                        (e, newValue?: string) => {
                          if (newValue !== undefined) {
                            onUpdateSelectedObject({ text: newValue })
                          }
                        }
                      }
                    />
                  : isArea(selectedObject)
                  ? <ChoiceGroup
                      label="Direction"
                      selectedKey={ selectedObject.horizontal ? 'h' : 'v' }
                      options={[
                        { key: 'v', text: 'Vertical' },
                        { key: 'h', text: 'Horizontal' }
                      ]}
                      onChange={ (_e, option) => option && onUpdateSelectedObject({ horizontal: option.key === 'h' }) }
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
                      onSelectColor={ color => onUpdateSelectedObject({ color }) }
                    />
                }
                {
                  !selectedObject
                  ? null
                  :
                    <ColorDropDown
                      selectedColor={selectedObject.backgroundColor}
                      label="Background Color"
                      onSelectColor={ color => onUpdateSelectedObject({ backgroundColor: color }) }
                    />
                }
              </>
          }
        </div>
      </div>
    </div>
  );
};
