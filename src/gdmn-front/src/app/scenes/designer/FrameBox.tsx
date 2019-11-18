import { getTheme, Stack } from "office-ui-fabric-react";
import { Object, IArea, Objects, isFrame, IFrame } from "./types";
import { object2style } from "./utils";
import React from "react";
import { Control } from "./Control";
import { RecordSet } from 'gdmn-recordset';
import { Entity } from 'gdmn-orm';
import { Frame } from "../gdmn/components/Frame";

interface IFrameProps {
  gridMode?: boolean;
  previewMode?: boolean;
  selectedObject?: Object;
  frame: IFrame;
  rs?: RecordSet;
  entity?: Entity;
  objects: Objects;
  onSelectObject: (object: Object) => void;
};

export const FrameBox = (props: IFrameProps) => {
  const { gridMode, selectedObject, previewMode, frame, objects, rs, entity, onSelectObject } = props;

  const frameStyle = gridMode
    ? {
      borderColor: getTheme().palette.themeDark,
      backgroundColor: getTheme().palette.themePrimary,
      opacity: frame === selectedObject ? 0.5 : 0.3,
      border: '1px solid',
      borderRadius: '4px',
      margin: '2px',
      padding: '4px',
      zIndex: 1
    }
    : previewMode
    ? {
      ...object2style(frame, objects),
      padding: '4px'
    }
    : {
      ...object2style(frame, objects),
      border: frame === selectedObject ? '1px dotted' : '1px dashed',
      borderColor: frame === selectedObject ? getTheme().palette.themePrimary : getTheme().palette.themeLight,
      borderRadius: '4px',
      padding: '4px'
    };
    console.log(objects
      .filter( object => object.parent === frame.name))
  return (
    <Frame
      key={frame.name}
      caption={frame.caption}
      border={true}
      marginTop={frame.marginTop}
      height={frame.height}
      // onClick={ () => //previewMode ? undefined :
      //   e => {
      //     e.stopPropagation();
      //     onSelectObject(frame);
      //   }
     //}
    >
      {/* {
        gridMode
        ?
          <div
            // style={{
            //   width: '100%',
            //   height: '100%',
            //   display: 'flex',
            //   flexDirection: 'row',
            //   justifyContent: 'center',
            //   alignItems: 'center',
            //   fontWeight: 600,
            //   fontSize: '48px',
            //   color: 'black'
            // }}
          >
            <div>
              {frame.name}1234
            </div>
          </div>
        : */}
          <Stack>
            {
              objects
                .filter( object => object.parent === frame.name)
                .map( object =>
                  <Control
                    key={object.name}
                    object={object}
                    objects={objects}
                    rs={rs}
                    entity={entity}
                    selected={object === selectedObject}
                    previewMode={previewMode}
                    onSelectObject={ () =>{console.log(object.name); console.log('FrameBox'); onSelectObject(object)} }
                  />
                )
            }
          </Stack>
      {/* } */}
    </Frame>
  )
};
