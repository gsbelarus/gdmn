import React, { ReactNode } from "react";
import { Label, getTheme } from "office-ui-fabric-react";
import { Frame } from "./Frame";

interface ICenteredColumnProps {
  label?: string;
  children: ReactNode;
};

export const CenteredColumn = ({ children, label }: ICenteredColumnProps): JSX.Element => {
  return (
    <div
      style={{
        maxWidth: '860px',
        margin: '16px auto'
      }}
    >
      {label && <Label styles={{ root: { ...getTheme().fonts.xLarge } }}>{label}</Label>}
      <Frame border>
        {children}
      </Frame>
    </div>
  );
};