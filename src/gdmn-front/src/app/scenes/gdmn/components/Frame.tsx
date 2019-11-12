import React, { ReactNode } from "react";
import { getTheme, Label } from "office-ui-fabric-react";

interface IFrameProps {
  marginLeft?: boolean;
  marginTop?: boolean;
  marginRight?: boolean;
  marginBottom?: boolean;
  border?: boolean;
  attention?: boolean;
  selected?: boolean;
  subTitle?: string;
  scroll?: boolean;
  height?: string;
  children: ReactNode;
  readOnly?: boolean;
  onClick?: () => void;
};

export const Frame = (props: IFrameProps): JSX.Element => {
  const { marginTop, marginRight, marginBottom, marginLeft, border, attention, selected, subTitle, children, scroll, height, onClick, readOnly } = props;

  const ifMargin = (m?: boolean) => m ? '16px' : 'none';
  const ifBorder = (defPadding = '16px') => border ? defPadding : 'inherit';

  const withMargin = (ch: ReactNode) => {
    return (
      <div
        style={{
          marginLeft: ifMargin(marginLeft),
          marginTop: ifMargin(marginTop),
          marginRight: ifMargin(marginRight),
          marginBottom: ifMargin(marginBottom),
          height,
          border: ifBorder('1px solid ' + (attention ? getTheme().palette.red : getTheme().palette.themeDark)),
          borderRadius: ifBorder('4px'),
          paddingLeft: ifBorder(),
          paddingTop: ifBorder(subTitle ? '8px' : '16px'),
          paddingRight: ifBorder(),
          paddingBottom: ifBorder(),
          overflowY: scroll ? 'auto' : 'hidden',
          backgroundColor: selected ? getTheme().palette.themeLighter : readOnly ? getTheme().palette.neutralLight : getTheme().semanticColors.bodyBackground,
        }}
        onClick={onClick}
      >
        {ch}
      </div>
    );
  };

  const withSubTitle = (ch: ReactNode) => {
    if (subTitle) {
      return (
        <>
          <Label styles={{
            root: {
              marginBottom: '8px'
            }
          }}>
            {subTitle}
          </Label>
          {ch}
        </>
      )
    } else {
      return ch;
    }
  };

  return withMargin(withSubTitle(children)) as JSX.Element;
};
