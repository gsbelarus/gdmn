import { getTheme } from "office-ui-fabric-react";
import React from "react";
import { Object } from "./types";

interface IWithSelectionFrameProps {
  children: JSX.Element | null;
  selected: boolean;
  previewMode?: boolean;
  onSelectObject: () => void;
};

export const WithSelectionFrame = ({ children, selected, previewMode, onSelectObject }: IWithSelectionFrameProps) => (
  previewMode ?
    children
  :
    <div
      style={{
        border: selected ? '1px dotted ' + getTheme().palette.themePrimary : '1px solid transparent'
      }}
      onClick={ e => {
        e.stopPropagation();
        onSelectObject();
      }}
    >
      {children}
    </div>
);
