import { getTheme, Stack } from "office-ui-fabric-react";
import { Object, IArea, Objects } from "./types";
import { object2style } from "./utils";
import React from "react";
import { Control } from "./Control";

interface IAreaProps {
  gridMode?: boolean;
  previewMode?: boolean;
  selectedObject?: Object;
  area: IArea;
  objects: Objects;
  onSelectObject: (object: Object) => void;
};

export const Area = (props: IAreaProps) => {
  const { gridMode, selectedObject, previewMode, area, objects, onSelectObject } = props;

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
      ...object2style(area, objects),
      padding: '4px'
    }
    : {
      ...object2style(area, objects),
      border: area === selectedObject ? '1px dotted' : '1px dashed',
      borderColor: area === selectedObject ? getTheme().palette.themePrimary : getTheme().palette.themeLight,
      borderRadius: '4px',
      padding: '4px'
    };

  return (
    <div
      key={area.name}
      style={{
        ...areaStyle,
        gridArea: `${area.top + 1} / ${area.left + 1} / ${area.bottom + 2} / ${area.right + 2}`
      }}
      onClick={ previewMode ? undefined :
        e => {
          e.stopPropagation();
          onSelectObject(area);
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
                .map( object =>
                  <Control
                    key={object.name}
                    object={object}
                    objects={objects}
                    selected={object === selectedObject}
                    previewMode={previewMode}
                    onSelectObject={ () => onSelectObject(object) }
                  />
                )
            }
          </Stack>
      }
    </div>
  )
};