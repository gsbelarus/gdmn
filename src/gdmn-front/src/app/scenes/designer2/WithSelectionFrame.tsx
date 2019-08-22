import { getTheme } from "office-ui-fabric-react";
import React from "react";

interface IWithSelectionFrameProps {
  children: JSX.Element | null;
  selected: boolean;
};

export const WithSelectionFrame = ({ children, selected }: IWithSelectionFrameProps) => (
  <div
    style={{
      border: selected ? '1px dotted ' + getTheme().palette.themePrimary : '1px solid transparent'
    }}
  >
    {children}
  </div>
);