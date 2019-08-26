import { Object, Objects } from "./types";
import { Label, TextField } from "office-ui-fabric-react";
import React from "react";
import { object2style, object2ITextFieldStyles, object2ILabelStyles } from "./utils";
import { WithSelectionFrame } from "./WithSelectionFrame";

interface IInternalControlProps {
  object: Object;
  objects: Objects;
};

const InternalControl = ({ object, objects }: IInternalControlProps) => {

  switch (object.type) {
    case 'LABEL':
      return (
        <Label
          key={object.name}
          styles={object2ILabelStyles(object, objects)}
        >
          {object.text}
        </Label>
      );

    case 'FIELD':
      return (
        <div>
          <TextField
            styles={object2ITextFieldStyles(object, objects)}
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
            style={object2style(object, objects)}
          />
        </div>
      )

    default:
      return null;
  }
};

interface IControlProps {
  object: Object;
  objects: Objects;
  selected: boolean;
  previewMode?: boolean;
  onSelectObject: () => void;
};

export const Control = ({ object, objects, onSelectObject, selected, previewMode }: IControlProps) =>
  <WithSelectionFrame selected={selected} previewMode={previewMode} onSelectObject={onSelectObject}>
    <InternalControl object={object} objects={objects} />
  </WithSelectionFrame>

