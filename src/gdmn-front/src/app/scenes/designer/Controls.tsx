import { IInternalControlProps, Control } from "./Control";
import { Stack } from "office-ui-fabric-react";
import React from "react";
import { isArea } from "./types";

export const Controls = (props: IInternalControlProps) => {
  const { selectedObject, previewMode, object, objects, rs, entity, onSelectObject } = props;

  return (
    <Stack horizontal={isArea(object) && object.horizontal}>
    {
      objects
        .filter( obj => obj.parent === object.name)
        .map( obj =>
          <Control
            key={obj.name}
            object={obj}
            objects={objects}
            rs={rs}
            entity={entity}
            selectedObject={selectedObject}
            previewMode={previewMode}
            onSelectObject={onSelectObject}
          />
        )
    }
    </Stack>
  )
}
