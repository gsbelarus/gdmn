import React, { ReactNode } from "react";
import { getTheme, Label } from "office-ui-fabric-react";

interface ISplitViewProps {
  split?: 'vertical' | 'horizontal',
  marginLeft?: boolean;
  marginTop?: boolean;
  marginRight?: boolean;
  marginBottom?: boolean;
  border?: boolean;
  children: ReactNode;
};

export const SplitView = (props: ISplitViewProps): JSX.Element => {
  const {split, children} = props;

  const splitStyle = (split === 'horizontal') ? {
    gridTemplateColumns: 'repeat(2, 1fr)',
    gridTemplateRows: 'auto',
  } : {
    gridTemplateColumns: '1fr',
    gridTemplateRows: 'auto 1fr',
  }

  return (
    <div
      style={{
        display: 'grid',
        width: '100%',
        height: 'calc(100% - 42px)',
        padding: '4px',
        backgroundColor: getTheme().semanticColors.bodyBackground,
        ...{...splitStyle}
      }}
    >
      {children}
    </div>
  );
};
