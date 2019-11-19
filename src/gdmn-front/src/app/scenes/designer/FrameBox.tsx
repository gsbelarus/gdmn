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
  onSelectObject: (object: Object | undefined) => void;
};

export const FrameBox = (props: IFrameProps) => {
  const { selectedObject, previewMode, frame, objects, rs, entity, onSelectObject } = props;

  return (
    <div
      key={frame.name}
      onClick={
        e => {
          e.stopPropagation();
          onSelectObject(frame);
        }
      }
    >
      <Frame
        key={frame.name}
        caption={frame.caption}
        border={frame.border}
        marginTop={frame.marginTop}
        marginRight={frame.marginRight}
        marginBottom={frame.marginBottom}
        marginLeft={frame.marginLeft}
        height={`${frame.height}px`}
        scroll={frame.scroll}
      >
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
                  onSelectObject={obj => onSelectObject(obj)}
                />
              )
          }
        </Stack>
      </Frame>
    </div>
  )
};
