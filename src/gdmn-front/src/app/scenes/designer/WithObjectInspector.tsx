import React, { useMemo } from "react";
import { GridInspector, OnUpdateGrid } from "./GridInspector";
import { IGrid, isArea, IObject, OnUpdateSelectedObject, Object, Objects, isLabel, isImage, isField, ILabel, IField, IArea, IImage, getAreas, isWindow, isFrame, IFrame } from "./types";
import { Dropdown, TextField, ChoiceGroup, Stack, Checkbox } from "office-ui-fabric-react";
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

  const propControls = useMemo( () => {
    const res: JSX.Element[] = [];

    if (!selectedObject) {
      return res;
    }

    const getOnChange = (prop: keyof IObject | keyof ILabel | keyof IImage | keyof IArea | keyof IField | keyof IFrame, required?: boolean) => (_e: any, newValue?: string | boolean) => {
      if (!required || newValue !== undefined) {
        onUpdateSelectedObject({ [prop]: newValue })
      }
    };

    res.push(
      <ColorDropDown
        key="color"
        selectedColor={selectedObject.color}
        label="Color"
        onChange={getOnChange('color')}
      />
    );

    res.push(
      <ColorDropDown
        key="backgroundColor"
        selectedColor={selectedObject.backgroundColor}
        label="Background Color"
        onChange={getOnChange('backgroundColor')}
      />
    );

    if (selectedObject && !isWindow(selectedObject) && !isArea(selectedObject)) {
      res.push(
        <Dropdown
          key="parent"
          label="Parent"
          selectedKey={selectedObject ? selectedObject.parent : undefined}
          onChange={ (_, option) => option && onUpdateSelectedObject({ parent: option.key as string }) }
          options={ objects.filter( object => isArea(object) || isFrame(object)).map( object => ({ key: object.name, text: object.name }) ) }
        />
      );
    }

    if (isLabel(selectedObject)) {
      res.push(
        <TextField
          key="text"
          label="Text"
          value={selectedObject.text}
          onChange={getOnChange('text', true)}
        />
      );
    }

    if (isFrame(selectedObject)) {
      res.push(
        <TextField
          key="caption"
          label="Caption"
          value={selectedObject.caption}
          onChange={getOnChange('caption')}
        />
      );
      res.push(
        <TextField
          key="height"
          label="Height"
          value={selectedObject.height}
          onChange={getOnChange('height')}
        />
      );
      res.push(
        <Checkbox
          key="border"
          label="Border"
          checked={!!selectedObject.border}
          onChange={getOnChange('border')}
        />
      );
      res.push(
        <Checkbox
          style={{ margin: '16px 0' }}
          key="marginTop"
          label="MarginTop"
          checked={!!selectedObject.marginTop}
          onChange={getOnChange('marginTop')}
        />
      );
      res.push(
        <Checkbox
          key="marginRight"
          label="MarginRight"
          checked={!!selectedObject.marginRight}
          onChange={getOnChange('marginRight')}
        />
      );
      res.push(
        <Checkbox
          key="marginBottom"
          label="MarginBottom"
          checked={!!selectedObject.marginBottom}
          onChange={getOnChange('marginBottom')}
        />
      );
      res.push(
        <Checkbox
          key="marginLeft"
          label="MarginLeft"
          checked={!!selectedObject.marginLeft}
          onChange={getOnChange('marginLeft')}
        />
      );
    }

    if (isImage(selectedObject)) {
      res.push(
        <TextField
          key="imageUrl"
          label="Image URL"
          value={selectedObject.url}
          onChange={getOnChange('url', true)}
        />
      );

      res.push(
        <TextField
          key="imageCaption"
          label="Image caption"
          value={selectedObject.alt}
          onChange={getOnChange('alt')}
        />
      );
    }

    if (isField(selectedObject)) {
      res.push(
        <TextField
          key="label"
          label="Label"
          value={selectedObject.label}
          onChange={getOnChange('label', true)}
        />
      );

      res.push(
        <TextField
          key="fieldName"
          label="Field name"
          value={selectedObject.fieldName}
          onChange={getOnChange('fieldName')}
        />
      );
    }

    if (isArea(selectedObject)) {
      res.push(
        <ChoiceGroup
          key="direction"
          label="Direction"
          selectedKey={ selectedObject.horizontal ? 'h' : 'v' }
          options={[
            { key: 'v', text: 'Vertical' },
            { key: 'h', text: 'Horizontal' }
          ]}
          onChange={ (_e, option) => option && onUpdateSelectedObject({ horizontal: option.key === 'h' }) }
        />
      );
    }

    return res.sort( (a, b) => a.key === null ? -1 : b.key === null ? 1 : a.key < b.key ? -1 : a.key === b.key ? 0 : 1 );
  }, [selectedObject, onUpdateSelectedObject]);

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
          width: '100%',
          overflow: 'auto'
        }}
      >
        {children}
      </div>
      <div
        style={{
          gridArea: '1 2 2 3',
          paddingRight: '4px',
          overflow: 'auto',
          height: 'calc(100% - 44px)'
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
              <Stack>
                <Dropdown
                  label="Selected object"
                  selectedKey={selectedObject ? selectedObject.name : undefined}
                  onChange={ (_, option) => option && option.data && onSelectObject(option.data) }
                  options={ objects.map( object => ({ key: object.name, text: object.name, data: object }) ) }
                />
                {propControls}
              </Stack>
          }
        </div>
      </div>
    </div>
  );
};
