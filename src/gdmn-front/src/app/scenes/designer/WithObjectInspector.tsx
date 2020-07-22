import React, { useMemo } from "react";
import { GridInspector, OnUpdateGrid } from "./GridInspector";
import { IGrid, isArea, IObject, OnUpdateSelectedObject, Object, Objects, isLabel, isImage, isField, ILabel, IField, IArea, IImage, isWindow, isFrame, IFrame, isFrameOrArea, IButton } from "./types";
import { Dropdown, TextField, ChoiceGroup, Stack, Checkbox } from "office-ui-fabric-react";

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
  const Style = {
    root:
      { margin: '8px 0' }
  };

  const propControls = useMemo( () => {
    const res: JSX.Element[] = [];

    if (!selectedObject) {
      return res;
    }

    const getOnChange = (prop: keyof IObject | keyof ILabel | keyof IImage | keyof IArea | keyof IField | keyof IFrame | keyof IButton, required?: boolean) => (_e: any, newValue?: string | boolean) => {
      if (!required || newValue !== undefined) {
        onUpdateSelectedObject({ [prop]: newValue })
      }
    };

    if (selectedObject && !isWindow(selectedObject) && !isArea(selectedObject)) {
      res.push(
        <Dropdown
          key="parent"
          label="Parent"
          selectedKey={selectedObject ? selectedObject.parent : undefined}
          onChange={ (_, option) => option && onUpdateSelectedObject({ parent: option.key as string }) }
          options={ objects.filter( object => isFrameOrArea(object)).map( object => ({ key: object.name, text: object.name }) ) }
        />
      );
    }

    if (isLabel(selectedObject)) {
      res.push(
        <TextField
          key="text"
          label="Text"
          styles={Style}
          value={selectedObject.text}
          onChange={getOnChange('text', true)}
        />
      );
    }

    if (isFrame(selectedObject)) {
      res.push(
        <TextField
          key="1.caption"
          label="Caption"
          styles={Style}
          value={selectedObject.caption}
          onChange={getOnChange('caption')}
        />
      );
      res.push(
        <Checkbox
          key="2.border"
          label="Border"
          styles={Style}
          checked={!!selectedObject.border}
          onChange={getOnChange('border')}
        />
      );
      res.push(
        <Checkbox
          key="2.scroll"
          label="Scroll"
          styles={Style}
          checked={!!selectedObject.scroll}
          onChange={getOnChange('scroll')}
        />
      );
      res.push(
        <TextField
          key="3.height"
          label="Height, px"
          styles={Style}
          value={selectedObject.height}
          onChange={getOnChange('height')}
        />
      );
      res.push(
        <Checkbox
          key="4.marginTop"
          label="MarginTop"
          styles={Style}
          checked={!!selectedObject.marginTop}
          onChange={getOnChange('marginTop')}
        />
      );
      res.push(
        <Checkbox
          key="5.marginRight"
          label="MarginRight"
          styles={Style}
          checked={!!selectedObject.marginRight}
          onChange={getOnChange('marginRight')}
        />
      );
      res.push(
        <Checkbox
          key="6.marginBottom"
          label="MarginBottom"
          styles={Style}
          checked={!!selectedObject.marginBottom}
          onChange={getOnChange('marginBottom')}
        />
      );
      res.push(
        <Checkbox
          key="7.marginLeft"
          label="MarginLeft"
          styles={Style}
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
          styles={Style}
          value={selectedObject.url}
          onChange={getOnChange('url', true)}
        />
      );

      res.push(
        <TextField
          key="imageCaption"
          label="Image caption"
          styles={Style}
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
          styles={Style}
          value={selectedObject.label}
          onChange={getOnChange('label', true)}
        />
      );

      res.push(
        <TextField
          key="fieldName"
          label="Field name"
          styles={Style}
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
