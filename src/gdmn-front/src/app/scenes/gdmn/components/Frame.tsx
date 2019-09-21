import React, { ReactNode } from "react";
import { getTheme, Label } from "office-ui-fabric-react";

interface IFrameProps {
  marginLeft?: boolean;
  marginTop?: boolean;
  marginRight?: boolean;
  marginBottom?: boolean;
  border?: boolean;
  attention?: boolean;
  subTitle?: string;
  scroll?: boolean;
  height?: string;
  children: ReactNode;
};

export const Frame = (props: IFrameProps): JSX.Element => {
  const { marginTop, marginRight, marginBottom, marginLeft, border, attention, subTitle, children, scroll, height } = props;

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
          border: ifBorder('1px solid ' + (attention ? getTheme().palette.red : getTheme().palette.themeDarker)),
          borderRadius: ifBorder('4px'),
          paddingLeft: ifBorder(),
          paddingTop: ifBorder(subTitle ? '8px' : '16px'),
          paddingRight: ifBorder(),
          paddingBottom: ifBorder(),
          overflowY: scroll ? 'auto' : 'hidden',
        }}
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