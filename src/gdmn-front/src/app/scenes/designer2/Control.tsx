import { Object } from "./types";
import { Label, TextField } from "office-ui-fabric-react";
import React from "react";
import { object2IStyle, object2style } from "./utils";
import { WithSelectionFrame } from "./WithSelectionFrame";

interface IInternalControlProps {
  object: Object;
};

const InternalControl = ({ object }: IInternalControlProps) => {

  switch (object.type) {
    case 'LABEL':
      return (
        <Label
          key={object.name}
          styles={{ root: object2IStyle(object) }}
        >
          {object.text}
        </Label>
      );

    case 'FIELD':
      return (
        <div>
          <TextField
            styles={{
              root: object2IStyle(object),
              wrapper: object2IStyle(object)
            }}
            label={object.label}
          />
        </div>
      )

    case 'IMAGE':
      return (
        <div>
          <img
            src={object.url}
            alt={object.alt}
            style={object2style(object)}
          />
        </div>
      )

    default:
      return null;
  }
};

interface IControlProps {
  object: Object;
  selected: boolean;
  previewMode?: boolean;
  onSelectObject: () => void;
};

export const Control = ({ object, onSelectObject, selected, previewMode }: IControlProps) =>
  <WithSelectionFrame selected={selected} previewMode={previewMode} onSelectObject={onSelectObject}>
    <InternalControl object={object} />
  </WithSelectionFrame>

