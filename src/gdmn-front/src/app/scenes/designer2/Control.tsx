import { Object } from "./types";
import { Label, TextField } from "office-ui-fabric-react";
import React from "react";
import { object2IStyle, object2style } from "./utils";
import { WithSelectionFrame } from "./WithSelectionFrame";

interface IInternalControlProps {
  object: Object;
  onSelectObject: () => void;
};

const InternalControl = ({ object, onSelectObject }: IInternalControlProps) => {

  const onClick = (e: any) => {
    e.stopPropagation();
    onSelectObject();
  };

  switch (object.type) {
    case 'LABEL':
      return (
        <Label
          key={object.name}
          styles={{ root: object2IStyle(object) }}
          onClick={onClick}
        >
          {object.text}
        </Label>
      );

    case 'FIELD':
      return (
        <div onClick={onClick}>
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
            onClick={onClick}
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
  <WithSelectionFrame selected={selected} previewMode={previewMode}>
    <InternalControl object={object} onSelectObject={onSelectObject} />
  </WithSelectionFrame>

