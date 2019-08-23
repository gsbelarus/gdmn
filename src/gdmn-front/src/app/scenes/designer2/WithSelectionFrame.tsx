import { getTheme } from "office-ui-fabric-react";
import React from "react";

interface IWithSelectionFrameProps {
  children: JSX.Element | null;
  selected: boolean;
  previewMode?: boolean;
};

export const WithSelectionFrame = ({ children, selected, previewMode }: IWithSelectionFrameProps) => (
  previewMode ?
    children
  :
    <div
      style={{
        border: selected ? '1px dotted ' + getTheme().palette.themePrimary : '1px solid transparent'
      }}
    >
      {children}
    </div>
);