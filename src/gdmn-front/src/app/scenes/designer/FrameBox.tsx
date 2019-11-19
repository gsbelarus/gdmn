import { Object, Objects, IFrame } from "./types";
import React from "react";
import { RecordSet } from 'gdmn-recordset';
import { Entity } from 'gdmn-orm';
import { Frame } from "../gdmn/components/Frame";
import { Controls } from "./Controls";

interface IFrameProps {
  gridMode?: boolean;
  previewMode?: boolean;
  selectedObject?: Object;
  frame: IFrame;
  rs?: RecordSet;
  entity?: Entity;
  objects: Objects;
  onSelectObject: (object?: Object) => void;
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
        <Controls
          object={frame}
          objects={objects}
          rs={rs}
          entity={entity}
          selectedObject={selectedObject}
          previewMode={previewMode}
          onSelectObject={onSelectObject}
        />
      </Frame>
    </div>
  )
};
